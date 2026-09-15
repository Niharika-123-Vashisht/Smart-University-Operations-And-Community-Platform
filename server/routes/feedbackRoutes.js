import express from 'express';
import {
  createFeedback,
  getFeedback,
  deleteFeedback,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.post('/', createFeedback);
router.get('/', authorize('admin'), getFeedback);
router.delete('/:id', authorize('admin'), deleteFeedback);

export default router;
