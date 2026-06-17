const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, googleScholarId, bio } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      googleScholarId,
      bio
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
