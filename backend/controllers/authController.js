const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, googleScholarId, bio } = req.body;

