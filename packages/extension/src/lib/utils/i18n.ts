/**
 * Internationalization utilities
 */

export type Locale = 'zh-CN' | 'zh-TW' | 'en';

interface Messages {
  [key: string]: string;
}

const messages: Record<Locale, Messages> = {
  'zh-CN': {
    'app.name': '小查馆',
    'app.tagline': 'AI 多语种事实核查',
    'verify.button': '验证',
    'verify.placeholder': '输入需要验证的内容...',
    'verify.verifying': '验证中...',
    'verify.result.true': '真实',
    'verify.result.false': '虚假',
    'verify.result.partly_true': '部分真实',
    'verify.result.unverified': '无法验证',
    'connection.connected': '已连接',
    'connection.connecting': '连接中...',
    'connection.disconnected': '未连接',
    'connection.error': '连接错误',
    'connection.offline': '离线模式',
    'settings.title': '设置',
    'settings.language': '语言',
    'settings.network': '网络设置',
    'settings.cache': '缓存管理',
    'settings.clearCache': '清除缓存',
    'history.title': '历史记录',
    'history.empty': '暂无验证记录',
    'stats.title': '统计',
    'stats.totalVerifications': '总验证次数',
    'stats.cacheHitRate': '缓存命中率',
    'error.networkError': '网络错误，请稍后重试',
    'error.apiError': 'API 错误',
    'error.unknown': '未知错误',
  },
  'zh-TW': {
    'app.name': '小查館',
    'app.tagline': 'AI 多語種事實核查',
    'verify.button': '驗證',
    'verify.placeholder': '輸入需要驗證的內容...',
    'verify.verifying': '驗證中...',
    'verify.result.true': '真實',
    'verify.result.false': '虛假',
    'verify.result.partly_true': '部分真實',
    'verify.result.unverified': '無法驗證',
    'connection.connected': '已連接',
    'connection.connecting': '連接中...',
    'connection.disconnected': '未連接',
    'connection.error': '連接錯誤',
    'connection.offline': '離線模式',
    'settings.title': '設定',
    'settings.language': '語言',
    'settings.network': '網路設定',
    'settings.cache': '快取管理',
    'settings.clearCache': '清除快取',
    'history.title': '歷史紀錄',
    'history.empty': '暫無驗證紀錄',
    'stats.title': '統計',
    'stats.totalVerifications': '總驗證次數',
    'stats.cacheHitRate': '快取命中率',
    'error.networkError': '網路錯誤，請稍後重試',
    'error.apiError': 'API 錯誤',
    'error.unknown': '未知錯誤',
  },
  en: {
    'app.name': 'XiaoChaGuan',
    'app.tagline': 'AI Multilingual Fact-Checker',
    'verify.button': 'Verify',
    'verify.placeholder': 'Enter text to verify...',
    'verify.verifying': 'Verifying...',
    'verify.result.true': 'True',
    'verify.result.false': 'False',
    'verify.result.partly_true': 'Partly True',
    'verify.result.unverified': 'Unverified',
    'connection.connected': 'Connected',
    'connection.connecting': 'Connecting...',
    'connection.disconnected': 'Disconnected',
    'connection.error': 'Connection Error',
    'connection.offline': 'Offline Mode',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.network': 'Network',
    'settings.cache': 'Cache',
    'settings.clearCache': 'Clear Cache',
    'history.title': 'History',
    'history.empty': 'No verification history',
    'stats.title': 'Statistics',
    'stats.totalVerifications': 'Total Verifications',
    'stats.cacheHitRate': 'Cache Hit Rate',
    'error.networkError': 'Network error, please try again',
    'error.apiError': 'API Error',
    'error.unknown': 'Unknown Error',
  },
};

let currentLocale: Locale = 'zh-CN';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string>): string {
  let message = messages[currentLocale][key] || messages['en'][key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      message = message.replace(`{${k}}`, v);
    });
  }

  return message;
}

export function detectBrowserLocale(): Locale {
  const browserLang = navigator.language;

  if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK')) {
    return 'zh-TW';
  }
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en';
}
