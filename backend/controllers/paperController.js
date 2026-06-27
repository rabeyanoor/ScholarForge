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
      query = query.find({
        $or: [
          { title: searchPattern },
          { abstract: searchPattern },
          { authors: searchPattern }
        ]
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Execute query
    const papers = await query;

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single paper
// @route   GET /api/papers/:id
// @access  Public
exports.getPaper = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id).populate({
      path: 'uploadedBy',
      select: 'name role'
    });

    if (!paper) {
      return next(new ErrorResponse(`Paper not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: paper
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new paper
// @route   POST /api/papers
// @access  Private
exports.createPaper = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.uploadedBy = req.user.id;

    const paper = await Paper.create(req.body);

    res.status(201).json({
      success: true,
      data: paper
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete paper
// @route   DELETE /api/papers/:id
