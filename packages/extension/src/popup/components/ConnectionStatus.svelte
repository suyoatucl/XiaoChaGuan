<script lang="ts">
  import { onMount } from 'svelte';
  import type { ConnectionLayer, ConnectionState } from '~/lib/types';

  let layer: ConnectionLayer = 'direct';
  let state: ConnectionState = 'connected';
  let latency = 0;

  const stateConfig: Record<ConnectionState, { label: string; color: string; dot: string }> = {
    connected: { label: '已连接', color: 'text-green-600', dot: 'bg-green-500' },
    connecting: { label: '连接中', color: 'text-yellow-600', dot: 'bg-yellow-500' },
    disconnected: { label: '未连接', color: 'text-gray-500', dot: 'bg-gray-400' },
    error: { label: '错误', color: 'text-red-600', dot: 'bg-red-500' },
  };

  const layerLabels: Record<ConnectionLayer, string> = {
    direct: '直连',
    shadowsocks: 'SS',
    vmess: 'VMess',
    tor: 'Tor',
    offline: '离线',
  };

  onMount(() => {
    // TODO: Implement actual connection status monitoring
    // Simulate connection check
    setTimeout(() => {
      state = 'connected';
      latency = Math.floor(Math.random() * 100) + 50;
    }, 500);
  });
</script>

<div class="flex items-center gap-2 text-xs">
  <!-- Status Dot -->
  <span
    class="w-2 h-2 rounded-full {stateConfig[state].dot}
           {state === 'connecting' ? 'animate-pulse' : ''}"
  ></span>

  <!-- Layer & Latency -->
  <span class="text-white/80">
    {layerLabels[layer]}
    {#if state === 'connected' && latency > 0}
      <span class="text-white/60">({latency}ms)</span>
    {/if}
  </span>
</div>
