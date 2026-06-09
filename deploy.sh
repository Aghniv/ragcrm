#!/bin/bash

# =============================================================================
# AI CRM - Deployment Script
# =============================================================================
# This script helps deploy the application to Render (Backend + Database)
# and Vercel (Frontend)
# =============================================================================

echo "=========================================="
echo "  AI CRM Deployment Script"
echo "=========================================="

# Check if git repository is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first."
    exit 1
fi

echo ""
echo "Step 1: Pushing to GitHub..."
echo "-----------------------------------"
git push origin main
echo "✅ Code pushed to GitHub"

echo ""
echo "Step 2: Deploying to Render..."
echo "-----------------------------------"
echo "Please follow these steps:"
echo ""
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository: Aghniv/ragcrm"
echo "4. Select the 'render.yaml' file"
echo "5. Click 'Apply Blueprint'"
echo ""
echo "⚠️  IMPORTANT: After deployment, update these environment variables:"
echo "   - JWT_SECRET: Generate with 'openssl rand -base64 32'"
echo "   - MAIL_USERNAME: Your Gmail address"
echo "   - MAIL_PASSWORD: Your Gmail app password"
echo "   - CORS_ORIGINS: Your Vercel frontend URL (after deploying frontend)"
echo ""

read -p "Press Enter when you've deployed the backend on Render..."

echo ""
echo "Step 3: Deploying Frontend to Vercel..."
echo "-----------------------------------"
echo "Please follow these steps:"
echo ""
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'Add New...' → 'Project'"
echo "3. Import GitHub repository: Aghniv/ragcrm"
echo "4. Set 'Root Directory' to 'frontend'"
echo "5. Under 'Environment Variables':"
echo "   - Name: REACT_APP_API_URL"
echo "   - Value: https://aicrm-api.onrender.com (or your Render backend URL)"
echo "6. Click 'Deploy'"
echo ""

read -p "Press Enter when you've deployed the frontend on Vercel..."

echo ""
echo "Step 4: Final Configuration"
echo "-----------------------------------"
echo ""
echo "1. Go back to Render Dashboard"
echo "2. Update CORS_ORIGINS with your Vercel URL"
echo "3. Redeploy the backend"
echo ""

echo "=========================================="
echo "  Deployment Complete! 🎉"
echo "=========================================="
echo ""
echo "Your application should now be live:"
echo "- Backend API: https://aicrm-api.onrender.com"
echo "- Frontend: https://your-app.vercel.app"
echo ""