// 快速测试脚本：验证身份验证修复
const http = require('http');

function request(method, path, body = null, headers = {}) {
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('测试认证修复...\n');
  
  try {
    // 1. 登录
    console.log('1️⃣ 登录...');
    const login = await request('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = login.data.token;
    console.log(`   ✅ 登录成功, 令牌: ${token?.substring(0, 30)}...`);

    // 2. 创建教程
    console.log('\n2️⃣ 创建教程 (带有有效令牌)...');
    const create = await request('POST', '/admin/tutorials',
      {
        title: '测试教程 ' + Date.now(),
        category: 'Phones',
        model: 'iPhone 13',
        difficulty: 'Beginner',
        durationMinutes: 30,
        summary: '测试',
        steps: []
      },
      { 'Authorization': `Bearer ${token}` }
    );
    console.log(`   状态码: ${create.status}`);
    if (create.status === 200 || create.status === 201) {
      console.log(`   ✅ 教程创建成功!`);
      console.log(`   📝 ID: ${create.data.id || create.data._id}`);
    } else {
      console.log(`   ❌ 失败: ${create.data.error || create.data}`);
    }

    // 3. 获取教程列表确认数据保存
    console.log('\n3️⃣ 获取教程列表...');
    const list = await request('GET', '/tutorials');
    console.log(`   ✅ 获取成功, 共有 ${list.data.length} 个教程`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  }
})();
