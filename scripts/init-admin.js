const { CosmosClient } = require("@azure/cosmos");
const bcrypt = require("bcrypt");

// Configuration - Update these values
const endpoint = process.env.COSMOS_ENDPOINT || "your-cosmos-endpoint";
const key = process.env.COSMOS_KEY || "your-cosmos-key";
const databaseId = "refix";
const containerId = "users";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

async function createAdminAccount() {
  console.log("🚀 Starting admin account creation...");
  
  try {
    // Check if admin account already exists
    console.log("📋 Checking for existing admin account...");
    const existingAdmin = await container.items
      .query("SELECT * FROM c WHERE c.role = 'admin'")
      .fetchAll();
    
    if (existingAdmin.resources.length > 0) {
      console.log("⚠️  Admin account already exists!");
      console.log("Existing admin username:", existingAdmin.resources[0].username);
      console.log("Existing admin email:", existingAdmin.resources[0].email);
      return;
    }
    
    // Hash the password
    console.log("🔐 Hashing password...");
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash("admin123", saltRounds);
    
    // Create admin account object
    const adminAccount = {
      id: "admin-user-001",
      username: "admin",
      email: "admin@refix.com",
      passwordHash: passwordHash,
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert admin account
    console.log("💾 Creating admin account in database...");
    const { resource } = await container.items.create(adminAccount);
    
    console.log("\n✅ Admin account created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Login Credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  SECURITY WARNING:");
    console.log("   - Change the password immediately after first login!");
    console.log("   - Use a strong password (minimum 16 characters)");
    console.log("   - Never share these credentials");
    console.log("\n🔗 Access the admin panel at: /creator-dashboard");
    
  } catch (error) {
    console.error("\n❌ Error creating admin account:");
    console.error(error.message);
    
    if (error.code === "ENOTFOUND") {
      console.error("\n💡 Tip: Check your COSMOS_ENDPOINT and COSMOS_KEY environment variables");
    }
    
    throw error;
  }
}

// Run the initialization
createAdminAccount()
  .then(() => {
    console.log("\n✨ Initialization complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Initialization failed!");
    process.exit(1);
  });

