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
    // Store decoded token data in req.user for use in route handlers
    // Route handlers can verify with db if needed
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
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
    const { category, brand, model, part, search } = req.query;
    const filtered = await db.listTutorials({ category, brand, model, part, search });
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

// ==================== SPARE PARTS STORE ENDPOINTS ====================

// GET /api/products - List all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.listProducts();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:id - Get a single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/products - Create a new product (admin only)
app.post('/api/admin/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    
    if (!name || price === undefined || !description) {
      return res.status(400).json({ error: 'Name, price, and description are required' });
    }
    
    const product = {
      id: `product-${Date.now()}`,
      name,
      price: parseFloat(price),
      description,
      imageUrl: imageUrl || null,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const created = await db.createProduct(product);
    res.status(201).json(created);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/products/:id - Update a product (admin only)
app.put('/api/admin/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (price !== undefined) updates.price = parseFloat(price);
    if (description) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    updates.updatedAt = new Date().toISOString();
    
    const updated = await db.updateProduct(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/products/:id - Delete a product (admin only)
app.delete('/api/admin/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await db.getProduct(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await db.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/seed - Seed initial data (admin only, one-time use)
app.post('/api/admin/seed', authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await db.getCategories();
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Database already contains data. Seeding is only for initial setup.' });
    }

    console.log('📚 Seeding initial data...');
    
    const phoneParts = SHARED_PARTS_LIBRARY.phones;
    const laptopParts = SHARED_PARTS_LIBRARY.laptops;
    const tabletParts = SHARED_PARTS_LIBRARY.tablets;
    const otherParts = SHARED_PARTS_LIBRARY.other;
    
    const defaultCategories = [
      {
        id: 'cat-phones',
        name: 'Phones',
        subcategories: [
          {
            id: 'sub-iphone',
            name: 'iPhone',
            parts: [...phoneParts],
            models: [
              { name: 'iPhone 13', parts: [...phoneParts] },
              { name: 'iPhone 13 Pro', parts: [...phoneParts] },
              { name: 'iPhone 13 Pro Max', parts: [...phoneParts] },
              { name: 'iPhone 14', parts: [...phoneParts] },
              { name: 'iPhone 14 Pro', parts: [...phoneParts] },
              { name: 'iPhone 14 Pro Max', parts: [...phoneParts] },
              { name: 'iPhone 15', parts: [...phoneParts] },
              { name: 'iPhone 15 Pro', parts: [...phoneParts] },
              { name: 'iPhone 15 Pro Max', parts: [...phoneParts] }
            ]
          },
          {
            id: 'sub-android',
            name: 'Android',
            parts: [...phoneParts],
            models: [
              { name: 'Samsung Galaxy S22', parts: [...phoneParts] },
              { name: 'Samsung Galaxy S23', parts: [...phoneParts] },
              { name: 'Google Pixel 7', parts: [...phoneParts] },
              { name: 'Google Pixel 8', parts: [...phoneParts] },
              { name: 'OnePlus 11', parts: [...phoneParts] }
            ]
          }
        ]
      }
    ];
    
    await db.setCategories(defaultCategories);
    
    // Also seed public categories
    const pubCategories = [
      {
        id: 'pubcat-phone',
        name: 'Phone',
        icon: '📱',
        path: '/device/phone',
        displayOrder: 1,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pubcat-laptop',
        name: 'PC / Laptop',
        icon: '💻',
        path: '/device/laptop',
        displayOrder: 2,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pubcat-mac',
        name: 'Mac',
        icon: '🖥️',
        path: '/device/more',
        displayOrder: 3,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const category of pubCategories) {
      try {
        await db.createPublicCategory(category);
      } catch (err) {
        console.warn('⚠️  Skipping public category:', category.id);
      }
    }
    
    console.log('✅ Seed data initialized successfully');
    res.json({ message: 'Database seeded successfully with initial data' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database: ' + error.message });
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

// GET /api/shared-parts - Get shared parts library for suggestions
app.get('/api/shared-parts', (req, res) => {
  res.json(getSharedPartsLibrary());
});

// GET /api/categories/:categoryName/brands - Get brands/subcategories for a category
app.get('/api/categories/:categoryName/brands', async (req, res) => {
  try {
    const cats = await db.getCategories();
    const category = cats.find(c => c.name.toLowerCase() === req.params.categoryName.toLowerCase());
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category.subcategories || []);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories/:categoryName/brands/:brandName/models - Get models for a brand
app.get('/api/categories/:categoryName/brands/:brandName/models', async (req, res) => {
  try {
    const cats = await db.getCategories();
    const category = cats.find(c => c.name.toLowerCase() === req.params.categoryName.toLowerCase());
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const brand = category.subcategories?.find(s => s.name.toLowerCase() === req.params.brandName.toLowerCase());
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand.models || []);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories/:categoryName/brands/:brandName/models/:modelName/parts - Get parts for a model
app.get('/api/categories/:categoryName/brands/:brandName/models/:modelName/parts', async (req, res) => {
  try {
    const cats = await db.getCategories();
    const category = cats.find(c => c.name.toLowerCase() === req.params.categoryName.toLowerCase());
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const brand = category.subcategories?.find(s => s.name.toLowerCase() === req.params.brandName.toLowerCase());
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    const model = brand.models?.find(m => {
      const modelName = typeof m === 'string' ? m : m.name;
      const requested = (req.params.modelName || '').toString().toLowerCase();
      const normalize = (s) => s.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Match either by exact lowercased name or by a slugified form so routes can use slugs
      return modelName.toLowerCase() === requested || normalize(modelName) === requested;
    });
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Return parts array from model only (parts are model-specific, not brand-level)
    const parts = typeof model === 'object' && model.parts ? model.parts : [];
    res.json(parts);
  } catch (error) {
    console.error('Get parts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tutorials/by-part - Filter tutorials by full hierarchy
app.get('/api/tutorials/by-part', async (req, res) => {
  try {
    const { category, brand, model, part } = req.query;
    const tutorials = await db.listTutorials({});
    
    const filtered = tutorials.filter(t => {
      if (category && t.category !== category) return false;
      if (brand && t.brand !== brand) return false;
      if (model && t.model !== model) return false;
      if (part && t.part !== part) return false;
      return true;
    });
    
    res.json(filtered);
  } catch (error) {
    console.error('Get tutorials by part error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PUBLIC CATEGORY ENDPOINTS ====================

// GET /api/public-categories - Returns top-level categories marked for public display
app.get('/api/public-categories', async (req, res) => {
  try {
    // Get all categories and filter to top-level ones marked as public
    const allCategories = await db.getCategories();
    
    // Filter to public categories (or return all if none are explicitly marked)
    const publicCats = allCategories.filter(c => c.isPublic !== false);
    
    // Sort by displayOrder and map to public-friendly format
    const publicView = publicCats
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '📁',
        path: c.path || `/device/${(c.id || c.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        displayOrder: c.displayOrder || 0,
        parentId: c.parentId || null,
        imageUrl: c.imageUrl || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }));
    
    res.json(publicView);
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public-categories/:parentId/subcategories - Deprecated: use /categories/:categoryName/brands instead
app.get('/api/public-categories/:parentId/subcategories', async (req, res) => {
  try {
    const subcategories = await db.getPublicSubcategories(req.params.parentId);
    res.json(subcategories);
  } catch (error) {
    console.error('Get public subcategories error:', error);
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
      brand: req.body.brand || null,
      part: req.body.part || null,
      relatedParts: req.body.relatedParts || [],
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
    const updateData = {
      ...req.body,
      brand: req.body.brand || null,
      part: req.body.part || null,
      relatedParts: req.body.relatedParts || [],
      updatedAt: new Date().toISOString()
    };
    const updated = await db.updateTutorial(req.params.id, updateData);
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

// POST /api/admin/public-categories - Create a new top-level public category
app.post('/api/admin/public-categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const allCategories = await db.getCategories();
    
    const category = {
      id: req.body.id || `cat-${Date.now()}`,
      name: req.body.name,
      icon: req.body.icon || '📁',
      path: req.body.path || `/device/${(req.body.id || req.body.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      displayOrder: req.body.displayOrder !== undefined ? req.body.displayOrder : (allCategories.length + 1),
      isPublic: true,
      subcategories: [],
      imageUrl: req.body.imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updated = await db.setCategories([...allCategories, category]);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create public category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/public-categories/:id - Update public fields of a category
app.put('/api/admin/public-categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const allCategories = await db.getCategories();
    const idx = allCategories.findIndex(c => c.id === req.params.id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const updated = {
      ...allCategories[idx],
      name: req.body.name !== undefined ? req.body.name : allCategories[idx].name,
      icon: req.body.icon !== undefined ? req.body.icon : (allCategories[idx].icon || '📁'),
      path: req.body.path !== undefined ? req.body.path : allCategories[idx].path,
      displayOrder: req.body.displayOrder !== undefined ? req.body.displayOrder : allCategories[idx].displayOrder,
      imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : allCategories[idx].imageUrl,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      updatedAt: new Date().toISOString()
    };
    
    allCategories[idx] = updated;
    await db.setCategories(allCategories);
    
    res.json(updated);
  } catch (error) {
    console.error('Update public category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/public-categories/:id - Delete a top-level category
app.delete('/api/admin/public-categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const allCategories = await db.getCategories();
    const idx = allCategories.findIndex(c => c.id === req.params.id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const filtered = allCategories.filter(c => c.id !== req.params.id);
    await db.setCategories(filtered);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete public category error:', error);
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

// Migrate existing tutorials to include brand and part fields
async function migrateTutorials() {
  try {
    const tutorials = await db.listTutorials({});
    const needsMigration = tutorials.filter(t => !t.migrated && (!t.brand || !t.part));
    
    if (needsMigration.length === 0) {
      return;
    }
    
    console.log(`🔄 Migrating ${needsMigration.length} tutorials...`);
    
    const categories = await db.getCategories();
    
    for (const tutorial of needsMigration) {
      // Find category
      const category = categories.find(c => c.name === tutorial.category);
      if (!category) continue;
      
      // Try to extract brand and part from title or model
      let brand = tutorial.brand;
      let part = tutorial.part;
      let relatedParts = tutorial.relatedParts || [];
      
      // Attempt to find brand from model
      if (!brand && tutorial.model) {
        const subcategory = category.subcategories?.find(sub => {
          const models = sub.models || [];
          return models.some(m => {
            const modelName = typeof m === 'string' ? m : m.name;
            return modelName === tutorial.model;
          });
        });
        if (subcategory) {
          brand = subcategory.name;
        }
      }
      
      // Attempt to extract part from title (e.g., "iPhone 13 Screen Replacement" -> "Screen")
      if (!part && tutorial.title) {
        const title = tutorial.title.toLowerCase();
        const allParts = [...new Set(Object.values(SHARED_PARTS_LIBRARY).flat())];
        
        for (const possiblePart of allParts) {
          if (title.includes(possiblePart.toLowerCase())) {
            part = possiblePart;
            break;
          }
        }
      }
      
      // Update tutorial with migrated data
      await db.updateTutorial(tutorial.id, {
        brand: brand || 'Unknown',
        part: part || 'General',
        relatedParts,
        migrated: true
      });
    }
    
    console.log('✅ Tutorial migration completed');
  } catch (error) {
    console.error('⚠️  Tutorial migration failed:', error.message);
  }
}

// Initialize default public categories if none exist
async function initializePublicCategories() {
  const existing = await db.getPublicCategories();
  
  if (existing.length === 0) {
    console.log('📂 Initializing default public categories...');
    const defaultCategories = [
      {
        id: 'pubcat-phone',
        name: 'Phone',
        icon: '📱',
        path: '/device/phone',
        displayOrder: 1,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pubcat-laptop',
        name: 'PC / Laptop',
        icon: '💻',
        path: '/device/laptop',
        displayOrder: 2,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pubcat-mac',
        name: 'Mac',
        icon: '🖥️',
        path: '/device/more',
        displayOrder: 3,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const category of defaultCategories) {
      try {
        await db.createPublicCategory(category);
      } catch (err) {
        console.warn('⚠️  Skipping creation of default public category (already exists or error):', category.id, err.message || err);
      }
    }
    console.log('✅ Default public categories created');
  }
}

// Shared parts library - common parts across all devices
const SHARED_PARTS_LIBRARY = {
  phones: [
    'Screen', 'Battery', 'Charging Port', 'Loudspeaker', 'Microphone', 
    'Front Camera', 'Back Camera', 'Volume Buttons', 'Power Button', 
    'Back Glass', 'SIM Tray', 'Vibration Motor', 'Ear Speaker', 
    'Home Button', 'Face ID Module', 'Wireless Charging Coil'
  ],
  laptops: [
    'Screen', 'Battery', 'Keyboard', 'Trackpad', 'Hard Drive/SSD', 
    'RAM', 'Wi-Fi Card', 'Fan', 'Charging Port', 'Hinges', 
    'Motherboard', 'Thermal Paste', 'Webcam', 'Speakers'
  ],
  tablets: [
    'Screen', 'Battery', 'Charging Port', 'Front Camera', 'Back Camera', 
    'Buttons', 'Back Panel', 'Speakers', 'Microphone', 'Home Button'
  ],
  other: [
    'Screen', 'Battery', 'Charging Port', 'Controller', 'HDMI Port', 
    'Buttons', 'Fan', 'Power Supply', 'Hard Drive'
  ]
};

// Initialize default tutorial categories if none exist
async function initializeTutorialCategories() {
  const existing = await db.getCategories();
  
  if (existing.length === 0) {
    console.log('📚 Initializing default tutorial categories...');
    
    const phoneParts = SHARED_PARTS_LIBRARY.phones;
    const laptopParts = SHARED_PARTS_LIBRARY.laptops;
    const tabletParts = SHARED_PARTS_LIBRARY.tablets;
    const otherParts = SHARED_PARTS_LIBRARY.other;
    
    const defaultCategories = [
      {
        id: 'cat-phones',
        name: 'Phones',
        subcategories: [
          {
            id: 'sub-iphone',
            name: 'iPhone',
            parts: [...phoneParts],
            models: [
              { name: 'iPhone 13', parts: [...phoneParts] },
              { name: 'iPhone 13 Pro', parts: [...phoneParts] },
              { name: 'iPhone 13 Pro Max', parts: [...phoneParts] },
              { name: 'iPhone 14', parts: [...phoneParts] },
              { name: 'iPhone 14 Pro', parts: [...phoneParts] },
              { name: 'iPhone 14 Pro Max', parts: [...phoneParts] },
              { name: 'iPhone 15', parts: [...phoneParts] },
              { name: 'iPhone 15 Pro', parts: [...phoneParts] },
              { name: 'iPhone 15 Pro Max', parts: [...phoneParts] }
            ]
          },
          {
            id: 'sub-android',
            name: 'Android',
            parts: [...phoneParts],
            models: [
              { name: 'Samsung Galaxy S22', parts: [...phoneParts] },
              { name: 'Samsung Galaxy S23', parts: [...phoneParts] },
              { name: 'Google Pixel 7', parts: [...phoneParts] },
              { name: 'Google Pixel 8', parts: [...phoneParts] },
              { name: 'OnePlus 11', parts: [...phoneParts] }
            ]
          }
        ]
      },
      {
        id: 'cat-laptops',
        name: 'Laptops',
        subcategories: [
          {
            id: 'sub-windows',
            name: 'Windows Laptops',
            parts: [...laptopParts],
            models: [
              { name: 'Dell XPS', parts: [...laptopParts] },
              { name: 'HP Pavilion', parts: [...laptopParts] },
              { name: 'Lenovo ThinkPad', parts: [...laptopParts] },
              { name: 'ASUS ZenBook', parts: [...laptopParts] }
            ]
          },
          {
            id: 'sub-macbook',
            name: 'MacBook',
            parts: [...laptopParts],
            models: [
              { name: 'MacBook Air M1', parts: [...laptopParts] },
              { name: 'MacBook Air M2', parts: [...laptopParts] },
              { name: 'MacBook Pro 13"', parts: [...laptopParts] },
              { name: 'MacBook Pro 14"', parts: [...laptopParts] },
              { name: 'MacBook Pro 16"', parts: [...laptopParts] }
            ]
          }
        ]
      },
      {
        id: 'cat-tablets',
        name: 'Tablets',
        subcategories: [
          {
            id: 'sub-ipad',
            name: 'iPad',
            parts: [...tabletParts],
            models: [
              { name: 'iPad 9th Gen', parts: [...tabletParts] },
              { name: 'iPad 10th Gen', parts: [...tabletParts] },
              { name: 'iPad Air', parts: [...tabletParts] },
              { name: 'iPad Pro 11"', parts: [...tabletParts] },
              { name: 'iPad Pro 12.9"', parts: [...tabletParts] }
            ]
          },
          {
            id: 'sub-android-tablets',
            name: 'Android Tablets',
            parts: [...tabletParts],
            models: [
              { name: 'Samsung Galaxy Tab', parts: [...tabletParts] },
              { name: 'Amazon Fire HD', parts: [...tabletParts] }
            ]
          }
        ]
      },
      {
        id: 'cat-other',
        name: 'Other Devices',
        subcategories: [
          {
            id: 'sub-gaming',
            name: 'Gaming Consoles',
            parts: [...otherParts],
            models: [
              { name: 'PlayStation 5', parts: [...otherParts] },
              { name: 'Xbox Series X', parts: [...otherParts] },
              { name: 'Nintendo Switch', parts: [...otherParts] }
            ]
          },
          {
            id: 'sub-wearables',
            name: 'Wearables',
            parts: ['Screen', 'Battery', 'Charging Port', 'Buttons', 'Heart Rate Sensor', 'Strap'],
            models: [
              { name: 'Apple Watch', parts: ['Screen', 'Battery', 'Charging Port', 'Digital Crown', 'Heart Rate Sensor', 'Strap'] },
              { name: 'Samsung Galaxy Watch', parts: ['Screen', 'Battery', 'Charging Port', 'Buttons', 'Heart Rate Sensor', 'Strap'] }
            ]
          }
        ]
      }
    ];
    
    await db.setCategories(defaultCategories);
    console.log('✅ Default tutorial categories created with parts');
  }
}

// Get shared parts library for suggestions
function getSharedPartsLibrary() {
  return SHARED_PARTS_LIBRARY;
}

// Start server
async function startServer() {
  await db.init();
  await initializeAdmin();
  // DISABLED: Auto-seeding overwrites user data on server restart
  // Seed data should only be created once via manual admin action, not on startup
  // await initializePublicCategories();
  // await initializeTutorialCategories();
  await db.migratePublicCategoriesToCategories();
  await migrateTutorials();
  
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

