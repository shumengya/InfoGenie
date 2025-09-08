// AI写诗小助手配置文件
const CONFIG = {
    // GitHub API 配置
    GITHUB_TOKEN: '',
    endpoint: 'https://models.github.ai/inference/chat/completions',
    MODEL_NAME: 'openai/gpt-4o-mini',
    
    // 专业的古诗生成提示词
    createPoemPrompt: (theme) => {
        return `你是一位精通中国古典诗词的大师，请根据用户提供的主题创作一首优美的古诗。

要求：
1. 严格遵循中国古诗的格律和韵律
2. 可以是五言绝句、七言绝句、五言律诗或七言律诗
3. 注重意境的营造，体现中国传统文化的美感
4. 用词典雅，富有诗意
5. 根据主题选择合适的风格（豪放、婉约、田园、边塞等）
6. 确保押韵和平仄协调
7. 请先给诗歌起一个优美的标题，然后换行写出诗歌内容
8. 格式：标题\n诗歌正文
9. 注意排版对齐，标题居中，诗歌正文左对齐
10. 诗歌内容必须是中文

主题：${theme}

请创作一首古诗：`;
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}