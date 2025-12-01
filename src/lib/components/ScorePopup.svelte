<script lang="ts">
  // ✅ Props via $props()
  const { score = 0, correct = false } = $props<{ score?: number; correct?: boolean }>();
</script>

<div class="fixed inset-0 flex items-center justify-center pointer-events-none">
  <div class="px-6 py-4 rounded-2xl shadow bg-white fade-enter text-center">
    <div class="text-5xl mb-2">{correct ? '✅' : '❌'}</div>
    <div class="text-xl font-bold">{correct ? `+${score}p` : '0p'}</div>
  </div>
</div>
