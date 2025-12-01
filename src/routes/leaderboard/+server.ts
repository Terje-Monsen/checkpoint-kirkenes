// src/routes/api/leaderboard/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// GET /api/leaderboard?limit=10
export const GET: RequestHandler = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit') ?? '10');

  const { data, error } = await supabase
    .from('leaderboard')
    .select('id, name, score, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error(error);
    return json({ error: 'db_error' }, { status: 500 });
  }

  return json({ entries: data });
};

// POST /api/leaderboard
// body: { name: string, score: number }
export const POST: RequestHandler = async ({ request }) => {
  const { name, score } = await request.json();

  if (!name || typeof score !== 'number') {
    return json({ error: 'invalid_payload' }, { status: 400 });
  }

  // trim / begrens navn
  const safeName = String(name).slice(0, 12);

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({ name: safeName, score })
    .select('id, name, score, created_at')
    .single();

  if (error || !data) {
    console.error(error);
    return json({ error: 'db_error' }, { status: 500 });
  }

  // Finn rank: tell hvor mange som er bedre
  const { count, error: countError } = await supabase
    .from('leaderboard')
    .select('id', { count: 'exact', head: true })
    .or(
      `score.gt.${data.score},and(score.eq.${data.score},created_at.lt.${data.created_at})`
    );

  if (countError) {
    console.error(countError);
  }

  const rank = (count ?? 0) + 1;

  return json({
    entry: data,
    rank
  });
};
