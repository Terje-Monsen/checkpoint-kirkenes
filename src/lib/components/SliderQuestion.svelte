<script lang="ts">
  import { onMount } from 'svelte';
  import TimerBar from './TimerBar.svelte';
  import { sliderScore } from '$lib/utils/score';
  import { dict, tDict, lang } from '$lib/data/i18n';
  import type { Lang } from '$lib/data/i18n';

  // Props
  const {
    text,
    min = 0,
    max = 100,
    start = 50,
    correct = 50,
    scoreRange = 20,
    prefix = '',
    step = 1,
    index,
    total,
    totalScore = 0,
    maxTime = 30,
    maxPoint = 100,
    onDone
  } = $props<{
    text: Record<Lang, string>;
    min?: number; max?: number; start?: number;
    correct?: number; scoreRange?: number; prefix?: string;
    step?: number;
    index: number; total: number; totalScore?: number;
    maxTime?: number; maxPoint?: number;
    onDone: (res: { score:number; elapsed:number; value:number }) => void;
  }>();

  // State
  let value = $state(start);
  let startTs = $state(0);
  let elapsed = $state(0);
  let finished = $state(false);
  let timedOut = $state(false);
  let roundScore = $state(0);
  let visibleScore = $state(totalScore);

  // sync totalscore i header når parent bytter spørsmål
  $effect(() => { visibleScore = totalScore; });

  function now(){ return performance.now(); }
  onMount(() => {
    startTs = now();
    const i = setInterval(() => {
      if (finished) return;
      elapsed = (now() - startTs) / 1000;
      if (elapsed >= maxTime && !finished) {
        finished = true;
        timedOut = true;
        roundScore = 0;
      }
    }, 100);
    return () => clearInterval(i);
  });

  // Hjelpere (prosent)
  function clamp(v:number, lo:number, hi:number){ return Math.max(lo, Math.min(hi, v)); }
  function pct(v:number){
    if (max === min) return 0;
    return clamp(((v - min) / (max - min)) * 100, 0, 100);
  }
  const correctPct   = $derived(pct(correct));
  const bandStartPct = $derived(pct(correct - scoreRange));
  const bandEndPct   = $derived(pct(correct + scoreRange));
  const bandW        = $derived(Math.max(0, bandEndPct - bandStartPct));
  const dist         = $derived(Math.abs(value - correct));
  const isPerfect    = $derived(dist === 0);
  const isClose      = $derived(dist > 0 && dist <= scoreRange);
  const userPct      = $derived(pct(value));

  // Submit
  function submit(){
    if (finished) return;
    finished = true;
    const s = sliderScore({ value, correct, scoreRange, elapsed, maxTime, maxPoint });
    roundScore = s;

    // enkel animert opptelling
    const from = totalScore;
    const to = totalScore + s;
    const steps = 20;
    let cur = from, stepI = 0, diff = (to - from) / steps;
    setTimeout(() => {
      const t = setInterval(() => {
        if (stepI++ >= steps) { visibleScore = to; clearInterval(t); return; }
        cur += diff; visibleScore = Math.round(cur);
      }, 25);
    }, 600);
  }

  function next(){
    onDone?.({
      score: timedOut ? 0 : roundScore,
      elapsed: Math.min(elapsed, maxTime),
      value
    });
  }
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

    <!-- SLIDER + OVERLAYS -->
    <div class="mt-6 px-4">
      <div class="slider-wrap">
        <!-- Track -->
        <div class="track"></div>

        <!-- Toleransebånd -->
        {#if finished}
          <div
            class="band"
            style={`left:${bandStartPct}%; width:${bandW}%;`}
          ></div>

          <!-- Riktig pin (pivot i bunn-senter) -->
          <div
            class="correct-pin"
            style={`left:${correctPct}%;`}
          >
            <div class="pin-img"></div>
            <div class="val">{correct}{prefix}</div>
          </div>
        {/if}

        <!-- POENG-BADGE OVER SLIDER-MARKØR -->
        {#if finished}
          <div
            class="score-badge-wrap"
            style={`left:${userPct}%;`}
          >
            <span
              class="badge {roundScore > 0 ? 'good' : 'bad'} {finished ? 'show' : ''}"
              aria-hidden={!finished}
            >
              +{finished ? roundScore : 0}
            </span>
          </div>
        {/if}

        <!-- Range -->
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          bind:value
          disabled={finished}
          class={`range ${finished ? 'range--finished' : ''}`}
          aria-label="slider"
        />
      </div>

      <!-- Verdi under slider -->
      <div class="value-wrap text-center mt-2">
        <div class="value-readout text-center mt-2 font-semibold">{value}{prefix}</div>
      </div>

      <!-- Submit -->
      {#if !finished}
        <div class="mt-4 flex justify-center">
          <button on:click={submit} class="next-btn inline-flex items-center justify-center font-bold text-white shadow-lg active:scale-[.97]">
            {$dict['btn.ok'] ?? 'OK'}
          </button>
        </div>
      {/if}
    </div>

    <!-- FEEDBACK + NESTE -->
    {#if finished}
      <div class="mt-8 text-center animate-fadein">
        {#if timedOut}
          <div class="text-[1.5em] font-semibold text-rose-600">{$dict['feedback.timeout']}</div>
        {:else}
          <div class="text-[1.6em] font-semibold" style="margin-top:1em">
            {#if isPerfect}
              <span class="text-emerald-700">
                {$dict['slider.perfect'] ?? $dict['feedback.correct'] ?? 'Riktig!'}
              </span>
            {:else if isClose}
              <span class="text-amber-600">
                {$dict['slider.close'] ?? 'Veldig nært!'}
              </span>
            {:else}
              <span class="text-rose-600">
                {$dict['slider.wrong'] ?? $dict['feedback.wrong'] ?? 'Feil!'}
              </span>
            {/if}
          </div>
        {/if}

        <button on:click={next} class="next-btn mt-6 inline-flex items-center justify-center font-bold text-white shadow-lg active:scale-[.97]">
          {$dict['btn.next']}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
@keyframes fadein-up { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
@keyframes fadein { from { opacity: 0;} to { opacity: 1;} }
.animate-fadein-up { animation: fadein-up .35s ease both; }
.animate-fadein { animation: fadein .4s ease both; }

/* Container */
.slider-wrap {
  position: relative;
  margin-inline: 1em;
  margin-top: 4em;
  margin-bottom: 2em;
}

/* Track (full bredde) */
.track {
  position: relative;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #b8d7f0;
  box-shadow: inset 0 1px 2px rgba(0,0,0,.12);
}

/* Overlays */
.band,
.correct-pin {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}

/* Toleransebånd med gradient */
.band {
  top: 50%;
  transform: translateY(-50%) translateX(1px);
  height: 10px;
  border-radius: 5px;
  border: 1px solid rgba(0,0,0,.1);
  background: linear-gradient(
    90deg,
    rgba(255, 251, 38, 1) 10%,
    rgba(0, 189, 79, 1) 50%,
    rgba(255, 251, 38, 1) 90%
  );
  box-shadow: 0 0 6px rgba(0,0,0,.25);
  opacity: 0.75;
}

/* Correct pin: bunn-senter på track-linja */
.correct-pin {
  transform: translate(-50%, 0);
  text-align: center;
  z-index: 2;
}
.correct-pin .pin-img {
  position: relative;
  left: 54%;
  margin-left: -2px;
  width: 3px;
  height: 1em;
  display: block;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,.35));
  background: rgb(0, 190, 32);
}
.correct-pin .val {
  margin-top: .2em;
  font-size: 1.2rem;
  font-weight: 800;
  color: #087b33;
}

/* Range (input) – stor touch-hitbox og god drag på mobil */
.range {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  width: 100%;
  height: 80px;                  /* stor hitbox */
  position: absolute;
  top: 50%;                      /* sentrer over track */
  left: 0;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 3;
  touch-action: none;            /* gjør horizontal drag mer responsiv */
}

/* Kun for Firefox */
@supports (-moz-appearance: none) {
  .range {
    top: 50%;
  }
}
.range:disabled { cursor: default; }

/* Nøytraliser native track */
.range::-webkit-slider-runnable-track { background: transparent; height: 48px; }
.range::-moz-range-track { background: transparent; height: 48px; }
.range::-moz-range-progress { background: transparent; }

/* Thumb input-range (default) */
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 3px;
  height: 32px;
  outline: 5px solid #389af1 ;
  background: #389af1;
  border-radius:3px;
  border-bottom-left-radius:6px;
  border-bottom-right-radius:6px;
  box-shadow: 0 3px 6px rgba(0,0,0,.25);
  transition: transform .1s ease;
}

.range:disabled::-webkit-slider-thumb {
  outline: 2px solid #616161 ;
  background: #616161;
  border-radius:3px;
}

/* --- FIREFOX --- */
.range::-moz-range-thumb {
  width: 3px;
  height: 32px;
  background: #389af1;
  border: none;
  border-radius: 3px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transition: transform 0.1s ease;
  outline: 5px solid #389af1;
}
.range:disabled::-moz-range-thumb {
  background: #616161;
  outline: 2px solid #616161;
}
.range::-moz-range-track {
  background: transparent;
  border: none;
}

/* TOUCH / MOBIL: mye større tommel (bedre å treffe) */
@media (pointer: coarse) {
  .slider-wrap {
    margin-top: 3em;
    margin-bottom: 2.5em;
  }

  .range {
    height: 96px; /* enda større touch-flate */
  }

  .range::-webkit-slider-thumb {
    width: 28px;
    height: 48px;
    outline-width: 6px;
  }

  .range::-moz-range-thumb {
    width: 28px;
    height: 48px;
    outline-width: 6px;
  }
}

/* Neste-knapp */
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
  margin: 1em auto 1em auto;
  transition: transform .06s ease, background-color .15s ease;
  color: var(--text-on-dark);
  background: var(--brand-bg);
  border: 1px solid var(--brand-border);
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
}
.next-btn:hover { background: var(--brand-bg-hover); transform: translateY(-2px); }
.next-btn:active { transform: scale(.98); }

.value-readout {
  font-size: 2em;
  line-height: 1.1;
  margin-top: 1.8em;
  margin-left: auto;
  margin-right: auto;
  width: 5em;
  padding: .5em;
  background: #efefff;
  border: solid 1px #d3d3d3;
}

/* Wrapper som plasserer badgen over slider-markøren */
.score-badge-wrap {
  position: absolute;
  bottom: 100%;
  transform: translate(-50%, -0.8rem);
  z-index: 5;
  pointer-events: none;
}

.badge {
  display: inline-block;
  padding: .15rem .45rem;
  border-radius: 999px;
  font-weight: 900;
  font-size: 2rem;
  line-height: 1;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,.35);
  opacity: 1;
  text-align:center;
}

.badge.good { background: #087b33; }
.badge.bad  { background: #a90924; }

.badge.show {
  animation: popscore 1.8s cubic-bezier(.3,1,.6,1) forwards;
}

@keyframes popscore {
  0%   { transform: translateY(4px) scale(0.9);  opacity: 0; }
  10%  { transform: translateY(-4px) scale(1.25); opacity: .9; }
  20%  { transform: translateY(-4px) scale(1); opacity: .8; }
  100% { transform: translateY(-4px) scale(1); opacity: .8; }
}

.val-wrapper {
  position: relative;
  display: inline-block;
}

.val.user {
  margin-top: 16px;
  font-size: 1.2rem;
  font-weight: 800;
  color: #203a66;
}

/* 👇 NYTT: gjør slider-pin smalere når finished */
.range.range--finished:disabled::-webkit-slider-thumb {
  width: 6px;
  height: 28px;
  outline-width: 2px;
}

.range.range--finished:disabled::-moz-range-thumb {
  width: 6px;
  height: 28px;
  outline-width: 2px;
}
</style>
