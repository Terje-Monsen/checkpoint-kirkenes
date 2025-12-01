<script lang="ts">
  import { onMount } from 'svelte';
  import { dict, lang } from '$lib/data/i18n';

  const t = (key: string, en: string, no: string) =>
  $dict[key] ?? ($lang === 'en' ? en : no);
</script>

<div class="hero" style="--hero-bg:url('/images/bakgrunn-forside.png')">
  <main class="content">
    <img id="nt-logo" src="/images/nt-logo.svg" alt="Logo Norsk Test as" class="logo" />
    <p class="info">{t('about.info')}</p>
    <img style="width:80%"src='/images/bakgrunn-nt.png'>
  <nav class="actions">
        <a href="mailto:post@norsktest.no?subject=Checkpoint" class="contact-btn" aria-label={t('about.contact', 'Back to home', 'Tilbake til forsiden')}>
          <span>{t('about.contact')}</span>
        </a>
      </nav>

        <nav class="actions">

        <a href="/" class="home-btn" aria-label={t('results.home', 'Back to home', 'Tilbake til forsiden')}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="scale:1.5;color:#e4e4e4">
            <path d="M12 3 3 11h2v8h6v-5h2v5h6v-8h2z" fill="currentColor"/>
          </svg>
          <span>{$dict['finish.home'] ?? 'Checkpoint'}</span>
        </a>
      </nav>
  </main>
  
  
  

      

      
  
    </div>



  <style>
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

  .content {
    position: relative; z-index: 1;
    max-width: var(--content-max);
    margin: 0 auto; padding: 1em 1rem 1rem;
    display: flex; flex-direction: column; align-items: center;
    color: var(--text-on-dark); text-align: center;
    font-size:1.4em;
    
  }

  #nt-logo {
    width:80vw;
    max-width:320px;
    min-width:140px;
    display:block;

    bottom:2.2em;
    top:1em;
  }

  .actions {
    display:flex;
    justify-content:flex-end;
    margin-top:1rem;

    
  }

  .home-btn, .contact-btn {
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

  .contact-btn {


  }
  .home-btn:hover { background:#00b33f; }
</style>