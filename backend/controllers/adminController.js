import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import generateTokenAndSetCookie from '../utils/helpers/generateTokenAndSetCookie.js';
import Admin from '../models/adminModel.js';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';

const getReportedPosts = async (req, res) => {
  try {
    // Find all posts with at least one report
    const reportedPosts = await Post.find({ reports: { $gt: 0 } }).populate(
      'postedBy',
      'name username'
    );

    if (!reportedPosts || reportedPosts.length === 0) {
      return res.status(404).json({ message: 'No reported posts found' });
    }

    res.status(200).json(reportedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReportedPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Find and delete the post by its ID
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({}).select('-password'); // Exclude password for security

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const userExists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    const verificationUrl = `${process.env.ADMIN_URL}/verify-email?token=${emailVerificationToken}`;

    const newAdmin = new Admin({
      name,
      email,
      username,
      password,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
    });

    await newAdmin.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `<p>Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>`,
    });

    res.status(201).json({
      message:
        'User registered successfully. Please check your email to verify your account.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is missing' });
    }

    const admin = await Admin.findOne({
      emailVerificationToken: token,
    });

    if (!admin) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification token' });
    }

    // Check if the token has expired
    if (new Date() > new Date(admin.emailVerificationExpires)) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    admin.isEmailVerified = true;
    await admin.save();

    res
      .status(200)
      .json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.log('Error in verifyEmail:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin?.password || ''
    );

    if (!admin || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    if (!admin.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    generateTokenAndSetCookie(admin._id, res);

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  verifyEmail,
  getAllUsers,
  getReportedPosts,
  deleteReportedPost,
};
