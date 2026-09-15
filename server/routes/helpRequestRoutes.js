import express from 'express';
import {
  getHelpRequests,
  getMyHelpRequests,
  createHelpRequest,
  acceptHelpRequest,
  completeHelpRequest,
  deleteHelpRequest,
} from '../controllers/helpRequestController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/', getHelpRequests);
router.get('/my', authorize('student'), getMyHelpRequests);
router.post('/', authorize('student'), createHelpRequest);
router.put('/:id/accept', authorize('student'), acceptHelpRequest);
router.put('/:id/complete', completeHelpRequest);
router.delete('/:id', deleteHelpRequest);

export default router;
