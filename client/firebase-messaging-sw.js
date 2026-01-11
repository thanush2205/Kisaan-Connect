/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTkU4WI0enzgdWcBDSKe2DX4Mnot1I6lQ",
  authDomain: "kisaan-connect-fe4aa.firebaseapp.com",
  projectId: "kisaan-connect-fe4aa",
  storageBucket: "kisaan-connect-fe4aa.firebasestorage.app",
  messagingSenderId: "373354399824",
  appId: "1:373354399824:web:95be70165db926e6086955"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification.title || 'Kisaan Connect';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: payload.notification.icon || '/uploads/logo.png',
    badge: '/uploads/badge.png',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'close') {
    return;
  }
  
  // Determine URL based on notification type
  let url = '/';
  
  if (data) {
    if (data.link) {
      url = data.link;
    } else if (data.type === 'chat_message' && data.chatId) {
      url = `/chats.html?chatId=${data.chatId}`;
    } else if (data.type === 'admin_response') {
      url = '/help.html';
    } else if (data.type === 'new_ticket') {
      url = '/admin-help.html';
    }
  }
  
  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
