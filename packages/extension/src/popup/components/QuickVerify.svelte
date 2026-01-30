<script lang="ts">
  import { mockVerify } from '~/lib/api/verify';
  import type { VerificationResult, Verdict } from '~/lib/types';

  let inputText = '';
  let isVerifying = false;
  let result: VerificationResult | null = null;
  let error: string | null = null;

  const verdictConfig: Record<Verdict, { label: string; color: string; bg: string }> = {
    true: { label: '真实', color: 'text-green-600', bg: 'bg-green-100' },
    false: { label: '虚假', color: 'text-red-600', bg: 'bg-red-100' },
    partly_true: { label: '部分真实', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    unverified: { label: '无法验证', color: 'text-gray-600', bg: 'bg-gray-100' },
  };

  async function handleVerify() {
    if (!inputText.trim()) return;

    isVerifying = true;
    error = null;
    result = null;

    try {
      // For MVP, use mock verification
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay
      result = mockVerify(inputText);
    } catch (err) {
      error = err instanceof Error ? err.message : '验证失败';
    } finally {
      isVerifying = false;
    }
  }

  function handleClear() {
    inputText = '';
    result = null;
    error = null;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleVerify();
    }
  }
</script>

<div class="space-y-4">
  <!-- Input Area -->
  <div class="relative">
    <textarea
      bind:value={inputText}
      on:keydown={handleKeydown}
      placeholder="输入需要验证的内容...&#10;&#10;提示: 可以直接粘贴社交媒体上的文字"
      class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none
             focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent
             placeholder:text-gray-400 text-sm"
      disabled={isVerifying}
    ></textarea>

    <div class="absolute bottom-2 right-2 text-xs text-gray-400">
      {inputText.length} / 500
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-2">
    <button
      on:click={handleVerify}
      disabled={!inputText.trim() || isVerifying}
      class="flex-1 py-2 px-4 bg-gradient-to-r from-brand-purple to-brand-violet
             text-white font-medium rounded-lg
             hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
             transition-opacity flex items-center justify-center gap-2"
    >
      {#if isVerifying}
        <span class="animate-spin">⏳</span>
        验证中...
      {:else}
        🔍 验证
      {/if}
    </button>

    <button
      on:click={handleClear}
      disabled={isVerifying}
      class="py-2 px-4 border border-gray-300 text-gray-600 rounded-lg
             hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      清除
    </button>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
      ❌ {error}
    </div>
  {/if}

  <!-- Result Display -->
  {#if result}
    <div class="border border-gray-200 rounded-lg overflow-hidden animate-fade-in">
      <!-- Verdict Header -->
      <div class="p-3 {verdictConfig[result.verdict].bg} flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">
            {#if result.verdict === 'true'}✅{:else if result.verdict === 'false'}❌{:else if result.verdict === 'partly_true'}⚠️{:else}❓{/if}
          </span>
          <span class="font-bold {verdictConfig[result.verdict].color}">
            {verdictConfig[result.verdict].label}
          </span>
        </div>
        <div class="text-sm text-gray-600">
          置信度: {Math.round(result.confidence * 100)}%
        </div>
      </div>

      <!-- Summary -->
      <div class="p-3 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-1">分析结果</h4>
        <p class="text-sm text-gray-600">{result.summary}</p>
      </div>

      <!-- Evidence (if any) -->
      {#if result.evidenceChain.length > 0}
        <div class="p-3 border-t border-gray-200 bg-gray-50">
          <h4 class="text-sm font-medium text-gray-700 mb-2">证据来源</h4>
          <div class="space-y-2">
            {#each result.evidenceChain.slice(0, 3) as evidence}
              <a
                href={evidence.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="block p-2 bg-white rounded border border-gray-200 hover:border-brand-purple transition-colors"
              >
                <div class="text-sm font-medium text-brand-purple truncate">
                  {evidence.title}
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {evidence.source}
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Cache indicator -->
      {#if result.cached}
        <div class="px-3 py-1 bg-blue-50 text-blue-600 text-xs text-center">
          💾 来自缓存
        </div>
      {/if}
    </div>
  {/if}

  <!-- Quick Examples -->
  {#if !result && !isVerifying}
    <div class="text-xs text-gray-500">
      <p class="mb-2">💡 快捷键: Ctrl + Enter 开始验证</p>
      <p class="mb-1">试试这些示例:</p>
      <div class="space-y-1">
        <button
          class="text-left text-brand-purple hover:underline"
          on:click={() => (inputText = '据外媒报道，日本政府宣布将禁止所有外国游客入境。')}
        >
          • 据外媒报道，日本政府宣布...
        </button>
        <button
          class="text-left text-brand-purple hover:underline"
          on:click={() => (inputText = '研究表明，每天喝8杯水可以预防所有疾病。')}
        >
          • 研究表明，每天喝8杯水...
        </button>
      </div>
    </div>
  {/if}
</div>
