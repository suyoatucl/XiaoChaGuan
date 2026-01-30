<script lang="ts">
  import { onMount } from 'svelte';

  import QuickVerify from './components/QuickVerify.svelte';
  import RecentChecks from './components/RecentChecks.svelte';
  import Statistics from './components/Statistics.svelte';
  import Settings from './components/Settings.svelte';
  import ConnectionStatus from './components/ConnectionStatus.svelte';

  type Tab = 'verify' | 'history' | 'stats' | 'settings';

  let activeTab: Tab = 'verify';

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'verify', label: '验证', icon: '🔍' },
    { id: 'history', label: '历史', icon: '📋' },
    { id: 'stats', label: '统计', icon: '📊' },
    { id: 'settings', label: '设置', icon: '⚙️' },
  ];

  onMount(() => {
    console.log('[XCG] Popup mounted');
  });
</script>

<main class="w-[400px] min-h-[500px] bg-white">
  <!-- Header -->
  <header class="bg-gradient-to-r from-brand-purple to-brand-violet text-white p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-2xl">📰</span>
        <div>
          <h1 class="text-lg font-bold">小查馆</h1>
          <p class="text-xs opacity-80">AI 多语种事实核查</p>
        </div>
      </div>
      <ConnectionStatus />
    </div>
  </header>

  <!-- Tab Navigation -->
  <nav class="flex border-b border-gray-200">
    {#each tabs as tab}
      <button
        class="flex-1 py-3 px-2 text-sm font-medium transition-colors
               {activeTab === tab.id
          ? 'text-brand-purple border-b-2 border-brand-purple bg-purple-50'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
        on:click={() => (activeTab = tab.id)}
      >
        <span class="mr-1">{tab.icon}</span>
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- Tab Content -->
  <div class="p-4">
    {#if activeTab === 'verify'}
      <QuickVerify />
    {:else if activeTab === 'history'}
      <RecentChecks />
    {:else if activeTab === 'stats'}
      <Statistics />
    {:else if activeTab === 'settings'}
      <Settings />
    {/if}
  </div>

  <!-- Footer -->
  <footer class="absolute bottom-0 left-0 right-0 p-2 text-center text-xs text-gray-400 border-t">
    <a
      href="https://xiaochaguan.app"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:text-brand-purple"
    >
      xiaochaguan.app
    </a>
    <span class="mx-2">|</span>
    <span>v0.1.0</span>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif;
  }

  main {
    position: relative;
  }
</style>
