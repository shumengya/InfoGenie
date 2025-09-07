// AI变量命名助手配置文件
const CONFIG = {
    // GitHub Models API 配置
    GITHUB_TOKEN: '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',
    API_URL: 'https://models.github.ai/inference/chat/completions',
    MODEL_NAME: 'openai/gpt-4o-mini',
    
    // AI提示词模板
    createNamingPrompt: (description) => {
        return `你是一个专业的变量命名助手。请根据以下描述为变量生成合适的名称：

描述：${description}

请为每种命名规范生成3个变量名建议：
1. camelCase (驼峰命名法)
2. PascalCase (帕斯卡命名法) 
3. snake_case (下划线命名法)
4. kebab-case (短横线命名法)
5. CONSTANT_CASE (常量命名法)

要求：
- 变量名要准确反映功能和用途
- 严格遵循各自的命名规范
- 避免使用缩写，除非是广泛认知的缩写
- 名称要简洁但具有描述性
- 考虑代码的可读性和维护性

请按以下JSON格式返回：
{
  "suggestions": {
    "camelCase": [
      {"name": "变量名1", "description": "解释说明1"},
      {"name": "变量名2", "description": "解释说明2"},
      {"name": "变量名3", "description": "解释说明3"}
    ],
    "PascalCase": [
      {"name": "变量名1", "description": "解释说明1"},
      {"name": "变量名2", "description": "解释说明2"},
      {"name": "变量名3", "description": "解释说明3"}
    ],
    "snake_case": [
      {"name": "变量名1", "description": "解释说明1"},
      {"name": "变量名2", "description": "解释说明2"},
      {"name": "变量名3", "description": "解释说明3"}
    ],
    "kebab-case": [
      {"name": "变量名1", "description": "解释说明1"},
      {"name": "变量名2", "description": "解释说明2"},
      {"name": "变量名3", "description": "解释说明3"}
    ],
    "CONSTANT_CASE": [
      {"name": "变量名1", "description": "解释说明1"},
      {"name": "变量名2", "description": "解释说明2"},
      {"name": "变量名3", "description": "解释说明3"}
    ]
  }
}

只返回JSON格式的结果，不要包含其他文字。`;
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}