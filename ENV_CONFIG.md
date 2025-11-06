# Environment Variables Configuration Guide

## Problem: "VITE_API_BASE is not configured" Error

If you see this error, it means the frontend application cannot connect to your backend API server because the VITE_API_BASE environment variable is not set.

## Quick Fix

### Step 1: Create .env file

Create a file named .env in the root directory of your project (same level as package.json).

### Step 2: Add your backend API URL

Add this line to your .env file:

`env
VITE_API_BASE=http://localhost:3000/api
`

**Replace http://localhost:3000/api with your actual backend API URL.**

### Step 3: Restart the dev server

After creating/updating .env, restart your Vite dev server:

`ash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
`

## Environment Variable Examples

### Local Development

`env
# Local backend server (Express/Node.js)
VITE_API_BASE=http://localhost:3000/api

# Local Azure Functions
VITE_API_BASE=http://localhost:7071/api

# Local Django/FastAPI
VITE_API_BASE=http://localhost:8000/api
`

### Production (Azure Functions)

`env
VITE_API_BASE=https://your-function-app.azurewebsites.net/api
`

### Production (Custom Server)

`env
VITE_API_BASE=https://api.yourdomain.com/api
`

## Optional: Azure Blob Storage

If you want to upload images directly from the browser, also add:

`env
VITE_BLOB_CONTAINER_SAS_URL=https://yourstorageaccount.blob.core.windows.net/yourcontainer?sv=...&sig=...
`

**Note**: Azure Blob Storage is optional. If you don't set this, image uploads will be disabled but the rest of the app will work.

## Complete .env Template

Create a .env file with this content:

`env
# Backend API Base URL (REQUIRED)
# Replace with your actual backend API URL
VITE_API_BASE=http://localhost:3000/api

# Azure Blob Storage SAS URL (OPTIONAL)
# Only needed if you want to upload images directly from browser
VITE_BLOB_CONTAINER_SAS_URL=
`

## Verification

After configuring .env and restarting the server:

1. Try logging in at /creator-dashboard
2. The error "VITE_API_BASE is not configured" should disappear
3. If you still see connection errors, check:
   - Is your backend server running?
   - Is the URL in VITE_API_BASE correct?
   - Can you access the backend URL directly in your browser?

## Troubleshooting

### Error persists after creating .env

- Make sure .env is in the root directory (same folder as package.json)
- Restart the Vite dev server completely (stop and start again)
- Check for typos in the variable name (must be exactly VITE_API_BASE)

### Backend connection errors

- Verify your backend server is running
- Test the API endpoint directly: http://localhost:3000/api/auth/login (should return an error, not "not found")
- Check CORS settings on your backend (must allow requests from http://localhost:5173)

### Still not working?

1. Check browser console for detailed error messages
2. Verify .env file is being read: add console.log(import.meta.env.VITE_API_BASE) in your code temporarily
3. Make sure there are no spaces around the = sign in .env: VITE_API_BASE=http://... (correct), not VITE_API_BASE = http://... (wrong)
