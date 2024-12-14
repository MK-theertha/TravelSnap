import express from 'express';

import {
  loginUser,
  logoutUser,
  signupUser,
  verifyEmail,
  getAllUsers,
  getReportedPosts,
  deleteReportedPost,
} from '../controllers/adminController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/verify-email', verifyEmail);
router.get('/users', protectRoute, getAllUsers);
router.get('/posts', protectRoute, getReportedPosts);
router.delete('/posts/:id', protectRoute, deleteReportedPost);

export default router;
