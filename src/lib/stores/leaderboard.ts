// src/lib/stores/leaderboard.ts
export type Entry = { name: string; score: number; ts: number };

const KEY = 'airportquiz_leaderboard_v1';

export function loadBoard(): Entry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Entry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveBoard(entries: Entry[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function sortAndTrim(arr: Entry[]) {
  // sortér: score desc, ved lik score – eldste først (lavest ts)
  arr.sort((a, b) => (b.score - a.score) || (a.ts - b.ts));
  return arr.slice(0, 50);
}

export function addEntry(name: string, score: number) {
  const arr = loadBoard();
  arr.push({ name, score, ts: Date.now() });
  saveBoard(sortAndTrim(arr));
}

export function getRankFor(score: number, name: string) {
  const arr = loadBoard();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === name && arr[i].score === score) return i + 1;
  }
  return null;
}

export function getRankByTs(ts: number): number | null {
  const arr = loadBoard();
  const i = arr.findIndex((e) => e.ts === ts);
  return i >= 0 ? i + 1 : null;
}

export function renameEntry(ts: number, newName: string): number | null {
  const arr = loadBoard();
  const i = arr.findIndex((e) => e.ts === ts);
  if (i < 0) return null;
  arr[i].name = newName;
  saveBoard(sortAndTrim(arr));
  return getRankByTs(ts);
}

// ===== Auto-navn og provisorisk lagring (ENKELT EKSEMPLAR) =====

export function nextDefaultName(base = 'Spiller'): string {
  const arr = loadBoard();
  const taken = new Set(arr.map((e) => e.name.trim().toLowerCase()));
  for (let n = 1; n < 1000; n++) {
    const candidate = `${base}${n}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  // fallback
  return `${base}${Math.floor(Math.random() * 10000)}`;
}

/**
 * Legg inn score umiddelbart med auto-navn.
 * baseName: f.eks. "Spiller" / "Player" for NO/EN.
 */
export function addProvisional(score: number, baseName = 'Spiller'): { ts: number; name: string; rank: number } {
  const ts = Date.now();
  const name = nextDefaultName(baseName);
  const arr = loadBoard();
  arr.push({ name, score, ts });
  const sorted = sortAndTrim(arr);
  saveBoard(sorted);
  const rank = getRankByTs(ts) ?? sorted.length;
  return { ts, name, rank };
}
