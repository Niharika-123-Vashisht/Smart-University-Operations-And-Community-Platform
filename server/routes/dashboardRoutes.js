import express from 'express';
import { protect } from '../middleware/auth.js';
import { getStudentDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

// All routes here require authentication
router.use(protect);

router.get('/stats', getStudentDashboardStats);

export default router;
