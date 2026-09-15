import express from 'express';
import {
  createSlot,
  getFacultyAvailableSlots,
  bookSlot,
  getMyAppointments,
  respondToAppointment,
  completeAppointment,
  deleteSlot,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.post('/slots', authorize('faculty'), createSlot);
router.get('/faculty/:facultyId/slots', getFacultyAvailableSlots);
router.post('/:id/book', authorize('student'), bookSlot);
router.get('/my', getMyAppointments);
router.put('/:id/respond', authorize('faculty'), respondToAppointment);
router.put('/:id/complete', authorize('faculty'), completeAppointment);
router.delete('/:id', authorize('faculty', 'admin'), deleteSlot);

export default router;
