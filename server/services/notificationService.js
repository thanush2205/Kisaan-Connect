const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) {
    return;
  }

  try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'kisaan-connect-fe4aa'
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    throw error;
  }
}

// Initialize on module load
initializeFirebase();

/**
 * Send push notification to a single user
 * @param {string} fcmToken - User's FCM token
 * @param {Object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {Object} notification.data - Additional data payload
 * @returns {Promise<string>} - Message ID if successful
 */
async function sendNotificationToUser(fcmToken, notification) {
  try {
    if (!fcmToken) {
      console.log('⚠️ No FCM token provided');
      return null;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      webpush: {
        notification: {
          icon: '/uploads/logo.png',
          badge: '/uploads/badge.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'View'
            }
          ]
        },
        fcmOptions: {
          link: notification.data?.link || '/'
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log('⚠️ Token no longer valid, should be removed from database');
    }
    throw error;
  }
}

/**
 * Send push notification to multiple users
 * @param {Array<string>} fcmTokens - Array of FCM tokens
 * @param {Object} notification - Notification data
 * @returns {Promise<Object>} - Batch response
 */
async function sendNotificationToMultipleUsers(fcmTokens, notification) {
  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('⚠️ No FCM tokens provided');
      return null;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      webpush: {
        notification: {
          icon: '/uploads/logo.png',
          badge: '/uploads/badge.png',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: notification.data?.link || '/'
        }
      },
      tokens: fcmTokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
    
    // Log failed tokens for cleanup
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`⚠️ Failed to send to token ${idx}:`, resp.error.message);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Error sending batch notifications:', error.message);
    throw error;
  }
}

/**
 * Send chat message notification
 * @param {string} recipientFcmToken - Recipient's FCM token
 * @param {Object} messageData - Message information
 */
async function sendChatNotification(recipientFcmToken, messageData) {
  const notification = {
    title: `Kisaan Connect - New Message from ${messageData.senderName}`,
    body: messageData.messageContent.substring(0, 100), // Limit message preview
    data: {
      type: 'chat_message',
      chatId: messageData.chatId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      timestamp: new Date().toISOString(),
      link: `/chats.html?chatId=${messageData.chatId}`
    }
  };

  return await sendNotificationToUser(recipientFcmToken, notification);
}

/**
 * Send admin response notification
 * @param {string} userFcmToken - User's FCM token
 * @param {Object} responseData - Admin response information
 */
async function sendAdminResponseNotification(userFcmToken, responseData) {
  // Create a more descriptive status message
  let statusMessage = '';
  let bodyMessage = '';
  
  if (responseData.status === 'resolved') {
    statusMessage = '✅ Resolved';
    bodyMessage = `Your support ticket has been resolved! Check the response from our team.`;
  } else if (responseData.status === 'responded') {
    statusMessage = '💬 Response Received';
    bodyMessage = `Admin has responded to your support ticket. Tap to view the response.`;
  } else if (responseData.status === 'updated') {
    statusMessage = '🔄 Updated';
    bodyMessage = `Your support ticket has been updated by our team.`;
  } else {
    statusMessage = '📢 Support Update';
    bodyMessage = `Your support ticket ${responseData.ticketId} has been ${responseData.status}`;
  }

  const notification = {
    title: `Kisaan Connect - ${statusMessage}`,
    body: bodyMessage,
    data: {
      type: 'admin_response',
      ticketId: responseData.ticketId,
      status: responseData.status,
      response: responseData.adminResponse,
      timestamp: new Date().toISOString(),
      link: '/help.html'
    }
  };

  return await sendNotificationToUser(userFcmToken, notification);
}

/**
 * Send support ticket created notification to admin
 * @param {Array<string>} adminFcmTokens - Array of admin FCM tokens
 * @param {Object} ticketData - Ticket information
 */
async function sendNewTicketNotificationToAdmin(adminFcmTokens, ticketData) {
  const notification = {
    title: 'Kisaan Connect - New Support Ticket',
    body: `${ticketData.farmerName} submitted a ${ticketData.priority} priority ticket`,
    data: {
      type: 'new_ticket',
      ticketId: ticketData.ticketId,
      farmerName: ticketData.farmerName,
      category: ticketData.category,
      priority: ticketData.priority,
      link: '/admin-help.html'
    }
  };

  return await sendNotificationToMultipleUsers(adminFcmTokens, notification);
}

module.exports = {
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  sendChatNotification,
  sendAdminResponseNotification,
  sendNewTicketNotificationToAdmin
};
