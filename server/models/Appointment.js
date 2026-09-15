import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for straightforward date comparisons
      required: [true, 'Please provide date for appointment slot'],
    },
    startTime: {
      type: String, // HH:mm format, e.g. "14:00"
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String, // HH:mm format, e.g. "14:30"
      required: [true, 'Please provide end time'],
    },
    status: {
      type: String,
      enum: ['Available', 'Requested', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Available',
    },
    purpose: {
      type: String,
      trim: true,
      default: '',
    },
    meetingLocation: {
      type: String,
      default: 'Faculty Cabin',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    facultyNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent faculty from creating duplicate slots on the exact same date and start time
appointmentSchema.index({ faculty: 1, date: 1, startTime: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
