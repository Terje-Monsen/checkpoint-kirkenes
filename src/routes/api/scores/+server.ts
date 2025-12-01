// src/routes/api/scores/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const demo = [
  { name: 'Anna', score: 820 },
  { name: 'Per', score: 760 },
  { name: 'Mia', score: 710 }
];

export const GET: RequestHandler = async () => {
  return json(demo);
};
