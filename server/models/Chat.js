const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  }],
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: false // Optional, for crop-related chats
  },
  lastMessage: {
    content: {
      type: String,
      default: ''
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCount: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure unique chat between two participants (one chat per user pair)
chatSchema.index({ participants: 1 }, { unique: true });

// Method to find chat between two users
chatSchema.statics.findChatBetweenUsers = function(userId1, userId2, cropId = null) {
  const query = {
    participants: { $all: [userId1, userId2] }
  };
  
  if (cropId) {
    query.cropId = cropId;
  }
  
  return this.findOne(query).populate('participants', 'fullName profilePicture').populate('cropId', 'name imageUrl');
};

// Method to get user's chats
chatSchema.statics.getUserChats = function(userId) {
  return this.find({
    participants: userId,
    isActive: true
  })
  .populate('participants', 'fullName profilePicture')
  .populate('cropId', 'name imageUrl')
  .sort({ 'lastMessage.timestamp': -1 });
};

module.exports = mongoose.model('Chat', chatSchema);
