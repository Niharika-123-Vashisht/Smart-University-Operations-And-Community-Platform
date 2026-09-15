import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';

// @desc    Get announcements with audience filtering
// @route   GET /api/announcements
// @access  Public / Private
export const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, department } = req.query;
    const query = {};

    // Filter by role if logged in
    if (req.user) {
      if (req.user.role === 'student') {
        query.targetAudience = { $in: ['All', 'Student'] };
      } else if (req.user.role === 'faculty') {
        query.targetAudience = { $in: ['All', 'Faculty'] };
      }
    }

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.department = department;

    const announcements = await Announcement.find(query)
      .populate('author', 'name role avatar')
      .populate('department', 'name code')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin, Faculty)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetAudience, department, isPinned, expiresAt } =
      req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'Academic',
      priority: priority || 'Normal',
      targetAudience: targetAudience || 'All',
      department: department || null,
      author: req.user._id,
      isPinned: isPinned || false,
      expiresAt: expiresAt || null,
    });

    // If important or urgent, notify target users
    if (priority === 'Urgent' || priority === 'Important') {
      const userQuery = {};
      if (targetAudience === 'Student') userQuery.role = 'student';
      if (targetAudience === 'Faculty') userQuery.role = 'faculty';

      const recipients = await User.find(userQuery).select('_id');
      for (const u of recipients) {
        await createNotification({
          recipient: u._id,
          sender: req.user._id,
          title: `[${priority} Notice] ${title}`,
          message: content.substring(0, 100) + '...',
          type: 'Announcement',
          link: '/announcements',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      announcement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin, Author)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    // Only admin or author can delete
    if (
      req.user.role !== 'admin' &&
      announcement.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this announcement.',
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};
