const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  timeout: 10000, // 10 seconds timeout
  connectionTimeout: 10000, // 10 seconds connection timeout
  greetingTimeout: 5000, // 5 seconds greeting timeout
  socketTimeout: 10000 // 10 seconds socket timeout
});

// Verify email configuration with better error handling
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter failed:', error.message);
    } else {
      console.log('Email transporter ready');
    }
  });
} else {
  console.warn('Email credentials not configured - password reset emails will fail');
}

router.post('/', async (req, res) => {
  console.log('Received POST /forgot-password:', req.body);
  const { email } = req.body;

  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');

  if (!email) {
    console.log('Email missing');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await Farmer.findOne({ email });
    console.log('Database query result:', user);
    if (!user) {
      console.log('No user found for email:', email);
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    // Update user with reset token
    await Farmer.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry
    });
    console.log('Reset token stored for:', email);

    // Use dynamic base URL for production
    const baseUrl = process.env.NODE_ENV === 'production' || 
                   process.env.RENDER === '1' || 
                   req.get('host')?.includes('render.com')
      ? `https://${req.get('host')}`
      : 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password.html?token=${resetToken}`;
    console.log('Generated reset URL:', resetUrl);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Kisaan Connect',
      text: `You requested a password reset for your Kisaan Connect account. Visit this link to reset your password: ${resetUrl}. This link expires in 1 hour. If you didn’t request this, ignore this email.`, // Plain text fallback
      html: `
        <p>You requested a password reset for your Kisaan Connect account.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn’t request this, ignore this email.</p>
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    }); // Debug email content (without exposing full content)
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Reset email sent successfully to:', email);
      res.status(200).json({ message: 'Password reset email sent!' });
    } catch (emailError) {
      console.error('Failed to send email:', emailError.message);
      // Still return success to user for security (don't reveal email issues)
      res.status(200).json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }
  } catch (error) {
    console.error('Error in /forgot-password:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

router.post('/reset', async (req, res) => {
    console.log('Received POST /forgot-password/reset:', req.body);
    const { token, newPassword } = req.body;
  
    // Set content type to JSON
    res.setHeader('Content-Type', 'application/json');
  
    if (!token || !newPassword) {
      console.log('Missing token or newPassword');
      return res.status(400).json({ error: 'Token and new password are required' });
    }
  
    try {
      console.log('Querying database with token:', token);
      const user = await Farmer.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
      console.log('Query result:', user);
      if (!user) {
        console.log('No user found for token');
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('Hashed new password');
  
      // Update password and clear reset token
      await Farmer.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });
      console.log('Password reset for user:', user.email);
  
      res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
      console.error('Error in /forgot-password/reset:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

module.exports = router;