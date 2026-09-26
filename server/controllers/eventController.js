import paginationHelper from '../utils/pagination.js';
import Event from '../models/Event.js';
import { createNotification } from '../utils/notify.js';
export const getEvents = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const { page, limit, skip } = paginationHelper(req.query);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .populate('department', 'name code')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    // Enhance payload with whether current user is registered
    const enhancedEvents = events.map((ev) => {
      const obj = ev.toObject({ virtuals: true });
      if (req.user) {
        obj.isUserRegistered = (ev.registeredStudents || []).some((reg) => {
          const sId = reg.student?._id ? reg.student._id.toString() : reg.student?.toString();
          return sId === req.user._id.toString();
        });
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: enhancedEvents.length,
      total,
      events: enhancedEvents,
    });
  } catch (err) {
    next(err);
  }
};



// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public / Private
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar')
      .populate('department', 'name code')
      .populate('registeredStudents.student', 'name email identifier avatar');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const obj = event.toObject({ virtuals: true });
    if (req.user) {
      obj.isUserRegistered = (event.registeredStudents || []).some((reg) => {
        const sId = reg.student?._id ? reg.student._id.toString() : reg.student?.toString();
        return sId === req.user._id.toString();
      });
    }

    res.status(200).json({
      success: true,
      event: obj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin, Faculty)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, venue, startDate, endDate, capacity, department, bannerImage } =
      req.body;

    const event = await Event.create({
      title,
      description,
      category: category || 'Workshop',
      venue,
      startDate,
      endDate,
      capacity,
      department: department || null,
      bannerImage: bannerImage || '',
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Event published successfully.',
      event,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register student for an event (Enforce capacity & duplicate checks)
// @route   POST /api/events/:id/register
// @access  Private (Student)
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (!event.registeredStudents) event.registeredStudents = [];

    // 1. Check duplicate registration
    const isAlreadyRegistered = event.registeredStudents.some((reg) => {
      const sId = reg.student?._id ? reg.student._id.toString() : reg.student?.toString();
      return sId === req.user._id.toString();
    });
    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
      });
    }

    // 2. Enforce capacity limit
    if (event.capacity && event.registeredStudents.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration full. Maximum capacity for this event has been reached.',
      });
    }

    // Add registration
    event.registeredStudents.push({
      student: req.user._id,
      registeredAt: new Date(),
    });

    await event.save();

    // Send confirmation notification
    await createNotification({
      recipient: req.user._id,
      sender: event.organizer,
      title: 'Event Registration Confirmed',
      message: `You are officially registered for "${event.title}". Venue: ${event.venue}.`,
      type: 'Event',
      link: '/events',
    });

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event!',
      event: event.toObject({ virtuals: true }),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel event registration
// @route   POST /api/events/:id/cancel
// @access  Private (Student)
export const cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (!event.registeredStudents) event.registeredStudents = [];
    const initialLength = event.registeredStudents.length;
    event.registeredStudents = event.registeredStudents.filter((reg) => {
      const sId = reg.student?._id ? reg.student._id.toString() : reg.student?.toString();
      return sId !== req.user._id.toString();
    });

    if (event.registeredStudents.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event.',
      });
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.',
      event: event.toObject({ virtuals: true }),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin, Organizer)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event.',
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted.',
    });
  } catch (err) {
    next(err);
  }
};
