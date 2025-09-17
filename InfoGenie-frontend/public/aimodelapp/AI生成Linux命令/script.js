// 从配置文件导入设置
// 配置在 env.js 文件中定义

// DOM 元素
const taskInput = document.getElementById('task-input');
const levelSelect = document.getElementById('level-select');
const generateBtn = document.getElementById('generateBtn');
const loadingDiv = document.getElementById('loading');
const commandsContainer = document.getElementById('commands');

// 调用后端API
async function callBackendAPI(taskDescription, difficultyLevel) {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${window.API_CONFIG.baseUrl}${window.API_CONFIG.endpoints.linuxCommand}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                task_description: taskDescription,
                difficulty_level: difficultyLevel
            })
        });

        if (!response.ok) {
            if (response.status === 402) {
                throw new Error('您的萌芽币余额不足，无法使用此功能');
            }
            const errorData = await response.json();
            throw new Error(errorData.error || `API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            return data.command_result;
        } else {
            throw new Error(data.error || 'API响应格式异常');
        }
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 解析AI响应
function parseAIResponse(response) {
    try {
        // 尝试直接解析JSON
        const parsed = JSON.parse(response);
        return parsed;
    } catch (error) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed;
            } catch (e) {
                console.error('JSON解析失败:', e);
            }
        }
        
        // 如果JSON解析失败，返回空对象
        console.error('无法解析AI响应:', response);
        return {};
    }
}

// 获取安全等级颜色
function getSafetyLevelColor(safetyLevel) {
    const colors = {
        'safe': '#34C759',
        'caution': '#FF9500',
        'dangerous': '#FF3B30'
    };
    return colors[safetyLevel] || '#86868B';
}

// 获取安全等级文本
function getSafetyLevelText(safetyLevel) {
    const texts = {
        'safe': '安全',
        'caution': '谨慎',
        'dangerous': '危险'
    };
    return texts[safetyLevel] || '未知';
}

// 显示命令建议
function displayCommands(commandData) {
    commandsContainer.innerHTML = '';
    
    if (!commandData || !commandData.commands || commandData.commands.length === 0) {
        commandsContainer.innerHTML = '<div class="placeholder">暂无命令建议，请尝试重新生成</div>';
        return;
    }
    
    // 显示命令列表
    if (commandData.commands && commandData.commands.length > 0) {
        const commandsTitle = document.createElement('div');
        commandsTitle.className = 'section-title';
        commandsTitle.textContent = '推荐命令';
        commandsContainer.appendChild(commandsTitle);
        
        commandData.commands.forEach((command, index) => {
            const commandElement = document.createElement('div');
            commandElement.className = 'command-item';
            
            const safetyColor = getSafetyLevelColor(command.safety_level);
            const safetyText = getSafetyLevelText(command.safety_level);
            
            commandElement.innerHTML = `
                <div class="command-content">
                    <div class="command-header">
                        <div class="command-code">${command.command}</div>
                        <div class="safety-badge" style="background-color: ${safetyColor}">${safetyText}</div>
                    </div>
                    <div class="command-description">${command.description}</div>
                    <div class="command-explanation">
                        <strong>详细说明：</strong>${command.explanation}
                    </div>
                    ${command.example_output ? `<div class="command-output"><strong>预期输出：</strong><code>${command.example_output}</code></div>` : ''}
                    ${command.alternatives && command.alternatives.length > 0 ? `
                        <div class="command-alternatives">
                            <strong>替代命令：</strong>
                            ${command.alternatives.map(alt => `<code class="alt-command" onclick="copyToClipboard('${alt}', this)">${alt}</code>`).join(' ')}
                        </div>
                    ` : ''}
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${command.command}', this)">复制命令</button>
            `;
            commandsContainer.appendChild(commandElement);
        });
    }
    
    // 显示安全警告
    if (commandData.safety_warnings && commandData.safety_warnings.length > 0) {
        const warningsTitle = document.createElement('div');
        warningsTitle.className = 'section-title warning';
        warningsTitle.textContent = '⚠️ 安全提示';
        commandsContainer.appendChild(warningsTitle);
        
        const warningsContainer = document.createElement('div');
        warningsContainer.className = 'warnings-container';
        commandData.safety_warnings.forEach(warning => {
            const warningElement = document.createElement('div');
            warningElement.className = 'warning-item';
            warningElement.textContent = warning;
            warningsContainer.appendChild(warningElement);
        });
        commandsContainer.appendChild(warningsContainer);
    }
    
    // 显示前置条件
    if (commandData.prerequisites && commandData.prerequisites.length > 0) {
        const prereqTitle = document.createElement('div');
        prereqTitle.className = 'section-title info';
        prereqTitle.textContent = '📋 前置条件';
        commandsContainer.appendChild(prereqTitle);
        
        const prereqContainer = document.createElement('div');
        prereqContainer.className = 'prerequisites-container';
        commandData.prerequisites.forEach(prereq => {
            const prereqElement = document.createElement('div');
            prereqElement.className = 'prerequisite-item';
            prereqElement.textContent = prereq;
            prereqContainer.appendChild(prereqElement);
        });
        commandsContainer.appendChild(prereqContainer);
    }
    
    // 显示相关概念
    if (commandData.related_concepts && commandData.related_concepts.length > 0) {
        const conceptsTitle = document.createElement('div');
        conceptsTitle.className = 'section-title info';
        conceptsTitle.textContent = '💡 相关概念';
        commandsContainer.appendChild(conceptsTitle);
        
        const conceptsContainer = document.createElement('div');
        conceptsContainer.className = 'concepts-container';
        commandData.related_concepts.forEach(concept => {
            const conceptElement = document.createElement('div');
            conceptElement.className = 'concept-item';
            conceptElement.textContent = concept;
            conceptsContainer.appendChild(conceptElement);
        });
        commandsContainer.appendChild(conceptsContainer);
    }
}

// 复制到剪贴板
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessToast('已复制到剪贴板');
        const originalText = button.textContent;
        button.textContent = '已复制';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        // 备用复制方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccessToast('已复制到剪贴板');
            const originalText = button.textContent;
            button.textContent = '已复制';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        } catch (e) {
            showErrorMessage('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    });
}

// 显示成功提示
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 显示错误信息
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    commandsContainer.innerHTML = '';
    commandsContainer.appendChild(errorDiv);
}

// 显示加载状态
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    generateBtn.disabled = show;
    generateBtn.textContent = show ? '生成中...' : '生成命令';
}

// 生成命令建议
async function generateCommands() {
    const taskDescription = taskInput.value.trim();
    const difficultyLevel = levelSelect.value;
    
    if (!taskDescription) {
        showErrorMessage('请输入任务描述');
        return;
    }
    
    showLoading(true);
    commandsContainer.innerHTML = '';
    
    try {
        const commandResult = await callBackendAPI(taskDescription, difficultyLevel);
        const commandData = parseAIResponse(commandResult);
        displayCommands(commandData);
    } catch (error) {
        console.error('生成命令失败:', error);
        showErrorMessage(`生成失败: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// 事件监听器
generateBtn.addEventListener('click', generateCommands);

// 回车键生成
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateCommands();
    }
});

// 技能水平变化时的提示
levelSelect.addEventListener('change', (e) => {
    const levelDescriptions = {
        'beginner': '将提供基础命令和详细解释',
        'intermediate': '将提供常用命令和选项',
        'advanced': '将提供高效命令和高级用法'
    };
    
    const description = levelDescriptions[e.target.value];
    if (description) {
        console.log(`已选择技能水平: ${e.target.value} - ${description}`);
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认占位符
    commandsContainer.innerHTML = '<div class="placeholder">请输入要执行的Linux操作，然后点击生成按钮获取相应的命令</div>';
    
    // 设置默认任务描述
    if (!taskInput.value.trim()) {
        taskInput.value = '切换到根目录';
    }
});

// 导出函数供HTML调用
window.copyToClipboard = copyToClipboard;
window.generateCommands = generateCommands;

// 添加一些实用的辅助函数
function getRandomCommand(commands) {
    if (commands && commands.length > 0) {
        const randomIndex = Math.floor(Math.random() * commands.length);
        return commands[randomIndex];
    }
    return null;
}

// 命令使用统计（可选功能）
function trackCommandUsage(command) {
    const usage = JSON.parse(localStorage.getItem('commandUsage') || '{}');
    usage[command] = (usage[command] || 0) + 1;
    localStorage.setItem('commandUsage', JSON.stringify(usage));
}

// 获取常用命令（可选功能）
function getPopularCommands(limit = 5) {
    const usage = JSON.parse(localStorage.getItem('commandUsage') || '{}');
    return Object.entries(usage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([command]) => command);
}

// 导出辅助函数
window.getRandomCommand = getRandomCommand;
window.trackCommandUsage = trackCommandUsage;
window.getPopularCommands = getPopularCommands;