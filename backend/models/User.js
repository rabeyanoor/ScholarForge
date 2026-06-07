const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*@[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/,
      'Please add a valid email'
    ]
  },
  role: {
