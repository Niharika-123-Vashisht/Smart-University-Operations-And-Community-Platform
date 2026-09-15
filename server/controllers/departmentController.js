import Department from '../models/Department.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('headOfDepartment', 'name email identifier')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment, contactEmail, officeLocation } = req.body;

    const department = await Department.create({
      name,
      code,
      description,
      headOfDepartment: headOfDepartment || null,
      contactEmail,
      officeLocation,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('headOfDepartment', 'name email');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated.',
      department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
