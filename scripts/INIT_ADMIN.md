# Admin Account Initialization Guide

## Quick Setup

**Admin Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

## Prerequisites

Install required packages:
```bash
npm install @azure/cosmos bcrypt
```

## Setup Environment Variables

Create a `.env` file or set environment variables:

```bash
COSMOS_ENDPOINT=your-cosmos-db-endpoint
COSMOS_KEY=your-cosmos-db-key
```

Or set them directly:
```bash
export COSMOS_ENDPOINT="your-endpoint"
export COSMOS_KEY="your-key"
```

## Run Initialization

```bash
node scripts/init-admin.js
```

## Manual Database Insert (Alternative)

If you prefer to insert directly into your database:

1. **Generate password hash**:
   ```bash
   node -e "const bcrypt=require('bcrypt'); bcrypt.hash('admin123',10).then(h=>console.log(h))"
   ```

2. **Insert into database**:
   ```json
   {
     "id": "admin-user-001",
     "username": "admin",
     "email": "admin@refix.com",
     "passwordHash": "<paste-generated-hash-here>",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

## Verify

After initialization, login at `/creator-dashboard`:
- Username: `admin`
- Password: `admin123`

## Security

⚠️ **IMPORTANT**: Change the default password immediately after first login!

