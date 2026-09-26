import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_university_capstone_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user (Student or Faculty)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, identifier, phone } = req.body;

    if (!name || !email || typeof email !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, valid email, and password.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Restrict registration role strictly to student or faculty
    const validRoles = ['student', 'faculty'];
    const userRole = validRoles.includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      department: department || null,
      identifier: identifier || '',
      phone: phone || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        identifier: user.identifier,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both valid email and password.',
      });
    }

    // Check for user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('department', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        identifier: user.identifier,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department', 'name code');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, avatar, identifier, department } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (identifier !== undefined) fieldsToUpdate.identifier = identifier;
    if (department) fieldsToUpdate.department = department;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (err) {
    next(err);
  }
};
