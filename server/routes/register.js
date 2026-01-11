const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Farmer = require('../models/Farmer');
const { uploadProfile, deleteImage } = require('../config/cloudinary');

// Register Endpoint
router.post('/', uploadProfile.single('profilePicture'), async (req, res) => {
  console.log('Received POST /register request');
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);

  const {
    fullName, phoneNumber, email, password, inputState, inputDistrict, village_town, pinCode
  } = req.body;
  
  // Cloudinary stores the full URL in req.file.path
  const profilePicture = req.file ? req.file.path : null;

  console.log('Parsed form data:', {
    fullName, phoneNumber, email, password, inputState, inputDistrict, village_town, pinCode
  });
  console.log('Cloudinary image URL:', profilePicture);

  try {
    console.log('Checking for duplicate phone number or email:', phoneNumber, email);
    
    // Check for existing farmer with same phone number or email
    const existingFarmer = await Farmer.findOne({
      $or: [
        { phoneNumber: phoneNumber },
        { email: email || null }
      ]
    });
    
    console.log('Duplicate check result:', existingFarmer);

    if (existingFarmer) {
      // Delete uploaded image from Cloudinary if duplicate found
      if (profilePicture) {
        await deleteImage(profilePicture);
      }
      
      if (existingFarmer.phoneNumber === phoneNumber) {
        console.log('Duplicate phone number found');
        return res.status(400).json({ error: 'Phone number already registered.Please Login to your Account' });
      }
      if (existingFarmer.email === email) {
        console.log('Duplicate email found');
        return res.status(400).json({ error: 'Email already registered.Please Login to your Account' });
      }
    }

    const saltRounds = 10;
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Create new farmer document
    const newFarmer = new Farmer({
      fullName,
      phoneNumber,
      email: email || null,
      password: hashedPassword,
      state: inputState,
      district: inputDistrict,
      villageTown: village_town,
      pinCode,
      profilePicture
    });
    
    console.log('Creating new farmer with data:', {
      fullName, phoneNumber, email: email || null, inputState, inputDistrict, village_town, pinCode, profilePicture
    });
    
    const savedFarmer = await newFarmer.save();
    console.log('Farmer saved successfully:', savedFarmer._id);

    console.log('Farmer registered successfully');
    res.status(200).json({ message: 'Farmer registered successfully!' });
  } catch (error) {
    console.error('Error in /register endpoint:', error);
    
    // Delete uploaded image from Cloudinary on error
    if (profilePicture) {
      await deleteImage(profilePicture);
    }
    
    if (error.code === 11000) { // MongoDB duplicate key error
      console.log('Duplicate entry error detected');
      return res.status(400).json({ error: 'Duplicate entry detected' });
    }
    res.status(500).json({ error: 'An error occurred while registering. Please try again.' });
  }
});

module.exports = router;