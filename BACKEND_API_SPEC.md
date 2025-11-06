# Backend API Specification for Authentication & Authorization

This document outlines the required backend API endpoints for the unified authentication and authorization system.

## Architecture Overview

The system uses a **shared backend and database** approach:
- **Public Site**: Reads data from the shared database (no authentication required)
- **Admin Panel**: Creates/edits data in the shared database (requires admin authentication)

### **Single Super Admin Architecture**

⚠️ **IMPORTANT**: This system uses a **single, unique admin account** design:

- **Admin account** cannot be created through public registration
- **Admin account** must be manually pre-configured in the database during system initialization
- **Regular users** can register through public registration, but they are automatically assigned `"user"` role
- **Only admin account** can access protected admin APIs (create/update/delete operations)
- **All other user accounts** will be rejected when attempting to access admin APIs

## Authentication Flow

1. Admin logs in via `/auth/login` with username/password
2. Backend validates credentials and checks user role from database
3. Backend returns JWT token and user data (including role)
4. Frontend stores token in localStorage
5. All subsequent API calls include `Authorization: Bearer <token>` header
6. Backend validates token and checks role for protected endpoints

## Required API Endpoints

### Authentication Endpoints

#### POST `/auth/login`
Public endpoint for user authentication. Accepts both admin and regular user accounts.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Note**: 
- Regular users (`role: "user"`) can login but will be rejected when accessing admin APIs
- Only users with `role: "admin"` can access admin panel and protected endpoints

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing fields

---

#### POST `/auth/logout`
Protected endpoint to invalidate token (optional, token can expire naturally).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### GET `/auth/me`
Protected endpoint to get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "user123",
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

#### POST `/auth/register`
Public endpoint for regular user registration. **Note**: This endpoint is for regular users only. Admin accounts cannot be created through this endpoint.

**Request:**
```json
{
  "username": "regularuser",
  "password": "password123",
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "id": "user456",
  "username": "regularuser",
  "email": "user@example.com",
  "role": "user"
}
```

**Important**: 
- All users registered through this endpoint are **automatically assigned `"user"` role**
- Users with `"user"` role **cannot** access admin APIs
- Admin accounts must be manually created in the database

**Error Responses:**
- `409 Conflict`: Username or email already exists
- `400 Bad Request`: Validation errors

---

## Public API Endpoints (No Authentication Required)

### GET `/tutorials`
List all tutorials with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `model` (optional): Filter by model
- `search` (optional): Search in title/description

**Response (200):**
```json
[
  {
    "id": "tutorial1",
    "title": "iPhone 13 Screen Replacement",
    "category": "Phones",
    "model": "iPhone 13",
    "difficulty": "Beginner",
    "durationMinutes": 30,
    "summary": "...",
    "steps": [...],
    ...
  }
]
```

---

### GET `/tutorials/:id`
Get a specific tutorial by ID.

**Response (200):**
```json
{
  "id": "tutorial1",
  "title": "iPhone 13 Screen Replacement",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Tutorial not found

---

### POST `/feedback`
Submit feedback (public access).

**Request:**
```json
{
  "message": "Please add guide for iPhone 15",
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "id": "feedback1",
  "message": "Please add guide for iPhone 15",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### GET `/categories`
Get all categories (public read access).

**Response (200):**
```json
[
  {
    "id": "phones",
    "name": "Phones",
    "subcategories": [...]
  }
]
```

---

## Admin API Endpoints (Require Authentication + Admin Role)

⚠️ **CRITICAL**: All admin endpoints require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. User role must be **exactly `"admin"`** (the single super admin account)
3. Backend must **strictly reject** any requests from users with `role: "user"` (403 Forbidden)

### POST `/admin/tutorials`
Create a new tutorial.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "iPhone 13 Screen Replacement",
  "category": "Phones",
  "model": "iPhone 13",
  "difficulty": "Beginner",
  "durationMinutes": 30,
  "summary": "...",
  "steps": [...],
  ...
}
```

**Response (201):**
```json
{
  "id": "tutorial1",
  "title": "iPhone 13 Screen Replacement",
  ...
}
```

**Error Responses:**
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: User doesn't have admin role
- `400 Bad Request`: Validation errors

---

### PUT `/admin/tutorials/:id`
Update an existing tutorial.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** Same as POST

**Response (200):**
```json
{
  "id": "tutorial1",
  "title": "Updated Title",
  ...
}
```

**Error Responses:**
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: User doesn't have admin role
- `404 Not Found`: Tutorial not found

---

### DELETE `/admin/tutorials/:id`
Delete a tutorial.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):** No content

**Error Responses:**
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: User doesn't have admin role
- `404 Not Found`: Tutorial not found

---

### POST `/admin/categories`
Create a new category.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Phones",
  "subcategories": []
}
```

**Response (201):**
```json
{
  "id": "phones",
  "name": "Phones",
  "subcategories": []
}
```

---

### PUT `/admin/categories`
Update categories (bulk update).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
[
  {
    "id": "phones",
    "name": "Phones",
    "subcategories": [...]
  }
]
```

**Response (200):**
```json
{
  "message": "Categories updated successfully"
}
```

---

## Database Schema

### Users Collection

⚠️ **CRITICAL**: There must be **exactly ONE admin account** in the database, manually created during system initialization.

```json
{
  "id": "admin-user-001",
  "username": "admin",
  "email": "admin@example.com",
  "passwordHash": "...", // Hashed password (bcrypt, argon2, etc.)
  "role": "admin", // MUST be "admin" for the single super admin account
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Regular user accounts** (created through public registration):
```json
{
  "id": "user456",
  "username": "regularuser",
  "email": "user@example.com",
  "passwordHash": "...",
  "role": "user", // ALWAYS set to "user" for public registrations
  "createdAt": "2024-01-02T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

**Important Rules:**
- ✅ Only ONE account can have `role: "admin"`
- ✅ Admin account **MUST** be manually created in database during initialization
- ✅ All public registrations **MUST** automatically set `role: "user"`
- ✅ Backend **MUST** reject any attempt to create admin accounts through `/auth/register`
- ✅ Backend **MUST** validate that admin role is only assigned manually

### Tutorials Collection
```json
{
  "id": "tutorial1",
  "title": "iPhone 13 Screen Replacement",
  "category": "Phones",
  "model": "iPhone 13",
  "difficulty": "Beginner",
  "durationMinutes": 30,
  "summary": "...",
  "steps": [
    {
      "number": 1,
      "title": "Remove back cover",
      "description": "...",
      "images": [...],
      "warnings": [...],
      "tips": [...],
      "tools": [...],
      "parts": [...]
    }
  ],
  "tools": [...],
  "videoUrl": "...",
  "thumbnailUrl": "...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "createdBy": "user123" // Admin user ID
}
```

### Categories Collection
```json
{
  "id": "phones",
  "name": "Phones",
  "subcategories": [
    {
      "id": "iphone",
      "name": "iPhone",
      "models": ["iPhone 13", "iPhone 14", ...]
    }
  ]
}
```

---

## Security Requirements

1. **Password Hashing**: Use bcrypt or argon2 for password hashing
2. **JWT Token**: Use JWT with expiration (recommended: 24 hours)
3. **Token Validation**: Validate token signature and expiration on every protected request
4. **Role Checking**: Verify user role is "admin" before allowing admin operations
5. **HTTPS**: All API calls must use HTTPS in production
6. **Rate Limiting**: Implement rate limiting on login endpoint to prevent brute force attacks
7. **CORS**: Configure CORS to allow requests from your frontend domain only

## Error Response Format

All errors should follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional details
}
```

Common HTTP Status Codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success but no content to return
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate username)
- `500 Internal Server Error`: Server error

---

## Implementation Notes

1. **Token Storage**: Frontend stores token in `localStorage.getItem("authToken")`
2. **Token Transmission**: Token is sent in `Authorization: Bearer <token>` header
3. **Token Expiration**: Frontend automatically clears token on 401 responses
4. **Role-Based Access**: Backend must check role before allowing admin operations
5. **Database**: All data (tutorials, categories, users) stored in same Cosmos DB instance
6. **Single Admin Account**: Only ONE admin account exists, manually created during initialization
7. **Public Registration**: All public registrations automatically assigned `role: "user"`
8. **Admin Panel Access**: Frontend checks `role === "admin"` before allowing admin panel access

---

## Example Backend Implementation (Node.js/Express)

```javascript
// Middleware for protected routes
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware for admin-only routes
// CRITICAL: Strictly enforce that ONLY admin role can access admin endpoints
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // Strictly check for admin role - reject all other roles including "user"
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required. Only the admin account can access this endpoint.' });
  }
  next();
};

// Registration endpoint - ALWAYS assign "user" role
app.post('/auth/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user with "user" role ONLY
  const user = {
    id: generateId(),
    username,
    email,
    passwordHash,
    role: 'user', // Always set to 'user' for public registrations
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save to database
  await createUser(user);
  
  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role // Will always be "user"
  });
});

// Protected admin route
app.post('/admin/tutorials', authenticate, requireAdmin, async (req, res) => {
  // Create tutorial logic
});
```

---

## System Initialization

### Creating the Single Admin Account

⚠️ **CRITICAL**: The admin account **MUST** be manually created in the database before the system goes live. This cannot be done through the public API.

**Step 1: Create Admin Account in Database**

Use your database management tool or initialization script to insert the admin account:

```javascript
// Example: Database initialization script
const adminAccount = {
  id: 'admin-user-001',
  username: 'admin', // Or your preferred admin username
  email: 'admin@yourdomain.com',
  passwordHash: await bcrypt.hash('your-secure-password', 10),
  role: 'admin', // CRITICAL: Must be exactly "admin"
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Insert into users collection
await db.collection('users').insertOne(adminAccount);
```

**Step 2: Verify Admin Account**

After initialization, verify that:
- ✅ Only ONE account exists with `role: "admin"`
- ✅ Admin account can login via `/auth/login`
- ✅ Admin account receives `role: "admin"` in login response
- ✅ Admin account can access `/admin/*` endpoints
- ✅ Regular users (with `role: "user"`) are rejected from `/admin/*` endpoints

**Step 3: Security Checklist**

- ✅ Change default admin password immediately after first login
- ✅ Use strong password (minimum 16 characters, mix of letters, numbers, symbols)
- ✅ Store admin credentials securely (password manager)
- ✅ Never commit admin credentials to version control
- ✅ Enable HTTPS in production
- ✅ Implement rate limiting on login endpoint

---

## Summary

This API specification ensures that:
- ✅ Admin and public sites share the same database
- ✅ **Single admin account** manually created during initialization
- ✅ **Regular users** automatically assigned `role: "user"` via public registration
- ✅ **Admin actions** require authentication + admin role (strictly enforced)
- ✅ **Public read operations** don't require authentication
- ✅ **Security** enforced at the API level - backend rejects non-admin users
- ✅ **Token-based authentication** with role-based access control
- ✅ **No public admin registration** - admin account must be manually created

