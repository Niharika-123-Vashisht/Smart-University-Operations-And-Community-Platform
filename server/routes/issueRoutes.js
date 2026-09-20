// server/routes/issueRoutes.js
import express from 'express';
import {
  createIssue,
  getMyIssues,
  getIssueById,
  updateIssueStatus,
  deleteIssue,
} from '../controllers/issueController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Create issue (any authenticated user, optional image)
router.post('/', protect, upload.single('image'), createIssue);

// Get issues reported by logged‑in user
router.get('/me', protect, getMyIssues);

// Get single issue (owner, admin, faculty)
router.get('/:id', protect, getIssueById);

// Update status (admin or faculty only)
router.put('/:id/status', protect, authorize('admin', 'faculty'), updateIssueStatus);

// Delete issue (owner, only if pending)
router.delete('/:id', protect, deleteIssue);

export default router;
