<script lang="ts">
  import { loadBoard, getRankByTs, addProvisional, renameEntry } from '$lib/stores/leaderboard';
  import { validateUsername } from '$lib/utils/profanity';
  import { dict, lang } from '$lib/data/i18n';
  import { getMaxScore } from '$lib/data/quiz';

  const {
    finalScore,
    correctCount = 0,
    totalQuestions = 0,
    onRestart
  } = $props<{
    finalScore: number;
    correctCount?: number;
    totalQuestions?: number;
    onRestart?: () => void;
  }>();



  // i18n helpers – flate nøkler
  const t = (k: string) => $dict[`finish.${k}`] ?? k;
  const terr = (k: string) => $dict[`finish.errors.${k}`] ?? k;
  const baseName = $derived($dict['finish.defaultBaseName'] || 'Spiller');

  // Palett fra MultipleChoice
  const hex = ['#f36165', '#389af1', '#ffd65a', '#63bd6f'];
  const hextxt = ['#7a0505', '#183b6d', '#7c4d01', '#095a13'];

  // state
  let name = $state('');
  let saved = $state(false);
  let rank = $state<number | null>(null);
  let board = $state(loadBoard());
  let entryTs = $state<number | null>(null);

  const valid = $derived(validateUsername(name));

  const maxScore = getMaxScore();

  // Auto-lagre scoren når siden vises (språk-tilpasset basisnavn)
  $effect(() => {
    if (entryTs == null && finalScore != null) {
      const { ts, rank: initialRank } = addProvisional(finalScore, baseName);
      entryTs = ts;
      name = ''; // la brukeren skrive sitt eget
      rank = initialRank;
      board = loadBoard();
    }
  });

  // Hold rank oppdatert etter rename / endringer
  $effect(() => {
  if (entryTs != null) {
    const r = getRankByTs(entryTs);
    if (r != null) {
      rank = r;          // kun overskriv hvis vi faktisk fant en plassering
    }
  }
  });

  // Score-anim
  let visible = $state(0);
  $effect(() => {
    visible = 0;
    const steps = 30;
    const diff = finalScore / steps;
    let s = 0;
    const tId = setInterval(() => {
      s++;
      visible = Math.round(Math.min(finalScore, s * diff));
      if (s >= steps) clearInterval(tId);
    }, 20);
    return () => clearInterval(tId);
  });


  // Donut-params for score
  // Donut-params for score
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const scoreRatio = $derived(
    !maxScore || maxScore <= 0
      ? 0
      : Math.max(0, Math.min(visible / maxScore, 1)) // 0–1
  );

  const filledLength = $derived(circumference * scoreRatio);



  async function submit() {
    if (!valid.ok || entryTs == null) return;
    const safe = name.trim();

    // Oppdatér lokal leaderboard (som før)
    const newRank = renameEntry(entryTs, safe);
    board = loadBoard();
    rank = newRank ?? rank;

    // Lagre til Supabase via API
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: safe || baseName,   // fall-back om noe rart skjer
          score: finalScore
          // ev. utvid med correctCount, totalQuestions, språk, osv.
        })
      });
    } catch (e) {
      console.error('Klarte ikke å lagre til Supabase', e);
      // Du kan evt. vise en liten feilmelding her
    }

    saved = true;
    burstConfetti();
  }


  // Ordinal/plassering
  function formatRank(r?: number | null) {
    if (!r) return '';
    if ($lang === 'en') {
      const j = r % 10;
      const k = r % 100;
      const suf =
        j === 1 && k !== 11
          ? 'st'
          : j === 2 && k !== 12
          ? 'nd'
          : j === 3 && k !== 13
          ? 'rd'
          : 'th';
      return `${r}${suf}`;
    }
    return `${r}`;
  }

  // Konfetti
  let cnv: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  function burstConfetti() {
    if (!ctx) return;
    for (let i = 0; i < 80; i++) {
      const color = hex[Math.floor(Math.random() * hex.length)];
      particles.push({
        x: cnv.width / 2,
        y: cnv.height / 4,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -5 - 2,
        life: 120 + Math.random() * 40,
        color
      });
    }
  }

  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.globalAlpha = 1;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life--;
    });
    particles = particles.filter((p) => p.life > 0);
    ctx.save();
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 160));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 8);
    });
    ctx.restore();
    requestAnimationFrame(tick);
  }

  function onCanvas(el: HTMLCanvasElement) {
    cnv = el;
    ctx = cnv.getContext('2d');
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cnv.width = el.clientWidth * dpr;
      cnv.height = Math.max(220, el.clientHeight * dpr);
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    tick();
  }

  const top5 = $derived(board.slice(0, 5));
</script>

<div
  class="finish-wrap"
  style={`--c1:${hex[0]}; --c2:${hex[1]}; --c3:${hex[2]}; --c4:${hex[3]};
          --t1:${hextxt[0]}; --t2:${hextxt[1]}; --t3:${hextxt[2]}; --t4:${hextxt[3]};`}
>
  <canvas use:onCanvas class="confetti"></canvas>

  <div class="card">

    <div class="badge">🎖️</div>
    <h2 class="title">{t('title')}</h2>

    <!-- RUNDE BADGER: kun tall inne, label under -->
        <div class="summary-badges">
      <div class="stat-badge">
       <svg class="donut" viewBox="0 0 100 100" aria-hidden="true">
        <!-- bakgrunnsring -->
        <circle
          class="donut-bg"
          cx="50"
          cy="50"
          r={radius}
        />



        <!-- fremdriftsring -->
        <circle
          class="donut-fg"
          cx="50"
          cy="50"
          r={radius}
          stroke-dasharray={`${filledLength} ${circumference}`}
          stroke-dashoffset="0"
        />

        <!-- tekst -->
        <text
          x="50"
          y="50"
          text-anchor="middle"
          dominant-baseline="central"
          class="donut-text"
        >
          {visible}
        </text>
</svg>

        <span class="stat-label">
          {t('scoreLabel') ?? ($lang === 'en' ? 'Score' : 'Poengsum')}
        </span>
      </div>



      <div class="stat-badge">
        <div class="circle correct-circle">
          <span class="circle-value">
            {totalQuestions ? `${correctCount}/${totalQuestions}` : correctCount}
          </span>
        </div>
        <span class="stat-label">
          {t('correctLabel') ?? ($lang === 'en' ? 'Correct answers' : 'Antall riktige')}
        </span>
      </div>
    </div>


  {#if rank != null}
    <p class="placement">
      {t('rankLabel')}: <b>{formatRank(rank)}</b>
      {#if board?.length}
        {t('ofPlayers').replace('{count}', board.length.toString())}
      {/if}
    </p>
  {/if}

    {#if !saved}
      <div class="name-form">
        <div class="row">
          <input
            id="name"
            placeholder={t('namePlaceholder')}
            bind:value={name}
            maxlength="9"
            aria-invalid={!valid.ok}
            class:invalid={!!name && !valid.ok}
            on:input={(e) => {
              const el = e.target as HTMLInputElement;
              // kun lovlige tegn og maks 9 tegn
              el.value = el.value.replace(/[^A-Za-z0-9 æøåÆØÅ\-\.]/g, '').slice(0, 9);
              name = el.value;
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (valid.ok) submit();
              }
            }}
          />
          <button class="primary" on:click={submit} disabled={!valid.ok}>
            {t('save')}
          </button>
        </div>

        <p class="hint">
          {#if !!name && !valid.ok}
            {terr(valid.reason || 'empty')}
          {:else}
            {t('nameHint')}
          {/if}
        </p>
      </div>
    {:else}
      <div class="saved">
        <p>
          {t('savedAs')} <b>{name}</b>
          {#if rank} ({t('place')} {formatRank(rank)}){/if}.
        </p>
      </div>
    {/if}

    <div class="leaderboard">
      <h3>{t('leaderboard')}</h3>
      <ol>
        {#each top5 as e, i}
          <li>
            <span class="pos">#{i + 1}</span>
            <span class="n">{e.name}</span>
            <span class="s">{e.score}</span>
          </li>
        {/each}
      </ol>
    </div>

    <div class="actions">
      <a
        href="/"
        class="home-btn"
        aria-label={$lang === 'en' ? 'Checkpoint' : 'Checkpoint'}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 3 3 11h2v8h6v-5h2v5h6v-8h2z" fill="currentColor" />
        </svg>
        <span>{$dict['finish.home'] ?? 'Checkpoint'}</span>
      </a>

      {#if onRestart}
        <button class="secondary" on:click={onRestart}>
          {$dict['finish.back'] ?? ($lang === 'en' ? 'Back' : 'Tilbake')}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .finish-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100dvh;
    padding: 1.4rem 1em;
    color: var(--t2, #183b6d);
    background-image: var(--hero-bg, url('/images/bakgrunn-forside.png'));
    background-size: cover;
    background-position: left;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }

  .confetti {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .card {
    z-index: 1;
    width: 80%;
    max-width: 400px;
    border-radius: 16px;
    padding: 1.25rem clamp(1rem, 3vw, 2rem);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.16);
  }

  .badge {
    position: absolute;
    top: -14px;
    left: 20px;
    background: var(--c3, #ffb63f);
    color: var(--t3, #7c4d01);
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    font-weight: 900;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    scale: 1.2;
  }

  .title {
    font-size: 1.5rem;
    margin: .4rem 0 .6rem;
    color: #183b6d;
    font-weight: 900;
    text-align:center;
  }

  /* RUNDE STAT-BOKSER */
  .summary-badges {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
    margin: 0.25rem 0 1.5rem;
    flex-wrap: wrap;
  }

  .stat-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
  }


  .score-value {
    font-size: 1.6rem;
    animation: pop 0.4s ease;
  }

  .stat-label {
    font-size: 1rem;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #203a66;
    opacity: 0.95;
    font-weight:600;
  }

  @keyframes pop {
    0% {
      transform: scale(0.9);
    }
    40% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .placement {
    font-size:1em;
  margin: -0.5rem 0 1.1rem;
  opacity: 0.95;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #203a66;
  text-align: center; /* 👈 Midtstill teksten */
  letter-spacing: 0.08em;
  }

  .placement b {
    
    color: var(--c3, #ffb63f);
    font-weight:800;
    font-size:1.2em;
  }

  .name-form {
    margin: 1rem 0 1.25rem;
  }

  .name-form label {
    display: block;
    margin-bottom: 0.35rem;
    color: #203a66;
    font-weight: 700;
  }

  .row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.7rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(32, 58, 102, 0.2);
    background: #ffffff;
    color: #183b6d;
    outline: none;
    font-size: 1.2em;
    max-width: 7.5em;
  }

  input:focus {
    border-color: var(--c2, #389af1);
    box-shadow: 0 0 0 3px rgba(56, 154, 241, 0.25);
  }

  input.invalid {
    border-color: #f36165;
    box-shadow: 0 0 0 3px rgba(243, 97, 101, 0.25);
  }

  .hint {
    margin: 0.4rem 0 0;
    font-size: 0.9rem;
    color: #7a0505;
    opacity: 0.9;
  }

  .saved {
    margin: 0.75rem 0 1.25rem;
    font-size: 0.98rem;
    color: #203a66;
  }

  .primary {
    padding: 0.7rem 1rem;
    border-radius: 12px;
    border: 1px solid #089441;
    cursor: pointer;
    font-weight: 800;
    color: #ffffff;
    background: #00c748d1;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  }

  .primary:hover {
    background: #00b33f;
  }

  .primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .secondary {
    padding: 0.7rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(32, 58, 102, 0.25);
    background: #ffffff;
    color: #183b6d;
    font-weight: 700;
    cursor: pointer;
  }

  .secondary:hover {
    border-color: #203a66;
  }

  .leaderboard {
    margin: 1rem 0 0;
  }

  .leaderboard h3 {
    margin: 0 0 0.5rem;
    color: #183b6d;
  }

  .leaderboard ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .leaderboard li {
    display: grid;
    grid-template-columns: 3ch 1fr auto;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid rgba(32, 58, 102, 0.18);
    margin-bottom: 0.4rem;
    color: #183b6d;
  }

  .leaderboard .pos {
    opacity: 0.85;
  }

  .leaderboard .n {
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .leaderboard .s {
    font-variant-numeric: tabular-nums;
    font-weight: 900;
    color: #203a66;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .home-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border-radius: 12px;
    text-decoration: none;
    border: 1px solid #089441;
    background: #00c748d1;
    color: #fff;
    font-weight: 800;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  }

  .home-btn:hover {
    background: #00b33f;
  }

  .donut {
    width: 88px;
    height: 88px;
    display: block;
  }

.donut-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.25);
  stroke-width: 14; /* samme tykkelse som donut-fg for fin matching */
}


.donut-fg {
  fill: none;
  stroke: #183b6d;
  stroke-width: 14; /* +20–30%, juster mellom 12–15 */
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dasharray 0.25s ease-out;
}

.donut-text {
  font-size: 1.4rem;
  font-weight: 900;
  fill: white;
}


  .circle {
    width: 88px;
    height: 88px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.9);
  }

  .score-circle {
    background: var(--c2, #389af1);
    color: #ffffff;
  }

.correct-circle {
  width: 88px;          /* samme størrelse som donut */
  height: 88px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
 
  border:0;
  background: #183b6d;  /* behold din mørke blå */
  color: #ffffff;
}

  .circle-value {
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: -0.03em;
  }



</style>
