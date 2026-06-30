const express = require('express');
const {
  getPapers,
  getPaper,
  createPaper,
  deletePaper
} = require('../controllers/paperController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
