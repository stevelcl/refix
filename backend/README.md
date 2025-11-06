# ReFix Backend Server

Express.js backend API server for the ReFix repair guide platform.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created with default values. For production, change the `JWT_SECRET` to a secure random string.

### 3. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register new user (role: "user")

### Public APIs
- `GET /api/tutorials` - List tutorials
- `GET /api/tutorials/:id` - Get tutorial by ID
- `POST /api/feedback` - Submit feedback
- `GET /api/categories` - Get categories

### Admin APIs (require authentication + admin role)
- `POST /api/admin/tutorials` - Create tutorial
- `PUT /api/admin/tutorials/:id` - Update tutorial
- `DELETE /api/admin/tutorials/:id` - Delete tutorial
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories` - Update categories

## Default Admin Account

The server automatically creates an admin account on startup:
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Change password after first login!**

## Database

Currently uses in-memory storage (for development/testing). In production, connect to Azure Cosmos DB.

## CORS

Configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`

Update CORS settings in `server.js` for production.

