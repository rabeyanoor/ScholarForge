const mongoose = require('mongoose');

// Disable Mongoose command buffering so queries fail immediately if DB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarforge', {
      serverSelectionTimeoutMS: 2000 // 2 second timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Database connection warning: ${error.message}`);
    console.warn(`Server will operate with fallback mock database handlers.`);
  }
};

module.exports = connectDB;
