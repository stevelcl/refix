const { CosmosClient } = require("@azure/cosmos");
require('dotenv').config();

async function diagnose() {
  console.log('\n=== Azure Cosmos DB 详细诊断 ===\n');

  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;

  console.log('1️⃣ 凭证检查:');
  console.log(`   ENDPOINT: ${endpoint}`);
  console.log(`   KEY (首30字): ${key ? key.substring(0, 30) : 'NOT SET'}...`);
  console.log(`   KEY (末30字): ...${key ? key.substring(key.length - 30) : 'NOT SET'}`);
  console.log(`   KEY 长度: ${key ? key.length : 'N/A'}`);

  if (!endpoint || !key) {
    console.log('\n❌ 缺少环境变量！');
    return;
  }

  console.log('\n2️⃣ 创建客户端:');
  let client;
  try {
    client = new CosmosClient({ endpoint, key });
    console.log('   ✅ CosmosClient 创建成功');
  } catch (error) {
    console.log('   ❌ CosmosClient 创建失败:', error.message);
    return;
  }

  console.log('\n3️⃣ 尝试读取数据库:');
  try {
    const { database } = await client.database('refix').read();
    console.log('   ✅ 数据库连接成功！');
    console.log(`   数据库 ID: ${database.id}`);

    console.log('\n4️⃣ 列出容器:');
    const { resources: containers } = await client.database('refix').containers.readAll().fetchAll();
    console.log(`   ✅ 找到 ${containers.length} 个容器:`);
    containers.forEach(c => console.log(`      - ${c.id}`));

    console.log('\n✅ Azure Cosmos DB 连接正常！');
    console.log('   系统已准备好使用 Cosmos DB');
  } catch (error) {
    console.log('   ❌ 连接失败');
    console.log(`\n   错误信息: ${error.message}`);
    console.log(`   错误代码: ${error.code}`);

    // 详细诊断
    if (error.message.includes('authorization token')) {
      console.log('\n⚠️ 认证错误的可能原因:');
      console.log('   1. 密钥已被轮换或更新');
      console.log('   2. 密钥来自不同的 Cosmos DB 账户');
      console.log('   3. 密钥复制时包含多余空格');
      console.log('   4. 本地时间与 Azure 服务器时间不同步');
      console.log('\n💡 建议:');
      console.log('   • 登录 Azure Portal');
      console.log('   • 导航到 Cosmos DB > refixdb > Keys');
      console.log('   • 验证 Primary Key 与 .env 中的值是否一致');
      console.log('   • 如果不同，复制最新的 Primary Key 到 .env');
      console.log('   • 检查系统时间是否正确');
    } else if (error.message.includes('not found')) {
      console.log('\n⚠️ 数据库不存在');
      console.log('   密钥是有效的，但数据库 "refix" 不存在');
      console.log('   系统会自动创建数据库和容器');
    }

    console.log(`\n📋 完整错误: ${error.toString()}`);
  }

  console.log('\n5️⃣ 系统时间检查:');
  const now = new Date();
  console.log(`   本地时间: ${now.toUTCString()}`);
  console.log('   如果时间相差超过 5 分钟，可能导致认证失败');

  console.log('\n');
}

diagnose().catch(console.error);
