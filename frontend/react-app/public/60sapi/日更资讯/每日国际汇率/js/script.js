// 每日国际汇率 JavaScript 功能

// API配置
const API = {
    endpoints: [],
    currentIndex: 0,
    defaultCurrency: 'CNY',
    localFallback: '返回接口.json',
    // 初始化API接口列表
    async init() {
        try {
            const res = await fetch('./接口集合.json');
            const endpoints = await res.json();
            this.endpoints = endpoints.map(endpoint => `${endpoint}/v2/exchange_rate`);
        } catch (e) {
            // 如果无法加载接口集合，使用默认接口
            this.endpoints = ['https://60s.viki.moe/v2/exchange_rate'];
        }
    },
    // 获取当前接口URL
    getCurrentUrl(currency) {
        if (this.endpoints.length === 0) return null;
        const url = new URL(this.endpoints[this.currentIndex]);
        url.searchParams.append('currency', currency);
        return url.toString();
    },
    // 切换到下一个接口
    switchToNext() {
        this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
        return this.currentIndex < this.endpoints.length;
    },
    // 重置到第一个接口
    reset() {
        this.currentIndex = 0;
    }
};

// 常用货币列表
const POPULAR_CURRENCIES = [
    { code: 'CNY', name: '人民币', flag: '🇨🇳' },
    { code: 'USD', name: '美元', flag: '🇺🇸' },
    { code: 'EUR', name: '欧元', flag: '🇪🇺' },
    { code: 'JPY', name: '日元', flag: '🇯🇵' },
    { code: 'GBP', name: '英镑', flag: '🇬🇧' },
    { code: 'AUD', name: '澳元', flag: '🇦🇺' },
    { code: 'CAD', name: '加元', flag: '🇨🇦' },
    { code: 'CHF', name: '瑞士法郎', flag: '🇨🇭' },
    { code: 'HKD', name: '港币', flag: '🇭🇰' },
    { code: 'SGD', name: '新加坡元', flag: '🇸🇬' },
    { code: 'KRW', name: '韩元', flag: '🇰🇷' },
    { code: 'THB', name: '泰铢', flag: '🇹🇭' }
];

// 货币优先级排序 - 经济发达、交易频繁的国家货币优先
const CURRENCY_PRIORITY = {
    // 第一梯队：全球主要储备货币和交易货币
    'USD': 1,  // 美元 - 全球储备货币
    'EUR': 2,  // 欧元 - 欧盟统一货币
    'JPY': 3,  // 日元 - 亚洲主要货币
    'GBP': 4,  // 英镑 - 传统储备货币
    'CNY': 5,  // 人民币 - 中国货币
    
    // 第二梯队：发达国家货币
    'CHF': 10, // 瑞士法郎 - 避险货币
    'CAD': 11, // 加拿大元
    'AUD': 12, // 澳大利亚元
    'NZD': 13, // 新西兰元
    'SEK': 14, // 瑞典克朗
    'NOK': 15, // 挪威克朗
    'DKK': 16, // 丹麦克朗
    
    // 第三梯队：亚洲发达经济体
    'HKD': 20, // 港币
    'SGD': 21, // 新加坡元
    'KRW': 22, // 韩元
    'TWD': 23, // 新台币
    
    // 第四梯队：重要新兴市场货币
    'RUB': 30, // 俄罗斯卢布
    'INR': 31, // 印度卢比
    'BRL': 32, // 巴西雷亚尔
    'MXN': 33, // 墨西哥比索
    'ZAR': 34, // 南非兰特
    'TRY': 35, // 土耳其里拉
    
    // 第五梯队：亚洲重要货币
    'THB': 40, // 泰铢
    'MYR': 41, // 马来西亚林吉特
    'IDR': 42, // 印尼盾
    'PHP': 43, // 菲律宾比索
    'VND': 44, // 越南盾
    
    // 第六梯队：中东石油国家货币
    'SAR': 50, // 沙特里亚尔
    'AED': 51, // 阿联酋迪拉姆
    'QAR': 52, // 卡塔尔里亚尔
    'KWD': 53, // 科威特第纳尔
    
    // 第七梯队：欧洲其他货币
    'PLN': 60, // 波兰兹罗提
    'CZK': 61, // 捷克克朗
    'HUF': 62, // 匈牙利福林
    'RON': 63, // 罗马尼亚列伊
    'BGN': 64, // 保加利亚列弗
    'HRK': 65, // 克罗地亚库纳
    
    // 第八梯队：拉美货币
    'ARS': 70, // 阿根廷比索
    'CLP': 71, // 智利比索
    'COP': 72, // 哥伦比亚比索
    'PEN': 73, // 秘鲁索尔
    'UYU': 74, // 乌拉圭比索
    
    // 其他货币默认优先级为 999
};

// 货币名称映射
const CURRENCY_NAMES = {
    'CNY': '人民币', 'USD': '美元', 'EUR': '欧元', 'JPY': '日元', 'GBP': '英镑',
    'AUD': '澳元', 'CAD': '加元', 'CHF': '瑞士法郎', 'HKD': '港币', 'SGD': '新加坡元',
    'KRW': '韩元', 'THB': '泰铢', 'AED': '阿联酋迪拉姆', 'AFN': '阿富汗尼',
    'ALL': '阿尔巴尼亚列克', 'AMD': '亚美尼亚德拉姆', 'ANG': '荷属安的列斯盾',
    'AOA': '安哥拉宽扎', 'ARS': '阿根廷比索', 'AWG': '阿鲁巴弗罗林',
    'AZN': '阿塞拜疆马纳特', 'BAM': '波黑马克', 'BBD': '巴巴多斯元',
    'BDT': '孟加拉塔卡', 'BGN': '保加利亚列弗', 'BHD': '巴林第纳尔',
    'BIF': '布隆迪法郎', 'BMD': '百慕大元', 'BND': '文莱元', 'BOB': '玻利维亚诺',
    'BRL': '巴西雷亚尔', 'BSD': '巴哈马元', 'BTN': '不丹努尔特鲁姆',
    'BWP': '博茨瓦纳普拉', 'BYN': '白俄罗斯卢布', 'BZD': '伯利兹元',
    'CDF': '刚果法郎', 'CLP': '智利比索', 'COP': '哥伦比亚比索', 'CRC': '哥斯达黎加科朗',
    'CUP': '古巴比索', 'CVE': '佛得角埃斯库多', 'CZK': '捷克克朗', 'DJF': '吉布提法郎',
    'DKK': '丹麦克朗', 'DOP': '多米尼加比索', 'DZD': '阿尔及利亚第纳尔', 'EGP': '埃及镑',
    'ERN': '厄立特里亚纳克法', 'ETB': '埃塞俄比亚比尔', 'FJD': '斐济元', 'FKP': '福克兰群岛镑',
    'FOK': '法罗群岛克朗', 'GEL': '格鲁吉亚拉里', 'GGP': '根西岛镑', 'GHS': '加纳塞地',
    'GIP': '直布罗陀镑', 'GMD': '冈比亚达拉西', 'GNF': '几内亚法郎', 'GTQ': '危地马拉格查尔',
    'GYD': '圭亚那元', 'HNL': '洪都拉斯伦皮拉', 'HRK': '克罗地亚库纳', 'HTG': '海地古德',
    'HUF': '匈牙利福林', 'IDR': '印尼盾', 'ILS': '以色列新谢克尔', 'IMP': '马恩岛镑',
    'INR': '印度卢比', 'IQD': '伊拉克第纳尔', 'IRR': '伊朗里亚尔', 'ISK': '冰岛克朗',
    'JEP': '泽西岛镑', 'JMD': '牙买加元', 'JOD': '约旦第纳尔', 'KES': '肯尼亚先令',
    'KGS': '吉尔吉斯斯坦索姆', 'KHR': '柬埔寨瑞尔', 'KID': '基里巴斯元', 'KMF': '科摩罗法郎',
    'KWD': '科威特第纳尔', 'KYD': '开曼群岛元', 'KZT': '哈萨克斯坦坚戈', 'LAK': '老挝基普',
    'LBP': '黎巴嫩镑', 'LKR': '斯里兰卡卢比', 'LRD': '利比里亚元', 'LSL': '莱索托洛蒂',
    'LYD': '利比亚第纳尔', 'MAD': '摩洛哥迪拉姆', 'MDL': '摩尔多瓦列伊', 'MGA': '马达加斯加阿里亚里',
    'MKD': '北马其顿第纳尔', 'MMK': '缅甸缅元', 'MNT': '蒙古图格里克', 'MOP': '澳门帕塔卡',
    'MRU': '毛里塔尼亚乌吉亚', 'MUR': '毛里求斯卢比', 'MVR': '马尔代夫拉菲亚', 'MWK': '马拉维克瓦查',
    'MXN': '墨西哥比索', 'MYR': '马来西亚林吉特', 'MZN': '莫桑比克梅蒂卡尔', 'NAD': '纳米比亚元',
    'NGN': '尼日利亚奈拉', 'NIO': '尼加拉瓜科多巴', 'NOK': '挪威克朗', 'NPR': '尼泊尔卢比',
    'NZD': '新西兰元', 'OMR': '阿曼里亚尔', 'PAB': '巴拿马巴波亚', 'PEN': '秘鲁索尔',
    'PGK': '巴布亚新几内亚基那', 'PHP': '菲律宾比索', 'PKR': '巴基斯坦卢比', 'PLN': '波兰兹罗提',
    'PYG': '巴拉圭瓜拉尼', 'QAR': '卡塔尔里亚尔', 'RON': '罗马尼亚列伊', 'RSD': '塞尔维亚第纳尔',
    'RUB': '俄罗斯卢布', 'RWF': '卢旺达法郎', 'SAR': '沙特里亚尔', 'SBD': '所罗门群岛元',
    'SCR': '塞舌尔卢比', 'SDG': '苏丹镑', 'SEK': '瑞典克朗', 'SHP': '圣赫勒拿镑',
    'SLE': '塞拉利昂利昂', 'SLL': '塞拉利昂利昂(旧)', 'SOS': '索马里先令', 'SRD': '苏里南元',
    'SSP': '南苏丹镑', 'STN': '圣多美和普林西比多布拉', 'SYP': '叙利亚镑', 'SZL': '斯威士兰里兰吉尼',
    'TJS': '塔吉克斯坦索莫尼', 'TMT': '土库曼斯坦马纳特', 'TND': '突尼斯第纳尔', 'TOP': '汤加潘加',
    'TRY': '土耳其里拉', 'TTD': '特立尼达和多巴哥元', 'TVD': '图瓦卢元', 'TWD': '新台币',
    'TZS': '坦桑尼亚先令', 'UAH': '乌克兰格里夫纳', 'UGX': '乌干达先令', 'UYU': '乌拉圭比索',
    'UZS': '乌兹别克斯坦苏姆', 'VES': '委内瑞拉玻利瓦尔', 'VND': '越南盾', 'VUV': '瓦努阿图瓦图',
    'WST': '萨摩亚塔拉', 'XAF': '中非法郎', 'XCD': '东加勒比元', 'XCG': '加勒比盾',
    'XDR': '特别提款权', 'XOF': '西非法郎', 'XPF': '太平洋法郎', 'YER': '也门里亚尔',
    'ZAR': '南非兰特', 'ZMW': '赞比亚克瓦查', 'ZWL': '津巴布韦元'
};

// 货币旗帜映射
const CURRENCY_FLAGS = {
    'CNY': '🇨🇳', 'USD': '🇺🇸', 'EUR': '🇪🇺', 'JPY': '🇯🇵', 'GBP': '🇬🇧',
    'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭', 'HKD': '🇭🇰', 'SGD': '🇸🇬',
    'KRW': '🇰🇷', 'THB': '🇹🇭', 'AED': '🇦🇪', 'AFN': '🇦🇫', 'ALL': '🇦🇱',
    'AMD': '🇦🇲', 'ANG': '🇳🇱', 'AOA': '🇦🇴', 'ARS': '🇦🇷', 'AWG': '🇦🇼',
    'AZN': '🇦🇿', 'BAM': '🇧🇦', 'BBD': '🇧🇧', 'BDT': '🇧🇩', 'BGN': '🇧🇬',
    'BHD': '🇧🇭', 'BIF': '🇧🇮', 'BMD': '🇧🇲', 'BND': '🇧🇳', 'BOB': '🇧🇴',
    'BRL': '🇧🇷', 'BSD': '🇧🇸', 'BTN': '🇧🇹', 'BWP': '🇧🇼', 'BYN': '🇧🇾',
    'BZD': '🇧🇿', 'CDF': '🇨🇩', 'CLP': '🇨🇱', 'COP': '🇨🇴', 'CRC': '🇨🇷',
    'CUP': '🇨🇺', 'CVE': '🇨🇻', 'CZK': '🇨🇿', 'DJF': '🇩🇯', 'DKK': '🇩🇰',
    'DOP': '🇩🇴', 'DZD': '🇩🇿', 'EGP': '🇪🇬', 'ERN': '🇪🇷', 'ETB': '🇪🇹',
    'FJD': '🇫🇯', 'FKP': '🇫🇰', 'FOK': '🇫🇴', 'GEL': '🇬🇪', 'GGP': '🇬🇬',
    'GHS': '🇬🇭', 'GIP': '🇬🇮', 'GMD': '🇬🇲', 'GNF': '🇬🇳', 'GTQ': '🇬🇹',
    'GYD': '🇬🇾', 'HNL': '🇭🇳', 'HRK': '🇭🇷', 'HTG': '🇭🇹', 'HUF': '🇭🇺',
    'IDR': '🇮🇩', 'ILS': '🇮🇱', 'IMP': '🇮🇲', 'INR': '🇮🇳', 'IQD': '🇮🇶',
    'IRR': '🇮🇷', 'ISK': '🇮🇸', 'JEP': '🇯🇪', 'JMD': '🇯🇲', 'JOD': '🇯🇴',
    'KES': '🇰🇪', 'KGS': '🇰🇬', 'KHR': '🇰🇭', 'KID': '🇰🇮', 'KMF': '🇰🇲',
    'KWD': '🇰🇼', 'KYD': '🇰🇾', 'KZT': '🇰🇿', 'LAK': '🇱🇦', 'LBP': '🇱🇧',
    'LKR': '🇱🇰', 'LRD': '🇱🇷', 'LSL': '🇱🇸', 'LYD': '🇱🇾', 'MAD': '🇲🇦',
    'MDL': '🇲🇩', 'MGA': '🇲🇬', 'MKD': '🇲🇰', 'MMK': '🇲🇲', 'MNT': '🇲🇳',
    'MOP': '🇲🇴', 'MRU': '🇲🇷', 'MUR': '🇲🇺', 'MVR': '🇲🇻', 'MWK': '🇲🇼',
    'MXN': '🇲🇽', 'MYR': '🇲🇾', 'MZN': '🇲🇿', 'NAD': '🇳🇦', 'NGN': '🇳🇬',
    'NIO': '🇳🇮', 'NOK': '🇳🇴', 'NPR': '🇳🇵', 'NZD': '🇳🇿', 'OMR': '🇴🇲',
    'PAB': '🇵🇦', 'PEN': '🇵🇪', 'PGK': '🇵🇬', 'PHP': '🇵🇭', 'PKR': '🇵🇰',
    'PLN': '🇵🇱', 'PYG': '🇵🇾', 'QAR': '🇶🇦', 'RON': '🇷🇴', 'RSD': '🇷🇸',
    'RUB': '🇷🇺', 'RWF': '🇷🇼', 'SAR': '🇸🇦', 'SBD': '🇸🇧', 'SCR': '🇸🇨',
    'SDG': '🇸🇩', 'SEK': '🇸🇪', 'SHP': '🇸🇭', 'SLE': '🇸🇱', 'SLL': '🇸🇱',
    'SOS': '🇸🇴', 'SRD': '🇸🇷', 'SSP': '🇸🇸', 'STN': '🇸🇹', 'SYP': '🇸🇾',
    'SZL': '🇸🇿', 'TJS': '🇹🇯', 'TMT': '🇹🇲', 'TND': '🇹🇳', 'TOP': '🇹🇴',
    'TRY': '🇹🇷', 'TTD': '🇹🇹', 'TVD': '🇹🇻', 'TWD': '🇹🇼', 'TZS': '🇹🇿',
    'UAH': '🇺🇦', 'UGX': '🇺🇬', 'UYU': '🇺🇾', 'UZS': '🇺🇿', 'VES': '🇻🇪',
    'VND': '🇻🇳', 'VUV': '🇻🇺', 'WST': '🇼🇸', 'XAF': '🌍', 'XCD': '🏝️',
    'XCG': '🏝️', 'XDR': '🌐', 'XOF': '🌍', 'XPF': '🌊', 'YER': '🇾🇪',
    'ZAR': '🇿🇦', 'ZMW': '🇿🇲', 'ZWL': '🇿🇼'
};

// DOM元素
let elements = {};
let currentRates = [];
let filteredRates = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initElements();
    initCurrencySelector();
    bindEvents();
    loadExchangeRates();
});

// 初始化DOM元素
function initElements() {
    elements = {
        currencySelect: document.getElementById('currency-select'),
        searchInput: document.getElementById('search-input'),
        loading: document.getElementById('loading'),
        content: document.getElementById('exchange-content'),
        baseCurrency: document.getElementById('base-currency'),
        updateTime: document.getElementById('update-time'),
        ratesGrid: document.getElementById('rates-grid'),
        totalCurrencies: document.getElementById('total-currencies'),
        lastUpdate: document.getElementById('last-update')
    };
}

// 初始化货币选择器
function initCurrencySelector() {
    if (!elements.currencySelect) return;
    
    // 添加常用货币选项
    POPULAR_CURRENCIES.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.code;
        option.textContent = `${currency.flag} ${currency.code} - ${currency.name}`;
        if (currency.code === API.defaultCurrency) {
            option.selected = true;
        }
        elements.currencySelect.appendChild(option);
    });
}

// 绑定事件
function bindEvents() {
    // 货币选择变化
    if (elements.currencySelect) {
        elements.currencySelect.addEventListener('change', function() {
            loadExchangeRates(this.value);
        });
    }
    
    // 搜索功能
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', function() {
            filterRates(this.value);
        });
    }
}

// 加载汇率数据
async function loadExchangeRates(currency = API.defaultCurrency) {
    try {
        showLoading(true);
        
        // 尝试从API获取数据
        const data = await fetchFromAPI(currency);
        
        if (data && data.code === 200 && data.data) {
            currentRates = data.data.rates || [];
            displayExchangeRates(data.data);
        } else {
            // 尝试从本地获取数据
            const localData = await fetchFromLocal();
            if (localData && localData.code === 200 && localData.data) {
                currentRates = localData.data.rates || [];
                displayExchangeRates(localData.data);
                showError('使用本地数据，可能不是最新汇率');
            } else {
                throw new Error('无法获取汇率数据');
            }
        }
        
    } catch (error) {
        console.error('加载汇率失败:', error);
        showError('加载汇率数据失败，请稍后重试');
    } finally {
        showLoading(false);
    }
}

// 从API获取数据
async function fetchFromAPI(currency) {
    // 初始化API接口列表
    await API.init();
    
    // 重置API索引到第一个接口
    API.reset();
    
    // 尝试所有API接口
    for (let i = 0; i < API.endpoints.length; i++) {
        try {
            const url = API.getCurrentUrl(currency);
            console.log(`尝试接口 ${i + 1}/${API.endpoints.length}: ${url}`);
            
            const response = await fetch(url, { 
                cache: 'no-store'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && data.code === 200) {
                console.log(`接口 ${i + 1} 请求成功`);
                return data;
            }
            
            throw new Error(data && data.message ? data.message : '接口返回异常');
            
        } catch (e) {
            console.warn(`接口 ${i + 1} 失败:`, e.message);
            
            // 如果不是最后一个接口，切换到下一个
            if (i < API.endpoints.length - 1) {
                API.switchToNext();
                continue;
            }
            
            // 所有接口都失败了
            console.warn('所有远程接口都失败，尝试本地数据');
            return null;
        }
    }
}

// 从本地获取数据
async function fetchFromLocal() {
    try {
        const response = await fetch(API.localFallback + `?t=${Date.now()}`);
        if (!response.ok) throw new Error(`本地文件HTTP ${response.status}`);
        const data = await response.json();
        return data;
    } catch (e) {
        console.error('读取本地返回接口.json失败:', e);
        return null;
    }
}

// 显示汇率数据
function displayExchangeRates(data) {
    if (!data || !data.rates) {
        showError('没有获取到汇率数据');
        return;
    }
    
    // 更新基础货币信息
    if (elements.baseCurrency) {
        const baseCurrencyName = CURRENCY_NAMES[data.base_code] || data.base_code;
        const baseCurrencyFlag = CURRENCY_FLAGS[data.base_code] || '💱';
        elements.baseCurrency.textContent = `${baseCurrencyFlag} ${data.base_code} - ${baseCurrencyName}`;
    }
    
    // 更新时间信息
    if (elements.updateTime && data.updated) {
        elements.updateTime.textContent = `更新时间: ${data.updated}`;
    }
    
    // 更新统计信息
    updateStats(data);
    
    // 显示汇率列表
    filteredRates = data.rates;
    renderRates(filteredRates);
    
    // 显示内容区域
    if (elements.content) {
        elements.content.classList.add('fade-in');
        elements.content.style.display = 'block';
    }
}

// 更新统计信息
function updateStats(data) {
    if (elements.totalCurrencies) {
        elements.totalCurrencies.textContent = data.rates ? data.rates.length : 0;
    }
    
    if (elements.lastUpdate && data.updated) {
        elements.lastUpdate.textContent = data.updated;
    }
}

// 渲染汇率列表
function renderRates(rates) {
    if (!elements.ratesGrid || !rates) return;
    
    // 按优先级排序货币
    const sortedRates = [...rates].sort((a, b) => {
        const priorityA = CURRENCY_PRIORITY[a.currency] || 999;
        const priorityB = CURRENCY_PRIORITY[b.currency] || 999;
        
        // 优先级相同时按货币代码字母顺序排序
        if (priorityA === priorityB) {
            return a.currency.localeCompare(b.currency);
        }
        
        return priorityA - priorityB;
    });
    
    elements.ratesGrid.innerHTML = '';
    
    sortedRates.forEach(rate => {
        const rateCard = createRateCard(rate);
        elements.ratesGrid.appendChild(rateCard);
    });
}

// 创建汇率卡片
function createRateCard(rate) {
    const card = document.createElement('div');
    card.className = 'rate-card';
    
    const currencyName = CURRENCY_NAMES[rate.currency] || rate.currency;
    const currencyFlag = CURRENCY_FLAGS[rate.currency] || '💱';
    
    card.innerHTML = `
        <div class="currency-code">
            <span class="currency-flag">${currencyFlag}</span>
            ${rate.currency}
        </div>
        <div class="exchange-rate">${formatRate(rate.rate)}</div>
        <div class="currency-name">${currencyName}</div>
    `;
    
    return card;
}

// 格式化汇率
function formatRate(rate) {
    if (rate >= 1) {
        return rate.toFixed(4);
    } else if (rate >= 0.01) {
        return rate.toFixed(6);
    } else {
        return rate.toFixed(8);
    }
}

// 过滤汇率数据
function filterRates(searchTerm) {
    if (!searchTerm.trim()) {
        renderRates(currentRates);
        return;
    }
    
    const filtered = currentRates.filter(rate => {
        const currencyName = CURRENCY_NAMES[rate.currency] || rate.currency;
        return rate.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
               currencyName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    renderRates(filtered);
}

// 显示/隐藏加载状态
function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? 'block' : 'none';
    }
    if (elements.content) {
        elements.content.style.display = show ? 'none' : 'block';
    }
}

// 显示错误信息
function showError(message) {
    if (elements.content) {
        elements.content.innerHTML = `
            <div class="error">
                <h3>⚠️ 加载失败</h3>
                <p>${escapeHtml(message)}</p>
                <p>请检查网络连接或稍后重试</p>
            </div>
        `;
        elements.content.style.display = 'block';
    }
}

// HTML转义
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('页面错误:', event.error);
});

// 网络状态监听
window.addEventListener('online', function() {
    console.log('网络已连接');
});

window.addEventListener('offline', function() {
    console.log('网络已断开');
    showError('网络连接已断开，请检查网络设置');
});

// 导出函数供外部调用
window.ExchangeRate = {
    loadExchangeRates,
    showError,
    showLoading
};