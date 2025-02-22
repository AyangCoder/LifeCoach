require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 配置CORS
app.use(cors());
app.use(express.json());

// 配置请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 验证环境变量
if (!process.env.API_KEY) {
  console.error('错误：未设置API密钥！请在.env文件中配置API_KEY');
  process.exit(1);
}

// 设置静态文件服务
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 处理聊天请求的路由
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // 验证请求数据
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '无效的请求数据' });
    }

    // 准备请求配置
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: 'ep-20250215234034-fc2h9',
        messages,
        temperature: 0.6,
        stream: true
      })
    };

    // 设置超时
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    requestOptions.signal = controller.signal;

    // 发送请求到DeepSeek API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', requestOptions);
    
    // 清除超时定时器
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    // 设置响应头以支持流式传输
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 读取并转发流式响应
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      res.write(`data: ${chunk}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: '服务器内部错误',
        message: error.message
      });
    }
  }
});

// 处理根路径和所有其他路由
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});