# AI CRM - Deployment Guide

This document provides step-by-step instructions for deploying the AI CRM application using **Render** (backend) and **Vercel** (frontend).

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Vercel        │         │   Render        │
│   (Frontend)    │ ──────► │   (Backend)     │
│   React App     │  HTTPS  │   Spring Boot   │
└─────────────────┘         └────────┬────────┘
                                       │
                                       ▼
                               ┌───────────────┐
                               │  PostgreSQL   │
                               │  + pgvector   │
                               └───────────────┘
```

---

## Prerequisites

1. **GitHub/GitLab/Bitbucket** repository
2. **Render** account (free tier available)
3. **Vercel** account (free tier available)
4. **Ollama** API endpoint (cloud or self-hosted)

---

## Step 1: Deploy Backend on Render

### Option A: Deploy via render.yaml (Recommended)

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect `render.yaml` and deploy

### Option B: Manual Deploy via Render UI

1. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (e.g., `main`)

2. **Configure the service:**
   - **Name:** `aicrm-api`
   - **Environment:** `Java`
   - **Build Command:** `./mvnw -DskipTests clean package` or `mvnw -DskipTests clean package`
   - **Start Command:** `java -jar target/aicrm-0.0.1-SNAPSHOT.jar`

3. **Add Environment Variables:**

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `PORT` | `8086` | Render auto-sets this |
   | `DATABASE_URL` | `postgres://user:pass@host:5432/db` | PostgreSQL connection string |
   | `DATABASE_USERNAME` | `postgres` | Database username |
   | `DATABASE_PASSWORD` | `your_secure_password` | Database password |
   | `JPA_DDL_AUTO` | `update` | Hibernate schema update |
   | `SHOW_SQL` | `false` | Disable SQL logging in production |
   | `OLLAMA_MODEL` | `minimax-m2.5:cloud` | Ollama model |
   | `OLLAMA_BASE_URL` | `https://api.ollama.com` | Ollama API endpoint |
   | `MAIL_USERNAME` | `your_email@gmail.com` | Gmail for SMTP |
   | `MAIL_PASSWORD` | `your_app_password` | Gmail app password |
   | `JWT_SECRET` | `your_256_bit_secret_key` | **Generate a secure key!** |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` | Frontend URL |

4. **Deploy:** Click "Create Web Service"

### Create PostgreSQL Database on Render

1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Configure:
   - **Name:** `aicrm-db`
   - **Plan:** Free (or paid as needed)
   - **PostgreSQL Version:** 16
3. Once created, copy the "Internal Database URL" and use it as `DATABASE_URL`

---

## Step 2: Deploy Frontend on Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root (or import the entire repo and set frontend as root)
5. Configure:
   - **Framework Preset:** `Create React App` (or `Vite` if migrated)
   - **Build Command:** `npm run build` (or `npm run build` for Vite)
   - **Output Directory:** `build` (or `dist` for Vite)

6. **Add Environment Variables:**

   | Variable | Value |
   |----------|-------|
   | `REACT_APP_API_URL` | `https://your-backend-api.onrender.com` |

7. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your Vercel team
# - Link to existing project? No
# - What's your project's name? aicrm-frontend
# - In which directory is your code? . (current directory)
# - Want to override settings? Yes
# - What package.json script uses "build"? npm run build
# - What is the output directory? build
```

### Configure Environment Variables on Vercel

1. Go to your project on Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - `REACT_APP_API_URL` = `https://your-backend-api.onrender.com`
4. Redeploy to apply changes

---

## Step 3: Verify Deployment

1. **Test Backend API:**
   ```bash
   curl https://your-backend-api.onrender.com/api/leads
   ```

2. **Test Frontend:**
   - Visit `https://your-frontend.vercel.app`
   - Check browser console for CORS errors
   - Verify API calls are being made to the correct backend URL

---

## Step 4: Configure Custom Domain (Optional)

### Vercel:
1. Go to project Settings → "Domains"
2. Add your custom domain
3. Update DNS records as instructed

### Render:
1. Go to your web service → "Settings" → "Custom Domains"
2. Add your custom domain
3. Update DNS records

---

## Environment Variables Summary

### Backend (Render)

| Variable | Required | Example Value |
|----------|----------|---------------|
| `PORT` | Yes | `8086` |
| `DATABASE_URL` | Yes | `postgres://user:pass@host:5432/aicrm` |
| `DATABASE_USERNAME` | Yes | `postgres` |
| `DATABASE_PASSWORD` | Yes | `secure_password` |
| `JWT_SECRET` | Yes | `your-256-bit-secret-key` |
| `OLLAMA_BASE_URL` | Yes | `https://api.ollama.com` |
| `OLLAMA_MODEL` | Yes | `minimax-m2.5:cloud` |
| `MAIL_USERNAME` | No | `your_email@gmail.com` |
| `MAIL_PASSWORD` | No | `gmail_app_password` |
| `CORS_ORIGINS` | Yes | `https://your-frontend.vercel.app` |

### Frontend (Vercel)

| Variable | Required | Example Value |
|----------|----------|---------------|
| `REACT_APP_API_URL` | Yes | `https://your-backend-api.onrender.com` |

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` in Render includes your Vercel URL
- Example: `https://aicrm-frontend.vercel.app`

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Check that pgvector extension is enabled

### 502 Bad Gateway (Render)
- Check if the JAR file was built correctly
- Verify `startCommand` is correct
- Check Render logs for errors

### 404 on Frontend Routes
- Ensure `vercel.json` has correct rewrites
- Verify build output directory is correct

---

## Security Notes

1. **Never commit secrets to GitHub!** Use environment variables
2. **Generate a strong JWT_SECRET:**
   ```bash
   # Generate a random 256-bit key
   openssl rand -base64 32
   ```
3. **Use Gmail App Passwords** (not your regular password)
4. **Enable HTTPS** (automatic on Render and Vercel)

---

## Quick Deploy Commands

```bash
# Backend build (local)
./mvnw -DskipTests clean package

# Frontend build (local)
cd frontend
npm run build

# Test locally
java -jar target/aicrm-0.0.1-SNAPSHOT.jar
npm start
```