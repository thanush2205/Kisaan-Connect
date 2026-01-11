const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  console.log('🔐 Auth check - Session:', {
    hasSession: !!req.session,
    hasUser: !!req.session.user,
    userId: req.session.user ? req.session.user.id : 'none'
  });
  
  if (!req.session.user || !req.session.user.id) {
    console.log('❌ Authentication failed - no valid session');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Store userId for compatibility with existing chat code
  req.session.userId = req.session.user.id;
  console.log('✅ User authenticated:', req.session.userId);
  next();
}

// GET /chats - Get all chats for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const chats = await Chat.getUserChats(req.session.userId);
    
    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => !p._id.equals(req.session.userId));
      const unreadCount = chat.unreadCount.find(u => u.userId.equals(req.session.userId))?.count || 0;
      
      return {
        chatId: chat._id,
        participant: {
          id: otherParticipant._id,
          name: otherParticipant.fullName,
          profilePicture: otherParticipant.profilePicture
        },
        crop: chat.cropId ? {
          id: chat.cropId._id,
          name: chat.cropId.name,
          imageUrl: chat.cropId.imageUrl
        } : null,
        lastMessage: {
          content: chat.lastMessage.content,
          timestamp: chat.lastMessage.timestamp,
          isOwn: chat.lastMessage.sender ? chat.lastMessage.sender.equals(req.session.userId) : false
        },
        unreadCount,
        updatedAt: chat.updatedAt
      };
    });

    res.json({ success: true, chats: formattedChats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Start or get existing chat
router.post('/start', requireAuth, async (req, res) => {
  try {
    const { participantId, cropId } = req.body;
    const currentUserId = req.session.user.id;
    console.log('🔥 Chat start request:', { 
      userId: currentUserId,
      user: req.session.user,
      participantId, 
      cropId,
      body: req.body 
    });
    
    if (!participantId) {
      console.log('❌ Missing participant ID');
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    if (participantId === currentUserId) {
      console.log('❌ User trying to chat with themselves');
      return res.status(400).json({ error: 'Cannot start chat with yourself' });
    }

    // Check if participant exists
    console.log('🔍 Looking up participant:', participantId);
    const participant = await Farmer.findById(participantId);
    console.log('👤 Participant lookup result:', participant ? `Found: ${participant.fullName}` : 'Not found');
    if (!participant) {
      console.log('❌ Participant not found:', participantId);
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Check if chat already exists (regardless of crop - one chat per user pair)
    console.log('🔍 Checking for existing chat between users...');
    let chat = await Chat.findChatBetweenUsers(currentUserId, participantId);
    console.log('💬 Existing chat:', chat ? `Found: ${chat._id}` : 'Not found');
    
    if (!chat) {
      console.log('💬 Creating new chat');
      try {
        // Create new chat
        chat = new Chat({
          participants: [currentUserId, participantId],
          cropId: cropId || undefined
        });
        console.log('💾 Saving new chat to database...');
        await chat.save();
        console.log('✅ Chat saved:', chat._id);
        
        console.log('👥 Populating participants...');
        await chat.populate('participants', 'fullName profilePicture');
        console.log('✅ Participants populated');
        
        if (cropId) {
          console.log('🌾 Populating crop info...');
          await chat.populate('cropId', 'name imageUrl');
          console.log('✅ Crop populated');
        }
      } catch (saveError) {
        console.error('❌ Error creating chat:', saveError);
        console.error('❌ Save error details:', {
          message: saveError.message,
          name: saveError.name,
          code: saveError.code,
          errors: saveError.errors
        });
        throw saveError;
      }
    } else {
      console.log('💬 Using existing chat');
      // Make sure existing chat is populated
      if (!chat.participants[0].fullName) {
        console.log('👥 Populating existing chat participants...');
        await chat.populate('participants', 'fullName profilePicture');
      }
      
      // Optionally update the cropId if a new one is provided
      if (cropId && (!chat.cropId || chat.cropId.toString() !== cropId)) {
        console.log('📝 Updating chat cropId to:', cropId);
        chat.cropId = cropId;
        await chat.save();
        if (cropId) {
          await chat.populate('cropId', 'name imageUrl');
        }
      }
    }

    console.log('🔍 Finding other participant...');
    const otherParticipant = chat.participants.find(p => !p._id.equals(currentUserId));
    
    if (!otherParticipant) {
      console.error('❌ Could not find other participant in chat');
      console.error('Chat participants:', chat.participants);
      console.error('Current user ID:', currentUserId);
      return res.status(500).json({ error: 'Failed to identify chat participant' });
    }
    
    console.log('✅ Chat ready:', chat._id);
    res.json({
      success: true,
      chat: {
        chatId: chat._id,
        participant: {
          id: otherParticipant._id,
          name: otherParticipant.fullName,
          profilePicture: otherParticipant.profilePicture || '/uploads/profile/default-avatar.png'
        },
        crop: chat.cropId ? {
          id: chat.cropId._id,
          name: chat.cropId.name,
          imageUrl: chat.cropId.imageUrl
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error starting chat:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Failed to start chat',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /chats/:chatId/messages - Get messages for a specific chat
router.get('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('📥 Loading messages for chat:', chatId, 'by user:', req.session.userId);
    console.log('📋 Session user object:', req.session.user);

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    console.log('💬 Chat found:', chat ? 'Yes' : 'No');
    console.log('👥 Chat participants:', chat ? chat.participants : 'N/A');
    console.log('🔑 Current user ID:', req.session.userId);
    
    if (!chat || !chat.participants.includes(req.session.userId)) {
      console.log('❌ Access denied for chat:', chatId);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages and format for frontend
    console.log('🔍 Querying messages for chatId:', chatId);
    const rawMessages = await Message.find({ chatId })
      .populate('sender', 'fullName profilePicture')
      .sort({ createdAt: 1 }) // Ascending order for proper display
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    console.log('📨 Found messages:', rawMessages.length);
    console.log('📋 Sample message:', rawMessages[0] ? {
      id: rawMessages[0]._id,
      content: rawMessages[0].content,
      sender: rawMessages[0].sender ? rawMessages[0].sender.fullName : 'No sender',
      createdAt: rawMessages[0].createdAt
    } : 'No messages');

    // Format messages with isOwn field
    const messages = rawMessages.map(message => {
      // Handle case where sender might not be populated
      const sender = message.sender || { _id: message.sender, fullName: 'Unknown User', profilePicture: null };
      
      return {
        _id: message._id,
        content: message.content,
        type: message.type || 'text',
        timestamp: message.createdAt,
        sender: {
          id: sender._id,
          name: sender.fullName || 'Unknown User',
          profilePicture: sender.profilePicture
        },
        isOwn: sender._id.equals(req.session.userId),
        isRead: message.readBy ? message.readBy.some(read => read.userId.equals(req.session.userId)) : false
      };
    });
    
    // Mark messages as read for current user
    await Message.updateMany(
      { 
        chatId,
        'readBy.userId': { $ne: req.session.userId }
      },
      { 
        $push: { 
          readBy: { 
            userId: req.session.userId, 
            readAt: new Date() 
          } 
        } 
      }
    );

    console.log('✅ Returning formatted messages:', messages.length);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /chats/:chatId/messages - Send a message
router.post('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is part of this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.session.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const message = new Message({
      chatId,
      sender: req.session.userId,
      content: content.trim(),
      type
    });

    await message.save();
    await message.populate('sender', 'fullName profilePicture');

    // Update chat's last message and unread counts
    chat.lastMessage = {
      content: message.content,
      timestamp: message.createdAt,
      sender: message.sender._id
    };

    // Update unread counts for other participants
    const otherParticipants = chat.participants.filter(p => !p.equals(req.session.userId));
    for (const participantId of otherParticipants) {
      const unreadEntry = chat.unreadCount.find(u => u.userId.equals(participantId));
      if (unreadEntry) {
        unreadEntry.count += 1;
      } else {
        chat.unreadCount.push({ userId: participantId, count: 1 });
      }
    }

    await chat.save();

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Debug endpoint to check database data
router.get('/debug', async (req, res) => {
  try {
    const farmers = await Farmer.find().select('fullName email phoneNumber').limit(5);
    const crops = await Crop.find().select('name seller sellerId').limit(5);
    const chats = await Chat.find().populate('participants', 'fullName').limit(5);
    const messages = await Message.find().populate('sender', 'fullName').limit(10);
    
    res.json({
      farmersCount: await Farmer.countDocuments(),
      cropsCount: await Crop.countDocuments(),
      chatsCount: await Chat.countDocuments(),
      messagesCount: await Message.countDocuments(),
      sampleFarmers: farmers,
      sampleCrops: crops,
      sampleChats: chats,
      sampleMessages: messages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to create sample messages (for debugging)
router.post('/debug/create-test-messages', async (req, res) => {
  try {
    // Find first two users
    const farmers = await Farmer.find().limit(2);
    if (farmers.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 users' });
    }

    const [user1, user2] = farmers;

    // Create or find chat
    let chat = await Chat.findOne({
      participants: { $all: [user1._id, user2._id] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [user1._id, user2._id]
      });
      await chat.save();
    }

    // Clear existing messages
    await Message.deleteMany({ chatId: chat._id });

    // Create test messages
    const testMessages = [
      { sender: user1._id, content: 'Hello! How are you?' },
      { sender: user2._id, content: 'Hi! I am doing well, thanks!' },
      { sender: user1._id, content: 'Great to hear that!' },
      { sender: user2._id, content: 'How can I help you today?' },
      { sender: user1._id, content: 'I need some information about your crops' }
    ];

    const createdMessages = [];
    for (const msgData of testMessages) {
      const message = new Message({
        chatId: chat._id,
        sender: msgData.sender,
        content: msgData.content,
        type: 'text'
      });
      await message.save();
      createdMessages.push(message);
    }

    // Update chat last message
    const lastMessage = createdMessages[createdMessages.length - 1];
    chat.lastMessage = {
      content: lastMessage.content,
      sender: lastMessage.sender,
      timestamp: lastMessage.createdAt
    };
    await chat.save();

    res.json({
      success: true,
      chatId: chat._id,
      messagesCreated: createdMessages.length,
      participants: [user1.fullName, user2.fullName],
      message: 'Test messages created successfully!'
    });

  } catch (error) {
    console.error('Error creating test messages:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
