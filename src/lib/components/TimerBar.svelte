<script lang="ts">
  // ✅ Props via $props()
  const { maxTime = 30, elapsed = 0 } = $props<{ maxTime?: number; elapsed?: number }>();

  // ✅ derived verdi
  const pct = $derived(Math.max(0, 100 - (elapsed / maxTime) * 100));
</script>

<div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
  <div class="h-full bg-blue-600 transition-[width] duration-300" style={`width:${pct}%`}></div>
</div>
