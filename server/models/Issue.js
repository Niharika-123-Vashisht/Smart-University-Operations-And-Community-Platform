import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please provide issue title'], trim: true },
    description: { type: String, required: [true, 'Please describe the issue'], trim: true },
    category: {
      type: String,
      enum: ['Hostel', 'Classroom', 'Electricity', 'Water', 'Internet', 'Cleaning', 'Other'],
      required: [true, 'Please select a category'],
    },
    location: { type: String, required: [true, 'Please provide location details'] },
    image: { type: String, default: '' }, // path to uploaded image
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for quick lookup
issueSchema.index({ reporter: 1, status: 1, createdAt: -1 });

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
