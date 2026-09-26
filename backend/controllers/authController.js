import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '502898752167-6ld0b8gim1b5uvghr5o9uvb3t5kmd39f.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not set — refusing to start with an insecure default.'
  );
}

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /auth/register or /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /auth/login or /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /auth/me or /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile name & email
// @route   PUT /auth/profile or /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.body.name && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }
    if (req.body.email && req.body.email.trim()) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      const cleanEmail = req.body.email.toLowerCase().trim();
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }

      // Check if email already taken by another user
      const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ error: 'This email is already registered to another account' });
      }

      user.email = cleanEmail;
    }

    const updatedUser = await user.save();
    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email is already registered to another account' });
    }
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Authenticate with Google OAuth token (ID token or access token)
// @route   POST /auth/google or /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential, access_token } = req.body;
    if (!credential && !access_token) {
      return res.status(400).json({ error: 'Google credential or access token is required' });
    }

    let googleId, email, name, picture;

    if (credential) {
      // Verify ID token with Google
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Unable to retrieve user profile from Google' });
      }

      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (access_token) {
      // Retrieve user info using access_token via googleClient.request
      const userInfoResponse = await googleClient.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const profile = userInfoResponse.data;
      if (!profile || !profile.email) {
        return res.status(400).json({ error: 'Unable to retrieve user profile from Google' });
      }

      googleId = profile.sub;
      email = profile.email;
      name = profile.name;
      picture = profile.picture;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }],
    });

    if (user) {
      let isUpdated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        isUpdated = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        isUpdated = true;
      }
      if (isUpdated) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId,
        avatar: picture || '',
        authProvider: 'google',
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ error: 'Google authentication failed. Please try again.' });
  }
};
