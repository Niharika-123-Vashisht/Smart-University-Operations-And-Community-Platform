import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Lost', 'Found'],
      required: [true, 'Please specify if item is Lost or Found'],
    },
    title: {
      type: String,
      required: [true, 'Please provide item title/name'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe the item details'],
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'ID Cards/Wallets',
        'Books/Stationery',
        'Clothing/Accessories',
        'Keys',
        'Bags',
        'Other',
      ],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Please specify where item was lost or found'],
    },
    date: {
      type: Date,
      required: [true, 'Please specify the approximate date'],
    },
    image: {
      type: String,
      default: '',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved'],
      default: 'Open',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
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

lostFoundSchema.index({ type: 1, status: 1, category: 1, createdAt: -1 });

const LostFound = mongoose.model('LostFound', lostFoundSchema);
export default LostFound;
