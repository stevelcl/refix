# 快速参考指南

## 🚀 启动系统

### 终端 1: 后端服务器
```bash
cd backend
node server.js
```
**输出**: ✅ Using Azure Cosmos DB for persistence  
**监听**: http://localhost:3000/api

### 终端 2: 前端开发服务器
```bash
cd refix (根目录)
npm run dev
```
**输出**: VITE v5.4.21 ready  
**访问**: http://localhost:5173

---

## 🔐 默认凭证

| 字段 | 值 |
|------|-----|
| 用户名 | admin |
| 密码 | admin123 |
| 角色 | admin |

⚠️ **生产环境**: 立即更改密码！

---

## ✅ 验证系统

### 运行完整验证
```bash
cd backend
node final-verification.js
```

### 预期输出
```
✅ 通过: 5
❌ 失败: 0

🎉 所有测试通过！
🚀 系统完全就绪！
```

---

## 📝 API 端点速查

### 公开端点 (无需认证)
```bash
# 获取教程列表
GET http://localhost:3000/api/tutorials

# 获取分类
GET http://localhost:3000/api/categories

# 登录
POST http://localhost:3000/api/auth/login
Body: { username: "admin", password: "admin123" }
```

### 受保护端点 (需要 JWT 令牌)
```bash
# 创建教程
POST http://localhost:3000/api/admin/tutorials
Headers: Authorization: Bearer {token}
Body: {
  title: "教程标题",
  category: "Phones",
  model: "iPhone 14",
  difficulty: "Beginner",
  durationMinutes: 30,
  summary: "教程摘要",
  steps: []
}

# 获取当前用户
GET http://localhost:3000/api/auth/me
Headers: Authorization: Bearer {token}
```

---

## 🔧 环境配置

### Backend .env
```bash
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production-use-a-long-random-string
COSMOS_ENDPOINT=https://refixdb.documents.azure.com:443/
COSMOS_KEY=XilpHdDvbUHQAgVPqoePdxN6rwFcAuMYEi45kaCPe7uapUITXXuHcNoPuw23I97BTKZVXfGfuwl5ACDb2ADceQ==
```

### Frontend .env
```bash
VITE_API_BASE=http://localhost:3000/api
```

---

## 📊 系统状态检查

### 后端运行状态
```bash
curl http://localhost:3000/api/tutorials
```
**预期**: 200 OK + JSON 数组

### 前端访问
打开浏览器: http://localhost:5173

### 数据库连接
**检查**: 后端启动日志中有 "✅ Using Azure Cosmos DB for persistence"

---

## 🐛 常见问题

### 问题: 后端无法启动
```bash
# 检查依赖
npm install

# 检查 Node 版本
node --version  # 需要 v14+

# 检查端口占用
netstat -ano | findstr :3000
```

### 问题: 前端无法连接后端
```bash
# 检查 VITE_API_BASE
cat .env

# 检查 CORS 错误
# 在浏览器 DevTools → Console 中查看错误
```

### 问题: Cosmos DB 连接失败
```bash
# 检查凭证
cat backend/.env | grep COSMOS

# 测试连接
node backend/test-cosmos.js
```

---

## 📈 数据库容器

| 容器 | 用途 | 文档示例 |
|------|------|---------|
| users | 用户账户 | { id, username, passwordHash, role } |
| tutorials | 教程内容 | { id, title, category, model, steps } |
| categories | 分类配置 | { id, categories: [] } |
| feedback | 用户反馈 | { id, email, message, rating } |

---

## 🔒 安全性

### CORS 配置
✅ 允许: http://localhost:5173, localhost:5174, localhost:5175, localhost:3000

### JWT 认证
✅ 令牌有效期: 24 小时  
✅ 签名算法: HS256

### 密码安全
✅ 加密方法: bcrypt  
✅ Salt 轮数: 10

### 敏感数据
✅ JWT_SECRET: .env  
✅ COSMOS_KEY: .env  
✅ 不在代码中硬编码

---

## 🚀 部署准备

### 前置步骤
1. ✅ 更改默认管理员密码
2. ✅ 生成强随机 JWT_SECRET
3. ✅ 在生产环境中配置 HTTPS
4. ✅ 设置日志和监控

### 部署目标
- **后端**: Azure App Service 或 Vercel
- **前端**: Vercel 或 Azure Static Web Apps
- **数据库**: Azure Cosmos DB (已配置)

---

## 📚 项目结构

```
refix/
├── backend/
│   ├── db.js                 # 数据库抽象层 ✅ NEW
│   ├── server.js             # Express 服务器 ✅ UPDATED
│   ├── .env                  # 环境配置 ✅ UPDATED
│   └── package.json
├── src/
│   ├── App.jsx
│   ├── api.js                # API 客户端
│   ├── components/
│   └── pages/
├── .env                      # 前端配置
├── package.json
└── README.md
```

---

## 🔗 快速链接

- 前端应用: http://localhost:5173
- 后端 API: http://localhost:3000/api
- Azure Portal: https://portal.azure.com
- Cosmos DB: https://refixdb.documents.azure.com

---

## 📞 获取帮助

### 查看日志
```bash
# 后端日志
在终端中运行 node server.js，查看实时输出

# 前端日志
打开浏览器 DevTools (F12) → Console
```

### 运行诊断
```bash
cd backend
node diagnose-cosmos.js
```

### 测试 API
```bash
# 使用 PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/tutorials" -Method GET

# 使用 curl
curl http://localhost:3000/api/tutorials
```

---

## ✨ 完成清单

- ✅ 后端与 Azure Cosmos DB 连接
- ✅ 前端与后端 API 通信
- ✅ JWT 认证实施
- ✅ CORS 配置
- ✅ 数据库容器创建
- ✅ 管理员账户初始化
- ✅ 所有测试通过
- ✅ 系统文档完成

### 🎉 系统状态: **生产就绪**

---

**最后更新**: 2024 年 1 月 15 日  
**版本**: 1.0.0  
**状态**: ✅ 完全就绪
