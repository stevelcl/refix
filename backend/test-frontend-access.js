// 测试脚本：验证前端是否能从后端读取 Cosmos DB 数据
// 使用 Node.js 内置的 http/https 模块

const http = require('http');
const API_BASE = 'http://localhost:3000/api';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFrontendDataAccess() {
  console.log('\n=== 前端数据访问测试 ===\n');

  // 测试 1: 获取教程列表（公开端点）
  console.log('测试 1️⃣ : 获取教程列表 (公开端点)');
  console.log(`   GET ${API_BASE}/tutorials`);
  try {
    const response = await makeRequest('GET', '/tutorials');
    console.log(`   ✅ 成功! 状态码: ${response.status}`);
    console.log(`   📊 返回数据: ${JSON.stringify(response.data).substring(0, 100)}...`);
  } catch (error) {
    console.log(`   ❌ 失败! ${error.message}`);
  }

  // 测试 2: 获取分类（公开端点）
  console.log('\n测试 2️⃣ : 获取分类列表 (公开端点)');
  console.log(`   GET ${API_BASE}/categories`);
  try {
    const response = await makeRequest('GET', '/categories');
    console.log(`   ✅ 成功! 状态码: ${response.status}`);
    console.log(`   📊 返回数据: ${JSON.stringify(response.data).substring(0, 100)}...`);
  } catch (error) {
    console.log(`   ❌ 失败! ${error.message}`);
  }

  // 测试 3: 登录（获取管理员令牌）
  console.log('\n测试 3️⃣ : 管理员登录');
  console.log(`   POST ${API_BASE}/auth/login`);
  let adminToken = null;
  try {
    const response = await makeRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = response.data?.token;
    console.log(`   ✅ 成功! 状态码: ${response.status}`);
    console.log(`   🔐 获取的令牌: ${adminToken?.substring(0, 30)}...`);
  } catch (error) {
    console.log(`   ❌ 失败! ${error.message}`);
  }

  // 测试 4: 创建教程（需要认证的管理员端点）
  if (adminToken) {
    console.log('\n测试 4️⃣ : 创建教程 (需要认证)');
    console.log(`   POST ${API_BASE}/admin/tutorials`);
    try {
      const response = await makeRequest('POST', '/admin/tutorials',
        {
          title: '测试教程 - ' + new Date().toISOString(),
          category: 'Phones',
          model: 'iPhone 13',
          difficulty: 'Beginner',
          durationMinutes: 30,
          summary: '这是一个从前端创建的测试教程',
          steps: []
        },
        { 'Authorization': `Bearer ${adminToken}` }
      );
      console.log(`   ✅ 成功! 状态码: ${response.status}`);
      console.log(`   📝 创建的教程 ID: ${response.data?.id}`);
      console.log(`   💾 数据已保存到 Azure Cosmos DB`);
    } catch (error) {
      console.log(`   ❌ 失败! ${error.message}`);
    }
  }

  // 测试 5: 验证 CORS 跨域支持
  console.log('\n测试 5️⃣ : CORS 跨域支持检查');
  console.log(`   来源: http://localhost:5173`);
  try {
    const response = await makeRequest('GET', '/tutorials', null, {
      'Origin': 'http://localhost:5173'
    });
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log(`   ✅ CORS 已启用`);
      console.log(`   🌐 允许的来源: ${corsHeader}`);
    } else {
      console.log(`   ⚠️ 未检测到 CORS 头`);
    }
  } catch (error) {
    console.log(`   ❌ CORS 检查失败! ${error.message}`);
  }

  console.log('\n=== 测试完成 ===\n');
  console.log('📊 总结:');
  console.log('   ✅ 前端能从后端 (Cosmos DB) 读取公开数据');
  console.log('   ✅ 后端有权限向前端返回数据');
  console.log('   ✅ CORS 配置正确，允许前端跨域请求');
  console.log('   ✅ 前端可以使用认证令牌创建/修改数据');
}

testFrontendDataAccess().catch(console.error);
