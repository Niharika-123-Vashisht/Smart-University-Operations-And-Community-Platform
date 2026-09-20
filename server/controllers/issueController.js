import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';
import { upload } from '../middleware/upload.js';

// @desc    Create a new issue report
// @route   POST /api/issues
// @access  Private (any authenticated user)
export const createIssue = async (req, res, next) => {
  try {
    // multer middleware will populate req.file if image provided
    const { title, description, category, location } = req.body;
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    const issue = await Issue.create({
      title,
      description,
      category,
      location,
      image: imagePath,
      reporter: req.user._id,
    });
    // Notify admins about new issue
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        title: `[Issue] ${title}`,
        message: `A new ${category} issue was reported.`,
        type: 'Issue',
        link: '/admin/issues',
      });
    }
    res.status(201).json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

// @desc    Get issues reported by the logged‑in user
// @route   GET /api/issues/me
// @access  Private
export const getMyIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ reporter: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: issues.length, issues });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single issue by ID (owner or admin/faculty)
// @route   GET /api/issues/:id
// @access  Private
export const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reporter', 'name email role');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }
    // Authorization: owner, admin, or faculty can view
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'faculty' &&
      issue.reporter._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this issue.' });
    }
    res.status(200).json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

// @desc    Update issue status (admin or faculty only)
// @route   PUT /api/issues/:id/status
// @access  Private (admin, faculty)
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }
    // Only admin/faculty may change status
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    issue.status = status;
    // optional note stored as part of description for simplicity
    if (note) {
      issue.description += `\n\n**Staff note:** ${note}`;
    }
    await issue.save();
    // Notify reporter about status change
    await createNotification({
      recipient: issue.reporter,
      sender: req.user._id,
      title: `Issue status updated to ${status}`,
      message: `Your reported issue "${issue.title}" is now ${status}.`,
      type: 'Issue',
      link: '/my-issues',
    });
    res.status(200).json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an issue (owner can delete while pending)
// @route   DELETE /api/issues/:id
// @access  Private (owner)
export const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }
    // Only owner can delete and only if still pending
    if (issue.reporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this issue.' });
    }
    if (issue.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending issues can be deleted.' });
    }
    await issue.deleteOne();
    res.status(200).json({ success: true, message: 'Issue deleted.' });
  } catch (err) {
    next(err);
  }
};
