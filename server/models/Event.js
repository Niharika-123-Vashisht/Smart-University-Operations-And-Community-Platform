import mongoose from 'mongoose';

const registeredStudentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
    },
    category: {
      type: String,
      enum: ['Workshop', 'Seminar', 'Technical', 'Cultural', 'Sports', 'Hackathon', 'Guest Lecture'],
      default: 'Workshop',
    },
    venue: {
      type: String,
      required: [true, 'Please provide venue details'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date and time'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date and time'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide maximum attendee capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    registeredStudents: [registeredStudentSchema],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    bannerImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for current registered count
eventSchema.virtual('registeredCount').get(function () {
  return this.registeredStudents ? this.registeredStudents.length : 0;
});

// Virtual to check if event is completely booked
eventSchema.virtual('isFull').get(function () {
  return this.registeredStudents ? this.registeredStudents.length >= this.capacity : false;
});

eventSchema.index({ startDate: 1, category: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
