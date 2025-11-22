const db = require('./db');
const bcrypt = require('bcrypt');
function makeId() { return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }

(async () => {
  try {
    await db.init();

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'password123';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    const existing = await db.getUserByUsername(username);
    if (existing) {
      console.log('ℹ️  Admin user already exists:', username);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const adminUser = {
      id: makeId(),
      username,
      email,
      passwordHash: hashed,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    await db.createUser(adminUser);
    console.log('✅ Admin user created:', username);
    console.log('   Username:', username);
    console.log('   Password:', password);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err.message || err);
    process.exit(1);
  }
})();
