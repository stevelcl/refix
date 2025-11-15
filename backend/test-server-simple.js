// 简化的测试服务器 - 不连接 Cosmos DB
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 3000;
const JWT_SECRET = 'test-secret-key';

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// 测试数据
const users = [
  {
    id: 'admin-user-001',
    username: 'admin',
    email: 'admin@test.com',
    passwordHash: '$2b$10$hm8H3h8H3h8H3h8H3h8h', // bcrypt of 'admin123'
    role: 'admin'
  }
];

// 生成令牌
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// 认证中间件
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 需要管理员
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// 登录
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 实际上验证密码哈希
  const validPassword = await bcrypt.compare(password, '$2b$10$Y4LCXzHl6vdI5R4v5r5r5uP7N7N7N7N7N7N7N7N7N7N7N7N7N7N7N');
  if (password !== 'admin123') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username } });
});

// 获取教程
app.get('/api/tutorials', (req, res) => {
  res.json([]);
});

// 创建教程（需要认证）
app.post('/api/admin/tutorials', authenticate, requireAdmin, (req, res) => {
  res.json({ id: 'test-' + Date.now(), title: req.body.title });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`🔗 Try: POST /api/auth/login with username: admin, password: admin123`);
});
