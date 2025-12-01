<script lang="ts">
  import { onMount } from 'svelte';
  import { lang, setLang, dict, type Lang } from '$lib/data/i18n';

  let mounted = false;
  onMount(() => { mounted = true; });

  function onLangChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as Lang;
    setLang(value);
  }
</script>



<div class="hero" style="--hero-bg:url('/images/bakgrunn-forside.png')">
  <div class="lang-switch" aria-label={$dict['home.chooseLang']}>
    
    {#if mounted}
      <img
        src={$lang === 'no' ? '/images/lang-no.png' : '/images/lang-eng.png'}
        alt={$lang === 'no' ? 'Norsk flagg' : 'Engelsk flagg'}
        class="lang-switch__flag"
      />
    {/if}
    
  <label class="visually-hidden" for="lang-select">
    {$dict['home.chooseLang']}
  </label>
  <select
    id="lang-select"
    value={$lang}
    on:change={onLangChange}
    aria-label={$dict['home.chooseLang']}
    class="lang-switch__select"
  >
    <option value="no">Norsk</option>
    <option value="en">English</option>
  </select>
  
</div>

<main class="content">
  <img src="/images/checkpoint-logo-sv.svg" alt="Checkpoint logo" class="logo" />

  <p class="intro">{$dict['home.info']}</p>

  <nav class="nav" aria-label="Forsidevalg">
    <a href="/quiz" sveltekit:prefetch class="btn btn--primary">
      {$dict['home.start']}
    </a>
    <a href="/results" sveltekit:prefetch class="btn btn--primary">
      {$dict['home.leaderboard']}
    </a>
    <a href="/about" sveltekit:prefetch class="btn btn--primary">
      {$dict['home.about']}
    </a>
  </nav>

  </main>

  <img id="nt-logo" src="/images/nt-logo.svg" alt="Logo Norsk Test as" class="logo" />
</div>

<style>
  :root {
    --brand-bg: #00c748d1;
    --brand-bg-hover: #00b33f;
    --brand-border: #089441;
    --text-on-dark: #ffffff;
    --radius-md: .5rem;
    --content-max: 420px;
    --btn-w: 60%;
    --btn-h: 3em;
    --btn-fs: 1.4rem;
  }

  html, body { margin: 0; padding: 0; }

  .visually-hidden {
    position: absolute;
    clip: rect(1px,1px,1px,1px);
    clip-path: inset(50%);
    height: 1px; width: 1px; overflow: hidden; white-space: nowrap;
  }

  .hero {
    position: relative;
    min-height: 100dvh;
    width: 100%;
    background-image: var(--hero-bg);
    background-position: left;
    background-size: cover;
    background-repeat: no-repeat;
    height:100%;
  }

  #nt-logo {
    width:50vw;
    max-width:320px;
    min-width:140px;
    display:block;
    right:1em;;
    position:absolute;
    bottom:1em;
  }
  .lang-switch {
    position: absolute; top: 1rem; right: 1rem; z-index: 10;
    display: flex; align-items: center; gap: .5rem;
  }
  .lang-switch__flag {
    height: 28px; width: auto;
    border-radius: 6px; border: 1px solid rgba(255,255,255,.5);
  }
  .lang-switch__select {
    width: 5.5rem; height: 30px; padding: 0 .5em; font-size: .95rem; font-weight: 600;
    color: #111; background: rgba(255,255,255,.95);
    border: 1px solid rgba(255,255,255,.5); border-radius: 6px; outline: none;
    appearance: none;
    background-image:
      linear-gradient(45deg, transparent 50%, #555 50%),
      linear-gradient(135deg, #555 50%, transparent 50%);
    background-position: calc(100% - 14px) 50%, calc(100% - 9px) 50%;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
  }
  .lang-switch__select:focus { box-shadow: 0 0 0 3px rgba(255,255,255,.6); }

  .content {
    position: relative; z-index: 1;
    max-width: var(--content-max);
    margin: 0 auto; padding: 3em 1rem 2.5rem;
    display: flex; flex-direction: column; align-items: center;
    color: var(--text-on-dark); text-align: center;

  }

  .logo { width: 80%; max-width: 300px; margin-top: 2rem; margin-bottom: 1.5rem; }

  .intro { font-size: 1.4em; line-height: 1.4; padding: .5rem; margin: 0; }

  .nav { margin-top: 1rem; width: 100%; display: flex; flex-direction: column; align-items: center; }
  .btn {
    width: var(--btn-w); height: var(--btn-h);
    display: flex; align-items: center; justify-content: center;
    border-radius: var(--radius-md);
    text-decoration: none; font-size: var(--btn-fs); font-weight: 700;
    margin-bottom: 1em; transition: transform .06s ease, background-color .15s ease;
  }
  .btn--primary { color: #fff; background: var(--brand-bg); border: 1px solid var(--brand-border); }
  .btn--primary:hover { background: var(--brand-bg-hover); }
  .btn--primary:active { transform: translateY(1px) scale(.99); }
  .btn--primary:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

  .footer {
    margin-top: auto; padding-top: 2rem;
    font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.8);
  }

  @media (min-width: 480px) { :root { --btn-w: 55%; } }
  @media (min-width: 640px) { :root { --btn-w: 50%; } }
</style>
