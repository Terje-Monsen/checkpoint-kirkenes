<script lang="ts">
  import { onMount } from 'svelte';

  type Row = { name: string; score: number; at: string };
  let items = $state<Row[]>([]);

  onMount(async () => {
    try {
      const r = await fetch('/api/scores');
      if (r.ok) items = await r.json();
    } catch {}
  });
</script>

<div class="mx-auto max-w-sm p-4">
  <h2 class="text-xl font-bold mb-3 text-center">Resultatliste</h2>
  <div class="bg-white rounded-2xl shadow divide-y">
    {#if items.length === 0}
      <div class="p-4 text-center text-sm text-gray-500">Ingen resultater ennå.</div>
    {:else}
      {#each items.slice(0, 50) as it, i}
        <div class="p-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-6 text-right">{i+1}.</span>
            <span class="font-medium">{it.name}</span>
          </div>
          <span class="font-bold">{it.score}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>
