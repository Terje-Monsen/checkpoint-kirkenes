<script lang="ts">
  import { lang } from '$lib/data/i18n';
  import type { Lang } from '$lib/data/i18n';

  const { src, autoplay = false, onDone } = $props<{
    src: Record<Lang, string>;
    autoplay?: boolean;
    onDone?: () => void;
  }>();

  let el: HTMLVideoElement;

  function handleEnded() {
    onDone?.();
  }

  // Spill automatisk dersom aktivert
  $effect(() => {
    if (autoplay && el) {
      const p = el.play?.();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  });
</script>
<div class="video-container">
<video
  bind:this={el}
  src={src[$lang]}
  {autoplay}
  muted={autoplay}
  playsinline
  controls={false}
  on:ended={handleEnded}
  class="video-full"
/>
</div>
<style>
  .video-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #d8f3ff;
    overflow: hidden; /* tilsvarer det du ville ha på body */
  }

  .video-full {
    display:block;
    height:100vh;
    width:100vw;
    object-fit:cover;
    object-position: center;
    max-width:1090px;
  }


</style>