// AI姓名评测配置文件
const CONFIG = {
    // GitHub API 配置
    GITHUB_TOKEN: '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',
    endpoint: 'https://models.github.ai/inference/chat/completions',
    model: 'deepseek/DeepSeek-V3-0324',
    
    // 专业的姓名分析提示词
    createNameAnalysisPrompt: (name) => {
        return `你是一位专业的姓名学专家和语言学家，请对输入的姓名进行全面分析。请直接输出分析结果，不要包含任何思考过程或<think>标签。

姓名：${name}

请按照以下格式严格输出分析结果：

【稀有度评分】
评分：X%
评价：[对稀有度的详细说明，包括姓氏和名字的常见程度分析]

【音韵评价】
评分：X%
评价：[对音韵美感的分析，包括声调搭配、读音流畅度、音律和谐度等]

【含义解读】
[详细分析姓名的寓意内涵，包括：
1. 姓氏的历史渊源和文化背景
2. 名字各字的含义和象征
3. 整体姓名的寓意组合
4. 可能体现的父母期望或文化内涵
5. 与传统文化、诗词典故的关联等]

要求：
1. 评分必须是1-100的整数百分比，要有明显区分度，避免雷同
2. 分析要专业、客观、有依据，评分要根据实际情况有所差异
3. 含义解读要详细深入，至少150字
4. 严格按照上述格式输出，不要添加思考过程、<think>标签或其他内容
5. 如果是生僻字或罕见姓名，要特别说明
6. 直接输出最终结果，不要显示推理过程`;
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}