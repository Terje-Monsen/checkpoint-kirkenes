// src/lib/data/i18n.ts
import { writable, derived, type Readable } from 'svelte/store';
export type Lang = 'no' | 'en';

import NO from './i18n.no';
import EN from './i18n.en';

// Utvid importerte ordbøker med eventuelle nye nøkler (fallback hvis de ikke finnes i filene)
const NO_DICT: Record<string, string> = Object.freeze({
  ...NO,
  'btn.ok': NO['btn.ok'] ?? 'OK',
  'slider.perfect': NO['slider.perfect'] ?? 'Riktig!',
  'slider.close': NO['slider.close'] ?? 'Veldig nært!',
  'slider.wrong': NO['slider.wrong'] ?? 'Feil!',
  'slider.distance': NO['slider.distance'] ?? 'Avstand',
});

const EN_DICT: Record<string, string> = Object.freeze({
  ...EN,
  'btn.ok': EN['btn.ok'] ?? 'OK',
  'slider.perfect': EN['slider.perfect'] ?? 'Correct!',
  'slider.close': EN['slider.close'] ?? 'Very close!',
  'slider.wrong': EN['slider.wrong'] ?? 'Wrong!',
  'slider.distance': EN['slider.distance'] ?? 'Distance',
});

export function resolveCorrect<T extends string | string[]>(
  correct: T | Record<Lang, T>,
  curLang: Lang // <- unngå navnekonflikt med lang-store
): T {
  return (typeof correct === 'string' || Array.isArray(correct))
    ? (correct as T)
    : (correct as Record<Lang, T>)[curLang];
}

const DICTS: Record<Lang, Record<string, string>> = { no: NO_DICT, en: EN_DICT };

// Finn initialt språk.
// - På SSR finnes ikke window -> faller tilbake til 'no' i HTML-en.
// - I browser (hydrasjon) leses localStorage og settes som initialverdi,
//   slik at både $lang og $dict får samme startverdi i klienten.
let initial: Lang = 'no';
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('airportquiz_lang');
  if (saved === 'no' || saved === 'en') initial = saved;
}

// ÉN kilde for sannhet: språk-store
export const lang = writable<Lang>(initial);

// Persistér språk i browser
if (typeof window !== 'undefined') {
  lang.subscribe((l) => {
    try {
      localStorage.setItem('airportquiz_lang', l);
    } catch {
      // ignorer hvis localStorage er blokkert
    }
  });
}

// Reaktiv ordbok for gjeldende språk
export const dict: Readable<Record<string, string>> = derived(lang, ($lang) => DICTS[$lang]);

// Setter
export function setLang(l: Lang) {
  lang.set(l);
}

// Hjelpefunksjon for variabler i tekst
export function tDict(
  d: Record<string, string>,
  key: string,
  vars: Record<string, string | number> = {}
) {
  const raw = d[key] ?? key;
  return Object.keys(vars).reduce(
    (s, k) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k])),
    raw
  );
}
