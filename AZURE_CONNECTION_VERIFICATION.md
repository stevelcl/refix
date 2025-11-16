# Azure Connection Verification Guide

This document provides instructions for verifying that both frontend and backend servers are properly connected to Azure services.

## Quick Verification

Run the verification script to check all Azure connections:

```bash
npm run verify-azure
```

Or directly:

```bash
node verify-azure-connection.js
```

## What Gets Verified

The verification script checks four critical connections:

### 1. Backend → Azure Cosmos DB

**Status**: ❌ Not Connected (requires configuration)

**What it checks:**
- Cosmos DB endpoint and key in `backend/.env`
- Ability to connect to Cosmos DB
- Database and container existence
- Read/write operations

**To configure:**
1. Create `backend/.env` file:
```env
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key-here
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Restart backend server

### 2. Frontend → Azure Blob Storage

**Status**: ✅ Configured

**What it checks:**
- Blob Storage SAS URL in `src/localEnv.js` or `.env`
- SAS token validity (expiration date)
- Storage account and container information

**Current configuration:**
- Storage Account: `refix1storage`
- Container: `tutorials`
- SAS Token: Valid (expires in ~76 days)

**Note**: The connection test may fail from Node.js due to CORS restrictions, but it will work correctly from the browser.

### 3. Frontend → Backend API

**Status**: ⚠️ Requires Backend Server Running

**What it checks:**
- `VITE_API_BASE` configuration in `.env`
- Backend server accessibility
- API endpoint response

**Current configuration:**
- API Base URL: `http://localhost:3000/api`

**To test:**
1. Start backend server:
```bash
cd backend
npm start
```

2. Run verification again

### 4. End-to-End Data Flow

**Status**: ⚠️ Partial (requires Cosmos DB configuration)

**What it verifies:**
- Complete data flow from frontend → backend → Cosmos DB
- Architecture and connection path

## Verification Results Summary

Based on the current configuration:

| Connection | Status | Notes |
|------------|--------|-------|
| Backend → Cosmos DB | ❌ Not Connected | Configure `backend/.env` with Cosmos credentials |
| Frontend → Blob Storage | ✅ Connected | SAS URL configured and valid |
| Frontend → Backend API | ⚠️ Server Not Running | Start backend server to test |
| End-to-End Flow | ⚠️ Partial | Requires Cosmos DB configuration |

## Configuration Steps

### Step 1: Configure Backend Cosmos DB Connection

1. Create `backend/.env` file:
```env
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key-here
JWT_SECRET=your-secret-key-here
PORT=3000
```

2. Get Cosmos DB credentials from Azure Portal:
- Navigate to your Cosmos DB account
- Go to "Keys" section
- Copy the URI (endpoint) and Primary Key

### Step 2: Verify Backend Connection

```bash
cd backend
node diagnose-cosmos.js
```

This will test the Cosmos DB connection specifically.

### Step 3: Start Backend Server

```bash
cd backend
npm start
```

The server should display:
```
✅ Using Azure Cosmos DB for persistence
🚀 Backend server started!
📡 Server running on http://localhost:3000
```

### Step 4: Verify Frontend Configuration

Check that `.env` file exists in project root:
```env
VITE_API_BASE=http://localhost:3000/api
```

### Step 5: Run Full Verification

```bash
npm run verify-azure
```

## Expected Output

When all connections are properly configured, you should see:

```
✅ Backend -> Cosmos DB:        ✅ CONNECTED
✅ Frontend -> Blob Storage:    ✅ CONNECTED
✅ Frontend -> Backend API:     ✅ CONNECTED
✅ End-to-End Flow:             ✅ VERIFIED

✅ CRITICAL CONNECTIONS VERIFIED
   Your application is properly connected to Azure services!
```

## Troubleshooting

### Backend Cannot Connect to Cosmos DB

1. Verify credentials in `backend/.env`
2. Check network connectivity
3. Ensure Cosmos DB account is active
4. Verify firewall rules allow your IP

### Frontend Cannot Connect to Backend

1. Ensure backend server is running on port 3000
2. Check `VITE_API_BASE` in `.env` file
3. Restart frontend dev server after changing `.env`
4. Check CORS settings in `backend/server.js`

### Blob Storage Connection Issues

1. Verify SAS URL is valid and not expired
2. Check CORS settings in Azure Storage Account
3. Ensure SAS token has proper permissions (read, write, create)

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│  Cosmos DB  │
│  (React)    │  API    │  (Express)   │  SDK    │  (Azure)    │
└────────────┘         └──────────────┘         └─────────────┘
      │
      │ SAS URL
      ▼
┌─────────────┐
│ Blob Storage│
│   (Azure)   │
└─────────────┘
```

## Next Steps

1. Configure Cosmos DB connection in `backend/.env`
2. Start backend server
3. Run verification script
4. Verify all connections show ✅ status

For detailed Azure setup instructions, see:
- `AZURE_INTEGRATION_SUMMARY.md`
- `ENV_CONFIG.md`
- `backend/README.md`

