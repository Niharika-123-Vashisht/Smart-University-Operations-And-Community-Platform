import express from 'express';
import {
  getSkills,
  getMySkills,
  addSkill,
  deleteSkill,
  matchSkills,
} from '../controllers/skillController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/', getSkills);
router.get('/my', getMySkills);
router.get('/match', matchSkills);
router.post('/', authorize('student'), addSkill);
router.delete('/:id', authorize('student'), deleteSkill);

export default router;
