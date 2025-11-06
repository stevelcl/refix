# Troubleshooting "Failed to fetch" Error

## Problem

After configuring `.env` file, you're seeing "Failed to fetch" error when trying to login. This means the frontend cannot connect to your backend server.

## Diagnostic Steps

### Step 1: Verify Backend Server is Running

Check if your backend server is actually running:

```bash
# Test if backend is accessible
# Replace with your actual backend URL
curl http://localhost:3000/api/auth/login
# or open in browser: http://localhost:3000/api/auth/login
```

**Expected Result:** 
- If backend is running: You should get an error response (like "Method not allowed" or "Missing credentials"), NOT "Connection refused" or "Cannot connect"
- If backend is NOT running: You'll get "Connection refused" or "Cannot connect"

### Step 2: Check .env File Configuration

Verify your `.env` file contains the correct backend URL:

```bash
# Check current .env content
cat .env
# or on Windows PowerShell:
Get-Content .env
```

**Common Issues:**
- ❌ Wrong port number
- ❌ Missing `/api` suffix
- ❌ Using `https` instead of `http` for local development
- ❌ Extra spaces around `=` sign

### Step 3: Verify Server Restart

**CRITICAL:** After creating/updating `.env`, you MUST restart the Vite dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Vite only reads `.env` file on startup, so changes won't take effect until restart.

### Step 4: Check Browser Console

Open browser Developer Tools (F12) and check:

1. **Console Tab:** Look for any JavaScript errors
2. **Network Tab:** 
   - Try login again
   - Find the failed request to `/auth/login`
   - Check the request URL - is it correct?
   - Check the error message - what does it say?

### Step 5: Test Backend API Directly

Test if your backend endpoint exists:

```bash
# Test login endpoint (should return error, not 404)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

**Expected Response:**
- `401 Unauthorized` or `400 Bad Request` = ✅ Backend is working
- `404 Not Found` = ❌ Endpoint doesn't exist
- `Connection refused` = ❌ Backend not running

## Common Solutions

### Solution 1: Backend Server Not Running

**Problem:** Backend server is not started.

**Fix:**
```bash
# Start your backend server
# Example for Express/Node.js:
cd backend
npm start

# Example for Azure Functions:
func start
```

### Solution 2: Wrong Port Number

**Problem:** `.env` has wrong port number.

**Fix:**
1. Check what port your backend is actually running on
2. Update `.env` file:
   ```env
   VITE_API_BASE=http://localhost:YOUR_ACTUAL_PORT/api
   ```
3. Restart Vite dev server

### Solution 3: CORS Issue

**Problem:** Backend is running but blocking requests due to CORS.

**Fix:** Update your backend CORS settings to allow requests from `http://localhost:5173`:

```javascript
// Example for Express
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Solution 4: Backend URL Format Issue

**Problem:** Missing `/api` suffix or wrong URL format.

**Fix:** Ensure `.env` has the correct format:
```env
# ✅ Correct
VITE_API_BASE=http://localhost:3000/api

# ❌ Wrong - missing /api
VITE_API_BASE=http://localhost:3000

# ❌ Wrong - extra slash
VITE_API_BASE=http://localhost:3000/api/
```

## Quick Test

Run this in your browser console (F12) to test connection:

```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(e => console.error('Error:', e))
```

**If this works:** Frontend code issue  
**If this fails:** Backend/network issue

## Next Steps

1. ✅ Create `.env` file with correct backend URL
2. ✅ Restart Vite dev server
3. ✅ Verify backend server is running
4. ✅ Test backend endpoint directly
5. ✅ Check CORS settings
6. ✅ Review browser console for detailed errors

If you're still having issues, share:
- Backend server type (Express, Azure Functions, etc.)
- Backend server logs/errors
- Browser console Network tab details

