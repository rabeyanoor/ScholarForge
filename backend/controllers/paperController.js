const Paper = require('../models/Paper');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get all papers (with search/filtering)
// @route   GET /api/papers
// @access  Public
exports.getPapers = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from direct filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Paper.find(JSON.parse(queryStr)).populate({
      path: 'uploadedBy',
      select: 'name role'
    });

    // Text search if 'search' query parameter is present
    if (req.query.search) {
      const searchPattern = new RegExp(req.query.search, 'i');
