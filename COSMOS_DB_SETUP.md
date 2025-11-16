# Azure Cosmos DB Configuration Guide

This guide will walk you through configuring Azure Cosmos DB credentials for the ReFix backend server.

## Prerequisites

- An Azure account with an active subscription
- An Azure Cosmos DB account (or create one following the steps below)
- Access to Azure Portal

## Step 1: Get Cosmos DB Credentials from Azure Portal

### Option A: If You Already Have a Cosmos DB Account

1. **Log in to Azure Portal**
   - Go to [https://portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Navigate to Your Cosmos DB Account**
   - In the search bar at the top, type "Cosmos DB" and select it
   - Find and click on your Cosmos DB account (e.g., `refixdb`)

3. **Access Keys**
   - In the left sidebar, under "Settings", click on **"Keys"**
   - You will see:
     - **URI** (Endpoint): This is your `COSMOS_ENDPOINT`
     - **PRIMARY KEY**: This is your `COSMOS_KEY`
     - **PRIMARY CONNECTION STRING**: Alternative format (not used here)

4. **Copy the Credentials**
   - Copy the **URI** value (e.g., `https://refixdb.documents.azure.com:443/`)
   - Copy the **PRIMARY KEY** value (a long base64-encoded string)

### Option B: Create a New Cosmos DB Account

1. **Create Cosmos DB Account**
   - In Azure Portal, click **"Create a resource"**
   - Search for "Azure Cosmos DB" and select it
   - Click **"Create"**

2. **Configure Basic Settings**
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Account Name**: Enter a unique name (e.g., `refixdb`)
   - **API**: Select **"Core (SQL)"**
   - **Location**: Choose a region close to you
   - Click **"Review + Create"**, then **"Create"**

3. **Wait for Deployment**
   - Deployment takes 5-10 minutes
   - Click **"Go to resource"** when ready

4. **Get Credentials**
   - Follow steps 3-4 from Option A above

## Step 2: Create Backend Environment File

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Create `.env` File**
   - Create a new file named `.env` in the `backend` directory
   - **Important**: The file must be named exactly `.env` (with the dot at the beginning)
   - **Note**: On Windows, you may need to create it as `.env.` (with trailing dot) or use a text editor

3. **Add Configuration**
   Open the `.env` file and add the following content:

   ```env
   # Azure Cosmos DB Configuration
   COSMOS_ENDPOINT=https://your-account-name.documents.azure.com:443/
   COSMOS_KEY=your-primary-key-here

   # Server Configuration
   PORT=3000
   JWT_SECRET=your-secret-key-change-this-in-production-use-a-long-random-string
   ```

4. **Replace Placeholder Values**
   - Replace `https://your-account-name.documents.azure.com:443/` with your actual Cosmos DB URI
   - Replace `your-primary-key-here` with your actual PRIMARY KEY
   - Replace `your-secret-key-change-this-in-production-use-a-long-random-string` with a secure random string for JWT signing

### Example `.env` File

```env
# Azure Cosmos DB Configuration
COSMOS_ENDPOINT=https://refixdb.documents.azure.com:443/
COSMOS_KEY=XilpHdDvbUHQAgVPqoePdxN6rwFcAuMYEi45kaCPe7uapUITXXuHcNoPuw23I97BTKZVXfGfuwl5ACDb2ADceQ==

# Server Configuration
PORT=3000
JWT_SECRET=my-super-secret-jwt-key-change-in-production-1234567890abcdef
```

## Step 3: Verify Dependencies

Ensure the Azure Cosmos DB package is installed:

```bash
cd backend
npm install
```

This will install `@azure/cosmos` and other required dependencies.

## Step 4: Test the Connection

### Method 1: Use the Diagnosis Script

```bash
cd backend
node diagnose-cosmos.js
```

**Expected Output (Success):**
```
✅ CosmosClient 创建成功
✅ 数据库连接成功！
   数据库 ID: refix
✅ 找到 X 个容器:
   - users
   - tutorials
   - categories
   - feedback
```

**Expected Output (Error):**
```
❌ 连接失败
   错误信息: [error details]
```

### Method 2: Start the Backend Server

```bash
cd backend
npm start
```

**Expected Output (Success):**
```
✅ Using Azure Cosmos DB for persistence
🚀 Backend server started!
📡 Server running on http://localhost:3000
🔗 API base URL: http://localhost:3000/api
```

**Expected Output (Fallback - No Cosmos DB):**
```
ℹ️  Using local JSON file for persistence: [path]/db.json
```

If you see the fallback message, it means Cosmos DB credentials are not configured or invalid.

## Step 5: Verify Full System Connection

Run the comprehensive verification script from the project root:

```bash
npm run verify-azure
```

This will test:
- ✅ Backend → Cosmos DB connection
- ✅ Frontend → Blob Storage connection
- ✅ Frontend → Backend API connection
- ✅ End-to-end data flow

## Troubleshooting

### Issue: "Missing Cosmos DB credentials"

**Solution:**
- Verify that `backend/.env` file exists
- Check that `COSMOS_ENDPOINT` and `COSMOS_KEY` are set
- Ensure there are no extra spaces around the `=` sign
- Make sure the file is in the `backend` directory, not the root

### Issue: "Failed to initialize Cosmos DB client"

**Possible Causes:**
1. **Invalid Endpoint Format**
   - Ensure endpoint ends with `/` (e.g., `https://account.documents.azure.com:443/`)
   - Check for typos in the endpoint URL

2. **Invalid Key**
   - Ensure you copied the PRIMARY KEY, not the SECONDARY KEY
   - Check for extra spaces or line breaks in the key
   - Verify the key hasn't been rotated in Azure Portal

3. **Network Issues**
   - Check your internet connection
   - Verify firewall settings allow outbound HTTPS connections
   - Check if your IP is blocked in Cosmos DB firewall rules

4. **Package Not Installed**
   ```bash
   cd backend
   npm install @azure/cosmos
   ```

### Issue: "Authorization token is invalid"

**Solution:**
- The key may have been rotated in Azure Portal
- Go to Azure Portal → Cosmos DB → Keys
- Copy the latest PRIMARY KEY
- Update `backend/.env` with the new key
- Restart the backend server

### Issue: "Database not found"

**Solution:**
- This is normal! The database and containers will be created automatically on first use
- The system will create:
  - Database: `refix`
  - Containers: `users`, `tutorials`, `categories`, `feedback`

### Issue: Backend Falls Back to JSON File

**Symptoms:**
- Server shows: `ℹ️  Using local JSON file for persistence`
- No error messages about Cosmos DB

**Check:**
1. Verify `backend/.env` file exists and contains credentials
2. Check for typos in variable names (`COSMOS_ENDPOINT`, `COSMOS_KEY`)
3. Ensure no extra spaces: `COSMOS_ENDPOINT=https://...` (correct), not `COSMOS_ENDPOINT = https://...` (wrong)
4. Restart the server after making changes

## Security Best Practices

1. **Never Commit `.env` Files**
   - Add `.env` to `.gitignore`
   - Use environment variables in production
   - Rotate keys regularly

2. **Use Strong JWT Secret**
   - Generate a random string: `openssl rand -base64 32`
   - Use at least 32 characters
   - Never use default or predictable values

3. **Rotate Keys Periodically**
   - In Azure Portal, you can regenerate keys
   - Update `.env` immediately after rotation
   - Old keys stop working immediately

4. **Restrict IP Access (Optional)**
   - In Azure Portal → Cosmos DB → Networking
   - Configure firewall rules to allow only specific IPs
   - For development, you may allow all IPs (0.0.0.0/0)

## File Structure

After configuration, your backend directory should look like:

```
backend/
├── .env                    ← Your credentials file (DO NOT COMMIT)
├── db.js                   ← Database abstraction layer
├── server.js               ← Express server
├── package.json
├── node_modules/
└── db.json                 ← Fallback storage (if Cosmos DB not configured)
```

## Next Steps

After successfully configuring Cosmos DB:

1. ✅ Verify connection: `npm run verify-azure`
2. ✅ Start backend server: `cd backend && npm start`
3. ✅ Test API endpoints
4. ✅ Create admin account (if not exists)
5. ✅ Start frontend: `npm run dev`

## Additional Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure Portal](https://portal.azure.com)
- [@azure/cosmos SDK Documentation](https://docs.microsoft.com/javascript/api/@azure/cosmos/)

## Quick Reference

**File Location:** `backend/.env`

**Required Variables:**
```env
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key
PORT=3000
JWT_SECRET=your-secret-key
```

**Test Command:**
```bash
cd backend && node diagnose-cosmos.js
```

**Verify All Connections:**
```bash
npm run verify-azure
```

