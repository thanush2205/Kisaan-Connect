# How to Test Push Notifications - Step by Step

## ⚠️ CRITICAL: Use Two Different Browsers

**DO NOT test with the same browser!** FCM tokens are browser-specific, not user-specific.

---

## Setup Instructions

### Step 1: Prepare Two Browsers

**Option A (Recommended):**
- Browser 1: Chrome (normal window)
- Browser 2: Firefox or Edge

**Option B (Alternative):**
- Browser 1: Chrome (normal window)  
- Browser 2: Chrome (Incognito/Private window)

**Note:** Each browser will get its own unique FCM token.

---

## Testing Procedure

### Browser 1 - User "thanush" (Receiver)

1. **Open Browser 1 (Chrome)**
   - Navigate to: `http://localhost:3000/Login.html`

2. **Login as thanush**
   - Phone: `8317530967`
   - Password: `thanush@2205`

3. **Allow Notifications**
   - Browser will prompt: "Allow notifications?"
   - Click **"Allow"**

4. **Verify in Console (F12)**
   - Open DevTools Console
   - Look for:
     ```
     ✅ FCM Token received: <long-token-string>
     ✅ FCM token saved successfully
     ✅ FCM initialized successfully
     ```

5. **Navigate to Marketplace**
   - Go to crops page: `http://localhost:3000/index.html`
   - Keep this window open and **DO NOT CLOSE IT**

6. **Minimize or Switch Away**
   - For background notifications: Minimize the browser OR switch to another app
   - For foreground notifications: Keep browser visible

---

### Browser 2 - User "qwer" (Sender)

1. **Open Browser 2 (Firefox/Edge)**
   - Navigate to: `http://localhost:3000/Login.html`

2. **Login as qwer**
   - Phone: `0987654321`
   - Password: `new123`

3. **Allow Notifications**
   - Click **"Allow"** when prompted

4. **Verify in Console**
   - Open DevTools
   - Check for successful FCM initialization
   - **IMPORTANT:** Token should be DIFFERENT from Browser 1

5. **Start a Chat**
   - Go to crops page
   - Click on a crop listed by "thanush"
   - Click "Chat with Seller" button
   - You'll be taken to the chat page

6. **Send a Message**
   - Type: "Hello from qwer!"
   - Press Send

---

## Expected Results

### In Browser 1 (thanush - Receiver)

**If Browser is Minimized/Background:**
- 🔔 System notification appears
- Title: "New message from qwer"
- Body: "Hello from qwer!"
- Click notification → Opens chat page in Browser 1

**If Browser is Visible/Foreground:**
- 📱 Custom in-app notification banner appears (top-right corner)
- Shows message preview
- Auto-dismisses after 5 seconds

### In Browser 2 (qwer - Sender)

- ✅ Message appears in chat instantly
- No notification (you don't notify yourself)

---

## Server Console Verification

Check your terminal for these logs:

```
📤 Sending push notification to thanush
✅ Notification sent successfully: projects/kisaan-connect-fe4aa/messages/...
✅ Push notification sent successfully
```

---

## Troubleshooting

### Problem: "Both users have same FCM token"

**Symptom:** Server logs show both users with identical tokens

**Cause:** Both users logged in from same browser

**Solution:** 
1. Logout from current browser
2. Server will clear the FCM token (you'll see: `🔓 Cleared FCM token for user`)
3. Use a different browser for the second user

---

### Problem: "No notification appears"

**Check 1: Permission Granted?**
- Open Console in receiver's browser
- Type: `Notification.permission`
- Should return: `"granted"`
- If `"denied"`, reset permissions:
  - Click padlock in address bar
  - Click "Site settings"
  - Reset permissions
  - Refresh and allow again

**Check 2: Is Browser Focused?**
- Background notifications only appear when browser is minimized
- If browser is visible, check for custom in-app notification (top-right)

**Check 3: Service Worker Registered?**
- Open Console
- Look for: `✅ Service Worker registered`
- If not found, refresh page

**Check 4: Different Browsers?**
- Verify you're using two DIFFERENT browsers
- Check server logs - FCM tokens should be different

---

### Problem: "Notification opens wrong user"

**Symptom:** Click notification → Shows chat for wrong user

**Cause:** Same browser/token for both users

**Solution:** Use different browsers (see Step 1)

---

### Problem: "Permission denied / Not allowed"

**Reset Notification Permissions:**

**Chrome:**
1. Go to: `chrome://settings/content/notifications`
2. Find `localhost:3000`
3. Remove it
4. Refresh app and allow again

**Firefox:**
1. Click padlock in address bar
2. Click "Clear cookies and site data"
3. Refresh and allow

**Edge:**
1. Go to: `edge://settings/content/notifications`
2. Find and remove `localhost:3000`
3. Refresh and allow

---

## Advanced Testing

### Test Admin Response Notifications

1. **Submit a Support Ticket:**
   - Login as any user
   - Go to Help & Support page
   - Submit a query

2. **Admin Responds:**
   - Login as admin (thanushreddy934@gmail.com)
   - Go to admin help page
   - Add response to ticket
   - Click "Resolve"

3. **User Receives Notification:**
   - Original user gets push notification
   - Title: "Support Ticket Resolved"
   - Body: Admin's response

---

## Quick Verification Checklist

Before testing, verify:

- [ ] Server running (check terminal: "Server running at http://localhost:3000")
- [ ] Firebase initialized (check terminal: "✅ Firebase Admin SDK initialized successfully")
- [ ] Two DIFFERENT browsers ready
- [ ] Both browsers at http://localhost:3000/Login.html

During testing, verify:

- [ ] Browser 1: Notification permission = "granted"
- [ ] Browser 2: Notification permission = "granted"
- [ ] Browser 1: FCM token saved (check console)
- [ ] Browser 2: FCM token saved (check console)
- [ ] Tokens are DIFFERENT (check server logs or database)

After sending message:

- [ ] Server logs show: "📤 Sending push notification to..."
- [ ] Server logs show: "✅ Notification sent successfully"
- [ ] Browser 1 receives notification
- [ ] Clicking notification opens correct chat

---

## Database Check (Optional)

To verify tokens in database:

```javascript
// In MongoDB compass or shell
db.farmers.find(
  { phoneNumber: { $in: ["8317530967", "0987654321"] } },
  { fullName: 1, fcmToken: 1 }
)
```

Expected result:
- thanush: Has a long FCM token (if logged in Browser 1)
- qwer: Has a DIFFERENT long FCM token (if logged in Browser 2)
- Tokens should NOT match

---

## Success Criteria

✅ Notifications are working correctly if:

1. Two users in different browsers
2. Each user has unique FCM token
3. Sending message triggers notification in other browser
4. Notification shows correct sender name and message
5. Clicking notification opens correct chat
6. Server logs confirm successful sends

---

## Need Help?

Check these logs:

**Browser Console (F12):**
- FCM initialization messages
- Token save confirmations
- Foreground message received logs

**Server Terminal:**
- Firebase Admin SDK initialization
- Push notification send attempts
- Success/failure messages

**Common Success Patterns:**

Server terminal should show:
```
✅ Firebase Admin SDK initialized successfully
📤 Sending push notification to <username>
✅ Notification sent successfully: projects/kisaan-connect-fe4aa/messages/...
✅ Push notification sent successfully
```

Browser console should show:
```
✅ FCM Token received: <token>
✅ FCM token saved successfully
✅ FCM initialized successfully
```
