# Admin Account Setup

## Admin Credentials

**Username**: `admin`  
**Password**: `admin123`

## Quick Start

### Option 1: Use Initialization Script (Recommended)

1. Install dependencies:
   ```bash
   npm install @azure/cosmos bcrypt
   ```

2. Set environment variables:
   ```bash
   export COSMOS_ENDPOINT="your-cosmos-endpoint"
   export COSMOS_KEY="your-cosmos-key"
   ```

3. Run initialization:
   ```bash
   npm run init-admin
   ```

### Option 2: Manual Database Insert

If you prefer to manually insert into your database:

1. Generate password hash for "admin123":
   ```bash
   node -e "const bcrypt=require('bcrypt'); bcrypt.hash('admin123',10).then(h=>console.log('Password Hash:',h))"
   ```

2. Insert this document into your `users` collection:
   ```json
   {
     "id": "admin-user-001",
     "username": "admin",
     "email": "admin@refix.com",
     "passwordHash": "<paste-generated-hash>",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

## Login

After creating the admin account, access the admin panel at:
- URL: `/creator-dashboard`
- Username: `admin`
- Password: `admin123`

## Security Warning

⚠️ **CRITICAL**: 
- Change the password immediately after first login!
- Use a strong password (minimum 16 characters with mix of letters, numbers, symbols)
- Never commit admin credentials to version control

