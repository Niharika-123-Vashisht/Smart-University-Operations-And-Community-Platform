import paginationHelper from '../utils/pagination.js';

export const getHelpRequests = async (req, res, next) => {
  try {
    const { category, status, urgency, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillNeeded: { $regex: search, $options: 'i' } },
      ];
    }
    const { page, limit, skip } = paginationHelper(req.query);
    const total = await HelpRequest.countDocuments(query);
    const requests = await HelpRequest.find(query)
      .populate('student', 'name email identifier avatar department')
      .populate('acceptedBy', 'name email identifier avatar department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: requests.length,
      total,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all help requests with filters
// @route   GET /api/help-requests
// @access  Private
export const getHelpRequests = async (req, res, next) => {
  try {
    const { category, status, urgency, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillNeeded: { $regex: search, $options: 'i' } },
      ];
    }

    const requests = await HelpRequest.find(query)
      .populate('student', 'name email identifier avatar department')
      .populate('acceptedBy', 'name email identifier avatar department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's help requests (both requested and accepted to help)
// @route   GET /api/help-requests/my
// @access  Private (Student)
export const getMyHelpRequests = async (req, res, next) => {
  try {
    const myRequests = await HelpRequest.find({ student: req.user._id })
      .populate('acceptedBy', 'name email identifier phone avatar')
      .sort({ createdAt: -1 });

    const acceptedByMe = await HelpRequest.find({ acceptedBy: req.user._id })
      .populate('student', 'name email identifier phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      myRequests,
      acceptedByMe,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new help request
// @route   POST /api/help-requests
// @access  Private (Student)
export const createHelpRequest = async (req, res, next) => {
  try {
    const { title, description, category, skillNeeded, urgency } = req.body;

    const request = await HelpRequest.create({
      title,
      description,
      category: category || 'Programming',
      skillNeeded,
      urgency: urgency || 'Medium',
      student: req.user._id,
      status: 'Open',
    });

    // Proactive matching: find peers with this skill and notify them
    try {
      const matchingSkills = await Skill.find({
        skillName: { $regex: skillNeeded, $options: 'i' },
        user: { $ne: req.user._id },
      }).limit(5);

      for (const match of matchingSkills) {
        await createNotification({
          recipient: match.user,
          sender: req.user._id,
          title: `Peer Needs Help with ${skillNeeded}`,
          message: `${req.user.name} posted a help request that matches your skill: "${title}".`,
          type: 'Skill',
          link: '/skills/requests',
        });
      }
    } catch (notifyErr) {
      console.error('Peer notification failed:', notifyErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Help request posted to community board.',
      request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept to help a student with their request
// @route   PUT /api/help-requests/:id/accept
// @access  Private (Student)
export const acceptHelpRequest = async (req, res, next) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found.' });
    }

    if (request.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This help request is no longer open.',
      });
    }

    if (request.student.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot accept your own help request.',
      });
    }

    request.status = 'Accepted';
    request.acceptedBy = req.user._id;
    request.acceptedAt = new Date();
    await request.save();

    // Notify original student
    await createNotification({
      recipient: request.student,
      sender: req.user._id,
      title: 'Help Request Accepted!',
      message: `${req.user.name} offered to assist you with "${request.title}". Check your requests board.`,
      type: 'Skill',
      link: '/skills/requests',
    });

    res.status(200).json({
      success: true,
      message: 'You have accepted to help this student!',
      request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark help request completed
// @route   PUT /api/help-requests/:id/complete
// @access  Private (Student)
export const completeHelpRequest = async (req, res, next) => {
  try {
    const { resolutionNote } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Only student or accepted peer can complete
    const isStudent = request.student.toString() === req.user._id.toString();
    const isHelper = request.acceptedBy && request.acceptedBy.toString() === req.user._id.toString();

    if (!isStudent && !isHelper && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this request complete.',
      });
    }

    request.status = 'Completed';
    request.completedAt = new Date();
    if (resolutionNote) request.resolutionNote = resolutionNote;
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Help request completed successfully.',
      request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete help request
// @route   DELETE /api/help-requests/:id
// @access  Private (Student, Admin)
export const deleteHelpRequest = async (req, res, next) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      request.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request.',
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Help request deleted.',
    });
  } catch (err) {
    next(err);
  }
};
