<script lang="ts">
  import { Storage } from '@plasmohq/storage';
  import { onMount } from 'svelte';

  import cacheManager from '~/lib/cache/cache-manager';
  import { clearAllData } from '~/lib/cache/indexed-db';

  const storage = new Storage();

  let settings = {
    language: 'zh-CN',
    autoDetect: true,
    showNotifications: true,
    debugMode: false,
  };

  let saving = false;
  let clearing = false;

  const languages = [
    { code: 'zh-CN', label: '简体中文' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'en', label: 'English' },
  ];

  onMount(async () => {
    const saved = await storage.get('settings');
    if (saved) {
      settings = { ...settings, ...saved };
    }
  });

  async function saveSettings() {
    saving = true;
    try {
      await storage.set('settings', settings);
      // Show success feedback
      setTimeout(() => {
        saving = false;
      }, 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      saving = false;
    }
  }

  async function handleClearCache() {
    if (confirm('确定要清除所有缓存数据吗？这将删除所有验证历史记录。')) {
      clearing = true;
      try {
        await cacheManager.clear();
        await clearAllData();
        alert('缓存已清除');
      } catch (error) {
        console.error('Failed to clear cache:', error);
        alert('清除失败');
      } finally {
        clearing = false;
      }
    }
  }
</script>

<div class="space-y-6">
  <h3 class="font-medium text-gray-700">设置</h3>

  <!-- Language -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">界面语言</label>
    <select
      bind:value={settings.language}
      on:change={saveSettings}
      class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
    >
      {#each languages as lang}
        <option value={lang.code}>{lang.label}</option>
      {/each}
    </select>
  </div>

  <!-- Toggle Options -->
  <div class="space-y-3">
    <!-- Auto Detect -->
    <label class="flex items-center justify-between cursor-pointer">
      <div>
        <span class="text-sm font-medium text-gray-700">自动检测声明</span>
        <p class="text-xs text-gray-500">浏览页面时自动识别可疑内容</p>
      </div>
      <input
        type="checkbox"
        bind:checked={settings.autoDetect}
        on:change={saveSettings}
        class="w-5 h-5 text-brand-purple rounded focus:ring-brand-purple"
      />
    </label>

    <!-- Notifications -->
    <label class="flex items-center justify-between cursor-pointer">
      <div>
        <span class="text-sm font-medium text-gray-700">显示通知</span>
        <p class="text-xs text-gray-500">验证完成时显示系统通知</p>
      </div>
      <input
        type="checkbox"
        bind:checked={settings.showNotifications}
        on:change={saveSettings}
        class="w-5 h-5 text-brand-purple rounded focus:ring-brand-purple"
      />
    </label>

    <!-- Debug Mode -->
    <label class="flex items-center justify-between cursor-pointer">
      <div>
        <span class="text-sm font-medium text-gray-700">调试模式</span>
        <p class="text-xs text-gray-500">显示详细日志信息</p>
      </div>
      <input
        type="checkbox"
        bind:checked={settings.debugMode}
        on:change={saveSettings}
        class="w-5 h-5 text-brand-purple rounded focus:ring-brand-purple"
      />
    </label>
  </div>

  <!-- Cache Management -->
  <div class="pt-4 border-t border-gray-200">
    <h4 class="text-sm font-medium text-gray-700 mb-3">数据管理</h4>
    <button
      on:click={handleClearCache}
      disabled={clearing}
      class="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg
             hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {#if clearing}
        清除中...
      {:else}
        🗑️ 清除所有缓存
      {/if}
    </button>
    <p class="text-xs text-gray-500 mt-2">
      清除后将删除所有本地存储的验证结果和历史记录
    </p>
  </div>

  <!-- About -->
  <div class="pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
    <p class="font-medium">小查馆 XiaoChaGuan</p>
    <p class="mt-1">版本 0.1.0</p>
    <p class="mt-2">
      <a
        href="https://github.com/xiaochaguan"
        target="_blank"
        rel="noopener noreferrer"
        class="text-brand-purple hover:underline"
      >
        GitHub
      </a>
      <span class="mx-2">|</span>
      <a
        href="https://xiaochaguan.app/privacy"
        target="_blank"
        rel="noopener noreferrer"
        class="text-brand-purple hover:underline"
      >
        隐私政策
      </a>
    </p>
  </div>
</div>
