import Announcement from '../models/Announcement.js';
import Issue from '../models/Issue.js';
import LostFound from '../models/LostFound.js';
import HelpRequest from '../models/HelpRequest.js';

// @desc Get dashboard statistics for a student user
// @route GET /api/dashboard/stats
// @access Private (any authenticated user)
export const getStudentDashboardStats = async (req, res, next) => {
  try {
    const totalNotices = await Announcement.countDocuments();
    const totalIssues = await Issue.countDocuments({ reporter: req.user._id });
    const pendingIssues = await Issue.countDocuments({
      reporter: req.user._id,
      status: { $in: ['Pending', 'In Progress'] },
    });
    const totalLostFound = await LostFound.countDocuments();
    const totalHelpRequests = await HelpRequest.countDocuments({ student: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        totalNotices,
        totalIssues,
        pendingIssues,
        totalLostFound,
        totalHelpRequests,
      },
    });
  } catch (err) {
    next(err);
  }
};
