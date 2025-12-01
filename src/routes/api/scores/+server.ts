import { json } from '@sveltejs/kit';
import { loadBoard } from '$lib/stores/leaderboard'; // din eksisterende
export const GET = async () => json(await loadBoard());


type Row = { name: string; score: number; at: string };

// TODO: bytt ut med din egentlige kilde (fil, DB eller $lib/stores/leaderboard)
const demo: Row[] = [
  { name: 'Spiller1', score: 920, at: new Date().toISOString() },
  { name: 'Spiller2', score: 875, at: new Date().toISOString() }
];

export const GET = async () => {
  return json(demo);
};
