#!/usr/bin/env node

// Seed a single category using the unified categories schema and verify getPublicCategories()
const db = require('./db');

async function run() {
  try {
    await db.init();
    console.log('DB initialized');

    const baseCats = await db.getCategories();
    console.log('Existing categories count:', (baseCats || []).length);

    const newCat = {
      id: `test-seed-${Date.now()}`,
      name: 'Seeded Category',
      icon: '📦',
      path: '/device/seeded',
      displayOrder: 5,
      imageUrl: null,
      isPublic: true,
      subcategories: [
        {
          id: 'brand-a',
          name: 'Brand A',
          models: [
            { name: 'Model X', parts: ['Screen', 'Battery'] }
          ],
          imageUrl: null
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const all = [...(baseCats || []), newCat];
    await db.setCategories(all);
    console.log('Seeded new category:', newCat.id);

    const publicView = await db.getPublicCategories();
    console.log('Public categories (count):', publicView.length);
    console.log('First 5 public categories:', publicView.slice(0,5).map(c => ({ id: c.id, name: c.name, path: c.path, icon: c.icon })));

    // Verify the seeded category is present
    const found = publicView.find(c => c.id === newCat.id || c.name === newCat.name);
    if (found) {
      console.log('✅ Seeded category visible in public view:', found);
    } else {
      console.error('❌ Seeded category NOT found in public view');
      process.exitCode = 2;
    }
  } catch (e) {
    console.error('Error during seed-and-verify:', e);
    process.exitCode = 1;
  }
}

run();
