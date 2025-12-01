<script lang="ts">
  export let data: { lang: 'no' | 'en' };
  import '../app.css';              // <- Tailwind (@tailwind base/components/utilities)
  import '$lib/styles/fonts.css';   // <- Lokale fonter
</script>

<div class="min-h-dvh bg-gray-50 text-gray-900 font-sans">
  <slot />
</div>
