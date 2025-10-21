<script lang="ts">
  // popup.svelte - 扩展弹出界面
  import { onMount } from "svelte"
  import { sendToBackground } from "@plasmohq/messaging"
  import ConnectionStatus from "./components/ConnectionStatus.svelte"
  import QuickVerify from "./components/QuickVerify.svelte"
  import RecentChecks from "./components/RecentChecks.svelte"
  import Statistics from "./components/Statistics.svelte"
  import Settings from "./components/Settings.svelte"
  
  // 状态管理
  let activeTab = "verify"
  let connectionStatus = { isConnected: false, isRestricted: false, mode: "checking" }
  let statistics = { totalVerifications: 0, todayVerifications: 0 }
  let recentChecks = []
  let settings = {}
  let isLoading = true
  
  // 标签页配置
  const tabs = [
    { id: "verify", label: "快速验证", icon: "🔍" },
    { id: "recent", label: "最近检查", icon: "📋" },
    { id: "stats", label: "统计", icon: "📊" },
    { id: "settings", label: "设置", icon: "⚙️" }
  ]
  
  onMount(async () => {
    await loadData()
    // 定期更新连接状态
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  })
  
  async function loadData() {
    isLoading = true
    try {
      // 并行加载所有数据
      const [conn, stats, recent, sett] = await Promise.all([
        checkConnection(),
        loadStatistics(),
        loadRecentChecks(),
        loadSettings()
      ])
      
      connectionStatus = conn
      statistics = stats
      recentChecks = recent
      settings = sett
    } finally {
      isLoading = false
    }
  }
  
  async function checkConnection() {
    try {
      const response = await sendToBackground({
        name: "connection-check",
        body: { type: "CHECK_CONNECTION" }
      })
      return response
    } catch {
      return { isConnected: false, isRestricted: false, mode: "error" }
    }
  }
  
  async function loadStatistics() {
    try {
      const response = await sendToBackground({
        name: "get-stats",
        body: { type: "GET_STATISTICS" }
      })
      return response || { totalVerifications: 0, todayVerifications: 0 }
    } catch {
      return { totalVerifications: 0, todayVerifications: 0 }
    }
  }
  
  async function loadRecentChecks() {
    try {
      const response = await sendToBackground({
        name: "get-recent",
        body: { type: "GET_RECENT_CHECKS" }
      })
      return response || []
    } catch {
      return []
    }
  }
  
  async function loadSettings() {
    try {
      const response = await sendToBackground({
        name: "get-settings",
        body: { type: "GET_SETTINGS" }
      })
      return response || {}
    } catch {
      return {}
    }
  }
  
  function handleTabChange(tabId: string) {
    activeTab = tabId
  }
  
  async function handleVerificationComplete(result: any) {
    // 更新最近检查列表
    recentChecks = [result, ...recentChecks.slice(0, 9)]
    // 更新统计
    statistics.totalVerifications++
    statistics.todayVerifications++
  }
  
  async function handleSettingsUpdate(newSettings: any) {
    settings = newSettings
    await sendToBackground({
      name: "update-settings",
      body: { type: "UPDATE_SETTINGS", data: newSettings }
    })
  }
  
  function openWebsite() {
    chrome.tabs.create({ url: "https://xiaochaguan.app" })
  }
  
  function openHelp() {
    chrome.tabs.create({ url: "https://xiaochaguan.app/help" })
  }
</script>

<main class="popup-container">
  <!-- 头部 -->
  <header class="header">
    <div class="logo-section">
      <img src="/icon48.png" alt="小查馆" class="logo" />
      <div class="title-section">
        <h1 class="title">小查馆</h1>
        <p class="subtitle">智能事实核查助手</p>
      </div>
    </div>
    <ConnectionStatus status={connectionStatus} />
  </header>

  <!-- 标签导航 -->
  <nav class="tab-nav">
    {#each tabs as tab}
      <button
        class="tab-button"
        class:active={activeTab === tab.id}
        on:click={() => handleTabChange(tab.id)}
      >
        <span class="tab-icon">{tab.icon}</span>
        <span class="tab-label">{tab.label}</span>
      </button>
    {/each}
  </nav>

  <!-- 内容区域 -->
  <div class="content">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    {:else}
      {#if activeTab === "verify"}
        <QuickVerify 
          onComplete={handleVerificationComplete}
          connectionStatus={connectionStatus}
        />
      {:else if activeTab === "recent"}
        <RecentChecks 
          checks={recentChecks} 
        />
      {:else if activeTab === "stats"}
        <Statistics 
          data={statistics}
        />
      {:else if activeTab === "settings"}
        <Settings 
          currentSettings={settings}
          onUpdate={handleSettingsUpdate}
        />
      {/if}
    {/if}
  </div>

  <!-- 底部 -->
  <footer class="footer">
    <button class="footer-link" on:click={openWebsite}>
      访问网站
    </button>
    <span class="separator">·</span>
    <button class="footer-link" on:click={openHelp}>
      帮助文档
    </button>
    <span class="separator">·</span>
    <span class="version">v0.1.0</span>
  </footer>
</main>

<style>
  .popup-container {
    width: 400px;
    min-height: 500px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .header {
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: white;
    padding: 2px;
  }

  .title-section {
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 12px;
    opacity: 0.9;
    margin: 0;
  }

  .tab-nav {
    display: flex;
    background: #f7f8fa;
    border-bottom: 1px solid #e1e4e8;
    padding: 0 8px;
  }

  .tab-button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 8px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    color: #666;
  }

  .tab-button:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .tab-button.active {
    color: #667eea;
  }

  .tab-button.active::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 2px;
    background: #667eea;
  }

  .tab-icon {
    font-size: 20px;
    margin-bottom: 2px;
  }

  .tab-label {
    font-size: 11px;
    font-weight: 500;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #fafbfc;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #666;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e1e4e8;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .footer {
    padding: 12px 16px;
    background: white;
    border-top: 1px solid #e1e4e8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #666;
  }

  .footer-link {
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    text-decoration: none;
  }

  .footer-link:hover {
    text-decoration: underline;
  }

  .separator {
    margin: 0 8px;
    color: #ccc;
  }

  .version {
    color: #999;
  }
</style>
