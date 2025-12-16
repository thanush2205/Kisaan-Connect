#!/bin/bash

# Kisaan Connect - Render Deployment Quick Start
# This script helps you prepare your project for deployment

echo "🚀 Kisaan Connect - Render Deployment Preparation"
echo "================================================"
echo ""

# Check if Git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository found"
fi

# Check for .gitignore
if [ ! -f .gitignore ]; then
    echo "⚠️  .gitignore not found"
else
    echo "✅ .gitignore found"
fi

# Check for sensitive files
echo ""
echo "🔒 Checking for sensitive files..."
if git ls-files | grep -q "\.env$"; then
    echo "⚠️  WARNING: .env file is tracked by Git!"
    echo "   Run: git rm --cached .env"
else
    echo "✅ .env file not tracked"
fi

if git ls-files | grep -q "firebase-service-account\.json"; then
    echo "⚠️  WARNING: firebase-service-account.json is tracked by Git!"
    echo "   Run: git rm --cached firebase-service-account.json"
else
    echo "✅ Firebase credentials not tracked"
fi

# Check node_modules
if git ls-files | grep -q "node_modules"; then
    echo "⚠️  WARNING: node_modules is tracked by Git!"
    echo "   Run: git rm -r --cached node_modules"
else
    echo "✅ node_modules not tracked"
fi

# Check package.json
echo ""
echo "📦 Checking package.json..."
if [ -f package.json ]; then
    if grep -q '"start"' package.json; then
        echo "✅ Start script found"
    else
        echo "❌ Start script not found in package.json"
    fi
    
    if grep -q '"engines"' package.json; then
        echo "✅ Node.js version specified"
    else
        echo "⚠️  Node.js version not specified (will use default)"
    fi
else
    echo "❌ package.json not found!"
    exit 1
fi

# Check MongoDB connection
echo ""
echo "🗄️  Checking MongoDB Atlas setup..."
if [ -f .env ]; then
    if grep -q "MONGODB_URI" .env; then
        echo "✅ MongoDB URI found in .env"
        echo "   Make sure to add this to Render environment variables"
    else
        echo "⚠️  MONGODB_URI not found in .env"
    fi
else
    echo "⚠️  .env file not found"
fi

# Check Firebase
echo ""
echo "🔥 Checking Firebase setup..."
if [ -f firebase-service-account.json ]; then
    echo "✅ Firebase service account found"
    echo "   Remember to upload this as a Secret File in Render"
else
    echo "⚠️  firebase-service-account.json not found"
fi

# Git status
echo ""
echo "📊 Git Status:"
echo "=============="
git status --short

# Instructions
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Review the files above and ensure no sensitive data is tracked"
echo "2. Commit your changes:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo ""
echo "3. Create a GitHub repository and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/Kisaan-Connect.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Go to https://render.com and create a new Web Service"
echo "5. Connect your GitHub repository"
echo "6. Add environment variables (see .env.production for reference)"
echo "7. Add firebase-service-account.json as a Secret File"
echo "8. Deploy!"
echo ""
echo "📚 For detailed instructions, see RENDER_DEPLOYMENT_GUIDE.md"
echo ""

# Generate session secret
echo "🔐 Random SESSION_SECRET (copy this for Render):"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""

echo "✅ Preparation check complete!"
