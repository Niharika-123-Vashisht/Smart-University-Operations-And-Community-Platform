import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';
import paginationHelper from '../utils/pagination.js';

// @desc    Faculty creates appointment slot(s)
// @route   POST /api/appointments/slots
// @access  Private (Faculty)
export const createSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime, meetingLocation } = req.body;

    // Check for collision/duplicate slot
    const existing = await Appointment.findOne({
      faculty: req.user._id,
      date,
      startTime,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A time slot at this start time already exists in your schedule.',
      });
    }

    const slot = await Appointment.create({
      faculty: req.user._id,
      date,
      startTime,
      endTime,
      meetingLocation: meetingLocation || 'Faculty Cabin',
      status: 'Available',
    });

    res.status(201).json({
      success: true,
      message: 'Time slot created and made available for students.',
      slot,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available slots for a specific faculty
// @route   GET /api/appointments/faculty/:facultyId/slots
// @access  Private
export const getFacultyAvailableSlots = async (req, res, next) => {
  try {
    const slots = await Appointment.find({
      faculty: req.params.facultyId,
      status: 'Available',
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Student requests/books an available slot (Double-booking prevention)
// @route   POST /api/appointments/:id/book
// @access  Private (Student)
export const bookSlot = async (req, res, next) => {
  try {
    const { purpose } = req.body;

    if (!purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the purpose of your appointment.',
      });
    }

    // Atomic update: only updates if slot is currently 'Available'
    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'Available',
      },
      {
        student: req.user._id,
        purpose,
        status: 'Requested',
      },
      { new: true }
    ).populate('faculty', 'name email');

    if (!appointment) {
      return res.status(409).json({
        success: false,
        message: 'This slot is no longer available or was already booked by another student.',
      });
    }

    // Notify faculty of the booking request
    await createNotification({
      recipient: appointment.faculty._id,
      sender: req.user._id,
      title: `New Appointment Request`,
      message: `${req.user.name} requested an appointment on ${appointment.date} at ${appointment.startTime}.`,
      type: 'Appointment',
      link: `/faculty/appointments`,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment requested successfully. Awaiting faculty confirmation.',
      appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's appointments (Role-aware)
// @route   GET /api/appointments/my
// @access  Private
export const getMyAppointments = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    }
    // Admin can see all

    const { page, limit, skip } = paginationHelper(req.query);
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('faculty', 'name email identifier phone department avatar')
      .populate('student', 'name email identifier phone avatar')
      .sort({ date: -1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: appointments.length,
      total,
      appointments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Faculty accepts or rejects appointment
// @route   PUT /api/appointments/:id/respond
// @access  Private (Faculty)
export const respondToAppointment = async (req, res, next) => {
  try {
    const { action, rejectionReason, facultyNotes, meetingLocation } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      faculty: req.user._id,
    }).populate('student', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found.',
      });
    }

    if (action === 'accept') {
      appointment.status = 'Accepted';
      if (meetingLocation) appointment.meetingLocation = meetingLocation;
      if (facultyNotes) appointment.facultyNotes = facultyNotes;
    } else if (action === 'reject') {
      appointment.status = 'Rejected';
      appointment.rejectionReason = rejectionReason || 'Faculty unavailable.';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "accept" or "reject".',
      });
    }

    await appointment.save();

    // Notify student of response
    if (appointment.student) {
      const isAccepted = action === 'accept';
      await createNotification({
        recipient: appointment.student._id,
        sender: req.user._id,
        title: `Appointment ${isAccepted ? 'Confirmed' : 'Declined'}`,
        message: `Your appointment on ${appointment.date} at ${appointment.startTime} was ${
          isAccepted ? 'accepted' : 'declined: ' + (rejectionReason || 'No reason provided')
        }.`,
        type: 'Appointment',
        link: `/student/appointments`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${action === 'accept' ? 'confirmed' : 'rejected'}.`,
      appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Faculty marks appointment completed
// @route   PUT /api/appointments/:id/complete
// @access  Private (Faculty)
export const completeAppointment = async (req, res, next) => {
  try {
    const { facultyNotes } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      faculty: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    appointment.status = 'Completed';
    if (facultyNotes) appointment.facultyNotes = facultyNotes;
    await appointment.save();

    if (appointment.student) {
      await createNotification({
        recipient: appointment.student,
        sender: req.user._id,
        title: 'Appointment Completed',
        message: `Your appointment session on ${appointment.date} has been marked as completed.`,
        type: 'Appointment',
        link: `/student/appointments`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed.',
      appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete slot (if not booked)
// @route   DELETE /api/appointments/:id
// @access  Private (Faculty, Admin)
export const deleteSlot = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'faculty') query.faculty = req.user._id;

    const slot = await Appointment.findOne(query);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found.' });
    }

    if (slot.status === 'Requested' || slot.status === 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active or accepted appointment. Please decline or cancel first.',
      });
    }

    await slot.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
