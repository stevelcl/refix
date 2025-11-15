const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Helper: Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Helper: Authenticate middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Helper: Require admin role
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ==================== AUTHENTICATION ENDPOINTS ====================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    // Check if username already exists
    if (await db.getUserByUsername(username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user with "user" role (never "admin")
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      passwordHash,
      role: 'user', // Always set to "user" for public registrations
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PUBLIC API ENDPOINTS ====================

// GET /api/tutorials
app.get('/api/tutorials', async (req, res) => {
  try {
    const { category, model, search } = req.query;
    const filtered = await db.listTutorials({ category, model, search });
    res.json(filtered);
  } catch (error) {
    console.error('Get tutorials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tutorials/:id
app.get('/api/tutorials/:id', async (req, res) => {
  try {
    const tutorial = await db.getTutorial(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (error) {
    console.error('Get tutorial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, request, comments } = req.body;
    
    const feedbackItem = {
      id: `feedback-${Date.now()}`,
      name: name || 'anonymous',
      request: request || '',
      comments: comments || '',
      createdAt: new Date().toISOString()
    };
    
    await db.createFeedback(feedbackItem);
    res.status(201).json(feedbackItem);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await db.getCategories();
    res.json(cats.length > 0 ? cats : [
      { id: 'phones', name: 'Phones', subcategories: [] },
      { id: 'laptops', name: 'Laptops', subcategories: [] },
      { id: 'tablets', name: 'Tablets', subcategories: [] },
      { id: 'other', name: 'Other Devices', subcategories: [] }
    ]);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADMIN API ENDPOINTS ====================

// POST /api/admin/tutorials
app.post('/api/admin/tutorials', authenticate, requireAdmin, async (req, res) => {
  try {
    const tutorial = {
      id: `tutorial-${Date.now()}`,
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const created = await db.createTutorial(tutorial);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create tutorial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/tutorials/:id
app.put('/api/admin/tutorials/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateTutorial(req.params.id, { ...req.body, updatedAt: new Date().toISOString() });
    if (!updated) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Update tutorial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/tutorials/:id
app.delete('/api/admin/tutorials/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await db.getTutorial(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    
    await db.deleteTutorial(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete tutorial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/categories
app.post('/api/admin/categories', authenticate, requireAdmin, (req, res) => {
  try {
    const category = {
      id: req.body.id || `cat-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    categories.push(category);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/categories
app.put('/api/admin/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    // Update categories
    await db.setCategories(req.body);
    
    res.json({ message: 'Categories updated successfully' });
  } catch (error) {
    console.error('Update categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== INITIALIZATION ====================

// Initialize admin account on startup
async function initializeAdmin() {
  const adminExists = await db.getUserByUsername('admin');
  
  if (!adminExists) {
    console.log('🔐 Initializing admin account...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: 'admin-user-001',
      username: 'admin',
      email: 'admin@refix.com',
      passwordHash: passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.createUser(adminUser);
    console.log('✅ Admin account created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   ⚠️  Change password after first login!');
  }
}

// Start server
async function startServer() {
  await db.init();
  await initializeAdmin();
  
  app.listen(PORT, () => {
    console.log('\n🚀 Backend server started!');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    console.log('\n📝 Available endpoints:');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/me');
    console.log('   POST /api/auth/logout');
    console.log('   GET  /api/tutorials');
    console.log('   POST /api/admin/tutorials (admin only)');
    console.log('\n✨ Ready to accept requests!\n');
  });
}

startServer().catch(console.error);

