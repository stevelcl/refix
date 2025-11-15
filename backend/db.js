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
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify({ users: [], tutorials: [], categories: [], feedback: [] }, null, 2));
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
async function listTutorials({ category, model, search } = {}) {
  if (useCosmos) {
    const container = cosmosContainers['tutorials'];
    let query = 'SELECT * FROM c';
    const filters = [];
    const params = [];
    if (category && category !== 'All') { filters.push('c.category = @category'); params.push({ name: '@category', value: category }); }
    if (model) { filters.push('c.model = @model'); params.push({ name: '@model', value: model }); }
    if (search) { filters.push('(CONTAINS(LOWER(c.title), @search) OR CONTAINS(LOWER(c.summary), @search))'); params.push({ name: '@search', value: search.toLowerCase() }); }
    if (filters.length) query += ' WHERE ' + filters.join(' AND ');
    const { resources } = await container.items.query({ query, parameters: params }).fetchAll();
    return resources;
  }
  const db = await readJson();
  let items = db.tutorials || [];
  if (category && category !== 'All') items = items.filter(t => t.category === category);
  if (model) items = items.filter(t => t.model === model);
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
  // categories
  getCategories,
  setCategories,
  // feedback
  createFeedback,
};
