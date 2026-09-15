import express from 'express';
import { getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard', authorize('admin'), getAdminAnalytics);

export default router;
