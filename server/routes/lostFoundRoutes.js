import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  resolveItem,
  deleteItem,
} from '../controllers/lostFoundController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id/resolve', protect, resolveItem);
router.delete('/:id', protect, deleteItem);

export default router;
