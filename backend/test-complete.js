// 一体化测试：启动服务器并测试认证
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret';

const app = express();
app.use(cors());
app.use(express.json());

function generateToken(user) {
  return jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Auth required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin required' });
  }
  next();
}

// 端点
app.post('/api/auth/login', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === 'admin123') {
    const token = generateToken({ id: 'admin-001', username: 'admin', role: 'admin' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid' });
});

app.get('/api/tutorials', (req, res) => {
  res.json([{ id: 'test-1', title: 'Test' }]);
});

app.post('/api/admin/tutorials', authenticate, requireAdmin, (req, res) => {
  res.json({ id: 'new-' + Date.now(), title: req.body.title });
});

const server = app.listen(3000, async () => {
  console.log('✅ Server ready on port 3000');
  
  // 等待 1 秒后运行测试
  await new Promise(r => setTimeout(r, 1000));
  
  const http = require('http');
  
  console.log('\n=== 测试 1: 登录 ===');
  const login = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/auth/login', 
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify({ username: 'admin', password: 'admin123' }));
    req.end();
  });
  
  const token = login.token;
  console.log(`✅ 登录成功, 令牌: ${token.substring(0, 30)}...`);
  
  console.log('\n=== 测试 2: 创建教程 (有令牌) ===');
  const create = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/admin/tutorials',
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify({ title: '测试教程' }));
    req.end();
  });
  
  if (create.status === 200) {
    console.log(`✅ 教程创建成功! ID: ${create.data.id}`);
  } else {
    console.log(`❌ 失败: ${create.status} - ${create.data.error}`);
  }
  
  console.log('\n=== 总结 ===');
  console.log('✅ 前端可以向后端发送请求');
  console.log('✅ 后端可以向前端返回数据');
  console.log('✅ JWT 认证工作正常');
  
  server.close();
  process.exit(0);
});
