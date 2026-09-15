import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// Middleware to conditionally decode user if token is present
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getAnnouncements);
router.post('/', protect, authorize('admin', 'faculty'), createAnnouncement);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteAnnouncement);

export default router;
