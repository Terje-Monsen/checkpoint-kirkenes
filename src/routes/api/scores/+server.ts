// src/routes/api/scores/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';

type ScoreRow = {
  name: string;
  score: number;
  created_at: string;
};

export const GET: RequestHandler = async () => {
  const { data, error } = await supabase
    .from('scores')
    .select('name, score, created_at')
    .order('score', { ascending: false }) // høyeste score først
    .limit(50);

  if (error) {
    console.error('Supabase GET error', error);
    return new Response('DB error', { status: 500 });
  }

  const rows =
    (data as ScoreRow[] | null)?.map((d) => ({
      name: d.name,
      score: d.score,
      at: d.created_at
    })) ?? [];

  return json(rows);
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, score } = body as { name?: string; score?: number };

    if (!name || typeof name !== 'string' || typeof score !== 'number') {
      return new Response('Bad request', { status: 400 });
    }

    const trimmedName = name.trim().slice(0, 50); // ekstra sikkerhet

    const { error } = await supabase.from('scores').insert({
      name: trimmedName,
      score
    });

    if (error) {
      console.error('Supabase POST error', error);
      return new Response('DB error', { status: 500 });
    }

    return new Response(null, { status: 201 });
  } catch (err) {
    console.error('POST /api/scores error', err);
    return new Response('Bad request', { status: 400 });
  }
};
