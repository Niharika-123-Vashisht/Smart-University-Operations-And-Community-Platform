import paginationHelper from '../utils/pagination.js';
import Skill from '../models/Skill.js';

export const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { skillName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const { page, limit, skip } = paginationHelper(req.query);
    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .populate('user', 'name email identifier avatar department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: skills.length,
      total,
      skills,
    });
  } catch (err) {
    next(err);
  }
};





// @desc    Get logged in student's skills
// @route   GET /api/skills/my
// @access  Private (Student)
export const getMySkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add skill to profile
// @route   POST /api/skills
// @access  Private (Student)
export const addSkill = async (req, res, next) => {
  try {
    const { skillName, category, proficiencyLevel, availability, description } = req.body;

    const existing = await Skill.findOne({
      user: req.user._id,
      skillName: { $regex: `^${skillName.trim()}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already added this skill to your profile.',
      });
    }

    const skill = await Skill.create({
      user: req.user._id,
      skillName: skillName.trim(),
      category: category || 'Programming',
      proficiencyLevel: proficiencyLevel || 'Intermediate',
      availability: availability || 'Available on request',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Skill added to your profile.',
      skill,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Student)
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Skill removed from profile.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Skill-based matching: Find best peers for a requested skill
// @route   GET /api/skills/match
// @access  Private
export const matchSkills = async (req, res, next) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a skill name query to find matches.',
      });
    }

    // Exclude current user from their own search
    const matches = await Skill.find({
      skillName: { $regex: skill, $options: 'i' },
      user: { $ne: req.user._id },
    })
      .populate('user', 'name email avatar department identifier')
      .sort({
        // Sort priority: Expert > Advanced > Intermediate > Beginner
        proficiencyLevel: 1,
      });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (err) {
    next(err);
  }
};
