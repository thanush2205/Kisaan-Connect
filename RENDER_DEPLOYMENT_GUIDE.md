# 🚀 Deploy Kisaan Connect to Render.com - Complete Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ GitHub account (to push your code)
- ✅ Render.com account (sign up at https://render.com)
- ✅ MongoDB Atlas account (already configured)
- ✅ Firebase project (already configured)
- ✅ Gmail app password for nodemailer
- ✅ All local changes committed

---

## 🔧 Part 1: Prepare Your Project for Deployment

### Step 1: Update package.json

Your package.json already has the correct start script:
```json
"scripts": {
  "start": "node server/app.js"
}
```

### Step 2: Add Node.js Version

Specify Node.js version in package.json (I'll create this file for you).

### Step 3: Create render.yaml (Optional but Recommended)

This file tells Render how to build and deploy your app.

### Step 4: Verify .gitignore

Make sure sensitive files are not committed:
- ✅ `.env` (excluded)
- ✅ `firebase-service-account.json` (excluded)
- ✅ `node_modules/` (excluded)

---

## 📦 Part 2: Push to GitHub

### Step 1: Initialize Git (if not already done)

```bash
cd /home/thanush/Kisaan-Connect-1
git init
git add .
git commit -m "Prepare for Render deployment"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Kisaan-Connect` (or your choice)
3. **Keep it Private** (because you'll add secrets later)
4. Don't add README, .gitignore, or license (you already have them)
5. Click "Create repository"

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/thanush2205/Kisaan-Connect.git
git branch -M main
git push -u origin main
```

---

## 🌐 Part 3: Deploy to Render.com

### Step 1: Sign Up / Login to Render

1. Go to https://render.com
2. Sign up or login (recommended: use GitHub to sign in)

### Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Find and select your **"Kisaan-Connect"** repository
5. Click **"Connect"**

### Step 3: Configure Web Service

Fill in the following details:

**Basic Settings:**
- **Name:** `kisaan-connect` (or your preferred name)
- **Region:** Choose closest to India (e.g., Singapore)
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (for testing) or **"Starter"** (for production)
- Free tier: 750 hours/month, sleeps after 15 min inactivity
- Starter: $7/month, always active

### Step 4: Add Environment Variables

Click on **"Advanced"** → **"Environment Variables"**

Add these variables one by one (click "+ Add Environment Variable"):

#### Required Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://thanushreddy934_db_user:ywMjvTLUZ7WT0cJv@cluster-k.yzjyrci.mongodb.net/kisaan_connect_db?retryWrites=true&w=majority&appName=Cluster-k
   ```

2. **SESSION_SECRET**
   ```
   your-super-secret-session-key-change-this-in-production
   ```

3. **EMAIL_USER**
   ```
   thanushreddy934@gmail.com
   ```

4. **EMAIL_PASS**
   ```
   [Your Gmail App Password - 16 characters]
   ```
   To get this:
   - Go to https://myaccount.google.com/apppasswords
   - Sign in
   - Create new app password named "Kisaan Connect"
   - Copy the 16-character password

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

9. **FIREBASE_SERVICE_ACCOUNT**
   - **IMPORTANT:** This needs special handling
   - Open your `firebase-service-account.json` file
   - Copy the ENTIRE JSON content
   - Paste it as a **single-line** string
   - **OR** use Render's "Secret Files" feature (see below)

### Step 5: Add Firebase Credentials (Two Options)

#### Option A: Environment Variable (Easier)

1. Open `firebase-service-account.json`
2. Minify the JSON (remove newlines and spaces)
3. Add as environment variable: `FIREBASE_SERVICE_ACCOUNT`
4. Value: The minified JSON string

#### Option B: Secret File (Recommended)

1. In Render dashboard, go to your service
2. Click **"Environment"** tab
3. Scroll to **"Secret Files"**
4. Click **"Add Secret File"**
5. **Filename:** `firebase-service-account.json`
6. **Contents:** Paste the entire JSON content from your local file
7. Click "Save"

Then update your code to read from the file (I'll help with this).

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Monitor the logs in real-time
4. Wait for "Deploy successful" message (usually 3-5 minutes)

---

## 🔥 Part 4: Configure Firebase for Production

### Update Firebase Service Worker Path

Your service worker needs to be accessible. Add this to your code (I'll help).

### Update Firebase Client Config

Update allowed domains in Firebase Console:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **kisaan-connect-fe4aa**
3. Go to **Project Settings** (gear icon)
4. Scroll to **"Your apps"** → **Web app**
5. Click **"Add domain"** under **Authorized domains**
6. Add: `your-app-name.onrender.com` (you'll get this URL after deployment)

### Update FCM Configuration

1. In Firebase Console, go to **Cloud Messaging**
2. Under **Web configuration**, ensure VAPID key is the same
3. No changes needed if you're using the same Firebase project

---

## 🔒 Part 5: Update CORS and Security Settings

### Update Express Session Configuration

In `server/app.js`, ensure session config works with Render:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
```

### Update Socket.io CORS

In `server/app.js`, update Socket.io configuration:

```javascript
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://your-app-name.onrender.com"]
      : "*",
    methods: ["GET", "POST"]
  }
});
```

---

## 📝 Part 6: Post-Deployment Configuration

### Step 1: Get Your Render URL

After deployment completes, you'll get a URL like:
```
https://kisaan-connect-xyz123.onrender.com
```

### Step 2: Update Firebase Authorized Domains

1. Go to Firebase Console
2. Project Settings → Authorized domains
3. Add your Render URL: `kisaan-connect-xyz123.onrender.com`

### Step 3: Test All Features

Visit your deployed app and test:
- ✅ User registration and login
- ✅ MongoDB connection (create test user)
- ✅ File uploads (profile pictures, crop images)
- ✅ Chat functionality with Socket.io
- ✅ Email notifications
- ✅ Push notifications (FCM)
- ✅ Admin panel access
- ✅ Help & Support with admin responses

### Step 4: Enable Persistent Storage (Important!)

Render's free tier has ephemeral storage. For file uploads, you need:

**Option A: Use Render Disk**
1. In Render dashboard → Your service
2. Click **"Disks"** tab
3. Add a disk with mount path: `/opt/render/project/src/uploads`

**Option B: Use Cloud Storage (Recommended for Production)**
- Use AWS S3, Google Cloud Storage, or Cloudinary
- Update multer configuration to upload to cloud
- This ensures files persist across deploys

---

## 🐛 Part 7: Troubleshooting Common Issues

### Issue 1: "Cannot find module 'firebase-admin'"

**Solution:** Ensure `firebase-admin` is in dependencies (not devDependencies):
```json
"dependencies": {
  "firebase-admin": "^13.6.0"
}
```

### Issue 2: "Session store not working"

**Solution:** Add connect-mongo for session persistence:
```bash
npm install connect-mongo
```

Then update session configuration:
```javascript
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
```

### Issue 3: "Firebase service worker not found"

**Solution:** Ensure service worker is in the correct public directory and accessible.

### Issue 4: "App goes to sleep (free tier)"

**Solution:** 
- Upgrade to Starter plan ($7/month)
- Or use a service like UptimeRobot to ping your app every 5 minutes

### Issue 5: "CORS errors"

**Solution:** Update CORS configuration with your Render domain.

### Issue 6: "MongoDB connection timeout"

**Solution:** 
1. Check MongoDB Atlas network access
2. Add `0.0.0.0/0` to IP whitelist (allow from anywhere)
3. Verify connection string in environment variables

---

## 📊 Part 8: Monitoring and Logs

### View Logs in Render

1. Go to your service dashboard
2. Click **"Logs"** tab
3. Monitor real-time logs
4. Look for:
   ```
   ✅ Firebase Admin SDK initialized successfully
   ✅ Successfully connected to MongoDB
   Server running at http://localhost:3000
   ```

### Set Up Alerts

1. In Render dashboard → Service → **"Notifications"**
2. Enable email alerts for:
   - Deploy failures
   - Service crashes
   - High memory usage

---

## 🎯 Part 9: Performance Optimization

### Enable HTTP/2

Render automatically provides HTTP/2 and HTTPS.

### Add Health Check Endpoint

I'll create this for you:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### Enable Compression

Add compression middleware:
```bash
npm install compression
```

---

## 💰 Part 10: Cost Estimation

### Free Tier
- 750 hours/month
- 512 MB RAM
- Sleeps after 15 min inactivity
- Best for: Testing and development

### Starter Tier ($7/month)
- Always active
- 512 MB RAM
- Best for: Small production apps

### Standard Tier ($25/month)
- 2 GB RAM
- Better performance
- Best for: Production apps with moderate traffic

### MongoDB Atlas
- Free tier: 512 MB storage
- Enough for thousands of users

### Firebase
- Free tier: 10K notifications/day
- 20K operations/day
- Likely sufficient for small apps

**Total minimum cost:** $0 (all free tiers) to $7/month (Render Starter)

---

## ✅ Deployment Checklist

Before deploying:
- [ ] All code committed to Git
- [ ] Pushed to GitHub
- [ ] Environment variables prepared
- [ ] Firebase credentials ready
- [ ] Gmail app password created
- [ ] MongoDB Atlas IP whitelist configured

During deployment:
- [ ] Web service created on Render
- [ ] All environment variables added
- [ ] Firebase credentials uploaded
- [ ] Build completed successfully
- [ ] Deployment successful

After deployment:
- [ ] Render URL obtained
- [ ] Firebase authorized domains updated
- [ ] All features tested
- [ ] Logs checked for errors
- [ ] Performance monitored

---

## 🆘 Need Help?

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com

### Common Commands

**View logs:**
```bash
# In Render dashboard → Logs tab
```

**Restart service:**
```bash
# In Render dashboard → Manual Deploy → "Clear build cache & deploy"
```

**Rollback:**
```bash
# In Render dashboard → Deploys tab → Select previous deploy → "Rollback"
```

---

## 🎉 Success Indicators

Your deployment is successful when:
1. ✅ Build completes without errors
2. ✅ Server starts and shows "Server running" in logs
3. ✅ MongoDB connection successful
4. ✅ Firebase Admin SDK initialized
5. ✅ App accessible at Render URL
6. ✅ Users can register and login
7. ✅ All features working (chat, notifications, admin panel)

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git add . && git commit -m "Update feature"`
3. Push: `git push origin main`
4. Render automatically builds and deploys
5. Watch logs to ensure successful deployment

---

## 📱 Next Steps After Deployment

1. **Custom Domain:** Add your own domain in Render settings
2. **SSL Certificate:** Render provides free SSL automatically
3. **Monitoring:** Set up UptimeRobot or similar
4. **Backups:** Set up MongoDB Atlas automated backups
5. **Analytics:** Add Google Analytics or similar
6. **Error Tracking:** Add Sentry or similar service

---

## 🎓 Learn More

- Render Documentation: https://render.com/docs/web-services
- Node.js Deployment Best Practices: https://render.com/docs/deploy-node-express-app
- MongoDB Atlas with Render: https://render.com/docs/databases

---

**Ready to deploy? Let's start with Part 1! I'll help you prepare the necessary files.**
