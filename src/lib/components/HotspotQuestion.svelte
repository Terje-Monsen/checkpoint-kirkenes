<script lang="ts">
  import { onMount } from 'svelte';
  import TimerBar from './TimerBar.svelte';
  import { dict, tDict, lang } from '$lib/data/i18n';
  import type { Lang } from '$lib/data/i18n';

  const {
    text,
    image,
    pin,
    correct,
    index,
    total,
    totalScore = 0,
    maxTime = 60,
    maxPoint = 100,
    onDone
  } = $props<{
    text: Record<Lang, string>;
    image: string;
    pin: string;
    correct: { x: number; y: number; radiusInner: number; radiusOuter: number };
    index?: number;
    total?: number;
    totalScore?: number;
    maxTime?: number;
    maxPoint?: number;
    onDone: (res: {
      score: number;
      elapsed: number;
      click: { xPct: number; yPct: number };
    }) => void;
  }>();

  // State
  let pos = $state<{ xPct: number; yPct: number } | null>(null);
  let dragging = $state(false);
  let finished = $state(false);
  let timedOut = $state(false);

  let startTs = $state(0);
  let elapsed = $state(0);

  let roundScore = $state(0);
  let visibleScore = $state(totalScore);

  $effect(() => { visibleScore = totalScore; });

  // Refs + dimensjoner
  let mapEl: HTMLImageElement | null = null;
  let pinEl: HTMLImageElement | null = null;
  let mapRect: DOMRect | null = null;

  function updateMapRect() {
    if (mapEl) mapRect = mapEl.getBoundingClientRect();
  }

  function now(){ return performance.now(); }
  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  function clientToPct(clientX: number, clientY: number) {
    updateMapRect();
    if (!mapRect) return { xPct: 0, yPct: 0 };
    const xPct = clamp(((clientX - mapRect.left) / mapRect.width) * 100);
    const yPct = clamp(((clientY - mapRect.top) / mapRect.height) * 100);
    return { xPct, yPct };
  }

  function onMapPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement) === pinEl) return;
    if (finished) return;
    pos = clientToPct(e.clientX, e.clientY);
  }

  function onPinPointerDown(e: PointerEvent) {
    if (!pinEl || finished) return;
    dragging = true;
    pinEl.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }
  function onWindowPointerMove(e: PointerEvent) {
    if (!dragging || finished) return;
    pos = clientToPct(e.clientX, e.clientY);
  }
  function onWindowPointerUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    pinEl?.releasePointerCapture?.(e.pointerId);
  }

  // --- Perfekt sirkel: alt regnes i piksler basert på BREDDE ---
  function radiusPctToPx(rPct: number) {
    updateMapRect();
    const w = mapRect?.width ?? 0;
    return (rPct / 100) * w;
  }

  function distFromCorrectPx(click: { xPct: number; yPct: number }) {
    updateMapRect();
    const w = mapRect?.width ?? 0;
    const h = mapRect?.height ?? 0;
    const dxPx = ((click.xPct - correct.x) / 100) * w;
    const dyPx = ((click.yPct - correct.y) / 100) * h;
    return Math.hypot(dxPx, dyPx);
  }

  let feedbackType: 'perfect' | 'close' | 'wrong' | null = null;

  function ensureRadiusOrder() {
    if (correct.radiusOuter < correct.radiusInner) {
      const tmp = correct.radiusOuter;
      correct.radiusOuter = correct.radiusInner;
      correct.radiusInner = tmp;
    }
  }
  $effect(ensureRadiusOrder);

  function classifyClick(click: { xPct: number; yPct: number }): 'perfect' | 'close' | 'wrong' {
    const distPx = distFromCorrectPx(click);
    const rInnerPx = radiusPctToPx(correct.radiusInner);
    const rOuterPx = radiusPctToPx(correct.radiusOuter);
    if (distPx <= rInnerPx) return 'perfect';
    if (distPx <= rOuterPx) return 'close';
    return 'wrong';
  }

  function computeScore(click: { xPct: number; yPct: number }) {
    feedbackType = classifyClick(click);
    const distPx = distFromCorrectPx(click);
    const rInnerPx = radiusPctToPx(correct.radiusInner);
    const rOuterPx = radiusPctToPx(correct.radiusOuter);

    let base = 0;
    if (feedbackType === 'perfect') base = 1;
    else if (feedbackType === 'close') {
      const span = Math.max(1e-6, rOuterPx - rInnerPx);
      base = 1 - (distPx - rInnerPx) / span; // 1..0
    } else base = 0;

    const tf = Math.max(0.7, 1 - 0.3 * (elapsed / maxTime));
    const raw = (maxPoint ?? 100) * base * tf;
    return Math.round(feedbackType === 'close' ? Math.max(1, raw) : raw);
  }

  function submit() {
    if (finished) return;
    if (elapsed >= maxTime) {
      timedOut = true;
      feedbackType = 'wrong';
      roundScore = 0;
      finished = true;
      animateScore(totalScore, totalScore);
      return;
    }
    if (!pos) return;

    feedbackType = classifyClick(pos);
    roundScore = computeScore(pos);
    finished = true;
    animateScore(totalScore, totalScore + roundScore);
  }

  function animateScore(from: number, to: number) {
    const steps = 20;
    let cur = from, step = 0, diff = (to - from) / steps;
    setTimeout(() => {
      const t = setInterval(() => {
        if (step++ >= steps) { visibleScore = to; clearInterval(t); return; }
        cur += diff; visibleScore = Math.round(cur);
      }, 25);
    }, 1000);
  }

  function next() {
    const click = pos ?? { xPct: -1, yPct: -1 };
    onDone?.({
      score: finished ? roundScore : 0,
      elapsed: Math.min(elapsed, maxTime),
      click
    });
  }

  function ringStyle(radiusPct: number) {
    const dPx = radiusPctToPx(radiusPct) * 2;
    return `left:${correct.x}%; top:${correct.y}%; width:${dPx}px; height:${dPx}px; transform:translate(-50%,-50%);`;
  }

  onMount(() => {
    updateMapRect();

    const i = setInterval(() => {
      if (finished) return;
      elapsed = (now() - startTs) / 1000;
      if (elapsed >= maxTime && !finished) {
        elapsed = maxTime;
        timedOut = true;
        roundScore = 0;
        finished = true;
        animateScore(totalScore, totalScore);
      }
    }, 100);

    const ro = new ResizeObserver(() => updateMapRect());
    if (mapEl) ro.observe(mapEl);

    window.addEventListener('pointermove', onWindowPointerMove);
    window.addEventListener('pointerup', onWindowPointerUp);

    startTs = now();

    return () => {
      clearInterval(i);
      ro.disconnect();
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
    };
  });
</script>

<div class="min-h-dvh flex justify-center items-start w-full px-4 pt-4 pb-8" style="background:#d8f3ff;">
  <div class="w-full max-w-[560px]">

    <!-- HEADER -->
    <div class="grid grid-cols-3 items-end justify-items-center text-[#203a66] animate-fadein-up m-[1em]">
      <div class="text-center">
        <div class="text-[1em] font-semibold uppercase tracking-wide">{$dict['header.question']}</div>
        <div class="text-[2em] font-extrabold tabular-nums">{index}/{total}</div>
      </div>

      <div class="text-center">
        <div class="text-[1em] font-semibold uppercase tracking-wide">{$dict['header.time']}</div>
        <div class="text-[2em] font-extrabold tabular-nums">
          {Math.max(0, Math.ceil(maxTime - elapsed))}
        </div>
      </div>

      <div class="text-center">
        <div class="text-[1em] font-semibold uppercase tracking-wide">{$dict['header.score']}</div>
        <div class="text-[2em] font-extrabold tabular-nums">{visibleScore}</div>
      </div>
    </div>

    <div class="mt-2"><TimerBar {maxTime} {elapsed} /></div>

    <!-- SPØRSMÅL -->
    <h2 class="mt-6 text-center text-[clamp(1.5rem,4.5vw,2.3rem)] font-black text-[#183b6d] animate-fadein" style="margin:1em;margin-top:0.5em">
      {text[$lang]}
    </h2>

    <!-- HOTSPOT-KART -->
    <div class="mt-6" style="margin:1em">
      <div class="hotspot-container" on:pointerdown={onMapPointerDown}>
        <img bind:this={mapEl} class="map" src={image} alt="" draggable="false" />

        <!-- pin -->
        <img
          bind:this={pinEl}
          class={`pin ${pos ? 'visible' : ''}`}
          src={pin}
          alt="pin"
          draggable="false"
          style={pos ? `left:${pos.xPct}%; top:${pos.yPct}%; transform: translate(-50%, -100%);` : ''}
          on:pointerdown={onPinPointerDown}
        />

        <!-- fasitvisning (sirkler) -->
        {#if finished}
          <div class="ring inner" style={ringStyle(correct.radiusInner)} />
          <div class="ring outer" style={ringStyle(correct.radiusOuter)} />
        {/if}

        <!-- ⭐ POENG-BADGE VED PIN-POSISJONEN (NYTT) -->
        {#if finished && pos && !timedOut}
          <span
            class="badge {roundScore > 0 ? 'good' : 'bad'} show"
            style={`left:${pos.xPct}%; top:${pos.yPct}%; transform:translate(-50%,-140%); position:absolute;`}
          >
            +{roundScore}
          </span>
        {/if}
      </div>
    </div>

    <!-- HANDLINGER / FEEDBACK -->
    <div class="mt-4 text-center animate-fadein" style="margin:0 1em;">
      {#if !finished}
        <button
          on:click={submit}
          class="ok-btn inline-flex items-center justify-center font-bold text-white shadow-lg active:scale-[.97]"
          disabled={!pos}
        >
          OK
        </button>
      {:else}
        {#if timedOut}
          <div class="text-[1.5em] font-semibold text-rose-600">{$dict['feedback.timeout']}</div>
        {:else if feedbackType === 'perfect'}
          <div class="text-[1.5em] font-semibold text-emerald-700">{$dict['slider.perfect']}</div>
        {:else if feedbackType === 'close'}
          <div class="text-[1.5em] font-semibold text-amber-500">{$dict['slider.close']}</div>
        {:else}
          <div class="text-[1.5em] font-semibold text-rose-600">{$dict['slider.wrong']}</div>
        {/if}

        <button
          on:click={next}
          class="next-btn mt-6 inline-flex items-center justify-center font-bold text-white shadow-lg active:scale-[.97]">
          {$dict['btn.next']}
        </button>
      {/if}
    </div>

  </div>
</div>

<style>
@keyframes fadein-up { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
@keyframes fadein { from { opacity: 0;} to { opacity: 1;} }
.animate-fadein-up { animation: fadein-up .35s ease both; }
.animate-fadein { animation: fadein .4s ease both; }

/* Hotspot container */
.hotspot-container {
  position: relative;
  display: inline-block;
  user-select: none;
  touch-action: none;
  border:solid 2px #373b6d;
}
.hotspot-container img.map {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Pin */
.pin {
  position: absolute;
  width: 28px;
  pointer-events: auto;
  touch-action: none;
  display: none;
  z-index:3;
}
.pin.visible { display: block; }

/* Ringer (fasit) */
.ring {
  position:absolute; border:4px solid; border-radius:999px; pointer-events:none;
  box-shadow: none;
}
.ring.inner { border-color:#00ff5e; }
.ring.outer { border-color:#ffa200; }

/* ⭐ Badge (samme som MCQ/TF) */
.badge {
  position: absolute; /* NB: pos settes inline på elementet */
  padding: .15rem .45rem; border-radius: 999px;
  font-weight: 900; font-size: 2rem; line-height: 1;
  color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.35);
  opacity: 1;
  pointer-events: none;
  margin-top:-.8em;
}
.badge.good { background: #087b33; }
.badge.bad  { background: #a90924; }
.badge.show { animation: popscore 1.8s cubic-bezier(.3,1,.6,1) forwards; }

@keyframes popscore {
  0%   { transform: translate(-50%,-140%) translateY(4px) scale(0.9);  opacity: 0; }
  10%  { transform: translate(-50%,-140%) translateY(-4px) scale(1.25); opacity: .8; }
  20%  { transform: translate(-50%,-140%) translateY(-4px) scale(1); opacity: .8; }
  100% { transform: translate(-50%,-140%) translateY(-4px) scale(1); opacity: .8; }
}

/* OK / Neste */
.ok-btn {
  --brand-bg: #00c748d1;
  --brand-bg-hover: #00b33f;
  --brand-border: #089441;
  --text-on-dark: #ffffff;
  --radius-md: .5rem;
  --btn-w: 60%;
  --btn-h: 3em;
  --btn-fs: 1.4rem;

  width: var(--btn-w);
  height: var(--btn-h);
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--btn-fs);
  font-weight: 700;
  margin: .5em auto 0 auto;
  transition: transform .06s ease, background-color .15s ease;
  color: #fff;
  background: var(--brand-bg);
  border: 1px solid var(--brand-border);
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
}
.ok-btn:hover { background: var(--brand-bg-hover); transform: translateY(-2px); }
.ok-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }

.next-btn {
  --brand-bg: #00c748d1;
  --brand-bg-hover: #00b33f;
  --brand-border: #089441;
  --text-on-dark: #ffffff;
  --radius-md: .5rem;
  --btn-w: 60%;
  --btn-h: 3em;
  --btn-fs: 1.4rem;
  font-family: 'Noto Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;

  width: var(--btn-w);
  height: var(--btn-h);
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--btn-fs);
  font-weight: 700;
  margin: .5em auto 1em auto;
  transition: transform .06s ease, background-color .15s ease;
  color: var(--text-on-dark);
  background: var(--brand-bg);
  border: 1px solid var(--brand-border);
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
}
.next-btn:hover { background: var(--brand-bg-hover); transform: translateY(-2px); }
.next-btn:active { transform: scale(.98); }
</style>
