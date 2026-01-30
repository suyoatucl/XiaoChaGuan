<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '~/lib/cache/indexed-db';
  import type { HistoryEntry } from '~/lib/types';

  let history: HistoryEntry[] = [];
  let loading = true;

  const verdictEmoji: Record<string, string> = {
    true: '✅',
    false: '❌',
    partly_true: '⚠️',
    unverified: '❓',
  };

  onMount(async () => {
    try {
      history = await db.history.orderBy('createdAt').reverse().limit(20).toArray();
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      loading = false;
    }
  });

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(date).toLocaleDateString('zh-CN');
  }

  async function clearHistory() {
    if (confirm('确定要清除所有历史记录吗？')) {
      await db.history.clear();
      history = [];
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="font-medium text-gray-700">最近验证</h3>
    {#if history.length > 0}
      <button
        on:click={clearHistory}
        class="text-xs text-red-500 hover:text-red-600"
      >
        清除全部
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="text-center py-8 text-gray-400">
      <span class="animate-spin inline-block">⏳</span>
      <p class="mt-2 text-sm">加载中...</p>
    </div>
  {:else if history.length === 0}
    <div class="text-center py-8 text-gray-400">
      <span class="text-4xl">📋</span>
      <p class="mt-2 text-sm">暂无验证记录</p>
      <p class="text-xs mt-1">验证的内容将显示在这里</p>
    </div>
  {:else}
    <div class="space-y-2 max-h-[300px] overflow-y-auto">
      {#each history as item}
        <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div class="flex items-start gap-2">
            <span class="text-lg flex-shrink-0">
              {verdictEmoji[item.verdict] || '❓'}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 line-clamp-2">{item.claim}</p>
              <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>{Math.round(item.confidence * 100)}% 置信度</span>
                <span>·</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
