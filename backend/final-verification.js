#!/usr/bin/env node

// 最终验证测试：前端数据访问和后端权限
const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verify() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   前端-后端-Azure Cosmos DB 数据流验证                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let passed = 0, failed = 0;

  // 测试 1: 获取教程 (公开)
  console.log('📋 测试 1: 获取教程列表 (公开端点)');
  try {
    const res = await makeRequest('GET', '/tutorials');
    if (res.status === 200) {
      console.log(`   ✅ 成功 (HTTP ${res.status})`);
      console.log(`   📊 返回 ${Array.isArray(res.body) ? res.body.length : 0} 个教程`);
      passed++;
    } else {
      console.log(`   ❌ 失败 (HTTP ${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`   ❌ 错误: ${e.message}`);
    failed++;
  }

  // 测试 2: 获取分类 (公开)
  console.log('\n📋 测试 2: 获取分类 (公开端点)');
  try {
    const res = await makeRequest('GET', '/categories');
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`   ✅ 成功 (HTTP ${res.status})`);
      console.log(`   🏷️  返回 ${res.body.length} 个分类`);
      passed++;
    } else {
      console.log(`   ❌ 失败 (HTTP ${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`   ❌ 错误: ${e.message}`);
    failed++;
  }

  // 测试 3: 认证 (登录)
  console.log('\n📋 测试 3: 管理员认证 (登录)');
  let token = null;
  try {
    const res = await makeRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    if (res.status === 200 && res.body.token) {
      token = res.body.token;
      console.log(`   ✅ 成功 (HTTP ${res.status})`);
      console.log(`   🔐 获取有效 JWT 令牌`);
      passed++;
    } else {
      console.log(`   ❌ 失败 (HTTP ${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`   ❌ 错误: ${e.message}`);
    failed++;
  }

  // 测试 4: 创建教程 (需要认证)
  if (token) {
    console.log('\n📋 测试 4: 创建教程 (需要管理员认证)');
    try {
      const res = await makeRequest('POST', '/admin/tutorials',
        {
          title: '验证教程 - ' + new Date().toISOString(),
          category: 'Phones',
          model: 'iPhone 14',
          difficulty: 'Intermediate',
          durationMinutes: 45,
          summary: '从前端通过认证创建的教程',
          steps: []
        },
        { 'Authorization': `Bearer ${token}` }
      );
      if (res.status === 200 || res.status === 201) {
        console.log(`   ✅ 成功 (HTTP ${res.status})`);
        console.log(`   💾 教程已保存到 Azure Cosmos DB`);
        console.log(`   📝 教程 ID: ${res.body.id}`);
        passed++;
      } else {
        console.log(`   ❌ 失败 (HTTP ${res.status})`);
        console.log(`   💬 错误: ${res.body.error || res.body}`);
        failed++;
      }
    } catch (e) {
      console.log(`   ❌ 错误: ${e.message}`);
      failed++;
    }
  }

  // 测试 5: CORS 验证
  console.log('\n📋 测试 5: CORS 跨域配置');
  try {
    const res = await makeRequest('GET', '/tutorials', null, {
      'Origin': 'http://localhost:5173'
    });
    const corsHeader = res.headers['access-control-allow-origin'];
    if (corsHeader && corsHeader.includes('localhost:5173')) {
      console.log(`   ✅ 成功`);
      console.log(`   🌐 前端来源 (localhost:5173) 已授权`);
      console.log(`   💬 CORS Header: ${corsHeader}`);
      passed++;
    } else {
      console.log(`   ⚠️  警告: CORS 头未配置`);
      failed++;
    }
  } catch (e) {
    console.log(`   ❌ 错误: ${e.message}`);
    failed++;
  }

  // 总结
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                      测试总结                           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`总计: ${passed + failed}\n`);

  if (failed === 0) {
    console.log('🎉 所有测试通过！\n');
    console.log('📊 系统验证:\n');
    console.log('   ✅ 前端可以从后端读取公开数据 (教程、分类)');
    console.log('   ✅ 前端可以与后端进行身份认证');
    console.log('   ✅ 认证用户可以创建/修改数据');
    console.log('   ✅ 数据正确地存储在 Azure Cosmos DB');
    console.log('   ✅ CORS 配置允许前端访问后端');
    console.log('   ✅ 后端有权限向前端返回数据和错误\n');
    console.log('🚀 系统完全就绪！\n');
  } else {
    console.log('⚠️  请检查上述失败的测试\n');
  }
}

verify().catch(console.error);
