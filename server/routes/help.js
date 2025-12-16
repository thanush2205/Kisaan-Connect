const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Farmer = require('../models/Farmer');
const nodemailer = require('nodemailer');
const notificationService = require('../services/notificationService');

// Email transporter configuration with improved error handling
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  timeout: 15000, // 15 seconds timeout
  connectionTimeout: 15000, // 15 seconds connection timeout
  greetingTimeout: 10000, // 10 seconds greeting timeout
  socketTimeout: 15000, // 15 seconds socket timeout
  pool: true, // Use connection pooling
  maxConnections: 1, // Limit concurrent connections
  rateLimit: 3 // Limit to 3 emails per second
});

// Safe email sending function with fallback
async function sendEmailSafely(mailOptions) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured - skipping email');
      return { success: false, reason: 'not_configured' };
    }
    
    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // Log the ticket anyway even if email fails
    console.log('Email failed but ticket was still created successfully');
    return { success: false, error: error.message };
  }
}

// Verify email transporter with better error handling
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter failed:', error.message);
    } else {
      console.log('✅ Email transporter ready for support notifications');
    }
  });
} else {
  console.warn('Email credentials not configured - support emails will fail');
}

// Middleware to check if user is authenticated (optional for help)
const optionalAuth = (req, res, next) => {
  // This route works for both authenticated and non-authenticated users
  next();
};

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user is admin (you can customize this logic)
  const adminEmails = [
    'admin@kisaanconnect.com',
    'support@kisaanconnect.com',
    'thanushreddy934@gmail.com'
  ];
  
  if (!adminEmails.includes(req.session.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Generate ticket ID
function generateTicketId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `KC${timestamp.toString().slice(-6)}${random}`;
}

// Simple validation function
function validateTicketData(data) {
  const errors = [];
  
  if (!data.name || !data.name.trim()) {
    errors.push('Name is required');
  }
  
  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.message || !data.message.trim()) {
    errors.push('Message is required');
  }
  
  if (!data.category || !data.category.trim()) {
    errors.push('Category is required');
  }
  
  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push('Invalid priority level');
  }
  
  return errors;
}

// Email notification functions
async function sendSupportNotificationEmails(ticket) {
  try {
    console.log(`📧 Attempting to send email notifications for ticket ${ticket.ticketId}`);
    
    // Send notification to admin (thanushreddy934@gmail.com)
    const adminResult = await sendAdminNotification(ticket);
    
    // Send confirmation to user
    const userResult = await sendUserConfirmation(ticket);
    
    if (adminResult.success || userResult.success) {
      console.log(`✅ Email notifications processed for ticket ${ticket.ticketId}`);
    } else {
      console.log(`⚠️ Email notifications failed for ticket ${ticket.ticketId}, but ticket was created successfully`);
    }
  } catch (error) {
    console.error('Error sending email notifications:', error);
    console.log('Ticket creation will continue despite email failure');
  }
}

async function sendAdminNotification(ticket) {
  const priorityEmoji = {
    low: '🟢',
    medium: '🟡', 
    high: '🟠',
    urgent: '🔴'
  };

  const categoryEmoji = {
    technical: '🔧',
    crop_disease: '🌱',
    market_prices: '💰',
    weather: '🌤️',
    equipment: '🚜',
    general: '💬'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'thanushreddy934@gmail.com',
    subject: `${priorityEmoji[ticket.priority]} New Support Ticket: ${ticket.ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">🎫 New Support Ticket</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Ticket ID: <strong>${ticket.ticketId}</strong></p>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2e7d32; margin-bottom: 15px;">📋 Ticket Details</h3>
          
          <div style="margin-bottom: 10px;">
            <strong>👤 Name:</strong> ${ticket.name}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>📧 Email:</strong> ${ticket.email}
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>🎯 Priority:</strong> 
            <span style="background: ${ticket.priority === 'urgent' ? '#f44336' : ticket.priority === 'high' ? '#ff9800' : ticket.priority === 'medium' ? '#ffc107' : '#4caf50'}; color: white; padding: 3px 8px; border-radius: 15px; font-size: 12px;">
              ${priorityEmoji[ticket.priority]} ${ticket.priority.toUpperCase()}
            </span>
          </div>
          
          <div style="margin-bottom: 10px;">
            <strong>📂 Category:</strong> ${categoryEmoji[ticket.category] || '📋'} ${ticket.category.replace('_', ' ').toUpperCase()}
          </div>
          
          ${ticket.cropType ? `<div style="margin-bottom: 10px;"><strong>🌾 Crop Type:</strong> ${ticket.cropType}</div>` : ''}
          
          <div style="margin-bottom: 10px;">
            <strong>⏰ Created:</strong> ${new Date(ticket.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>
        </div>
        
        <div style="padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2e7d32; margin-bottom: 15px;">💬 Message</h3>
          <p style="line-height: 1.6; color: #333; background-color: #f8f8f8; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50;">
            ${ticket.message}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000/admin-help.html" style="background: linear-gradient(45deg, #4caf50, #2e7d32); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            🎛️ Manage in Admin Dashboard
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>🌾 Kisaan Connect Support System | Helping Farmers Grow</p>
        </div>
      </div>
    `
  };

  return sendEmailSafely(mailOptions);
}

async function sendUserConfirmation(ticket) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ticket.email,
    subject: `✅ Support Ticket Created: ${ticket.ticketId} - Kisaan Connect`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">✅ Support Ticket Confirmed</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Ticket ID: <strong>${ticket.ticketId}</strong></p>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear <strong>${ticket.name}</strong>,</p>
          
          <p>Thank you for contacting Kisaan Connect support! We have received your support request and our team will respond to you soon.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-bottom: 10px;">📋 Your Ticket Details</h3>
            <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
            <p><strong>Priority:</strong> ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</p>
            <p><strong>Category:</strong> ${ticket.category.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Expected Response:</strong> ${getExpectedResponseTime(ticket.priority)}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p><strong>📞 Need Immediate Help?</strong></p>
            <p>For urgent farming issues, call us directly: <strong>+91-9876543210</strong></p>
            <p>Available: 9 AM - 8 PM (All days)</p>
          </div>
          
          <p>You can track your ticket status or provide additional information by replying to this email or visiting our help center.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/help.html" style="background: linear-gradient(45deg, #4caf50, #2e7d32); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🎛️ Visit Help Center
            </a>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>🌾 Kisaan Connect - Empowering Farmers with Technology</p>
          <p>If you have any questions about this ticket, please contact us at support@kisaanconnect.com</p>
        </div>
      </div>
    `
  };

  return sendEmailSafely(mailOptions);
}

function getExpectedResponseTime(priority) {
  const responseTimes = {
    urgent: 'Within 1 hour',
    high: '2-4 hours', 
    medium: '4-8 hours',
    low: '24-48 hours'
  };
  return responseTimes[priority] || '24-48 hours';
}

async function sendResponseNotification(ticket, responseMessage, adminName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ticket.email,
      subject: `💬 Response to Support Ticket: ${ticket.ticketId} - Kisaan Connect`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">💬 New Response to Your Ticket</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Ticket ID: <strong>${ticket.ticketId}</strong></p>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear <strong>${ticket.name}</strong>,</p>
            
            <p>Our support team has responded to your ticket. Here are the details:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-bottom: 10px;">📋 Ticket Information</h3>
              <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
              <p><strong>Status:</strong> <span style="background: #4caf50; color: white; padding: 3px 8px; border-radius: 15px; font-size: 12px;">${ticket.status.toUpperCase()}</span></p>
              <p><strong>Responded by:</strong> ${adminName}</p>
              <p><strong>Response Date:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; margin-bottom: 15px;">💬 Response from Support Team</h3>
              <p style="line-height: 1.6; color: #333; margin: 0;">
                ${responseMessage}
              </p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📞 Need More Help?</strong></p>
              <p>If you have additional questions, please reply to this email or create a new ticket.</p>
              <p><strong>Emergency Support:</strong> +91-9876543210 (9 AM - 8 PM)</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/help.html" style="background: linear-gradient(45deg, #4caf50, #2e7d32); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                🎛️ Visit Help Center
              </a>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
            <p>🌾 Kisaan Connect - Empowering Farmers with Technology</p>
            <p>This is an automated response to your support ticket. Please do not reply directly to this email.</p>
          </div>
        </div>
      `
    };

    const result = await sendEmailSafely(mailOptions);
    if (result.success) {
      console.log(`📧 Response notification sent to ${ticket.email} for ticket ${ticket.ticketId}`);
    } else {
      console.log(`⚠️ Failed to send response notification to ${ticket.email} for ticket ${ticket.ticketId}`);
    }
  } catch (error) {
    console.error('Error sending response notification:', error);
  }
}

// POST /api/help/tickets - Create new support ticket
router.post('/tickets', optionalAuth, async (req, res) => {
  console.log('Received support ticket request:', req.body);
  
  try {
    // Validate input data
    const validationErrors = validateTicketData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const {
      name,
      email,
      priority = 'medium',
      category,
      cropType,
      message
    } = req.body;

    // Generate unique ticket ID
    const ticketId = generateTicketId();

    // Create new ticket
    const newTicket = new Ticket({
      ticketId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      priority,
      category,
      cropType: cropType ? cropType.trim() : null,
      message: message.trim(),
      status: 'open',
      userId: req.session.user ? req.session.user.id : null,
      source: 'web_form'
    });

    const savedTicket = await newTicket.save();
    console.log('Support ticket created:', savedTicket.ticketId);

    // Send notification emails
    await sendSupportNotificationEmails(savedTicket);

    // Send response
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticketId: savedTicket.ticketId,
      id: savedTicket._id,
      expectedResponse: getExpectedResponseTime(priority)
    });
    
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// GET /api/help/tickets - Get all tickets (admin only)
router.get('/tickets', requireAdmin, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Get tickets with pagination
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalTickets: total
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/help/tickets/:id - Get specific ticket details
router.get('/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ticket ID or MongoDB _id
    const ticket = await Ticket.findOne({
      $or: [
        { ticketId: id },
        { _id: id }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user can access this ticket
    if (!req.session.user) {
      // For non-authenticated users, require email verification
      const { email } = req.query;
      if (!email || ticket.email !== email.toLowerCase()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else {
      // For authenticated users, check if they own the ticket or are admin
      const adminEmails = ['admin@kisaanconnect.com', 'support@kisaanconnect.com', 'thanushreddy934@gmail.com'];
      const isAdmin = adminEmails.includes(req.session.user.email);
      const isOwner = ticket.userId && ticket.userId.toString() === req.session.user.id;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// PUT /api/help/tickets/:id - Update ticket (admin only)
router.put('/tickets/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminResponse, assignedTo } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.session.user.id;
    }
    if (assignedTo) updateData.assignedTo = assignedTo;
    
    updateData.updatedAt = new Date();

    const ticket = await Ticket.findOneAndUpdate(
      { $or: [{ ticketId: id }, { _id: id }] },
      updateData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Send push notification to user if admin added a response
    if (adminResponse) {
      try {
        const user = await Farmer.findOne({ email: ticket.email });
        
        if (user && user.fcmToken) {
          console.log(`📤 Sending push notification to ${user.fullName} for ticket update`);
          
          await notificationService.sendAdminResponseNotification(user.fcmToken, {
            ticketId: ticket.ticketNumber || ticket.ticketId || ticket._id,
            status: status === 'resolved' ? 'resolved' : 'updated',
            adminResponse: adminResponse.substring(0, 100) // Limit length for notification
          });
          
          console.log('✅ Push notification sent successfully');
        } else {
          console.log('⚠️ No FCM token found for user or user not found');
        }
      } catch (notifError) {
        console.error('❌ Error sending push notification:', notifError.message);
        // Don't fail the update if notification fails
      }
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });

    // TODO: Send notification to user about update
    
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// POST /api/help/tickets/:id/response - Add admin response
router.post('/tickets/:id/response', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status = 'in_progress' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Response message is required' });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { $or: [{ ticketId: id }, { _id: id }] },
      {
        $push: {
          responses: {
            message: message.trim(),
            respondedBy: req.session.user.id,
            respondedByName: req.session.user.fullName,
            respondedAt: new Date(),
            type: 'admin'
          }
        },
        status,
        lastResponseAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Send email notification to user about the response
    await sendResponseNotification(ticket, message.trim(), req.session.user.fullName);

    // Send push notification to user
    try {
      const user = await Farmer.findOne({ email: ticket.email });
      
      if (user && user.fcmToken) {
        console.log(`📤 Sending push notification to ${user.fullName} for ticket response`);
        
        await notificationService.sendAdminResponseNotification(user.fcmToken, {
          ticketId: ticket.ticketNumber || ticket.ticketId || ticket._id,
          status: status === 'resolved' ? 'resolved' : 'responded',
          adminResponse: message.trim().substring(0, 100) // Limit length for notification
        });
        
        console.log('✅ Push notification sent successfully');
      } else {
        console.log('⚠️ No FCM token found for user or user not found');
      }
    } catch (notifError) {
      console.error('❌ Error sending push notification:', notifError.message);
      // Don't fail the response if notification fails
    }

    res.json({
      message: 'Response added successfully',
      ticket
    });
    
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

// GET /api/help/stats - Get support statistics (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      total,
      open,
      resolved,
      urgent,
      todayTickets
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } }),
      Ticket.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // Get response time stats
    const avgResponseTime = await Ticket.aggregate([
      { $match: { respondedAt: { $exists: true } } },
      {
        $project: {
          responseTime: {
            $subtract: ['$respondedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const stats = {
      total,
      open,
      resolved,
      closed: total - open - resolved,
      urgent,
      todayTickets,
      avgResponseTimeHours: avgResponseTime.length > 0 
        ? Math.round(avgResponseTime[0].avgResponseTime / (1000 * 60 * 60) * 10) / 10 
        : 0,
      activeUsers: 0 // Placeholder - implement based on your user activity logic
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function to get expected response time
function getExpectedResponseTime(priority) {
  const times = {
    urgent: 'Within 1 hour',
    high: '2-4 hours',
    medium: '4-8 hours',
    low: '24-48 hours'
  };
  return times[priority] || '24-48 hours';
}

module.exports = router;
