# 🚀 Deployment Guide - Step by Step

## Easiest Way: Deploy to Railway (5 minutes)

### Step 1: Sign Up for Railway
1. Go to **[railway.app](https://railway.app)**
2. Click **"Login"** and sign in with your GitHub account
3. Authorize Railway to access your repositories

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`valeriotuci-tech/Valerio-Tuci`**
4. Railway will automatically detect it's a Node.js app

### Step 3: Add PostgreSQL Database
1. In your project dashboard, click **"New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway automatically creates the database and sets `DATABASE_URL`

### Step 4: Set Up Database Schema
1. Click on your **PostgreSQL service**
2. Go to **"Data"** tab
3. Click **"Query"**
4. Copy and paste the contents of `db/schema.sql`
5. Click **"Run Query"**

### Step 5: Configure Environment Variables
1. Click on your **web service** (not the database)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables:

```
NODE_ENV=production
JWT_SECRET=your_super_secret_random_string_change_this
JWT_EXPIRE=24h
```

### Step 6: Deploy
1. Railway automatically deploys your app
2. Wait for the build to complete (2-3 minutes)
3. Click **"Settings"** → **"Generate Domain"**
4. Your app is now live!

**Your URL will be:** `https://your-app-name.up.railway.app`

---

## Testing Your Deployment

Visit your deployment URL. You should see the homepage.

---

## Troubleshooting

### Issue: "Application Error" or 500 Error
Check your logs for errors. Common issues:
- Missing environment variables
- Database connection failed
- Database schema not set up

### Issue: Database connection failed
- Verify `DATABASE_URL` is set correctly
- Make sure database schema is created
- Check database is running

---

## Post-Deployment Checklist

- [ ] App is accessible via URL
- [ ] Database is connected and schema is created
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Environment variables are set
- [ ] Logs show no errors
