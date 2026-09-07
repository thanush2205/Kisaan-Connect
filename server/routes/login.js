const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Farmer = require('../models/Farmer');

router.post('/', async (req, res) => {
  console.log('Received POST /login request');
  console.log('Raw headers:', req.headers);
  console.log('Raw body:', req.body);

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { emailPhone, password } = req.body;

  if (!emailPhone || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required' });
  }

  try {
    // Find user by email or phone number
    const user = await Farmer.findOne({
      $or: [
        { email: emailPhone },
        { phoneNumber: emailPhone }
      ]
    });

    if (!user) {
      console.log('No user found');
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    console.log('User found from DB:', user); // Log full user object

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    req.session.user = {
      id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      profilePicture: user.profilePicture,
      state: user.state,
      district: user.district
    };
    console.log('Session created:', req.session.user); // Log session data

    console.log('Login successful for user:', user.fullName);
    req.session.save((sessionError) => {
      if (sessionError) {
        console.error('Error saving session:', sessionError);
        return res.status(500).json({ error: 'Could not save login session' });
      }

      res.status(200).json({ message: 'Login successful!' });
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;