import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide help request title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please describe what you need help with'],
    },
    category: {
      type: String,
      enum: [
        'Programming',
        'Mathematics',
        'Electronics',
        'Design & UI',
        'Languages',
        'Music & Arts',
        'Academics',
        'Other',
      ],
      default: 'Programming',
    },
    skillNeeded: {
      type: String,
      required: [true, 'Please specify the skill required (e.g. React, Calculus, Python)'],
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'Accepted', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

helpRequestSchema.index({ status: 1, category: 1, createdAt: -1 });

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);
export default HelpRequest;
