/**
 * Firebase Client Configuration
 * Handles Firebase initialization and FCM token management
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTkU4WI0enzgdWcBDSKe2DX4Mnot1I6lQ",
  authDomain: "kisaan-connect-fe4aa.firebaseapp.com",
  projectId: "kisaan-connect-fe4aa",
  storageBucket: "kisaan-connect-fe4aa.firebasestorage.app",
  messagingSenderId: "373354399824",
  appId: "1:373354399824:web:95be70165db926e6086955",
  measurementId: "G-249GV6YVGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID key for FCM
const VAPID_KEY = 'BHG0VLpWaxwGNthQB1WUenMX_OZwznHq5YqibGX59LFfQohkN1z1c-TZ9G3xVHlSnprqk0WbCgOXW-AKWaDA5Bw';

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export async function requestNotificationPermission() {
  try {
    console.log('🔔 Requesting notification permission...');
    
    const permission = await Notification.requestPermission();
    console.log('📋 Notification permission:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log('✅ FCM Token received:', token);
          return token;
        } else {
          console.log('⚠️ No registration token available');
          return null;
        }
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
}

/**
 * Save FCM token to server (associate with user)
 * @param {string} fcmToken - The FCM token to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveFCMTokenToServer(fcmToken) {
  try {
    console.log('💾 Saving FCM token to server...');
    
    const response = await fetch('/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ fcmToken })
    });
    
    if (response.ok) {
      console.log('✅ FCM token saved successfully');
      return true;
    } else {
      console.error('❌ Failed to save FCM token:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    return false;
  }
}

/**
 * Handle foreground messages (when app is open)
 */
export function setupForegroundMessageHandler() {
  onMessage(messaging, (payload) => {
    console.log('📨 Foreground message received:', payload);
    
    const { title, body } = payload.notification;
    const data = payload.data;
    
    // Show custom notification
    showCustomNotification(title, body, data);
  });
}

/**
 * Show custom notification in the app
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
function showCustomNotification(title, body, data) {
  // Create custom notification UI element
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'custom-notification';
  notificationDiv.innerHTML = `
    <div class="notification-content">
      <strong>${title}</strong>
      <p>${body}</p>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  // Add styles
  notificationDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notificationDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notificationDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notificationDiv.remove(), 300);
  }, 5000);
  
  // Handle click to navigate
  if (data && data.link) {
    notificationDiv.style.cursor = 'pointer';
    notificationDiv.onclick = () => {
      window.location.href = data.link;
    };
  }
}

/**
 * Initialize FCM for logged-in user
 */
export async function initializeFCM() {
  try {
    console.log('🚀 Initializing FCM...');
    
    // Request permission and get token
    const token = await requestNotificationPermission();
    
    if (token) {
      // Save token to server
      await saveFCMTokenToServer(token);
      
      // Setup foreground message handler
      setupForegroundMessageHandler();
      
      console.log('✅ FCM initialized successfully');
      return true;
    } else {
      console.log('⚠️ FCM initialization failed - no token');
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing FCM:', error);
    return false;
  }
}

// Export messaging instance for advanced usage
export { messaging };
