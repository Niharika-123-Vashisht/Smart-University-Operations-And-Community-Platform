import mongoose from 'mongoose';

const lostFoundItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Item name is required'], trim: true },
    type: { type: String, enum: ['Lost', 'Found'], required: [true, 'Specify Lost or Found'] },
    description: { type: String, required: [true, 'Description required'] },
    location: { type: String, required: [true, 'Location required'] },
    date: { type: Date, required: [true, 'Date required'] },
    contactInfo: { type: String, required: [true, 'Contact info required'] },
    image: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

lostFoundItemSchema.index({ type: 1, user: 1, createdAt: -1 });

const LostFoundItem = mongoose.model('LostFoundItem', lostFoundItemSchema);
export default LostFoundItem;
