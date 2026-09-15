import express from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  assignComplaint,
  updateComplaintStatus,
  confirmResolution,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(authorize('student'), createComplaint);

router.route('/:id')
  .get(getComplaintById);

router.put('/:id/assign', authorize('admin'), assignComplaint);
router.put('/:id/status', authorize('admin', 'faculty'), updateComplaintStatus);
router.put('/:id/confirm', authorize('student'), confirmResolution);

export default router;
