# 🔔 Firebase Push Notifications - Setup Guide

## ⚠️ IMPORTANT: Get Your VAPID Key

Before testing notifications, you MUST get your VAPID (Voluntary Application Server Identification) key from Firebase:

### Steps to Get VAPID Key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **kisaan-connect-fe4aa** project
3. Click **⚙️ Settings** → **Project settings**
4. Go to **Cloud Messaging** tab
5. Scroll to **Web Push certificates** section
6. Click **"Generate key pair"** if you don't have one
7. Copy the **Key pair** value (starts with "B...")
8. Replace `YOUR_VAPID_KEY_HERE` in `/client/js/firebase-config.js` with this value

---

## 📁 Files Created

### Server-Side:
- `server/services/notificationService.js` - Handles sending push notifications
- `firebase-service-account.json` - Firebase admin credentials (DO NOT COMMIT)
- Updated `server/models/Farmer.js` - Added `fcmToken` field
- Updated `server/app.js` - Added FCM token save endpoint

### Client-Side:
- `client/js/firebase-config.js` - Firebase client SDK configuration
- `client/firebase-messaging-sw.js` - Service worker for background notifications

---

## 🚀 How It Works

### 1. User Login Flow:
```
User logs in → Request notification permission → Get FCM token → Save to database
```

### 2. Chat Notification Flow:
```
User A sends message → Server detects via Socket.io → 
Lookup User B's FCM token → Send push notification
```

### 3. Admin Response Flow:
```
Admin responds to ticket → Server updates ticket → 
Lookup user's FCM token → Send push notification
```

---

## 🔧 Integration Steps

### Step 1: Update VAPID Key
Edit `client/js/firebase-config.js` and replace:
```javascript
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';
```

### Step 2: Initialize FCM on Login
Add to your login success handler in `client/Login.html` or wherever you handle login:

```javascript
// After successful login
import { initializeFCM } from './js/firebase-config.js';
await initializeFCM();
```

### Step 3: Test Notifications
1. Open your app in browser
2. Login with a user account
3. Allow notifications when prompted
4. Check browser console for FCM token
5. Send a test notification

---

## 🧪 Testing

### Test Chat Notifications:
1. Login with User A on one browser/device
2. Login with User B on another browser/device  
3. User A sends message to User B
4. User B should receive notification

### Test Admin Notifications:
1. User submits support ticket
2. Admin responds to ticket
3. User should receive notification

---

## 📱 Browser Support

✅ Chrome/Edge (Desktop & Mobile)
✅ Firefox (Desktop & Mobile)
✅ Safari (macOS 16.4+, iOS 16.4+)
❌ Older browsers without service worker support

---

## 🔒 Security Notes

- `firebase-service-account.json` is added to `.gitignore`
- Never commit Firebase credentials to Git
- FCM tokens are stored encrypted in MongoDB
- Notifications require user permission

---

## 🐛 Troubleshooting

### Notifications not showing?
1. Check browser console for errors
2. Verify VAPID key is correct
3. Ensure service worker is registered
4. Check notification permission is "granted"
5. Verify FCM token is saved in database

### Service Worker not registering?
1. Must be served over HTTPS (or localhost)
2. Check `/firebase-messaging-sw.js` is accessible
3. Clear browser cache and reload

### Token not saving?
1. Check user is logged in
2. Verify `/api/user/fcm-token` endpoint works
3. Check MongoDB connection
4. Look for errors in server logs

---

## 📚 Next Steps

1. Get VAPID key from Firebase Console
2. Update `firebase-config.js` with VAPID key
3. Integrate FCM initialization in login flow
4. Implement chat message notifications (Step 8)
5. Implement admin response notifications (Step 9)
6. Test end-to-end functionality

---

## 🎯 Current Progress

✅ Firebase dependencies installed
✅ Firebase Admin SDK configured
✅ Notification service created
✅ Farmer model updated
✅ Firebase client config created
✅ Service worker created
✅ FCM token endpoint added
⏳ Integrate with chat system
⏳ Integrate with admin system
⏳ Test notifications

