const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  courses: [{
    type: String,
    trim: true
  }],
  designation: {
    type: String,
    required: true,
    trim: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  qualifications: [String],
  contactNumber: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);