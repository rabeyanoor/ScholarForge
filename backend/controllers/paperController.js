const Paper = require('../models/Paper');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get all papers (with search/filtering)
// @route   GET /api/papers
// @access  Public
exports.getPapers = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };
