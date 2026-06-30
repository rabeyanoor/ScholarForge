const express = require('express');
const {
  getPapers,
  getPaper,
  createPaper,
  deletePaper
} = require('../controllers/paperController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getPapers)
  .post(protect, authorize('researcher', 'professor', 'admin'), createPaper);

router
  .route('/:id')
  .get(getPaper)
  .delete(protect, deletePaper);
