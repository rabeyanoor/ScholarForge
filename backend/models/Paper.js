const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a publication title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  abstract: {
    type: String,
    required: [true, 'Please add an abstract/description']
  },
  authors: {
    type: [String],
    required: [true, 'Please add at least one author']
  },
  doi: {
    type: String,
    unique: true,
