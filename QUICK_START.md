# Quick Start Guide

## Backend Server Status

✅ **Backend server is running!**
- URL: `http://localhost:3000`
- API Base: `http://localhost:3000/api`
- Status: Active and listening on port 3000

## Admin Account

The backend server automatically created an admin account:
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **Change password after first login!**

## Running Frontend and Backend Together

### Option 1: Two Terminal Windows (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Single Terminal (Background)

**Start backend:**
```bash
cd backend
npm start
# Press Ctrl+Z to background, or open new terminal
```

**Start frontend:**
```bash
npm run dev
```

## Testing Login

1. Open browser: `http://localhost:5173`
2. Navigate to: `/creator-dashboard`
3. Login with:
   - Username: `admin`
   - Password: `admin123`

## Server Commands

### Start Backend
```bash
cd backend
npm start
```

### Start Backend (Development with auto-reload)
```bash
cd backend
npm run dev
```

### Stop Backend
Press `Ctrl+C` in the terminal where backend is running.

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
1. Change `PORT` in `backend/.env`
2. Update `VITE_API_BASE` in frontend `.env` to match

### Backend Not Starting
- Check if Node.js is installed: `node --version`
- Install dependencies: `cd backend && npm install`
- Check for errors in terminal output

### Frontend Can't Connect
- Verify backend is running: `http://localhost:3000/api/auth/login`
- Check `.env` file has correct `VITE_API_BASE`
- Restart frontend dev server after changing `.env`

