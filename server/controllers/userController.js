import User from '../models/User.js';

// @desc    Get all users (with filtering)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { identifier: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get list of all faculty members
// @route   GET /api/users/faculty
// @access  Private
export const getFaculty = async (req, res, next) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .populate('department', 'name code')
      .select('name email identifier department phone avatar bio');

    res.status(200).json({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin update user role or details
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { role, department, identifier, name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, department, identifier, name, phone },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details updated.',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User account removed.',
    });
  } catch (err) {
    next(err);
  }
};
