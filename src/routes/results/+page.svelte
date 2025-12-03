<script lang="ts">
  export const ssr = false;
  export const prerender = false;

  import { onMount } from 'svelte';
  import { loadBoard } from '$lib/stores/leaderboard';
  import { dict, lang } from '$lib/data/i18n';

  type Row = { name: string; score: number; at?: string };

  let board: Row[] = [];
  let loading = true;
  let error: string | null = null;

  $: top10 = board.slice(0, 10);

  const t = (key: string, en: string, no: string) =>
    $dict[key] ?? ($lang === 'en' ? en : no);

onMount(async () => {
  try {
    const res = await fetch('/api/scores');
    console.log('GET /api/scores status:', res.status);

    if (!res.ok) {
      const txt = await res.text();
      console.error('Feil fra /api/scores:', res.status, txt);
      error = 'Kunne ikke hente resultater.';
      return;
    }

    const data = (await res.json()) as Row[];
    console.log('Supabase leaderboard:', data);
    board = data;
  } catch (err) {
    console.error('Nettverksfeil mot /api/scores:', err);
    error = 'Kunne ikke hente resultater.';
  } finally {
    loading = false;   // ⬅️ kjører ALLTID til slutt
  }
});


</script>

<div class="hero" style="--hero-bg:url('/images/bakgrunn-forside.png')">
  <main class="content">
    <div class="card">
      <div class="badge">🎖️</div>
      <h2 class="title">{t('results.title', 'Leaderboard', 'Resultatliste')}</h2>

      {#if loading}
        <div class="empty">
          {t('results.loading', 'Loading results…', 'Laster resultater…')}
        </div>
      {:else if error}
        <div class="empty">
          {t('results.error', 'Could not load results.', 'Kunne ikke hente resultater.')}
        </div>
      {:else if top10.length === 0}
        <div class="empty">
          {t('results.empty', 'No results yet.', 'Ingen resultater ennå.')}
        </div>
      {:else}
        <ol class="list">
          {#each top10 as e, i}
            <li class="row">
              <span class="pos">#{i + 1}</span>
              <span class="name" title={e.name}>{e.name}</span>
              <span class="score">{e.score}</span>
            </li>
          {/each}
        </ol>
        <p class="foot">
          {t('results.total', 'Total players:', 'Totalt antall spillere:')} {board.length}
        </p>
      {/if}

      <nav class="actions">
        <a
          href="/"
          class="home-btn"
          aria-label={t('results.home', 'Back to home', 'Tilbake til forsiden')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 3 3 11h2v8h6v-5h2v5h6v-8h2z" fill="currentColor"/>
          </svg>
          <span>{$dict['finish.home'] ?? 'Checkpoint'}</span>
        </a>
      </nav>
    </div>
  </main>
</div>

<style>
  :root {
    --brand-bg: #00c748d1;
    --brand-bg-hover: #00b33f;
    --brand-border: #089441;
    --text-on-dark: #ffffff;
    --radius-md: .5rem;
    --content-max: 420px;
  }

  html, body { margin:0; padding:0; }

  .hero {
    position: relative;
    min-height: 100dvh;
    width: 100%;
    background-image: var(--hero-bg);
    background-position: left;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .content {
    position: relative;
    z-index: 1;
    max-width: 400px;
    width:80%;
    margin: 0 auto;
    padding: 1.4em 1rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-on-dark);
    text-align: center;
  }

  .card {
    position: relative;
    width: 100%;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 10px 28px rgba(0,0,0,.12);
    background:rgba(255, 255, 255, 0.158); 
  }

  .badge {
    position:absolute; top:-14px; left:20px;
    background:var(--c3, #ffb63f); color:var(--t3, #7c4d01);
    padding:.35rem .6rem; border-radius:999px; font-weight:900;
    box-shadow:0 6px 16px rgba(0,0,0,.15);
    scale:1.2;
  }

  .title {
    margin:0 0 1rem;
    color:#183b6d;
    font-weight:900;
    font-size:clamp(1.6rem,4vw,2.2rem);
  }

  .empty {
    padding:1rem;
    text-align:center;
    color:#5b6a86;
    border:1px dashed rgba(32,58,102,.3);
    border-radius:12px;
    background:#fff;
  }

  .list {
    list-style:none;
    margin:0;
    padding:0;
  }

  .row {
    display:grid;
    grid-template-columns: 4ch 1fr auto;
    gap:.75rem;
    align-items:center;
    padding:.6rem .75rem;
    margin-bottom:.5rem;
    background:#fff;
    color:#183b6d;
    border:1px solid rgba(32,58,102,.18);
    border-radius:12px;
  }

  .pos { font-weight:800; opacity:.9; }
  .name { font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .score { font-variant-numeric: tabular-nums; font-weight:900; }
  .foot { margin:.5rem .25rem 0; font-size:.95rem; opacity:.85; }

  .actions {
    display:flex;
    justify-content:flex-end;
    margin-top:1rem;
  }

  .home-btn {
    display:inline-flex;
    align-items:center;
    gap:.5rem;
    padding:.7rem 1rem;
    border-radius:12px;
    text-decoration:none;
    border:1px solid #089441;
    background:#00c748d1;
    color:#fff;
    font-weight:800;
    box-shadow:0 6px 14px rgba(0,0,0,.15);
  }
  .home-btn:hover { background:#00b33f; }

  .footer {
    margin-left:auto;
    margin-right:auto;
    font-size: 10px;
    letter-spacing: .08em;
    text-transform: uppercase;
    position:fixed;
    bottom:2em; 
    color: rgba(255,255,255,.8);
  }
</style>
