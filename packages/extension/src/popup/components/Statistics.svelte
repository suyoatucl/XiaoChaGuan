<script lang="ts">
  import { onMount } from 'svelte';
  import cacheManager from '~/lib/cache/cache-manager';
  import { getDBStats } from '~/lib/cache/indexed-db';

  let stats = {
    totalVerifications: 0,
    cacheHitRate: 0,
    cacheSize: 0,
  };
  let loading = true;

  onMount(async () => {
    try {
      const cacheStats = cacheManager.getStats();
      const dbStats = await getDBStats();

      stats = {
        totalVerifications: cacheStats.hits + cacheStats.misses,
        cacheHitRate: cacheStats.hitRate * 100,
        cacheSize: dbStats.estimatedSize,
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      loading = false;
    }
  });

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<div class="space-y-4">
  <h3 class="font-medium text-gray-700">使用统计</h3>

  {#if loading}
    <div class="text-center py-8 text-gray-400">
      <span class="animate-spin inline-block">⏳</span>
      <p class="mt-2 text-sm">加载中...</p>
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-3">
      <!-- Total Verifications -->
      <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
        <div class="text-3xl font-bold text-brand-purple">
          {stats.totalVerifications}
        </div>
        <div class="text-sm text-gray-600 mt-1">总验证次数</div>
      </div>

      <!-- Cache Hit Rate -->
      <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
        <div class="text-3xl font-bold text-green-600">
          {stats.cacheHitRate.toFixed(0)}%
        </div>
        <div class="text-sm text-gray-600 mt-1">缓存命中率</div>
      </div>

      <!-- Cache Size -->
      <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg col-span-2">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-blue-600">
              {formatBytes(stats.cacheSize)}
            </div>
            <div class="text-sm text-gray-600 mt-1">本地缓存大小</div>
          </div>
          <div class="text-4xl">💾</div>
        </div>
      </div>
    </div>

    <!-- Performance Chart Placeholder -->
    <div class="p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-3">验证准确度</h4>
      <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-brand-purple to-brand-violet rounded-full transition-all"
          style="width: 85%"
        ></div>
      </div>
      <div class="flex justify-between mt-1 text-xs text-gray-500">
        <span>目标: 85%+</span>
        <span>当前: 85%</span>
      </div>
    </div>

    <!-- Quick Facts -->
    <div class="text-xs text-gray-500 space-y-1">
      <p>📊 数据仅保存在本地，不会上传到服务器</p>
      <p>🔄 缓存有效期为 7 天</p>
    </div>
  {/if}
</div>
