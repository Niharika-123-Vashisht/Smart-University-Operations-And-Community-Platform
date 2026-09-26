import paginationHelper from '../utils/pagination.js';
import LostFound from '../models/LostFound.js';

export const getItems = async (req, res, next) => {
  try {
    const { type, category, status, search } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const { page, limit, skip } = paginationHelper(req.query);
    const total = await LostFound.countDocuments(query);
    const items = await LostFound.find(query)
      .populate('postedBy', 'name email avatar identifier')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: items.length,
      total,
      items,
    });
  } catch (err) {
    next(err);
  }
};
// Duplicate block removed – functionality provided by the exported getItems above





// @desc    Get single item details
// @route   GET /api/lost-found/:id
// @access  Public / Private
export const getItemById = async (req, res, next) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate('postedBy', 'name email phone avatar identifier')
      .populate('resolvedBy', 'name email');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Post a lost or found item
// @route   POST /api/lost-found
// @access  Private
export const createItem = async (req, res, next) => {
  try {
    const { type, title, description, category, location, date, contactPhone, contactEmail } =
      req.body;

    let image = req.body.image || '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const item = await LostFound.create({
      type,
      title,
      description,
      category: category || 'Other',
      location,
      date: date || new Date(),
      image,
      postedBy: req.user._id,
      contactPhone: contactPhone || req.user.phone || '',
      contactEmail: contactEmail || req.user.email || '',
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: `${type} item posted successfully.`,
      item,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark item as resolved/claimed
// @route   PUT /api/lost-found/:id/resolve
// @access  Private
export const resolveItem = async (req, res, next) => {
  try {
    const { resolutionNote } = req.body;

    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    // Only original poster or admin can resolve
    if (
      req.user.role !== 'admin' &&
      item.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the poster or an administrator can mark this item as resolved.',
      });
    }

    item.status = 'Resolved';
    item.resolvedBy = req.user._id;
    item.resolvedAt = new Date();
    if (resolutionNote) item.resolutionNote = resolutionNote;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item status updated to Resolved/Claimed.',
      item,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete item
// @route   DELETE /api/lost-found/:id
// @access  Private
export const deleteItem = async (req, res, next) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    if (
      req.user.role !== 'admin' &&
      item.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post.',
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item removed.',
    });
  } catch (err) {
    next(err);
  }
};
