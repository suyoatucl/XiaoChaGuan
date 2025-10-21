<script lang="ts">
  // components/QuickVerify.svelte - 快速验证组件
  import { sendToBackground } from "@plasmohq/messaging"
  import { createEventDispatcher } from "svelte"
  
  export let connectionStatus: any
  export let onComplete: (result: any) => void
  
  const dispatch = createEventDispatcher()
  
  let inputText = ""
  let isVerifying = false
  let verificationResult: any = null
  let error = ""
  
  // 预设的示例文本
  const examples = [
    "日本排放核污水会导致海鲜变异",
    "5G信号会传播新冠病毒",
    "某某明星捐款一个亿",
  ]
  
  async function handleVerify() {
    if (!inputText.trim() || inputText.length < 10) {
      error = "请输入至少10个字符的文本"
      return
    }
    
    if (inputText.length > 500) {
      error = "文本长度不能超过500个字符"
      return
    }
    
    error = ""
    isVerifying = true
    verificationResult = null
    
    try {
      const result = await sendToBackground({
        name: "verify",
        body: {
          type: "VERIFY_CLAIM",
          data: {
            text: inputText,
            context: "",
            url: "manual-input"
          }
        }
      })
      
      verificationResult = result
      onComplete?.(result)
      
      // 3秒后自动清除结果，准备下一次验证
      setTimeout(() => {
        if (verificationResult === result) {
          resetForm()
        }
      }, 10000)
      
    } catch (err: any) {
      error = err.message || "验证失败，请稍后重试"
    } finally {
      isVerifying = false
    }
  }
  
  function handleExampleClick(text: string) {
    inputText = text
    error = ""
    verificationResult = null
  }
  
  function resetForm() {
    inputText = ""
    verificationResult = null
    error = ""
  }
  
  function getVerdictInfo(verdict: string) {
    switch (verdict) {
      case "false":
        return { label: "虚假", color: "#ef4444", icon: "❌" }
      case "misleading":
        return { label: "误导", color: "#f59e0b", icon: "⚠️" }
      case "true":
        return { label: "真实", color: "#10b981", icon: "✅" }
      case "unverifiable":
        return { label: "无法验证", color: "#6b7280", icon: "❓" }
      default:
        return { label: "未知", color: "#6b7280", icon: "❔" }
    }
  }
  
  function formatConfidence(confidence: number) {
    return Math.round(confidence * 100) + "%"
  }
</script>

<div class="quick-verify">
  <!-- 输入区域 -->
  <div class="input-section">
    <label for="verify-input" class="label">
      输入需要验证的文本
    </label>
    <textarea
      id="verify-input"
      class="input-textarea"
      placeholder="粘贴或输入您想要验证的信息..."
      bind:value={inputText}
      disabled={isVerifying}
      on:keydown={(e) => {
        if (e.key === "Enter" && e.ctrlKey) {
          handleVerify()
        }
      }}
    />
    <div class="input-footer">
      <span class="char-count" class:warning={inputText.length > 400}>
        {inputText.length}/500
      </span>
      <button
        class="verify-button"
        on:click={handleVerify}
        disabled={isVerifying || !inputText.trim()}
      >
        {#if isVerifying}
          <span class="spinner-small"></span>
          验证中...
        {:else}
          🔍 验证
        {/if}
      </button>
    </div>
  </div>

  <!-- 错误提示 -->
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}

  <!-- 连接状态警告 -->
  {#if connectionStatus.isRestricted}
    <div class="warning-message">
      ⚠️ 网络受限，使用缓存模式
    </div>
  {/if}

  <!-- 验证结果 -->
  {#if verificationResult}
    <div class="result-card">
      <div class="result-header">
        <div class="verdict-badge" style="background: {getVerdictInfo(verificationResult.verdict).color}">
          <span class="verdict-icon">{getVerdictInfo(verificationResult.verdict).icon}</span>
          <span class="verdict-label">{getVerdictInfo(verificationResult.verdict).label}</span>
        </div>
        <div class="confidence">
          置信度: {formatConfidence(verificationResult.confidence)}
        </div>
      </div>
      
      {#if verificationResult.summary}
        <div class="result-summary">
          {verificationResult.summary}
        </div>
      {/if}
      
      {#if verificationResult.evidence && verificationResult.evidence.length > 0}
        <div class="evidence-section">
          <h4 class="evidence-title">证据来源</h4>
          <div class="evidence-list">
            {#each verificationResult.evidence.slice(0, 3) as evidence}
              <a 
                href={evidence.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="evidence-item"
              >
                <span class="evidence-source">{evidence.source}</span>
                <span class="evidence-date">{evidence.date}</span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
      
      {#if verificationResult.isOffline}
        <div class="offline-notice">
          📵 离线结果，可能不是最新信息
        </div>
      {/if}
    </div>
  {/if}

  <!-- 示例文本 -->
  {#if !verificationResult && !isVerifying && inputText.length === 0}
    <div class="examples-section">
      <p class="examples-title">试试这些示例：</p>
      <div class="examples-list">
        {#each examples as example}
          <button
            class="example-button"
            on:click={() => handleExampleClick(example)}
          >
            "{example}"
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- 提示信息 -->
  <div class="tips">
    <p class="tip">
      💡 <strong>提示:</strong> 按 Ctrl+Enter 快速验证
    </p>
  </div>
</div>

<style>
  .quick-verify {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .input-section {
    display: flex;
    flex-direction: column;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }

  .input-textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: all 0.2s;
  }

  .input-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-textarea:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .char-count {
    font-size: 12px;
    color: #9ca3af;
  }

  .char-count.warning {
    color: #f59e0b;
  }

  .verify-button {
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .verify-button:hover:not(:disabled) {
    background: #5a67d8;
  }

  .verify-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .error-message {
    padding: 10px;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 6px;
    color: #c00;
    font-size: 13px;
  }

  .warning-message {
    padding: 10px;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 6px;
    color: #92400e;
    font-size: 13px;
  }

  .result-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .verdict-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    font-weight: 500;
  }

  .verdict-icon {
    font-size: 16px;
  }

  .confidence {
    font-size: 13px;
    color: #6b7280;
  }

  .result-summary {
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
    margin-bottom: 12px;
  }

  .evidence-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
  }

  .evidence-title {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    margin: 0 0 8px 0;
  }

  .evidence-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .evidence-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 8px;
    background: #f9fafb;
    border-radius: 4px;
    text-decoration: none;
    color: #374151;
    font-size: 12px;
    transition: background 0.2s;
  }

  .evidence-item:hover {
    background: #f3f4f6;
  }

  .evidence-source {
    font-weight: 500;
    color: #667eea;
  }

  .evidence-date {
    color: #9ca3af;
  }

  .offline-notice {
    margin-top: 12px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }

  .examples-section {
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .examples-title {
    font-size: 12px;
    color: #6b7280;
    margin: 0 0 8px 0;
  }

  .examples-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .example-button {
    padding: 8px 12px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    text-align: left;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .example-button:hover {
    background: #f9fafb;
    border-color: #667eea;
    color: #667eea;
  }

  .tips {
    margin-top: 8px;
  }

  .tip {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
