# 🧪 Testing Push Notifications Guide

## ✅ Setup Complete!

All Firebase push notification features have been successfully integrated:

### ✨ Features Implemented:
1. ✅ **Chat Message Notifications** - Real-time push when someone sends you a message
2. ✅ **Admin Response Notifications** - Alert when admin responds to your support ticket
3. ✅ **Firebase Admin SDK** - Server-side notification sender
4. ✅ **FCM Token Management** - Automatic registration and storage
5. ✅ **Service Worker** - Background notification support

---

## 🧪 Testing Instructions

### Test 1: Chat Message Notifications

**Setup:**
1. Open two different browsers (e.g., Chrome and Firefox) OR use incognito mode
2. Browser A: Login as User A
3. Browser B: Login as User B

**Steps:**
1. In Browser A, allow notifications when prompted
2. In Browser B, allow notifications when prompted
3. Browser A: Go to marketplace and click "Chat" on a crop listing
4. Browser A: Send a message to User B
5. **Expected**: Browser B should show a push notification with the message

**What to check:**
- ✅ Notification appears in Browser B (even if tab is not focused)
- ✅ Notification shows sender's name and message preview
- ✅ Clicking notification opens the chat page
- ✅ Console logs show "📤 Sending push notification" and "✅ Push notification sent"

---

### Test 2: Admin Response Notifications

**Setup:**
1. Browser A: Login as regular user
2. Browser B: Login as admin user (thansuh@gmail.com or thanushreddy934@gmail.com)

**Steps:**
1. Browser A (User): 
   - Allow notifications when prompted
   - Go to Help & Support page
   - Submit a support ticket
   
2. Browser B (Admin):
   - Go to Admin Help page
   - Find the new ticket
   - Click "Respond"
   - Add a response message
   - Click "Submit Response"

3. **Expected**: Browser A should show a push notification about the admin response

**What to check:**
- ✅ User receives notification with ticket status
- ✅ Notification shows admin's response preview
- ✅ Clicking notification opens the Help page
- ✅ Console logs show notification sent successfully

---

### Test 3: Background Notifications

**Steps:**
1. Login and allow notifications
2. Minimize browser or switch to another tab
3. Have someone send you a chat message OR admin respond to your ticket
4. **Expected**: System notification appears even when browser is minimized

**What to check:**
- ✅ Notification appears in system tray (Windows/Mac/Linux)
- ✅ Sound plays (if enabled in browser settings)
- ✅ Clicking brings browser back to focus and opens correct page

---

## 🔍 Debugging

### Check Browser Console

Look for these log messages:

**On Login:**
```
🔔 Requesting notification permission...
✅ Notification permission granted
✅ Service Worker registered
✅ FCM Token received: [long token string]
💾 Saving FCM token to server...
✅ FCM token saved successfully
✅ FCM initialized successfully
```

**On Chat Message:**
```
📤 Sending push notification to [User Name]
✅ Push notification sent successfully
```

**On Admin Response:**
```
📤 Sending admin response notification to [User Name]
✅ Admin response notification sent successfully
```

### Check Server Logs

Look for:
```
✅ Firebase Admin SDK initialized successfully
✅ FCM token saved for user: [User Name]
📤 Sending push notification to [User Name]
✅ Push notification sent successfully
```

### Common Issues

**1. "Permission denied" - User blocked notifications**
- Solution: Manually enable in browser settings (chrome://settings/content/notifications)

**2. "No FCM token found for recipient"**
- Solution: Make sure recipient has logged in and allowed notifications

**3. "Service Worker registration failed"**
- Solution: Check that firebase-messaging-sw.js is accessible at `/firebase-messaging-sw.js`
- Must be served from root, not `/client/` subdirectory

**4. "Failed to send notification - Invalid registration token"**
- Solution: Token may be expired, user needs to login again

---

## 📱 Browser Compatibility

### Desktop:
- ✅ Chrome 90+ (Full support)
- ✅ Firefox 90+ (Full support)
- ✅ Edge 90+ (Full support)
- ⚠️ Safari 16.4+ (macOS Ventura+, limited support)

### Mobile:
- ✅ Chrome Android (Full support)
- ✅ Firefox Android (Full support)
- ❌ iOS Safari (No support for web push yet)
- ⚠️ iOS 16.4+ with "Add to Home Screen" (Limited support)

---

## 🎯 Expected Behavior

### Foreground (Browser Open):
- Custom in-app notification appears at top-right
- Auto-dismisses after 5 seconds
- Clicking navigates to relevant page

### Background (Browser Minimized):
- System notification appears
- Persists until user interacts
- Clicking opens browser and navigates to page

### Notification Content:

**Chat Notifications:**
```
Title: "[Sender Name] sent you a message"
Body: "[Message preview up to 100 chars]"
Actions: [View] [Dismiss]
```

**Admin Response:**
```
Title: "Admin Response Received"
Body: "Your support ticket [ID] has been [status]"
Actions: [View] [Dismiss]
```

---

## 🔧 Manual Testing Checklist

- [ ] Login triggers notification permission request
- [ ] FCM token is saved to database (check MongoDB)
- [ ] Chat message sends push notification
- [ ] Admin response sends push notification
- [ ] Foreground notifications show custom UI
- [ ] Background notifications use system UI
- [ ] Clicking notification navigates correctly
- [ ] Multiple devices can receive notifications
- [ ] Notifications work when browser is closed (background)

---

## 📊 Database Verification

Check MongoDB to verify FCM tokens are stored:

```javascript
// In MongoDB shell or Compass
db.farmers.find({}, { fullName: 1, email: 1, fcmToken: 1 })
```

You should see fcmToken field populated for logged-in users.

---

## 🚀 Next Steps

1. Test with real devices (not just localhost)
2. Deploy to production with HTTPS
3. Add notification preferences (let users choose what to be notified about)
4. Implement notification history
5. Add notification sound customization
6. Handle token refresh when expired

---

## 📝 Additional Notes

- Notifications require **HTTPS** in production (localhost works for testing)
- Service workers cache notifications - clear cache if testing changes
- FCM has **rate limits** - don't spam notifications
- Tokens can expire - implement refresh logic if needed
- Consider adding a "Notification Settings" page for users

---

## 🎉 Success Criteria

Your push notification system is working if:

✅ Users receive chat message notifications instantly
✅ Users receive admin response notifications
✅ Notifications work in both foreground and background
✅ Clicking notifications navigates to correct pages
✅ Console shows no errors related to FCM
✅ Server logs confirm notifications are being sent

---

## 💡 Tips

- **Test on different networks** - Some corporate firewalls block FCM
- **Test with different users** - Verify notifications go to correct recipients
- **Check spam/notification settings** - OS level settings can block notifications
- **Use Chrome DevTools** - Application tab shows service worker status
- **Monitor Firebase Console** - Check Cloud Messaging logs for delivery stats

