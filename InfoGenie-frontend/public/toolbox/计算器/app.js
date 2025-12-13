(() => {
  const { createApp, ref, computed, watch } = Vue;

  // 检测是否可用 Math.js
  const hasMath = typeof math !== 'undefined';
  if (hasMath) {
    math.config({ number: 'BigNumber', precision: 64 });
  }

  // 保存原始三角函数以便覆盖时调用
  const originalSin = hasMath ? math.sin : null;
  const originalCos = hasMath ? math.cos : null;
  const originalTan = hasMath ? math.tan : null;

  // 角度转换因子（deg -> rad）
  const RAD_FACTOR = hasMath ? math.divide(math.pi, math.bignumber(180)) : (Math.PI / 180);

  // 动态角度模式变量供三角函数使用
  let angleModeVar = 'deg';

  function sinWrapper(x) {
    try {
      if (angleModeVar === 'deg') {
        const xr = hasMath ? math.multiply(x, RAD_FACTOR) : (Number(x) * RAD_FACTOR);
        return hasMath ? originalSin(xr) : Math.sin(xr);
      }
      return hasMath ? originalSin(x) : Math.sin(Number(x));
    } catch (e) { throw e; }
  }
  function cosWrapper(x) {
    try {
      if (angleModeVar === 'deg') {
        const xr = hasMath ? math.multiply(x, RAD_FACTOR) : (Number(x) * RAD_FACTOR);
        return hasMath ? originalCos(xr) : Math.cos(xr);
      }
      return hasMath ? originalCos(x) : Math.cos(Number(x));
    } catch (e) { throw e; }
  }
  function tanWrapper(x) {
    try {
      if (angleModeVar === 'deg') {
        const xr = hasMath ? math.multiply(x, RAD_FACTOR) : (Number(x) * RAD_FACTOR);
        return hasMath ? originalTan(xr) : Math.tan(xr);
      }
      return hasMath ? originalTan(x) : Math.tan(Number(x));
    } catch (e) { throw e; }
  }

  // 覆盖三角函数以支持角度模式（Math.js 可用时）
  if (hasMath) {
    math.import({ sin: sinWrapper, cos: cosWrapper, tan: tanWrapper }, { override: true });
  }

  function formatBig(value) {
    try {
      if (value == null) return '';
      if (hasMath) {
        return math.format(value, {
          notation: 'auto',
          precision: 14,
          lowerExp: -6,
          upperExp: 15,
        });
      } else {
        const num = typeof value === 'number' ? value : Number(value);
        if (!isFinite(num)) return '错误';
        const str = num.toFixed(12);
        return str.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
      }
    } catch (e) {
      return String(value);
    }
  }

  function normalize(exp) {
    // 将显示符号标准化为计算符号，保留原字符不做删除
    return exp
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/√/g, 'sqrt');
  }

  createApp({
    setup() {
      const expression = ref('');
      const result = ref(hasMath ? math.bignumber(0) : 0);
      const errorMsg = ref('');
      const lastAns = ref(hasMath ? math.bignumber(0) : 0);
      const angleMode = ref('deg');

      watch(angleMode, (val) => { angleModeVar = val; });

      const formattedExpression = computed(() => expression.value || '0');
      const formattedResult = computed(() => errorMsg.value ? '' : formatBig(result.value));

      function isParenthesesBalanced(s) {
        let count = 0;
        for (const ch of s) {
          if (ch === '(') count++;
          else if (ch === ')') count--;
          if (count < 0) return false;
        }
        return count === 0;
      }

      function safeEvaluate(exp) {
        errorMsg.value = '';
        try {
          const s = normalize(exp);
          if (!s) { result.value = hasMath ? math.bignumber(0) : 0; return result.value; }
          // 检测非法字符：仅允许数字、运算符、括号、字母（用于函数和ANS），以及空白
          if (/[^0-9\.\+\-\*\/\^\(\)a-zA-Z\s]/.test(s)) { throw new Error('错误'); }
          if (!isParenthesesBalanced(s)) throw new Error('错误');
          if (hasMath) {
            const scope = { ANS: lastAns.value };
            const res = math.evaluate(s, scope);
            // 防止除以零等无效情况
            if (res && res.isFinite && !res.isFinite()) { throw new Error('错误'); }
            result.value = res;
            return res;
          } else {
            // 原生回退：将表达式映射到安全本地函数
            let expr = s
              .replace(/\^/g, '**')
              .replace(/sin\(/g, '__sin(')
              .replace(/cos\(/g, '__cos(')
              .replace(/tan\(/g, '__tan(')
              .replace(/sqrt\(/g, '__sqrt(')
              .replace(/\bANS\b/g, String(lastAns.value));
            // 严格校验（只允许安全字符）
            if (/[^0-9+\-*/()._^a-zA-Z\s]/.test(expr)) throw new Error('错误');
            // 定义本地安全函数
            const __sqrt = (x) => Math.sqrt(Number(x));
            const __sin = (x) => angleModeVar === 'deg' ? Math.sin(Number(x) * Math.PI / 180) : Math.sin(Number(x));
            const __cos = (x) => angleModeVar === 'deg' ? Math.cos(Number(x) * Math.PI / 180) : Math.cos(Number(x));
            const __tan = (x) => angleModeVar === 'deg' ? Math.tan(Number(x) * Math.PI / 180) : Math.tan(Number(x));
            const res = Function('__sqrt','__sin','__cos','__tan', `"use strict"; return (${expr});`)(__sqrt,__sin,__cos,__tan);
            if (!isFinite(res)) throw new Error('错误');
            result.value = res;
            return res;
          }
        } catch (err) {
          errorMsg.value = '错误';
          return null;
        }
      }

      watch(expression, (exp) => { safeEvaluate(exp); });

      function press(token) {
        // 避免连续两个小数点
        if (token === '.' && expression.value.slice(-1) === '.') return;
        expression.value += token;
      }

      function op(opSymbol) {
        const last = expression.value.slice(-1);
        if (/[\+\-×÷\*\/\^]/.test(last)) {
          expression.value = expression.value.slice(0, -1) + opSymbol;
        } else {
          expression.value += opSymbol;
        }
      }

      function func(fn) {
        const map = { sqrt: 'sqrt', sin: 'sin', cos: 'cos', tan: 'tan' };
        const f = map[fn] || fn;
        expression.value += f + '(';
      }

      function square() {
        expression.value += '^2';
      }

      function backspace() {
        if (!expression.value) return;
        expression.value = expression.value.slice(0, -1);
      }

      function clear() {
        expression.value = '';
        result.value = math.bignumber(0);
        errorMsg.value = '';
      }

      function equals() {
        const res = safeEvaluate(expression.value);
        if (res != null) {
          lastAns.value = res;
          expression.value = formatBig(res);
          result.value = res;
        }
      }

      function ans() {
        expression.value += 'ANS';
      }

      function setAngle(mode) {
        angleMode.value = mode;
      }

      // 初始计算
      safeEvaluate(expression.value);

      return {
        expression,
        result,
        errorMsg,
        formattedExpression,
        formattedResult,
        angleMode,
        setAngle,
        press,
        op,
        func,
        clear,
        backspace,
        equals,
        square,
        ans,
      };
    },
  }).mount('#app');
})();