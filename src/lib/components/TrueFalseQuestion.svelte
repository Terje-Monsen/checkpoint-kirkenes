<script lang="ts">
  import { onMount } from 'svelte';
  import TimerBar from './TimerBar.svelte';
  import { timeScoreLinear } from '$lib/utils/score';
  import { dict, tDict, lang, resolveCorrect } from '$lib/data/i18n';
  import type { Lang } from '$lib/data/i18n';

  const {
    text,
    options,
    correct,
    index = 1,
    total = 1,
    totalScore = 0,
    maxTime = 30,
    maxPoint = 100,
    minPoint = 50,
    onDone
  } = $props<{
    text: Record<Lang, string>;
    options: Record<Lang, [string, string]>;
    correct: string | Record<Lang, string>;
    index?: number;
    total?: number;
    totalScore?: number;
    maxTime?: number; maxPoint?: number; minPoint?: number;
    onDone: (res:{correct:boolean; score:number; elapsed:number; choice:string})=>void;
  }>();

  // Språk-derivert
  const optionsForLang = $derived(options[$lang]);
  const correctForLang = $derived(resolveCorrect<string | string[]>(correct as any, $lang) as string);

  // A/B
  const a = $derived(optionsForLang?.[0] ?? '');
  const b = $derived(optionsForLang?.[1] ?? '');

  // State
  let startTs = $state(0);
  let elapsed = $state(0);
  let finished = $state(false);
  let timedOut = $state(false);
  let choice = $state<string>('');
  let roundScore = $state(0);

  // Header-score
  let visibleScore = $state(totalScore);
  $effect(() => { visibleScore = totalScore; });

  // Viser korrekt knapp etter en liten forsinkelse ved feil svar
  let showCorrectAfterDelay = $state(false);

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

  function choose(opt: string) {
    if (finished) return;
    finished = true;
    choice = opt;

    const isCorrect = opt === correctForLang;
    const s = timeScoreLinear({ correct: isCorrect, elapsed, maxTime, maxPoint, minPoint });
    roundScore = s;

    // Header-opptelling
    const from = totalScore;
    const to = totalScore + s;
    const steps = 20;
    let cur = from, step = 0, diff = (to - from) / steps;
    setTimeout(() => {
      const t = setInterval(() => {
        if (step++ >= steps) { visibleScore = to; clearInterval(t); return; }
        cur += diff; visibleScore = Math.round(cur);
      }, 25);
    }, 800);

    // Pop av korrekt etter delay hvis feil
    if (!isCorrect) {
      showCorrectAfterDelay = false;
      setTimeout(() => (showCorrectAfterDelay = true), 900);
    } else {
      showCorrectAfterDelay = true; // riktig valgt -> pop umiddelbart
    }
  }

  function next() {
    onDone?.({
      correct: choice === correctForLang,
      score: roundScore,
      elapsed: Math.min(elapsed, maxTime),
      choice
    });
  }

  // Farger
  const hex = ['#389af1', '#f36165'];
  const hextxt = ['#183b6d', '#7a0505'];
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

    <!-- SVARALTERNATIVER -->
    <div class="mt-6 grid grid-cols-2 gap-3" style="margin:1em">
      {#each [a, b] as opt, i}
        {@const isChosen = choice === opt}
        {@const isCorrect = opt === correctForLang}
        {@const userWasCorrect = choice && (choice === correctForLang)}

        <!-- Opacity:
             - Hvis riktig svar: full opacity hvis (userWasCorrect || showCorrectAfterDelay), ellers .25
             - Valgt feil: 1
             - Andre feil: .25
        -->
        {@const opacity =
          finished
            ? (isCorrect
                ? (userWasCorrect || showCorrectAfterDelay ? 1 : 0.25)
                : (isChosen ? 1 : 0.25))
            : 1}

        <!-- Pop/scale:
             - Valgt knapp popper alltid
             - Riktig knapp popper når den vises (umiddelbart hvis riktig valgt, etter delay hvis feil valgt)
        -->
        {@const willPop =
          finished && (isChosen || (isCorrect && showCorrectAfterDelay))}

        <button
          on:click={() => choose(opt)}
          disabled={finished}
          class="answer-btn font-bold shadow-md transition-all duration-200 active:scale-[.97] hover:brightness-[1.08] {willPop ? 'answer-pop' : ''}"
          style={`background:${hex[i % hex.length]};
                  color:${hextxt[i % hextxt.length]};
                  opacity:${opacity};`}
        >
          {opt}

          {#if finished && isChosen}
            <span class="badge {(isCorrect ? 'good' : 'bad')} show">
              {(isCorrect ? `+${roundScore}` : '+0')}
            </span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- FEEDBACK + NESTE -->
    {#if finished}
      <div class="mt-8 text-center animate-fadein">
        {#if timedOut}
          <div class="text-[1.5em] font-semibold text-rose-600">{$dict['feedback.timeout']}</div>
        {:else if choice === correctForLang}
          <div class="text-[1.5em] font-semibold text-emerald-700">
            {tDict($dict, 'feedback.correct', { points: roundScore })}
          </div>
        {:else}
          <div class="text-[1.5em] font-semibold text-rose-600">{$dict['feedback.wrong']}</div>
        {/if}

        <button
          on:click={next}
          class="next-btn mt-6 inline-flex items-center justify-center font-bold text-white shadow-lg active:scale-[.97]">
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

/* Knapper (runde) */
.answer-btn {
  aspect-ratio: 1 / 1;
  display: flex; align-items: center; justify-content: center;
  border: none;
  border-radius: 50%;
  font-size: 1.5em;
  cursor: pointer;
  margin:.25em;
  position:relative;
}

/* Felles pop (lik som ved klikk) */
@keyframes cardPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.answer-pop { animation: cardPop .35s ease; }

/* Badge (poeng) */
.badge {
  position: absolute; top: -1rem; right: -.5rem;
  padding: .15rem .45rem; border-radius: 999px;
  font-weight: 900; font-size: 2rem; line-height: 1;
  color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.35);
  opacity: 1;
}
.badge.good { background: #087b33; }
.badge.bad  { background: #a90924; }
.badge.show { animation: popscore 1.8s cubic-bezier(.3,1,.6,1) forwards; }

@keyframes popscore {
  0%   { transform: translateY(4px) scale(0.9);  opacity: 0; }
  10%  { transform: translateY(-4px) scale(1.25); opacity: .8; }
  20%  { transform: translateY(-4px) scale(1); opacity: .8; }
  100% { transform: translateY(-4px) scale(1); opacity: .8; }
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
