# Life Coach AI 对话系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

## 项目简介

Life Coach AI 是一个基于 DeepSeek R1 API 开发的智能生活教练对话系统。通过自然语言交互，为用户提供个性化的生活建议、职业规划和个人成长指导。系统采用流式响应技术，提供流畅的实时对话体验。

## 🎁 活动福利

**火山引擎 DeepSeek 满血版免费领取活动！**

- 🎯 活动内容：邀请好友注册并使用，双方最高可获得145元代金券
- 💰 奖励叠加：多邀多得，上不封顶
- 🚀 免费额度：高达3625万tokens，畅享R1与V3模型
- 🔗 活动链接：[立即领取](https://www.volcengine.com/experience/ark?utm_term=202502dsinvite&ac=DSASUQY5&rc=QKFTRDAP)
- 📋 邀请码：`QKFTRDAP`

![火山引擎活动二维码](https://p3-armor.byteimg.com/tos-cn-i-49unhts6dw/dfe75f2c4a694e9e9c79f0ed7ea0cffc~tplv-49unhts6dw-image.image)

## 功能特性

- 🤖 智能对话：基于先进的 DeepSeek R1 模型
- ⚡ 实时响应：流式数据传输，即时反馈
- 💾 上下文记忆：保持对话连贯性
- 🔒 安全可靠：API 密钥加密，请求限流保护
- 📱 响应式设计：支持各种设备访问

## 技术架构

### 前端技术栈

- HTML5 + CSS3：构建响应式用户界面
- 原生 JavaScript：处理用户交互和 API 通信
- Flexbox + Grid：实现灵活的页面布局

### 后端技术栈

- Node.js：运行时环境
- Express：Web 应用框架
- dotenv：环境变量管理
- cors：跨域资源共享
- express-rate-limit：请求限流

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/yourusername/life-coach-ai.git
cd life-coach-ai
```

2. 安装后端依赖
```bash
cd backend
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置你的 API_KEY
```

4. 启动服务器
```bash
npm start
```

5. 访问应用
- 打开 `frontend/index.html`
- 开始与 AI 助手对话

## 系统配置

### 关键参数

- API 请求超时：60 秒
- 对话温度：0.6（平衡创造性和准确性）
- 请求限流：每 IP 15 分钟最多 100 请求

### 环境变量

```env
# API配置
# API_KEY - 火山方舟大模型服务访问凭证
# 获取方式：访问火山引擎控制台 https://console.volcengine.com/ark
# 在API key管理页面创建新的密钥
# 详细文档：https://www.volcengine.com/docs/82379/1302007
API_KEY=your_api_key_here

# 服务器配置
PORT=3000
```

## 开发规范

- 遵循 W3C 标准规范
- 使用语义化 HTML 标签
- 代码添加详细的中文注释
- 保持代码简洁可维护
- 定期进行代码审查

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。请确保：

1. Fork 项目并创建新分支
2. 遵循现有的代码风格
3. 更新相关文档
4. 提交前进行充分测试

## 开源许可

本项目采用 [MIT 许可证](LICENSE)。

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件至：[zhangyangmxjc@gmail.com]

## 致谢

感谢所有为这个项目做出贡献的开发者！