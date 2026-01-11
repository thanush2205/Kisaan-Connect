# Admin Response Push Notifications - Testing Guide

## ✅ What's Been Implemented

Users will now receive **push notifications** when:
1. ✅ Admin responds to their support ticket
2. ✅ Admin updates their support ticket status
3. ✅ Admin resolves their support ticket

## 📱 Notification Details

### Notification Titles (with "Kisaan Connect" prefix):

1. **When ticket is resolved:**
   - Title: `Kisaan Connect - ✅ Resolved`
   - Body: `Your support ticket has been resolved! Check the response from our team.`

2. **When admin responds:**
   - Title: `Kisaan Connect - 💬 Response Received`
   - Body: `Admin has responded to your support ticket. Tap to view the response.`

3. **When ticket is updated:**
   - Title: `Kisaan Connect - 🔄 Updated`
   - Body: `Your support ticket has been updated by our team.`

### Clicking the Notification:
- Opens the Help & Support page (`/help.html`)
- User can view their ticket details and admin's response

---

## 🧪 How to Test

### Step 1: Submit a Support Ticket (As User)

1. **Login as a regular user** (not admin)
   - Example: Login as "thanush" (8317530967 / thanush@2205)
   - Make sure notifications are allowed

2. **Go to Help & Support page**
   - URL: `http://localhost:3000/help.html`

3. **Submit a new support query**
   - Fill in the form:
     - Subject: "Test notification"
     - Category: Any category
     - Priority: Select priority
     - Description: "Testing admin response notification"
   - Click Submit

4. **Note the ticket number** displayed in the success message

5. **Keep the browser open** (minimize it to test background notifications)

---

### Step 2: Respond as Admin

1. **Open a different browser** (Firefox/Edge/Chrome Incognito)

2. **Login as admin**
   - Email: thanushreddy934@gmail.com
   - Password: thanush@2205

3. **Go to Admin Help page**
   - URL: `http://localhost:3000/admin-help.html`

4. **Find the ticket** submitted by the user

5. **Add a response:**
   - Click on the ticket to view details
   - In the "Admin Response" section, type your response
   - Example: "Thank you for contacting us. We have resolved your issue."
   - Select status: "In Progress" or "Resolved"
   - Click "Submit Response" or "Update Ticket"

---

### Step 3: Verify Notification

**In the User's Browser (Step 1):**

**If browser is minimized/background:**
- 🔔 System notification appears with:
  - Icon: Kisaan Connect logo
  - Title: "Kisaan Connect - 💬 Response Received" (or "✅ Resolved")
  - Body: Message about the update
  - Click notification → Opens help.html page

**If browser is visible/foreground:**
- 📱 Custom in-app notification banner (top-right corner)
- Shows the notification title and body
- Auto-dismisses after 5 seconds

---

## 🔍 Server Logs to Watch

When admin submits response, you should see in terminal:

```
📤 Sending push notification to <username> for ticket response
✅ Notification sent successfully: projects/kisaan-connect-fe4aa/messages/...
✅ Push notification sent successfully
```

---

## 📊 Multiple Notification Points

Push notifications are sent from **3 different places**:

1. **`server/app.js`** (Line ~665-695)
   - Main ticket update endpoint
   - Handles admin responses

2. **`server/routes/help.js`** (Line ~555-580)
   - POST /tickets/:id/response
   - When admin adds a new response

3. **`server/routes/help.js`** (Line ~505-535)
   - PUT /tickets/:id
   - When admin updates ticket status

All three will send the same style of push notification to the user.

---

## ✅ What Happens on User Side

1. **User submits ticket** → Receives confirmation email + in-app confirmation

2. **Admin responds** → User receives:
   - 📧 Email notification (already existed)
   - 🔔 **Push notification (NEW!)**

3. **User clicks notification** → Redirected to help.html page

4. **User views response** → Can see admin's response in their ticket history

---

## 🎯 Notification Behavior

### Background Notification (Browser Minimized):
- Uses system notification style
- Displays even when browser is closed (if service worker is active)
- Clicking opens the app and navigates to help.html

### Foreground Notification (Browser Visible):
- Custom in-app notification banner
- Appears at top-right corner
- Auto-dismisses after 5 seconds
- Can click to navigate immediately

---

## 🔧 Troubleshooting

### "No notification received"

**Check 1: User has FCM token?**
```
Server logs should show:
✅ FCM token saved for user: <username>
```

**Check 2: Notification permission granted?**
- User must click "Allow" when prompted for notifications
- Check browser console: `Notification.permission` should return `"granted"`

**Check 3: Different browsers?**
- User and admin should use different browsers for testing
- Each browser needs its own FCM token

**Check 4: Server logs?**
```
Should see:
📤 Sending push notification to <username> for ticket response
✅ Notification sent successfully
```

If you see:
```
⚠️ No FCM token found for user or user not found
```
Then the user needs to logout and login again to get an FCM token.

---

### "Notification shows but clicking does nothing"

**Check:** Service worker registered?
- Open browser console
- Look for: `✅ Service Worker registered`
- If not found, refresh the page

---

## 📝 Testing Checklist

Before testing:
- [ ] Server running (`node server/app.js`)
- [ ] Firebase initialized (check terminal: "✅ Firebase Admin SDK initialized successfully")
- [ ] User logged in (regular user, not admin)
- [ ] User allowed notifications (check console)
- [ ] Admin logged in (different browser)

During test:
- [ ] User submits support ticket
- [ ] Admin can see the ticket in admin panel
- [ ] Admin adds response
- [ ] Server logs show push notification sent
- [ ] User receives notification (system or in-app)
- [ ] Clicking notification opens help.html

Success criteria:
- [ ] User receives notification immediately after admin responds
- [ ] Notification title includes "Kisaan Connect"
- [ ] Notification body describes the action (resolved/responded/updated)
- [ ] Clicking notification navigates to help page
- [ ] User can see admin's response in their ticket

---

## 🎉 Expected Results

**Perfect scenario:**

1. User submits ticket at 2:00 PM
2. Admin responds at 2:05 PM
3. User's browser/device shows notification at 2:05 PM (within 1-2 seconds)
4. User clicks notification
5. Browser opens/focuses on help.html
6. User sees admin's response in their ticket history

**Notification should include:**
- ✅ "Kisaan Connect" in the title
- ✅ Clear status (Resolved/Response Received/Updated)
- ✅ Descriptive message
- ✅ Clickable to navigate to help page

---

## 🔥 Live Testing Example

**User Browser:**
```
1. Login as thanush
2. Allow notifications
3. Submit ticket: "Need help with crop pricing"
4. Minimize browser
5. Wait for admin to respond...
```

**Admin Browser:**
```
1. Login as admin (thanushreddy934@gmail.com)
2. Go to admin-help.html
3. Find thanush's ticket
4. Add response: "We've updated the pricing. Please check now."
5. Click "Resolve" or "Submit Response"
```

**Expected on User's Device:**
```
🔔 NOTIFICATION APPEARS:
┌─────────────────────────────────────┐
│ Kisaan Connect - ✅ Resolved        │
│                                      │
│ Your support ticket has been        │
│ resolved! Check the response from   │
│ our team.                           │
│                                      │
│ [View]  [Dismiss]                   │
└─────────────────────────────────────┘
```

Click "View" → Opens help.html with the response!

---

## 💡 Additional Notes

1. **Email + Push:** Users now get BOTH email and push notifications
2. **Real-time:** Push notifications are instant (< 2 seconds delay)
3. **Offline:** If user is offline, notification queues until they're back online
4. **Multiple devices:** If user logged in on multiple devices, all receive notification
5. **Token refresh:** FCM tokens can expire; users may need to re-login periodically

---

## 🆘 Need Help?

Check server logs for these patterns:

**Success:**
```
📤 Sending push notification to <username> for ticket response
✅ Notification sent successfully: projects/kisaan-connect-fe4aa/messages/xxx
✅ Push notification sent successfully
```

**Failure:**
```
⚠️ No FCM token found for user or user not found
❌ Error sending push notification: <error message>
```

If you see failures, ensure:
1. User has logged in and allowed notifications
2. User is in the database with an fcmToken field
3. FCM token is not expired/invalid
