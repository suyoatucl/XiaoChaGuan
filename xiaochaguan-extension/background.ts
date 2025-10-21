// background.ts - Service Worker for Xiao Cha Guan Extension
import { Storage } from "@plasmohq/storage"
import browser from "webextension-polyfill"
import { ConnectionManager } from "~lib/network/connection-manager"
import { FactCheckService } from "~lib/services/fact-check-service"
import { CacheManager } from "~lib/cache/cache-manager"
import type { ClaimVerificationRequest, VerificationResult } from "~types"

// 初始化存储
const storage = new Storage()

// 初始化网络连接管理器（处理GFW规避）
const connectionManager = new ConnectionManager()

// 初始化事实核查服务
const factCheckService = new FactCheckService(connectionManager)

// 初始化缓存管理
const cacheManager = new CacheManager()

// 扩展安装或更新时
browser.runtime.onInstalled.addListener(async (details) => {
  console.log("小查馆已安装/更新", details)
  
  // 初始化默认设置
  if (details.reason === "install") {
    await storage.set("settings", {
      autoDetect: true, // 自动检测可疑内容
      highlightSuspicious: true, // 高亮可疑内容
      connectionMode: "auto", // auto/direct/proxy
      cacheEnabled: true,
      language: "zh-CN",
      sensitivityLevel: "medium" // low/medium/high
    })
    
    // 初始化本地事实数据库
    await cacheManager.initializeDatabase()
  }
  
  // 创建右键菜单
  browser.contextMenus.create({
    id: "fact-check-selection",
    title: "用小查馆验证 "%s"",
    contexts: ["selection"]
  })
})

// 监听右键菜单点击
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fact-check-selection" && info.selectionText) {
    // 发送选中文本到content script进行验证
    browser.tabs.sendMessage(tab.id!, {
      type: "VERIFY_SELECTION",
      text: info.selectionText
    })
  }
})

// 处理来自content script的消息
browser.runtime.onMessage.addListener(async (request, sender) => {
  console.log("收到消息:", request.type)
  
  switch (request.type) {
    case "VERIFY_CLAIM":
      return handleClaimVerification(request.data)
    
    case "CHECK_CONNECTION":
      return handleConnectionCheck()
    
    case "GET_CACHED_RESULT":
      return handleCacheQuery(request.data)
    
    case "UPDATE_SETTINGS":
      return handleSettingsUpdate(request.data)
      
    case "TRANSLATE_TEXT":
      return handleTranslation(request.data)
      
    default:
      return { error: "Unknown request type" }
  }
})

// 处理声明验证请求
async function handleClaimVerification(data: ClaimVerificationRequest): Promise<VerificationResult> {
  try {
    // 1. 检查缓存
    const cached = await cacheManager.get(data.text)
    if (cached && !cached.isExpired()) {
      console.log("使用缓存结果")
      return cached
    }
    
    // 2. 检测语言
    const language = await detectLanguage(data.text)
    
    // 3. 检查网络状态并选择连接方式
    const connection = await connectionManager.getOptimalConnection()
    
    // 4. 执行事实核查
    const result = await factCheckService.verify({
      text: data.text,
      language,
      context: data.context,
      url: data.url,
      connection
    })
    
    // 5. 缓存结果
    await cacheManager.set(data.text, result)
    
    // 6. 记录统计信息
    await recordVerificationStats(result)
    
    return result
    
  } catch (error) {
    console.error("验证失败:", error)
    
    // 降级到本地验证
    return await performLocalVerification(data)
  }
}

// 检查网络连接状态
async function handleConnectionCheck() {
  const status = await connectionManager.checkConnectivity()
  
  // 更新扩展图标以反映连接状态
  if (status.isRestricted) {
    browser.action.setBadgeText({ text: "!" })
    browser.action.setBadgeBackgroundColor({ color: "#FFA500" })
  } else if (status.isConnected) {
    browser.action.setBadgeText({ text: "" })
  } else {
    browser.action.setBadgeText({ text: "×" })
    browser.action.setBadgeBackgroundColor({ color: "#FF0000" })
  }
  
  return status
}

// 查询缓存
async function handleCacheQuery(data: { text: string }) {
  return await cacheManager.get(data.text)
}

// 更新设置
async function handleSettingsUpdate(settings: any) {
  await storage.set("settings", settings)
  
  // 应用新设置
  if (settings.connectionMode) {
    await connectionManager.setMode(settings.connectionMode)
  }
  
  return { success: true }
}

// 处理翻译请求（用于跨语言验证）
async function handleTranslation(data: { text: string, targetLang: string }) {
  // 这里可以集成翻译API
  // 暂时返回模拟数据
  return {
    original: data.text,
    translated: "[翻译后的文本]",
    targetLang: data.targetLang,
    confidence: 0.95
  }
}

// 本地验证（离线模式）
async function performLocalVerification(data: ClaimVerificationRequest): Promise<VerificationResult> {
  const localDb = await cacheManager.getLocalDatabase()
  
  // 使用本地数据库进行基础验证
  const results = await localDb.search(data.text)
  
  return {
    claim: data.text,
    verdict: results.length > 0 ? results[0].verdict : "unverifiable",
    confidence: results.length > 0 ? 0.7 : 0.3,
    evidence: results.map(r => ({
      source: r.source,
      text: r.text,
      url: r.url,
      date: r.date
    })),
    isOffline: true,
    timestamp: new Date().toISOString()
  }
}

// 语言检测
async function detectLanguage(text: string): Promise<string> {
  // 简单的语言检测逻辑
  const chinesePattern = /[\u4e00-\u9fa5]/
  const containsChinese = chinesePattern.test(text)
  
  if (containsChinese) {
    return "zh-CN"
  }
  
  // 可以集成更复杂的语言检测库
  return "en"
}

// 记录验证统计
async function recordVerificationStats(result: VerificationResult) {
  const stats = await storage.get("stats") || {
    totalVerifications: 0,
    verdictCounts: {},
    languageCounts: {}
  }
  
  stats.totalVerifications++
  stats.verdictCounts[result.verdict] = (stats.verdictCounts[result.verdict] || 0) + 1
  
  await storage.set("stats", stats)
}

// 定期清理过期缓存
browser.alarms.create("cleanup-cache", { periodInMinutes: 60 })
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "cleanup-cache") {
    await cacheManager.cleanup()
  }
})

// 监听网络状态变化
browser.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    // 主框架加载完成，检查连接状态
    await handleConnectionCheck()
  }
})

export {}
