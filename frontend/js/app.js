// 全局变量
const API_URL = 'http://localhost:3000';
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const historyButton = document.getElementById('historyButton');
const newChatButton = document.getElementById('newChatButton');

// 创建历史对话列表容器
const historyList = document.createElement('div');
historyList.className = 'history-list';
document.body.appendChild(historyList);

// 当前对话ID
let currentChatId = Date.now().toString();

// 保存对话到本地存储
function saveChat(chatId, message, isUser) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (!chats[chatId]) {
        chats[chatId] = [];
    }
    chats[chatId].push({
        content: message,
        isUser,
        timestamp: Date.now()
    });
    localStorage.setItem('chats', JSON.stringify(chats));
    updateHistoryList();
}

// 格式化时间戳
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    if (days === 0) {
        return time;
    } else if (days === 1) {
        return `昨天 ${time}`;
    } else if (days < 7) {
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return `${weekdays[date.getDay()]} ${time}`;
    } else {
        const year = date.getFullYear();
        const currentYear = now.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return currentYear === year ? `${month}月${day}日 ${time}` : `${year}年${month}月${day}日 ${time}`;
    }
}

// 更新历史对话列表
function updateHistoryList() {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    historyList.innerHTML = '';
    
    Object.entries(chats).reverse().forEach(([chatId, messages]) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'history-time';
        timeDiv.textContent = formatTimestamp(messages[0]?.timestamp || Date.now());
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'history-preview';
        const firstMessage = messages[0]?.content || '空对话';
        previewDiv.textContent = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
        
        const countDiv = document.createElement('div');
        countDiv.className = 'message-count';
        countDiv.textContent = `${messages.length} 条消息`;
        
        historyItem.appendChild(timeDiv);
        historyItem.appendChild(previewDiv);
        historyItem.appendChild(countDiv);
        
        historyItem.addEventListener('click', () => loadChat(chatId));
        historyList.appendChild(historyItem);
    });
}

// 加载历史对话
function loadChat(chatId) {
    const chats = JSON.parse(localStorage.getItem('chats') || '{}');
    const messages = chats[chatId] || [];
    
    // 清空当前对话
    messagesContainer.innerHTML = '';
    
    // 更新当前对话ID
    currentChatId = chatId;
    
    // 显示历史消息
    let lastTimestamp = 0;
    messages.forEach(msg => {
        const currentTime = msg.timestamp;
        const shouldShowTimestamp = !lastTimestamp || (currentTime - lastTimestamp) >= 5 * 60 * 1000;
        
        if (shouldShowTimestamp) {
            const timestampDiv = document.createElement('div');
            timestampDiv.className = 'message-timestamp';
            timestampDiv.textContent = formatTimestamp(currentTime);
            timestampDiv.dataset.timestamp = currentTime;
            messagesContainer.appendChild(timestampDiv);
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.isUser ? 'user' : 'ai'}`;

        // 添加头像
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = msg.isUser ? '我' : 'AI';
        messageDiv.appendChild(avatarDiv);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = msg.content;
        
        messageContent.appendChild(paragraph);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        if (shouldShowTimestamp) {
            lastTimestamp = currentTime;
        }
    });
    
    // 隐藏历史列表
    historyList.classList.remove('show');
    
    // 滚动到最新消息
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 开始新对话
function startNewChat() {
    currentChatId = Date.now().toString();
    messagesContainer.innerHTML = '';
    // 添加欢迎消息
    addMessage('你好！我是你的AI生活教练。我会通过对话了解你，为你提供个性化的建议和指导。让我们开始吧！', false);
}

// 切换历史对话列表显示
historyButton.addEventListener('click', () => {
    historyList.classList.toggle('show');
});

// 新对话按钮点击事件
newChatButton.addEventListener('click', startNewChat);

// 发送消息到服务器
async function sendMessage(message) {
    try {
        // 创建AI回复的消息容器，并添加loading状态
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai loading';

        // 添加头像
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = 'AI';
        messageDiv.appendChild(avatarDiv);

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        const paragraph = document.createElement('p');
        messageContent.appendChild(paragraph);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: message
                }]
            })
        });

        if (!response.ok) {
            throw new Error('网络请求失败');
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.choices && data.choices[0].delta.content) {
                            aiResponse += data.choices[0].delta.content;
                            // 实时更新界面显示
                            paragraph.textContent = aiResponse;
                            // 滚动到最新内容
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        }
                    } catch (e) {
                        console.error('解析响应数据失败:', e);
                    }
                }
            }
        }

        // 移除loading状态并保存消息
        messageDiv.classList.remove('loading');
        // 在这里保存AI的回复
        saveChat(currentChatId, aiResponse, false);
        return aiResponse || '抱歉，未能获取到有效响应。';
    } catch (error) {
        console.error('Error:', error);
        return '抱歉，服务器出现错误。请稍后再试。';
    }
}

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const lastMessage = messagesContainer.lastElementChild;
    const currentTime = Date.now();
    let shouldShowTimestamp = true;

    // 检查是否需要显示时间戳
    if (lastMessage) {
        const lastTimestamp = lastMessage.querySelector('.message-timestamp');
        if (lastTimestamp) {
            const lastTime = parseInt(lastTimestamp.dataset.timestamp);
            // 如果与上一条消息时间间隔小于5分钟，不显示时间戳
            shouldShowTimestamp = (currentTime - lastTime) >= 5 * 60 * 1000;
        }
    }

    // 如果需要显示时间戳，创建时间戳元素
    if (shouldShowTimestamp) {
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = formatTimestamp(currentTime);
        timestampDiv.dataset.timestamp = currentTime;
        messagesContainer.appendChild(timestampDiv);
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;

    // 添加头像
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.textContent = isUser ? '我' : 'AI';
    messageDiv.appendChild(avatarDiv);

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const paragraph = document.createElement('p');
    paragraph.textContent = content;

    messageContent.appendChild(paragraph);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);

    // 只有用户消息在这里保存
    if (isUser) {
        saveChat(currentChatId, content, true);
    }

    // 滚动到最新消息
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 处理发送按钮点击事件
async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    // 只禁用发送按钮，保持输入框可用
    sendButton.disabled = true;

    // 显示用户消息
    addMessage(message, true);
    userInput.value = '';

    // 获取AI响应
    await sendMessage(message);

    // 恢复发送按钮
    sendButton.disabled = false;
    userInput.focus();
}

// 事件监听器
sendButton.addEventListener('click', handleSend);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

// 页面加载完成后初始化历史对话列表
document.addEventListener('DOMContentLoaded', () => {
    updateHistoryList();
});