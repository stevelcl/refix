const { CosmosClient } = require("@azure/cosmos");
require('dotenv').config();

async function testConnection() {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;

  console.log('\n=== Cosmos DB 连接诊断 ===\n');
  console.log('1. 环境变量检查:');
  console.log(`   ENDPOINT: ${endpoint}`);
  console.log(`   KEY (前30字): ${key ? key.substring(0, 30) + '...' : 'NOT SET'}`);
  console.log(`   KEY (后30字): ${key ? '...' + key.substring(key.length - 30) : 'NOT SET'}`);
  console.log(`   KEY 长度: ${key ? key.length : 'N/A'}`);

  if (!endpoint || !key) {
    console.log('\n❌ 缺少环境变量！');
    return;
  }

  console.log('\n2. 尝试创建 Cosmos 客户端...');
  try {
    const client = new CosmosClient({ endpoint, key });
    console.log('✅ 客户端创建成功');

    console.log('\n3. 尝试连接到数据库...');
    const { database } = await client.database('refix').read();
    console.log('✅ 数据库连接成功！');
    console.log(`   数据库 ID: ${database.id}`);

    console.log('\n4. 列出容器...');
    const { resources: containers } = await client.database('refix').containers.readAll().fetchAll();
    console.log(`✅ 找到 ${containers.length} 个容器:`);
    containers.forEach(c => console.log(`   - ${c.id}`));

    console.log('\n✅ Cosmos DB 连接完全正常！');
  } catch (error) {
    console.log('\n❌ 连接失败！');
    console.log(`   错误: ${error.message}`);
    console.log(`\n   错误代码: ${error.code}`);
    console.log(`   错误详情: ${error.body || error.toString()}`);

    if (error.message.includes('authorization token')) {
      console.log('\n   💡 提示: 这通常表示密钥不正确或格式有问题。');
      console.log('      请确保密钥来自 Azure Portal > Cosmos DB > Keys');
    }
  }
}

testConnection();
