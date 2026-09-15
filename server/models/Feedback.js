import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    category: {
      type: String,
      enum: [
        'Platform Experience',
        'Campus Facilities',
        'Academic Services',
        'Hostel & Mess',
        'Events & Activities',
        'Other',
      ],
      default: 'Platform Experience',
    },
    comment: {
      type: String,
      required: [true, 'Please share your comments/feedback'],
      trim: true,
      maxlength: [1000, 'Feedback comment cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Addressed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ rating: 1, category: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
