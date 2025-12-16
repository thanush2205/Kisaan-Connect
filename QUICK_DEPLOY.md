# 🚀 Quick Deploy to Render - 10 Minute Guide

## Step 1: Prepare (2 minutes)
```bash
cd /home/thanush/Kisaan-Connect-1
./prepare-deploy.sh
# Copy the SESSION_SECRET it generates
```

## Step 2: Get Gmail App Password (1 minute)
1. Go to: https://myaccount.google.com/apppasswords
2. Create "Kisaan Connect" app password
3. Copy the 16-character password

## Step 3: Push to GitHub (2 minutes)
```bash
git add .
git commit -m "Deploy to Render"
git remote add origin https://github.com/thanush2205/Kisaan-Connect.git
git branch -M main
git push -u origin main
```

## Step 4: MongoDB Atlas (1 minute)
1. Go to: https://cloud.mongodb.com
2. Network Access → Add IP → Allow 0.0.0.0/0

## Step 5: Create Render Service (2 minutes)
1. Go to: https://render.com
2. New + → Web Service
3. Connect GitHub repo
4. **Name:** kisaan-connect
5. **Region:** Singapore
6. **Build:** npm install
7. **Start:** npm start
8. **Instance:** Free or Starter ($7/month)

## Step 6: Environment Variables (2 minutes)
Add these in Render (click "Advanced"):

```
MONGODB_URI=mongodb+srv://thanushreddy934_db_user:ywMjvTLUZ7WT0cJv@cluster-k.yzjyrci.mongodb.net/kisaan_connect_db?retryWrites=true&w=majority&appName=Cluster-k

SESSION_SECRET=[paste generated secret from Step 1]

EMAIL_USER=thanushreddy934@gmail.com

EMAIL_PASS=[paste Gmail app password from Step 2]

SUPPORT_EMAIL=thanushreddy934@gmail.com

PORT=3000

NODE_ENV=production

FIREBASE_PROJECT_ID=kisaan-connect-fe4aa

FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**Secret File:**
- Filename: `firebase-service-account.json`
- Content: Paste your entire firebase-service-account.json content

## Step 7: Deploy! (3-5 minutes)
Click "Create Web Service" and wait for deployment.

## Step 8: Update Firebase (1 minute)
1. Go to: https://console.firebase.google.com
2. Settings → Authorized domains
3. Add: `your-app-name.onrender.com`

## ✅ Done!
Your app is live at: `https://your-app-name.onrender.com`

---

## 📋 Quick Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Verify all environment variables are correct

**MongoDB error?**
- Ensure IP whitelist has 0.0.0.0/0
- Check MONGODB_URI is correct

**Firebase error?**
- Verify firebase-service-account.json uploaded
- Check authorized domains

**App sleeps (free tier)?**
- Use UptimeRobot to ping every 5 minutes
- Or upgrade to Starter ($7/month)

---

## 🎯 Test Checklist
- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login
- [ ] Can upload images
- [ ] Chat works
- [ ] Push notifications work
- [ ] Admin panel accessible

---

**For detailed instructions:** See `DEPLOYMENT_STEPS.md`
