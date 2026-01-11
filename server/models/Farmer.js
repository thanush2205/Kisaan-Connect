const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  villageTown: {
    type: String,
    required: true,
    trim: true
  },
  pinCode: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  fcmToken: {
    type: String,
    default: null,
    index: true // Index for faster lookups
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
