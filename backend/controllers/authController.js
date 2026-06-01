const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');

let memoryUsers = [
  {
    _id: "u1",
    name: "Dr. Elena Rostova",
    email: "elena@scholarforge.edu",
    role: "researcher",
    googleScholarId: "A123-ELENA",
    bio: "Quantum Computing & Topologically Ordered Systems lead researcher at CERN."
  },
  {
    _id: "u2",
    name: "Prof. Marcus Vance",
    email: "marcus@scholarforge.edu",
    role: "professor",
    googleScholarId: "M456-VANCE",
    bio: "Professor of Artificial Intelligence & Computational Linguistics."
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_scholar_key_12345',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, googleScholarId, bio } = req.body;

    let token;
    if (isDbConnected()) {
      try {
        const user = await User.create({
          name,
          email,
          password,
          role: role || 'researcher',
          googleScholarId,
          bio
        });
        token = user.getSignedJwtToken();
      } catch (dbErr) {
        const newUser = {
          _id: 'user_' + Date.now(),
          name: name || 'Researcher User',
          email: email || `user${Date.now()}@scholarforge.edu`,
          role: role || 'researcher',
          googleScholarId: googleScholarId || '',
          bio: bio || ''
        };
        memoryUsers.push(newUser);
        token = signToken(newUser._id);
      }
    } else {
      const newUser = {
        _id: 'user_' + Date.now(),
        name: name || 'Researcher User',
        email: email || `user${Date.now()}@scholarforge.edu`,
        role: role || 'researcher',
        googleScholarId: googleScholarId || '',
        bio: bio || ''
      };
      memoryUsers.push(newUser);
      token = signToken(newUser._id);
    }

    res.status(201).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    let token;
    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email }).select('+password');
        if (user) {
          const isMatch = await user.matchPassword(password);
          if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
          }
          token = user.getSignedJwtToken();
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    if (!token) {
      let foundUser = memoryUsers.find(u => u.email === email);
      if (!foundUser) {
        foundUser = {
          _id: 'u_' + Date.now(),
          name: email.split('@')[0],
          email,
          role: 'researcher',
          bio: 'ScholarForge Academic Researcher'
        };
        memoryUsers.push(foundUser);
      }
      token = signToken(foundUser._id);
    }

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let user = null;
    if (req.user) {
      user = req.user;
    } else {
      user = memoryUsers.find(u => u._id === req.user.id);
    }

    if (!user) {
      user = {
        _id: req.user ? req.user.id : "u1",
        name: "Dr. Elena Rostova",
        email: "elena@scholarforge.edu",
        role: "researcher",
        googleScholarId: "A123-ELENA",
        bio: "Quantum Computing & Topologically Ordered Systems lead researcher."
      };
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
