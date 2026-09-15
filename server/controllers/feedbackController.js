import Feedback from '../models/Feedback.js';

// @desc    Submit platform feedback & rating (1-5)
// @route   POST /api/feedback
// @access  Private
export const createFeedback = async (req, res, next) => {
  try {
    const { rating, category, comment } = req.body;

    const feedback = await Feedback.create({
      user: req.user._id,
      rating,
      category: category || 'Platform Experience',
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted successfully.',
      feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all feedback entries with aggregate ratings (Admin)
// @route   GET /api/feedback
// @access  Private (Admin)
export const getFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email role identifier avatar')
      .sort({ createdAt: -1 });

    const totalSubmissions = feedbacks.length;
    const averageRating =
      totalSubmissions > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalSubmissions).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      totalSubmissions,
      averageRating: parseFloat(averageRating),
      feedbacks,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted.',
    });
  } catch (err) {
    next(err);
  }
};
