import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import generateTokenAndSetCookie from '../utils/helpers/generateTokenAndSetCookie.js';

const getUserProfile = async (req, res) => {
  const { query } = req.params;

  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select('-password')
        .select('-updatedAt');
    } else {
      user = await User.findOne({ username: query })
        .select('-password')
        .select('-updatedAt');
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password, profilePic, bio } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

    const newUser = new User({
      name,
      email,
      username,
      password,
      profilePic: profilePic || '',
      bio: bio || '',
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
    });

    await newUser.save();

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

    const user = await User.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification token' });
    }

    // Check if the token has expired
    if (new Date() > new Date(user.emailVerificationExpires)) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    user.isEmailVerified = true;
    await user.save();

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
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ''
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
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

const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: 'You cannot follow/unfollow yourself' });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: 'User not found' });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in followUnFollowUser: ', err.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split('/').pop().split('.')[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { 'replies.userId': userId },
      {
        $set: {
          'replies.$[reply].username': user.username,
          'replies.$[reply].userProfilePic': user.profilePic,
        },
      },
      { arrayFilters: [{ 'reply.userId': userId }] }
    );

    // password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in updateUser: ', err.message);
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select('following');

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  freezeAccount,
  verifyEmail,
};
