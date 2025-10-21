// xiaochaguan-website/src/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';

// 组件导入
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import TrendingClaims from './components/TrendingClaims';
import RecentFactChecks from './components/RecentFactChecks';
import VerificationModal from './components/VerificationModal';
import Footer from './components/Footer';
import NetworkStatus from './components/NetworkStatus';

// 类型定义
interface Claim {
  id: string;
  text: string;
  verdict: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence: number;
  checkedAt: string;
  category: string;
  language: string;
  sources: number;
}

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'restricted' | 'offline'>('connected');
  const [language, setLanguage] = useState<'zh-CN' | 'en'>('zh-CN');

  useEffect(() => {
    // 检测网络状态
    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkNetworkStatus = async () => {
    try {
      // 尝试访问API
      const response = await fetch('/api/status', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      
      if (response.ok) {
        setNetworkStatus('connected');
      } else {
        setNetworkStatus('restricted');
      }
    } catch {
      setNetworkStatus('offline');
    }
  };

  const handleSearch = async (query: string) => {
    setIsVerifying(true);
    try {
      // API调用逻辑
      const result = await verifyClaimAPI(query);
      setSelectedClaim(result);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyClaimAPI = async (text: string): Promise<Claim> => {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          text,
          verdict: 'misleading',
          confidence: 0.78,
          checkedAt: new Date().toISOString(),
          category: 'politics',
          language: 'zh-CN',
          sources: 5
        });
      }, 2000);
    });
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* 网络状态提示 */}
      <NetworkStatus status={networkStatus} />

      {/* 头部导航 */}
      <Header 
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* 主要内容区 */}
      <main className="main-content">
        {/* Hero区域 */}
        <Hero />

        {/* 搜索栏 */}
        <SearchBar 
          onSearch={handleSearch}
          isLoading={isVerifying}
          placeholder={language === 'zh-CN' 
            ? "输入您想要验证的信息..." 
            : "Enter information to verify..."}
        />

        {/* 功能展示区 */}
        <div className="features-grid">
          <FeatureCard
            icon="🔍"
            title={language === 'zh-CN' ? "智能检测" : "Smart Detection"}
            description={language === 'zh-CN' 
              ? "自动识别可疑声明和误导性信息" 
              : "Automatically identify suspicious claims"}
          />
          <FeatureCard
            icon="🌐"
            title={language === 'zh-CN' ? "多语种支持" : "Multilingual"}
            description={language === 'zh-CN' 
              ? "支持中文、英文等多种语言验证" 
              : "Support Chinese, English and more"}
          />
          <FeatureCard
            icon="🔒"
            title={language === 'zh-CN' ? "隐私优先" : "Privacy First"}
            description={language === 'zh-CN' 
              ? "本地缓存，保护您的查询隐私" 
              : "Local cache to protect your privacy"}
          />
          <FeatureCard
            icon="⚡"
            title={language === 'zh-CN' ? "实时验证" : "Real-time"}
            description={language === 'zh-CN' 
              ? "快速验证，几秒内获得结果" 
              : "Fast verification in seconds"}
          />
        </div>

        {/* 热门验证 */}
        <section className="trending-section">
          <h2 className="section-title">
            {language === 'zh-CN' ? "🔥 热门验证" : "🔥 Trending Checks"}
          </h2>
          <TrendingClaims language={language} />
        </section>

        {/* 最近事实核查 */}
        <section className="recent-section">
          <h2 className="section-title">
            {language === 'zh-CN' ? "📋 最新核查结果" : "📋 Recent Fact Checks"}
          </h2>
          <RecentFactChecks language={language} />
        </section>

        {/* 统计数据 */}
        <section className="stats-section">
          <StatCard number="100K+" label={language === 'zh-CN' ? "验证次数" : "Verifications"} />
          <StatCard number="50K+" label={language === 'zh-CN' ? "活跃用户" : "Active Users"} />
          <StatCard number="95%" label={language === 'zh-CN' ? "准确率" : "Accuracy"} />
          <StatCard number="3s" label={language === 'zh-CN' ? "平均响应" : "Avg Response"} />
        </section>

        {/* 工作原理 */}
        <section className="how-it-works">
          <h2 className="section-title">
            {language === 'zh-CN' ? "🎯 工作原理" : "🎯 How It Works"}
          </h2>
          <div className="steps">
            <Step 
              number="1" 
              title={language === 'zh-CN' ? "输入信息" : "Input Text"}
              description={language === 'zh-CN' 
                ? "粘贴或输入您想要验证的文本" 
                : "Paste or type text to verify"}
            />
            <Step 
              number="2" 
              title={language === 'zh-CN' ? "智能分析" : "Analysis"}
              description={language === 'zh-CN' 
                ? "AI分析文本并搜索相关证据" 
                : "AI analyzes and searches evidence"}
            />
            <Step 
              number="3" 
              title={language === 'zh-CN' ? "验证结果" : "Results"}
              description={language === 'zh-CN' 
                ? "展示验证结果和可信度评分" 
                : "Show verification and confidence"}
            />
            <Step 
              number="4" 
              title={language === 'zh-CN' ? "查看证据" : "Evidence"}
              description={language === 'zh-CN' 
                ? "提供详细的证据来源链接" 
                : "Provide detailed source links"}
            />
          </div>
        </section>

        {/* 合作伙伴 */}
        <section className="partners">
          <h2 className="section-title">
            {language === 'zh-CN' ? "🤝 数据来源" : "🤝 Data Sources"}
          </h2>
          <div className="partners-grid">
            <PartnerLogo name="Wikipedia" />
            <PartnerLogo name="Google Scholar" />
            <PartnerLogo name="PubMed" />
            <PartnerLogo name="arXiv" />
            <PartnerLogo name="CrossRef" />
            <PartnerLogo name="IFCN" />
          </div>
        </section>
      </main>

      {/* 验证详情弹窗 */}
      {selectedClaim && (
        <VerificationModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          language={language}
        />
      )}

      {/* 页脚 */}
      <Footer language={language} />

      {/* 浮动操作按钮 */}
      <div className="fab-container">
        <button className="fab-extension" title="安装浏览器插件">
          🧩
        </button>
        <button className="fab-help" title="帮助">
          ❓
        </button>
      </div>
    </div>
  );
};

// 子组件
const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

const StatCard: React.FC<{ number: string; label: string }> = ({ number, label }) => (
  <div className="stat-card">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const Step: React.FC<{ number: string; title: string; description: string }> = ({ 
  number, 
  title, 
  description 
}) => (
  <div className="step">
    <div className="step-number">{number}</div>
    <div className="step-content">
      <h4 className="step-title">{title}</h4>
      <p className="step-description">{description}</p>
    </div>
  </div>
);

const PartnerLogo: React.FC<{ name: string }> = ({ name }) => (
  <div className="partner-logo">
    <div className="partner-placeholder">{name}</div>
  </div>
);

export default App;
