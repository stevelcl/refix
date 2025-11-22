const path = require('path');
const fs = require('fs');

// Try to import CosmosClient, but don't fail if package is not installed
let CosmosClient = null;
try {
  const cosmosModule = require('@azure/cosmos');
  CosmosClient = cosmosModule.CosmosClient || cosmosModule;
} catch (e) {
  // Package not installed or import failed, will use JSON file
  CosmosClient = null;
}

const JSON_DB_FILE = path.join(__dirname, 'db.json');

let useCosmos = false;
let cosmos = null;
let cosmosContainers = {};

async function init() {
  // Prefer Cosmos if env vars present
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;

  if (endpoint && key && CosmosClient && typeof CosmosClient === 'function') {
    try {
      const client = new CosmosClient({ endpoint, key });
      // Using database 'refix' and containers: users,tutorials,categories,feedback
      const { database } = await client.databases.createIfNotExists({ id: 'refix' });
      const ensure = async (id) => {
        const { container } = await database.containers.createIfNotExists({ id });
        cosmosContainers[id] = container;
      };
      await ensure('users');
      await ensure('tutorials');
      await ensure('categories');
      await ensure('feedback');
      await ensure('publicCategories');
      await ensure('products');
      cosmos = client;
      useCosmos = true;
      console.log('✅ Using Azure Cosmos DB for persistence');
      return;
    } catch (err) {
      console.error('⚠️  Failed to initialize Cosmos DB client, falling back to JSON file.');
      console.error('   Error:', err.message || err);
      // Continue to fallback below
    }
  } else {
    if (endpoint && key) {
      console.log('ℹ️  Cosmos DB credentials found but @azure/cosmos package not available, using JSON file.');
    }
  }

  // Fallback: ensure JSON file exists
  if (!fs.existsSync(JSON_DB_FILE)) {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify({ users: [], tutorials: [], categories: [], feedback: [], publicCategories: [], products: [] }, null, 2));
  }
  console.log('ℹ️  Using local JSON file for persistence:', JSON_DB_FILE);
}

// ----------------- Helpers: JSON file operations -----------------
async function readJson() {
  const raw = await fs.promises.readFile(JSON_DB_FILE, 'utf8');
  return JSON.parse(raw || '{}');
}

async function writeJson(data) {
  await fs.promises.writeFile(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ----------------- Users -----------------
async function getUserByUsername(username) {
  if (useCosmos) {
    const container = cosmosContainers['users'];
    const querySpec = { query: 'SELECT * FROM c WHERE c.username = @u', parameters: [{ name: '@u', value: username }] };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0];
  }
  const db = await readJson();
  return (db.users || []).find(u => u.username === username);
}

async function getUserById(id) {
  if (useCosmos) {
    const container = cosmosContainers['users'];
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (e) {
      return null;
    }
  }
  const db = await readJson();
  return (db.users || []).find(u => u.id === id);
}

async function createUser(user) {
  if (useCosmos) {
    const container = cosmosContainers['users'];
    const { resource } = await container.items.create(user);
    return resource;
  }
  const db = await readJson();
  db.users = db.users || [];
  db.users.push(user);
  await writeJson(db);
  return user;
}

// ----------------- Tutorials -----------------
async function listTutorials({ category, brand, model, part, search } = {}) {
  if (useCosmos) {
    const container = cosmosContainers['tutorials'];
    let query = 'SELECT * FROM c';
    const filters = [];
    const params = [];
    if (category && category !== 'All') { filters.push('c.category = @category'); params.push({ name: '@category', value: category }); }
    if (brand) { filters.push('c.brand = @brand'); params.push({ name: '@brand', value: brand }); }
    if (model) { filters.push('c.model = @model'); params.push({ name: '@model', value: model }); }
    if (part) { filters.push('c.part = @part'); params.push({ name: '@part', value: part }); }
    if (search) { filters.push('(CONTAINS(LOWER(c.title), @search) OR CONTAINS(LOWER(c.summary), @search))'); params.push({ name: '@search', value: search.toLowerCase() }); }
    if (filters.length) query += ' WHERE ' + filters.join(' AND ');
    const { resources } = await container.items.query({ query, parameters: params }).fetchAll();
    return resources;
  }
  const db = await readJson();
  let items = db.tutorials || [];
  if (category && category !== 'All') items = items.filter(t => t.category === category);
  if (brand) items = items.filter(t => t.brand === brand);
  if (model) items = items.filter(t => t.model === model);
  if (part) items = items.filter(t => t.part === part);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(t => (t.title || '').toLowerCase().includes(s) || (t.summary || '').toLowerCase().includes(s));
  }
  return items;
}

async function getTutorial(id) {
  if (useCosmos) {
    const container = cosmosContainers['tutorials'];
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (e) {
      return null;
    }
  }
  const db = await readJson();
  return (db.tutorials || []).find(t => t.id === id);
}

async function createTutorial(tutorial) {
  if (useCosmos) {
    const container = cosmosContainers['tutorials'];
    const { resource } = await container.items.create(tutorial);
    return resource;
  }
  const db = await readJson();
  db.tutorials = db.tutorials || [];
  db.tutorials.push(tutorial);
  await writeJson(db);
  return tutorial;
}

async function updateTutorial(id, payload) {
  if (useCosmos) {
    const container = cosmosContainers['tutorials'];
    const { resource: existing } = await container.item(id, id).read();
    const updated = { ...existing, ...payload, id };
    const { resource } = await container.item(id, id).replace(updated);
    return resource;
  }
  const db = await readJson();
  db.tutorials = db.tutorials || [];
  const idx = db.tutorials.findIndex(t => t.id === id);
  if (idx === -1) return null;
  db.tutorials[idx] = { ...db.tutorials[idx], ...payload, id };
  await writeJson(db);
  return db.tutorials[idx];
}

async function deleteTutorial(id) {
  if (useCosmos) {
    const container = cosmosContainers['tutorials'];
    await container.item(id, id).delete();
    return;
  }
  const db = await readJson();
  db.tutorials = (db.tutorials || []).filter(t => t.id !== id);
  await writeJson(db);
}

// ----------------- Categories -----------------
async function getCategories() {
  if (useCosmos) {
    const container = cosmosContainers['categories'];
    const { resources } = await container.items.query({ query: 'SELECT * FROM c' }).fetchAll();
    // store categories as an array in a single item or multiple items; assume single document "categories-root"
    // If multiple docs, return resources
    return resources.length === 1 && resources[0].id === 'categories-root' ? resources[0].list || [] : resources;
  }
  const db = await readJson();
  return db.categories || [];
}

async function setCategories(categories) {
  if (useCosmos) {
    const container = cosmosContainers['categories'];
    // Upsert a single categories-root document
    const doc = { id: 'categories-root', list: categories };
    const { resource } = await container.items.upsert(doc);
    return resource;
  }
  const db = await readJson();
  db.categories = categories;
  await writeJson(db);
  return categories;
}

// ----------------- Feedback -----------------
async function createFeedback(item) {
  if (useCosmos) {
    const container = cosmosContainers['feedback'];
    const { resource } = await container.items.create(item);
    return resource;
  }
  const db = await readJson();
  db.feedback = db.feedback || [];
  db.feedback.push(item);
  await writeJson(db);
  return item;
}

// ----------------- Products (Spare Parts Store) -----------------
async function listProducts() {
  if (useCosmos) {
    const container = cosmosContainers['products'];
    const { resources } = await container.items.query({ query: 'SELECT * FROM c ORDER BY c.createdAt DESC' }).fetchAll();
    return resources;
  }
  const db = await readJson();
  return (db.products || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getProduct(id) {
  if (useCosmos) {
    const container = cosmosContainers['products'];
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (e) {
      return null;
    }
  }
  const db = await readJson();
  return (db.products || []).find(p => p.id === id);
}

async function createProduct(product) {
  if (useCosmos) {
    const container = cosmosContainers['products'];
    const { resource } = await container.items.create(product);
    return resource;
  }
  const db = await readJson();
  db.products = db.products || [];
  db.products.push(product);
  await writeJson(db);
  return product;
}

async function updateProduct(id, updates) {
  if (useCosmos) {
    const container = cosmosContainers['products'];
    const { resource: existing } = await container.item(id, id).read();
    const updated = { ...existing, ...updates, id };
    const { resource } = await container.item(id, id).replace(updated);
    return resource;
  }
  const db = await readJson();
  db.products = db.products || [];
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...updates, id };
  await writeJson(db);
  return db.products[idx];
}

async function deleteProduct(id) {
  if (useCosmos) {
    const container = cosmosContainers['products'];
    await container.item(id, id).delete();
    return;
  }
  const db = await readJson();
  db.products = (db.products || []).filter(p => p.id !== id);
  await writeJson(db);
}

// ----------------- Public Categories -----------------
async function getPublicCategories() {
  // Derive the public-friendly list from the unified categories collection.
  // The categories collection is now the single source of truth for public metadata.
  try {
    const cats = await getCategories();
    const list = (cats || []).filter(c => c.isPublic !== false).map((c, idx) => ({
      id: c.id || `cat-derived-${idx}`,
      name: c.name,
      icon: c.icon || '📁',
      path: c.path || `/device/${(c.id || c.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      displayOrder: c.displayOrder || idx + 1,
      parentId: c.parentId || null,
      imageUrl: c.imageUrl || null,
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: c.updatedAt || new Date().toISOString()
    }));
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (e) {
    return [];
  }
}

async function getPublicCategoryById(id) {
  if (useCosmos) {
    const container = cosmosContainers['publicCategories'];
    try {
      const { resource } = await container.item(id, id).read();
      return resource;
    } catch (e) {
      return null;
    }
  }
  const db = await readJson();
  return (db.publicCategories || []).find(c => c.id === id);
}

async function getPublicSubcategories(parentId) {
  if (useCosmos) {
    const container = cosmosContainers['publicCategories'];
    const querySpec = { 
      query: 'SELECT * FROM c WHERE c.parentId = @parentId ORDER BY c.displayOrder', 
      parameters: [{ name: '@parentId', value: parentId }] 
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  }
  const db = await readJson();
  return (db.publicCategories || [])
    .filter(c => c.parentId === parentId)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

async function createPublicCategory(category) {
  if (useCosmos) {
    const container = cosmosContainers['publicCategories'];
    // Use upsert to make initialization idempotent and avoid 409 conflicts
    const { resource } = await container.items.upsert(category);
    return resource;
  }
  const db = await readJson();
  db.publicCategories = db.publicCategories || [];
  db.publicCategories.push(category);
  await writeJson(db);
  return category;
}

async function updatePublicCategory(id, updates) {
  if (useCosmos) {
    const container = cosmosContainers['publicCategories'];
    const { resource: existing } = await container.item(id, id).read();
    const updated = { ...existing, ...updates, id };
    const { resource } = await container.item(id, id).replace(updated);
    return resource;
  }
  const db = await readJson();
  db.publicCategories = db.publicCategories || [];
  const idx = db.publicCategories.findIndex(c => c.id === id);
  if (idx === -1) return null;
  db.publicCategories[idx] = { ...db.publicCategories[idx], ...updates, id };
  await writeJson(db);
  return db.publicCategories[idx];
}

async function deletePublicCategory(id) {
  if (useCosmos) {
    const container = cosmosContainers['publicCategories'];
    await container.item(id, id).delete();
    return;
  }
  const db = await readJson();
  db.publicCategories = (db.publicCategories || []).filter(c => c.id !== id);
  await writeJson(db);
}

// Migrate publicCategories into categories with public metadata
async function migratePublicCategoriesToCategories() {
  try {
    const existing = await getCategories();
    
    if (useCosmos) {
      const pubContainer = cosmosContainers['publicCategories'];
      try {
        const { resources } = await pubContainer.items.query({ query: 'SELECT * FROM c' }).fetchAll();
        if (!resources || resources.length === 0) return; // No migration needed
        
        // Merge public metadata into categories
        const migrated = existing.map(cat => {
          const pubEntry = resources.find(p => 
            p.name === cat.name || 
            p.id === cat.id || 
            (cat.id && p.id && cat.id.toLowerCase() === p.id.toLowerCase())
          );
          
          if (pubEntry) {
            return {
              ...cat,
              icon: pubEntry.icon || cat.icon || '📁',
              path: pubEntry.path || cat.path,
              displayOrder: pubEntry.displayOrder !== undefined ? pubEntry.displayOrder : (cat.displayOrder || 1),
              isPublic: true,
              publicMetadata: {
                migratedFrom: pubEntry.id,
                migratedAt: new Date().toISOString()
              }
            };
          }
          return cat;
        });
        
        // Add any public categories that don't have a matching tutorial category
        for (const pubEntry of resources) {
          if (!migrated.find(c => c.id === pubEntry.id || c.name === pubEntry.name)) {
            migrated.push({
              id: pubEntry.id,
              name: pubEntry.name,
              icon: pubEntry.icon || '📁',
              path: pubEntry.path || `/device/${(pubEntry.id || pubEntry.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              displayOrder: pubEntry.displayOrder || migrated.length + 1,
              isPublic: true,
              subcategories: [],
              publicMetadata: {
                migratedFrom: pubEntry.id,
                migratedAt: new Date().toISOString()
              }
            });
          }
        }
        
        await setCategories(migrated);
        console.log('✅ Migrated public categories into categories schema');
        return;
      } catch (e) {
        console.log('ℹ️  No explicit publicCategories to migrate (using fallback)');
        return;
      }
    } else {
      // JSON file fallback
      const db = await readJson();
      const pubCats = db.publicCategories || [];
      if (pubCats.length === 0) return;
      
      const migrated = existing.map(cat => {
        const pubEntry = pubCats.find(p => 
          p.name === cat.name || 
          p.id === cat.id || 
          (cat.id && p.id && cat.id.toLowerCase() === p.id.toLowerCase())
        );
        
        if (pubEntry) {
          return {
            ...cat,
            icon: pubEntry.icon || cat.icon || '📁',
            path: pubEntry.path || cat.path,
            displayOrder: pubEntry.displayOrder !== undefined ? pubEntry.displayOrder : (cat.displayOrder || 1),
            isPublic: true,
            publicMetadata: {
              migratedFrom: pubEntry.id,
              migratedAt: new Date().toISOString()
            }
          };
        }
        return cat;
      });
      
      // Add standalone public categories
      for (const pubEntry of pubCats) {
        if (!migrated.find(c => c.id === pubEntry.id || c.name === pubEntry.name)) {
          migrated.push({
            id: pubEntry.id,
            name: pubEntry.name,
            icon: pubEntry.icon || '📁',
            path: pubEntry.path || `/device/${(pubEntry.id || pubEntry.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            displayOrder: pubEntry.displayOrder || migrated.length + 1,
            isPublic: true,
            subcategories: [],
            publicMetadata: {
              migratedFrom: pubEntry.id,
              migratedAt: new Date().toISOString()
            }
          });
        }
      }
      
      await setCategories(migrated);
      console.log('✅ Migrated public categories into categories schema');
    }
  } catch (error) {
    console.error('⚠️  Migration of public categories failed:', error.message);
  }
}

module.exports = {
  init,
  // users
  getUserByUsername,
  getUserById,
  createUser,
  // tutorials
  listTutorials,
  getTutorial,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  // categories (unified - now includes public metadata)
  getCategories,
  setCategories,
  migratePublicCategoriesToCategories,
  // feedback
  createFeedback,
  // public categories (deprecated - kept for backwards compatibility)
  getPublicCategories,
  getPublicCategoryById,
  getPublicSubcategories,
  createPublicCategory,
  updatePublicCategory,
  deletePublicCategory,
  // products (spare parts store)
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
