import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillName: {
      type: String,
      required: [true, 'Please provide skill name'],
      trim: true,
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
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    availability: {
      type: String,
      trim: true,
      default: 'Available upon request',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

skillSchema.index({ skillName: 'text', description: 'text' });
skillSchema.index({ user: 1, skillName: 1 }, { unique: true });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
