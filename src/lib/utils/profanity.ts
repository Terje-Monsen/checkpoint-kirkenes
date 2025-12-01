// Svært enkel "bad words" blokkering med leetspeak-normalisering.
// Ikke perfekt, men stopper det meste uten å måtte hente pakker.

const BAD_WORDS = [
  // legg til/justér etter behov (norsk/engelsk, uten diakritikk)
  'fuck','shit','cunt','bitch','whore','kill','murder','rape','dick','ass', 'kkk', 'milf', 
  'asshole','slut','faggot','dyke','molest','pedo', 'nige','nigge', 'nigga', 'neger', 'porn', 'jerkoff',
  'kuk','fitt','fitte','jævla','jævlig','faen','helvete','pule','hore','pikk','ræv','rasshøl','knull','runk',
];

function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD') // fjern diakritikk
    .replace(/[\u0300-\u036f]/g, '')
    // enkel leetspeak
    .replace(/[@]/g, 'a')
    .replace(/[0]/g, 'o')
    .replace(/[1!]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[5]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[^a-zæøå ]/g, ''); // behold kun bokstaver/space
}

export function isCleanUsername(name: string) {
  const n = normalize(name).replace(/\s+/g, '');
  // tillat korte navn (min 1 tegn, før 2)
  if (n.length < 1) return true;
  return !BAD_WORDS.some(w => n.includes(w));
}


export function sanitizeUsername(name: string) {
  // Trim og klipp maks 9 tegn
  let s = name.trim().slice(0, 9);

  // Bare bokstaver, tall, mellomrom og æøå (ikke understrek hvis du ikke vil)
  s = s.replace(/[^A-Za-z0-9 æøåÆØÅ\-\.]/g, '');

  // Fjerne doble mellomrom
  s = s.replace(/\s{2,}/g, ' ').trim();

  // Blokker e-post (har @ eller domenesuffix)
  if (/@|\.com|\.no|\.net|\.org|\.se|\.dk/i.test(s)) return 'Spiller';

  // Blokker telefonnummer-lignende (5+ siffer samlet)
  if (/\d{5,}/.test(s)) return 'Spiller';

  // Blokker "fornavn etternavn" (mellomrom + stor forbokstav)
  if (/\s+[A-ZÆØÅ]/.test(s)) return 'Spiller';

  // Bad words
  if (!isCleanUsername(s)) return 'Spiller';

  return s || 'Spiller';
}

export function validateUsername(name: string): { ok: boolean; reason?: string } {
  const raw = name ?? '';
  const trimmed = raw.trim();

  if (trimmed.length === 0) return { ok: false, reason: 'empty' };
  if (trimmed.length > 9) return { ok: false, reason: 'too_long' };

  // Kun bokstaver/tall/mellomrom/æøå/-/.
  if (/[^A-Za-z0-9 æøåÆØÅ\-\.]/.test(trimmed)) {
    return { ok: false, reason: 'invalid_chars' };
  }

  // E-post (enkelt – @ eller kjente domener)
  if (/@|\.com|\.no|\.net|\.org|\.se|\.dk/i.test(trimmed)) {
    return { ok: false, reason: 'email' };
  }

  // Telefon: 5+ sammenhengende siffer
  if (/\d{5,}/.test(trimmed)) {
    return { ok: false, reason: 'phone' };
  }

  // “Fornavn Etternavn” (mellomrom + stor begynnelse i neste ord)
  if (/\s+[A-ZÆØÅ]/.test(trimmed)) {
    return { ok: false, reason: 'fullname' };
  }

  // Bannefilter (med leetspeak-normalisering)
  if (!isCleanUsername(trimmed)) {
    return { ok: false, reason: 'profanity' };
  }

  // Til slutt: sjekk at sanitize ikke endrer navnet (sikkerhetsnett)
  if (sanitizeUsername(trimmed) !== trimmed) {
    return { ok: false, reason: 'sanitized' };
  }

  return { ok: true };
}

