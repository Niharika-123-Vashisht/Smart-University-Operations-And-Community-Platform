import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';
import paginationHelper from '../utils/pagination.js';

// @desc    Get all complaints (Role-filtered)
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, department, search } = req.query;
    const query = {};

    // Role-based restrictions
    if (req.user.role === 'student') {
      query.submittedBy = req.user._id;
    } else if (req.user.role === 'faculty') {
      query.$or = [
        { assignedTo: req.user._id },
        { department: req.user.department },
      ];
    }
    // Admin has unrestricted view

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (search) {
      query.$or = query.$or
        ? [
            ...query.$or,
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ]
        : [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
    }

    const { page, limit, skip } = paginationHelper(req.query);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email identifier avatar')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email identifier')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: complaints.length,
      total,
      complaints,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email identifier phone avatar')
      .populate('department', 'name code headOfDepartment')
      .populate('assignedTo', 'name email identifier phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.',
      });
    }

    // Role security: Student can only view their own complaint
    if (
      req.user.role === 'student' &&
      complaint.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this grievance.',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, department, attachment } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      department: department || null,
      attachment: attachment || '',
      submittedBy: req.user._id,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          updatedBy: req.user._id,
          note: 'Complaint registered by student',
          timestamp: new Date(),
        },
      ],
    });

    // Notify admins about new complaint
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        title: `New Grievance Submitted: ${title.substring(0, 30)}...`,
        message: `A new ${category} complaint was submitted with priority ${priority || 'Medium'}.`,
        type: 'Complaint',
        link: `/admin/complaints`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and queued for review.',
      complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin assign department, responsible person, and change priority
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
export const assignComplaint = async (req, res, next) => {
  try {
    const { department, assignedTo, priority, note } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (department) complaint.department = department;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (priority) complaint.priority = priority;
    complaint.status = 'Assigned';

    complaint.statusHistory.push({
      status: 'Assigned',
      updatedBy: req.user._id,
      note: note || `Assigned to department/handler with priority ${complaint.priority}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify the assigned faculty/staff
    if (assignedTo) {
      await createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        title: `Grievance Assigned to You: ${complaint.title}`,
        message: `Admin assigned you to resolve complaint #${complaint._id.toString().slice(-6)}.`,
        type: 'Complaint',
        link: `/faculty/complaints`,
      });
    }

    // Notify the student
    await createNotification({
      recipient: complaint.submittedBy,
      sender: req.user._id,
      title: `Update on Complaint #${complaint._id.toString().slice(-6)}`,
      message: `Your grievance has been assigned to the responsible authority.`,
      type: 'Complaint',
      link: `/student/complaints`,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status & resolution info (Admin or Assigned Faculty)
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin, Faculty)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Validate permitted transitions
    const validTransitions = ['In Progress', 'Resolved'];
    if (!validTransitions.includes(status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition requested.',
      });
    }

    complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      note: note || `Status updated to ${status}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify the student
    await createNotification({
      recipient: complaint.submittedBy,
      sender: req.user._id,
      title: `Complaint Status: ${status}`,
      message: `Your grievance #${complaint._id.toString().slice(-6)} is now marked as "${status}".`,
      type: 'Complaint',
      link: `/student/complaints`,
    });

    res.status(200).json({
      success: true,
      message: `Complaint marked as ${status}.`,
      complaint,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Student confirms complaint resolution
// @route   PUT /api/complaints/:id/confirm
// @access  Private (Student)
export const confirmResolution = async (req, res, next) => {
  try {
    const { note } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the grievance author can confirm resolution.',
      });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Complaint must be in "Resolved" state before confirmation.',
      });
    }

    complaint.status = 'Confirmed';
    complaint.confirmedAt = new Date();
    complaint.statusHistory.push({
      status: 'Confirmed',
      updatedBy: req.user._id,
      note: note || 'Student confirmed satisfactory resolution.',
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify assigned faculty / admin
    if (complaint.assignedTo) {
      await createNotification({
        recipient: complaint.assignedTo,
        sender: req.user._id,
        title: `Resolution Confirmed by Student`,
        message: `Student confirmed closure of complaint #${complaint._id.toString().slice(-6)}.`,
        type: 'Complaint',
        link: `/faculty/complaints`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resolution confirmed. Complaint successfully closed.',
      complaint,
    });
  } catch (err) {
    next(err);
  }
};
