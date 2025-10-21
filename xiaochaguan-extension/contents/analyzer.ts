// contents/analyzer.ts - 页面内容分析和交互
import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import { ClaimDetector } from "~lib/nlp/claim-detector"
import { UIRenderer } from "~lib/ui/content-ui"
import { debounce } from "~lib/utils/debounce"
import type { DetectedClaim } from "~types"

// Plasmo配置 - 指定在哪些网站运行
export const config: PlasmoCSConfig = {
  matches: [
    "https://*.weibo.com/*",
    "https://*.weibo.cn/*",
    "https://*.zhihu.com/*",
    "https://*.toutiao.com/*",
    "https://*.douyin.com/*",
    "https://mp.weixin.qq.com/*",
    "https://*.bilibili.com/*",
    "https://*.xiaohongshu.com/*",
    "https://*.baidu.com/*",
    "<all_urls>" // 可以在所有网站运行，用户可以设置白名单
  ],
  run_at: "document_idle"
}

// 初始化组件
const claimDetector = new ClaimDetector()
const uiRenderer = new UIRenderer()

// 存储已检测的声明，避免重复
const detectedClaims = new Map<string, DetectedClaim>()

// 页面加载完成后初始化
window.addEventListener("load", async () => {
  console.log("小查馆: 开始分析页面内容")
  
  // 获取用户设置
  const settings = await getSettings()
  
  if (settings.autoDetect) {
    // 自动检测模式
    await analyzePageContent()
    
    // 监听DOM变化（处理动态加载的内容）
    observeContentChanges()
  }
  
  // 监听用户选择文本
  document.addEventListener("mouseup", handleTextSelection)
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener(handleBackgroundMessage)
})

// 分析页面内容
async function analyzePageContent() {
  // 获取页面主要内容区域
  const contentAreas = findContentAreas()
  
  for (const area of contentAreas) {
    const text = area.textContent || ""
    
    // 检测可验证的声明
    const claims = await claimDetector.detectClaims(text)
    
    for (const claim of claims) {
      // 跳过已检测的声明
      if (detectedClaims.has(claim.text)) continue
      
      // 标记声明在页面中的位置
      const elements = findTextNodes(area, claim.text)
      
      for (const element of elements) {
        // 添加视觉标记
        await markSuspiciousClaim(element, claim)
      }
      
      // 记录已检测的声明
      detectedClaims.set(claim.text, claim)
    }
  }
  
  // 如果检测到可疑内容，显示提示
  if (detectedClaims.size > 0) {
    uiRenderer.showNotification({
      type: "info",
      message: `检测到 ${detectedClaims.size} 条可能需要验证的信息`,
      action: "查看详情"
    })
  }
}

// 标记可疑声明
async function markSuspiciousClaim(element: Element, claim: DetectedClaim) {
  // 添加高亮样式
  const wrapper = document.createElement("span")
  wrapper.className = "xcg-claim-wrapper"
  wrapper.setAttribute("data-claim-id", claim.id)
  wrapper.setAttribute("data-confidence", claim.confidence.toString())
  
  // 根据置信度设置不同的样式
  if (claim.confidence > 0.8) {
    wrapper.classList.add("xcg-high-risk")
  } else if (claim.confidence > 0.5) {
    wrapper.classList.add("xcg-medium-risk")
  } else {
    wrapper.classList.add("xcg-low-risk")
  }
  
  // 包装原始元素
  element.parentNode?.insertBefore(wrapper, element)
  wrapper.appendChild(element)
  
  // 添加交互事件
  wrapper.addEventListener("mouseenter", (e) => handleClaimHover(e, claim))
  wrapper.addEventListener("mouseleave", handleClaimLeave)
  wrapper.addEventListener("click", (e) => handleClaimClick(e, claim))
  
  // 预加载验证结果（低优先级）
  requestIdleCallback(() => {
    preloadVerification(claim)
  })
}

// 处理声明悬停
function handleClaimHover(event: MouseEvent, claim: DetectedClaim) {
  // 显示快速信息卡片
  uiRenderer.showQuickCard({
    target: event.target as Element,
    claim: claim,
    status: detectedClaims.get(claim.text)?.verificationStatus || "pending"
  })
}

// 处理声明点击
async function handleClaimClick(event: MouseEvent, claim: DetectedClaim) {
  event.preventDefault()
  event.stopPropagation()
  
  // 显示详细验证面板
  const panel = uiRenderer.showVerificationPanel({
    claim: claim,
    position: { x: event.clientX, y: event.clientY }
  })
  
  // 如果还没有验证结果，立即开始验证
  if (!claim.verificationResult) {
    panel.showLoading()
    
    try {
      const result = await sendToBackground({
        name: "verify",
        body: {
          type: "VERIFY_CLAIM",
          data: {
            text: claim.text,
            context: claim.context,
            url: window.location.href
          }
        }
      })
      
      // 更新验证结果
      claim.verificationResult = result
      panel.updateResult(result)
      
      // 更新页面标记
      updateClaimMarking(claim.id, result.verdict)
      
    } catch (error) {
      panel.showError("验证失败，请稍后重试")
    }
  }
}

// 预加载验证（后台低优先级）
async function preloadVerification(claim: DetectedClaim) {
  // 检查缓存
  const cached = await sendToBackground({
    name: "cache-query",
    body: {
      type: "GET_CACHED_RESULT",
      data: { text: claim.text }
    }
  })
  
  if (cached) {
    claim.verificationResult = cached
    claim.verificationStatus = "verified"
    updateClaimMarking(claim.id, cached.verdict)
  }
}

// 更新声明标记样式
function updateClaimMarking(claimId: string, verdict: string) {
  const element = document.querySelector(`[data-claim-id="${claimId}"]`)
  if (!element) return
  
  // 移除原有样式
  element.classList.remove("xcg-high-risk", "xcg-medium-risk", "xcg-low-risk")
  
  // 添加验证结果样式
  switch (verdict) {
    case "false":
      element.classList.add("xcg-verified-false")
      break
    case "misleading":
      element.classList.add("xcg-verified-misleading")
      break
    case "true":
      element.classList.add("xcg-verified-true")
      break
    case "unverifiable":
      element.classList.add("xcg-verified-unknown")
      break
  }
}

// 处理用户选择文本
const handleTextSelection = debounce(async () => {
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  
  if (!text || text.length < 10 || text.length > 500) return
  
  // 显示快速操作按钮
  const range = selection?.getRangeAt(0)
  if (range) {
    const rect = range.getBoundingClientRect()
    uiRenderer.showQuickAction({
      text: text,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      },
      onVerify: async () => {
        await verifySelectedText(text)
      }
    })
  }
}, 500)

// 验证选中的文本
async function verifySelectedText(text: string) {
  // 创建临时声明对象
  const claim: DetectedClaim = {
    id: `manual-${Date.now()}`,
    text: text,
    confidence: 0.5,
    context: extractContext(text),
    type: "manual"
  }
  
  // 显示验证面板
  const panel = uiRenderer.showVerificationPanel({
    claim: claim,
    position: "center"
  })
  
  panel.showLoading()
  
  try {
    const result = await sendToBackground({
      name: "verify",
      body: {
        type: "VERIFY_CLAIM",
        data: {
          text: text,
          context: claim.context,
          url: window.location.href
        }
      }
    })
    
    panel.updateResult(result)
  } catch (error) {
    panel.showError("验证失败，请稍后重试")
  }
}

// 监听DOM变化（处理动态内容）
function observeContentChanges() {
  const observer = new MutationObserver(
    debounce(async (mutations) => {
      // 检测新添加的内容节点
      const newContentNodes = []
      
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              newContentNodes.push(node as Element)
            }
          })
        }
      }
      
      // 分析新内容
      if (newContentNodes.length > 0) {
        for (const node of newContentNodes) {
          const text = node.textContent || ""
          if (text.length > 50) {
            const claims = await claimDetector.detectClaims(text)
            for (const claim of claims) {
              if (!detectedClaims.has(claim.text)) {
                await markSuspiciousClaim(node, claim)
                detectedClaims.set(claim.text, claim)
              }
            }
          }
        }
      }
    }, 1000)
  )
  
  // 监听主要内容区域
  const contentAreas = findContentAreas()
  contentAreas.forEach(area => {
    observer.observe(area, {
      childList: true,
      subtree: true
    })
  })
}

// 查找页面主要内容区域
function findContentAreas(): Element[] {
  const areas = []
  
  // 通用内容选择器
  const selectors = [
    "main",
    "article",
    "[role='main']",
    ".content",
    "#content",
    ".post-content",
    ".entry-content",
    // 社交媒体特定选择器
    ".WB_feed", // 微博
    ".Card", // 知乎
    ".feed-item", // 今日头条
    ".rich_media_content", // 微信公众号
  ]
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector)
    areas.push(...Array.from(elements))
  }
  
  // 如果没找到特定区域，使用body
  if (areas.length === 0) {
    areas.push(document.body)
  }
  
  return areas
}

// 查找包含特定文本的节点
function findTextNodes(root: Element, text: string): Element[] {
  const elements: Element[] = []
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const nodeText = node.textContent || ""
        return nodeText.includes(text) 
          ? NodeFilter.FILTER_ACCEPT 
          : NodeFilter.FILTER_REJECT
      }
    }
  )
  
  let node
  while (node = walker.nextNode()) {
    const parent = node.parentElement
    if (parent && !parent.classList.contains("xcg-claim-wrapper")) {
      elements.push(parent)
    }
  }
  
  return elements
}

// 提取上下文
function extractContext(text: string): string {
  // 查找包含该文本的最近段落
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const paragraph = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container as Element
      
    if (paragraph) {
      const fullText = paragraph.textContent || ""
      const startIndex = Math.max(0, fullText.indexOf(text) - 100)
      const endIndex = Math.min(fullText.length, fullText.indexOf(text) + text.length + 100)
      return fullText.substring(startIndex, endIndex)
    }
  }
  
  return text
}

// 处理来自background的消息
function handleBackgroundMessage(request: any, sender: any, sendResponse: any) {
  switch (request.type) {
    case "VERIFY_SELECTION":
      // 来自右键菜单的验证请求
      verifySelectedText(request.text)
      break
      
    case "UPDATE_SETTINGS":
      // 设置更新，重新初始化
      location.reload()
      break
      
    case "HIGHLIGHT_CLAIM":
      // 高亮特定声明
      const element = document.querySelector(`[data-claim-id="${request.claimId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("xcg-highlight-flash")
        setTimeout(() => {
          element.classList.remove("xcg-highlight-flash")
        }, 2000)
      }
      break
  }
  
  return true
}

// 获取用户设置
async function getSettings() {
  try {
    const response = await sendToBackground({
      name: "get-settings",
      body: { type: "GET_SETTINGS" }
    })
    return response || {
      autoDetect: true,
      highlightSuspicious: true,
      sensitivityLevel: "medium"
    }
  } catch {
    return {
      autoDetect: true,
      highlightSuspicious: true,
      sensitivityLevel: "medium"
    }
  }
}

// 处理鼠标离开
function handleClaimLeave() {
  uiRenderer.hideQuickCard()
}

// 注入样式
const style = document.createElement("style")
style.textContent = `
  .xcg-claim-wrapper {
    position: relative;
    display: inline;
    cursor: help;
    transition: all 0.3s ease;
  }
  
  .xcg-high-risk {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 0, 0, 0.3) 60%);
  }
  
  .xcg-medium-risk {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 165, 0, 0.3) 60%);
  }
  
  .xcg-low-risk {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 255, 0, 0.2) 60%);
  }
  
  .xcg-verified-false {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 0, 0, 0.4) 60%);
    border-bottom: 2px solid red;
  }
  
  .xcg-verified-misleading {
    background: linear-gradient(to bottom, transparent 60%, rgba(255, 165, 0, 0.4) 60%);
    border-bottom: 2px solid orange;
  }
  
  .xcg-verified-true {
    background: linear-gradient(to bottom, transparent 60%, rgba(0, 255, 0, 0.2) 60%);
    border-bottom: 2px solid green;
  }
  
  .xcg-verified-unknown {
    background: linear-gradient(to bottom, transparent 60%, rgba(128, 128, 128, 0.2) 60%);
    border-bottom: 2px solid gray;
  }
  
  .xcg-highlight-flash {
    animation: xcg-flash 0.5s ease-in-out 3;
  }
  
  @keyframes xcg-flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`
document.head.appendChild(style)

export {}
