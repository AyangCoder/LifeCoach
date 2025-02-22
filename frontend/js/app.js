// 全局变量
const API_URL = 'http://localhost:3000';
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// 发送消息到服务器
async function sendMessage(message) {
    try {
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
                        }
                    } catch (e) {
                        console.error('解析响应数据失败:', e);
                    }
                }
            }
        }

        return aiResponse || '抱歉，未能获取到有效响应。';
    } catch (error) {
        console.error('Error:', error);
        return '抱歉，服务器出现错误。请稍后再试。';
    }
}

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const paragraph = document.createElement('p');
    paragraph.textContent = content;

    messageContent.appendChild(paragraph);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);

    // 滚动到最新消息
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 处理发送按钮点击事件
async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    // 禁用输入和按钮
    userInput.disabled = true;
    sendButton.disabled = true;

    // 显示用户消息
    addMessage(message, true);
    userInput.value = '';

    // 获取AI响应
    const response = await sendMessage(message);
    addMessage(response);

    // 恢复输入和按钮
    userInput.disabled = false;
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