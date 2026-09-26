import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Event from '../models/Event.js';
import LostFound from '../models/LostFound.js';
import Skill from '../models/Skill.js';
import HelpRequest from '../models/HelpRequest.js';
import Feedback from '../models/Feedback.js';

// @desc    Get real MongoDB-aggregated analytics for admin dashboard & Recharts
// @route   GET /api/analytics/dashboard
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. User metrics
    const totalUsers = await User.countDocuments();
    const usersByRoleRaw = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const usersByRole = {
      student: 0,
      faculty: 0,
      admin: 0,
    };
    usersByRoleRaw.forEach((item) => {
      if (item._id) usersByRole[item._id] = item.count;
    });

    // 2. Complaint metrics
    const totalComplaints = await Complaint.countDocuments();
    
    // Status breakdown
    const statusBreakdownRaw = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {
      Pending: 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Confirmed: 0,
    };
    statusBreakdownRaw.forEach((item) => {
      if (item._id) statusMap[item._id] = item.count;
    });

    // Categories breakdown
    const categoryBreakdown = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by Department
    const departmentComplaints = await Complaint.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept',
        },
      },
      {
        $unwind: {
          path: '$dept',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$dept.name', 'General Campus'] },
          code: { $first: { $ifNull: ['$dept.code', 'GEN'] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly complaint trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ['$status', ['Resolved', 'Confirmed']] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format month labels for charts (e.g. "Sep 2026")
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyTrends = monthlyTrends.map((t) => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      total: t.total,
      resolved: t.resolved,
      pending: t.total - t.resolved,
    }));

    // 3. Events metrics
    const totalEvents = await Event.countDocuments();
    const eventsData = await Event.aggregate([
      {
        $project: {
          registeredCount: { $size: { $ifNull: ['$registeredStudents', []] } },
          capacity: '$capacity',
        },
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: '$registeredCount' },
          totalCapacity: { $sum: '$capacity' },
        },
      },
    ]);
    const eventStats = eventsData[0] || { totalRegistrations: 0, totalCapacity: 0 };

    // 4. Lost & Found metrics
    const totalLostFound = await LostFound.countDocuments();
    const lostCount = await LostFound.countDocuments({ type: 'Lost' });
    const foundCount = await LostFound.countDocuments({ type: 'Found' });
    const resolvedItems = await LostFound.countDocuments({ status: 'Resolved' });
    const recoveryRate =
      totalLostFound > 0 ? Math.round((resolvedItems / totalLostFound) * 100) : 0;

    // 5. Skill Exchange & Help Request metrics
    const totalSkills = await Skill.countDocuments();
    const totalHelpRequests = await HelpRequest.countDocuments();
    const openHelpRequests = await HelpRequest.countDocuments({ status: 'Open' });
    const completedHelpRequests = await HelpRequest.countDocuments({ status: 'Completed' });

    // 6. Feedback & Ratings
    const feedbackList = await Feedback.find().select('rating category');
    const totalFeedback = feedbackList.length;
    const avgRating =
      totalFeedback > 0
        ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalFeedback).toFixed(1)
        : '0.0';

    const ratingDistribution = [
      { star: '5 Star', count: feedbackList.filter((f) => f.rating === 5).length },
      { star: '4 Star', count: feedbackList.filter((f) => f.rating === 4).length },
      { star: '3 Star', count: feedbackList.filter((f) => f.rating === 3).length },
      { star: '2 Star', count: feedbackList.filter((f) => f.rating === 2).length },
      { star: '1 Star', count: feedbackList.filter((f) => f.rating === 1).length },
    ];

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
        },
        complaints: {
          total: totalComplaints,
          statusBreakdown: statusMap,
          categoryBreakdown: categoryBreakdown.map((c) => ({ name: c._id, count: c.count })),
          departmentBreakdown: departmentComplaints.map((d) => ({
            department: d._id,
            code: d.code,
            count: d.count,
          })),
          monthlyTrends: formattedMonthlyTrends,
        },
        events: {
          totalEvents,
          totalRegistrations: eventStats.totalRegistrations,
          totalCapacity: eventStats.totalCapacity,
          utilizationRate:
            eventStats.totalCapacity > 0
              ? Math.round((eventStats.totalRegistrations / eventStats.totalCapacity) * 100)
              : 0,
        },
        lostFound: {
          total: totalLostFound,
          lost: lostCount,
          found: foundCount,
          resolved: resolvedItems,
          recoveryRate,
        },
        skillExchange: {
          totalSkills,
          totalHelpRequests,
          openHelpRequests,
          completedHelpRequests,
        },
        feedback: {
          totalSubmissions: totalFeedback,
          averageRating: parseFloat(avgRating),
          ratingDistribution,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
