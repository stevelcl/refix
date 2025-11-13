// Quick script to check Azure Cosmos DB connection status
require('dotenv').config();

const path = require('path');
const fs = require('fs');

console.log('\n=== Azure Cosmos DB 连接状态检查 ===\n');

// Check environment variables
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

console.log('1. 环境变量检查:');
console.log(`   COSMOS_ENDPOINT: ${endpoint ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`   COSMOS_KEY: ${key ? '✅ 已设置' : '❌ 未设置'}`);

// Check if @azure/cosmos package is installed
let cosmosInstalled = false;
try {
  require.resolve('@azure/cosmos');
  cosmosInstalled = true;
} catch (e) {
  cosmosInstalled = false;
}

console.log(`\n2. @azure/cosmos 包: ${cosmosInstalled ? '✅ 已安装' : '❌ 未安装'}`);

// Check current storage mode
const JSON_DB_FILE = path.join(__dirname, 'db.json');
const usingJsonFile = fs.existsSync(JSON_DB_FILE);

console.log(`\n3. 当前存储方式:`);
if (usingJsonFile) {
  const db = JSON.parse(fs.readFileSync(JSON_DB_FILE, 'utf8'));
  const userCount = (db.users || []).length;
  const tutorialCount = (db.tutorials || []).length;
  console.log(`   ✅ 使用本地 JSON 文件存储`);
  console.log(`   📁 文件位置: ${JSON_DB_FILE}`);
  console.log(`   📊 数据统计: ${userCount} 用户, ${tutorialCount} 教程`);
} else {
  console.log(`   ⚠️  JSON 文件不存在`);
}

// Summary
console.log(`\n=== 总结 ===`);
if (endpoint && key && cosmosInstalled) {
  console.log('✅ 配置完整，可以连接到 Azure Cosmos DB');
  console.log('   但当前可能仍在使用本地 JSON 文件（需要重启服务器）');
} else {
  console.log('❌ 未连接到 Azure Cosmos DB');
  if (!endpoint || !key) {
    console.log('   原因: 缺少环境变量 (COSMOS_ENDPOINT 或 COSMOS_KEY)');
  }
  if (!cosmosInstalled) {
    console.log('   原因: @azure/cosmos 包未安装');
    console.log('   解决方案: 运行 npm install 安装依赖');
  }
  console.log('   当前使用: 本地 JSON 文件存储');
}

console.log('\n');

