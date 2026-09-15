import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  registerForEvent,
  cancelRegistration,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);
router.post('/', protect, authorize('admin', 'faculty'), createEvent);
router.post('/:id/register', protect, authorize('student'), registerForEvent);
router.post('/:id/cancel', protect, authorize('student'), cancelRegistration);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteEvent);

export default router;
