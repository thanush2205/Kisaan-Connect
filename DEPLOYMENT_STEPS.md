# 🚀 Render.com Deployment - Step by Step Instructions

Follow these steps in order to deploy your Kisaan Connect project to Render.com.

---

## ✅ STEP 1: Prepare Your Project

### 1.1 Run the Preparation Script

```bash
cd /home/thanush/Kisaan-Connect-1
./prepare-deploy.sh
```

This will check your project for:
- Git initialization
- Sensitive files not tracked
- Required files present
- Generate a random SESSION_SECRET

### 1.2 Fix Any Issues

If the script shows warnings:

**If .env is tracked:**
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

**If firebase-service-account.json is tracked:**
```bash
git rm --cached firebase-service-account.json
git commit -m "Remove Firebase credentials from tracking"
```

**If node_modules is tracked:**
```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
```

---

## ✅ STEP 2: Prepare Environment Variables

### 2.1 Copy Your Environment Variables

Open your `.env` file and copy these values:
```bash
cat .env
```

### 2.2 Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Click "Select app" → Choose "Other"
4. Type "Kisaan Connect"
5. Click "Generate"
6. **Copy the 16-character password** (remove spaces)
7. Save it - you'll need this for EMAIL_PASS

### 2.3 Generate Session Secret

The preparation script generated one for you. Copy it.

Or generate a new one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Prepare Firebase Credentials

**Option 1 (Recommended): Upload as Secret File**
- Keep `firebase-service-account.json` ready
- You'll upload it in Render dashboard

**Option 2: As Environment Variable**
```bash
# Minify the JSON file
cat firebase-service-account.json | jq -c
```
Copy the output (single line JSON)

---

## ✅ STEP 3: MongoDB Atlas Configuration

### 3.1 Allow Access from Anywhere

1. Go to: https://cloud.mongodb.com
2. Click your cluster → "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

**Why?** Render uses dynamic IPs, so we need to allow all IPs.

### 3.2 Verify Connection String

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

---

## ✅ STEP 4: Push to GitHub

### 4.1 Initialize Git (if not done)

```bash
cd /home/thanush/Kisaan-Connect-1
git init
```

### 4.2 Check Git Status

```bash
git status
```

Ensure these are NOT showing:
- .env
- firebase-service-account.json
- node_modules/

### 4.3 Commit Your Changes

```bash
git add .
git commit -m "Prepare for Render deployment with Firebase notifications"
```

### 4.4 Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `Kisaan-Connect`
3. **Keep it PRIVATE** (important!)
4. Don't add README, .gitignore, or license
5. Click "Create repository"

### 4.5 Push to GitHub

Replace `thanush2205` with your GitHub username:

```bash
git remote add origin https://github.com/thanush2205/Kisaan-Connect.git
git branch -M main
git push -u origin main
```

Enter your GitHub credentials when prompted.

---

## ✅ STEP 5: Create Render Account

### 5.1 Sign Up

1. Go to: https://render.com
2. Click "Get Started"
3. **Sign up with GitHub** (recommended)
4. Authorize Render to access your GitHub

### 5.2 Verify Email

Check your email and verify your Render account.

---

## ✅ STEP 6: Create Web Service on Render

### 6.1 New Web Service

1. Click "New +" button (top right)
2. Select "Web Service"

### 6.2 Connect Repository

1. Find "Kisaan-Connect" in the list
2. Click "Connect"

**If you don't see it:**
- Click "Configure account"
- Grant access to your repository

### 6.3 Configure Service

Fill in these fields:

**Name:** `kisaan-connect` (or your preferred name)

**Region:** `Singapore` (closest to India)

**Branch:** `main`

**Root Directory:** (leave empty)

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm start`

**Instance Type:** 
- **Free** (for testing) - Sleeps after 15 min
- **Starter** ($7/month) - Always on (recommended for production)

---

## ✅ STEP 7: Add Environment Variables

### 7.1 Expand Advanced Options

Click "Advanced" button to show more options.

### 7.2 Add Environment Variables

Click "Add Environment Variable" for each:

#### Required Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://thanushreddy934_db_user:ywMjvTLUZ7WT0cJv@cluster-k.yzjyrci.mongodb.net/kisaan_connect_db?retryWrites=true&w=majority&appName=Cluster-k
   ```
   *(Use your actual connection string)*

2. **SESSION_SECRET**
   ```
   [Paste the random string generated in Step 2.3]
   ```

3. **EMAIL_USER**
   ```
   thanushreddy934@gmail.com
   ```

4. **EMAIL_PASS**
   ```
   [Your 16-character Gmail App Password from Step 2.2]
   ```

5. **SUPPORT_EMAIL**
   ```
   thanushreddy934@gmail.com
   ```

6. **PORT**
   ```
   3000
   ```

7. **NODE_ENV**
   ```
   production
   ```

8. **FIREBASE_PROJECT_ID**
   ```
   kisaan-connect-fe4aa
   ```

9. **FIREBASE_SERVICE_ACCOUNT_PATH**
   ```
   ./firebase-service-account.json
   ```

### 7.3 Add Firebase Service Account (Secret File)

1. Scroll to "Secret Files" section
2. Click "Add Secret File"
3. **Filename:** `firebase-service-account.json`
4. **Contents:** Open your local `firebase-service-account.json` and paste the entire content
5. Click "Save"

---

## ✅ STEP 8: Deploy

### 8.1 Create Web Service

Click "Create Web Service" button at the bottom.

### 8.2 Monitor Deployment

Watch the logs in real-time. You should see:

```
==> Downloading Node.js...
==> Installing dependencies...
==> Building...
==> Starting service...
✅ Firebase Admin SDK initialized successfully
Attempting to connect to MongoDB...
✅ Successfully connected to MongoDB
Server running at http://localhost:3000
```

**Deployment takes 3-5 minutes.**

### 8.3 Get Your URL

After successful deployment, you'll get a URL like:
```
https://kisaan-connect-xyz123.onrender.com
```

**Copy this URL - you'll need it!**

---

## ✅ STEP 9: Update Firebase Configuration

### 9.1 Add Authorized Domain

1. Go to: https://console.firebase.google.com
2. Select project: **kisaan-connect-fe4aa**
3. Click ⚙️ (Settings) → "Project settings"
4. Scroll to "Authorized domains"
5. Click "Add domain"
6. Paste: `kisaan-connect-xyz123.onrender.com` (your Render domain)
7. Click "Add"

### 9.2 Update Environment Variable

1. Go back to Render dashboard
2. Click your service → "Environment"
3. Find `FRONTEND_URL`
4. Update value to your Render URL: `https://kisaan-connect-xyz123.onrender.com`
5. Click "Save Changes"

The service will automatically redeploy.

---

## ✅ STEP 10: Test Your Deployment

### 10.1 Access Your App

Open your Render URL in a browser:
```
https://kisaan-connect-xyz123.onrender.com
```

### 10.2 Test Features

1. **Homepage loads** ✅
2. **User Registration** ✅
   - Register a new user
   - Check if email arrives

3. **User Login** ✅
   - Login with registered user
   - Allow notifications when prompted

4. **Upload Images** ✅
   - Update profile picture
   - Add a crop with image

5. **Chat** ✅
   - Open chat with another user
   - Send messages
   - Check if Socket.io works

6. **Push Notifications** ✅
   - Send chat message from one user
   - Check if other user receives notification

7. **Admin Panel** ✅
   - Login as admin
   - Access admin help page
   - Respond to tickets

8. **Help & Support** ✅
   - Submit a support ticket
   - Check if email arrives
   - Admin responds
   - Check if push notification arrives

---

## ✅ STEP 11: Monitor and Maintain

### 11.1 View Logs

In Render dashboard:
1. Click your service
2. Go to "Logs" tab
3. Monitor for errors

### 11.2 Check Health

Visit:
```
https://kisaan-connect-xyz123.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T...",
  "uptime": 123.456,
  "environment": "production"
}
```

### 11.3 Set Up Uptime Monitoring (Optional)

**For Free Tier (to prevent sleep):**

1. Go to: https://uptimerobot.com
2. Sign up for free
3. Add new monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Kisaan Connect
   - **URL:** Your Render URL + /health
   - **Monitoring Interval:** 5 minutes
4. Save

This pings your app every 5 minutes to keep it awake.

---

## 🎉 Deployment Complete!

Your Kisaan Connect app is now live at:
```
https://kisaan-connect-xyz123.onrender.com
```

---

## 🐛 Troubleshooting

### Build Fails

**Check logs for:**
- Missing dependencies → Add to package.json
- Syntax errors → Fix locally and redeploy
- Memory issues → Upgrade instance type

### MongoDB Connection Fails

1. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
2. Verify MONGODB_URI environment variable
3. Check database user credentials

### Firebase Not Working

1. Verify firebase-service-account.json uploaded correctly
2. Check FIREBASE_PROJECT_ID matches your project
3. Ensure authorized domains include your Render URL
4. Check logs for Firebase initialization errors

### Notifications Not Working

1. Check Firebase authorized domains
2. Verify users allowed notifications in browser
3. Check server logs for FCM errors
4. Ensure HTTPS is used (Render provides this automatically)

### Session Not Persisting

1. Check SESSION_SECRET is set
2. Verify cookie settings in production
3. Consider adding connect-mongo for session store

### Images Not Loading

1. Check if uploads directory exists
2. Consider using cloud storage (AWS S3, Cloudinary)
3. Add persistent disk in Render (Disks tab)

---

## 📊 Performance Tips

### 1. Add Persistent Disk (for file uploads)

In Render dashboard:
1. Go to "Disks" tab
2. Click "Add Disk"
3. **Name:** `uploads`
4. **Mount Path:** `/opt/render/project/src/uploads`
5. **Size:** 1 GB (free tier includes 1GB)
6. Save

### 2. Enable Compression

Already included in your project.

### 3. Monitor Performance

Use Render's built-in metrics:
- CPU usage
- Memory usage
- Response times

---

## 💰 Cost Summary

### Free Tier
- **Render Web Service:** $0 (750 hours/month)
- **MongoDB Atlas:** $0 (512 MB)
- **Firebase:** $0 (10K notifications/day)
- **Total:** $0/month

### Production (Recommended)
- **Render Starter:** $7/month
- **MongoDB Atlas:** $0 (M0 free tier sufficient)
- **Firebase:** $0 (free tier sufficient)
- **Total:** $7/month

---

## 🔄 Updating Your App

After making changes locally:

```bash
# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

Render automatically detects the push and redeploys!

---

## 🆘 Need Help?

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com

### Check These Files
- `RENDER_DEPLOYMENT_GUIDE.md` - Detailed guide
- `ADMIN_RESPONSE_NOTIFICATIONS_GUIDE.md` - Notification testing
- `HOW_TO_TEST_NOTIFICATIONS.md` - Push notification guide

---

## ✅ Final Checklist

- [ ] Project pushed to GitHub
- [ ] Render account created
- [ ] Web service created and configured
- [ ] All environment variables added
- [ ] Firebase credentials uploaded
- [ ] MongoDB IP whitelist configured
- [ ] Firebase authorized domains updated
- [ ] App deployed successfully
- [ ] Homepage loads
- [ ] User registration works
- [ ] Login works
- [ ] Push notifications work
- [ ] Chat works
- [ ] Admin panel works
- [ ] Images upload correctly

**Congratulations! Your app is live! 🎉**

---

**Your deployed app:** https://kisaan-connect-xyz123.onrender.com
(Replace with your actual URL)
