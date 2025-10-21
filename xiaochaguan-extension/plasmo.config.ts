import { defineConfig } from "plasmo"

export default defineConfig({
  // 扩展基本信息
  manifest: {
    name: "小查馆 - Xiao Cha Guan",
    description: "智能多语种事实核查助手",
    version: "0.1.0",
    author: "Xiao Cha Guan Team",
    
    // 图标配置
    icons: {
      "16": "icon16.png",
      "48": "icon48.png", 
      "128": "icon128.png"
    },

    // 默认语言
    default_locale: "zh_CN",
    
    // 内容安全策略
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'"
    }
  },

  // 构建配置
  build: {
    // 优化选项
    overrides: {
      optimizer: true,
      chunks: true
    }
  }
})
