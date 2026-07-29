import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateStudySet(topic, inputText) {
  const url = `${supabaseUrl}/functions/v1/generate-study-set`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ topic, inputText }),
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.flashcards) || !Array.isArray(data.quiz)) {
    throw new Error('Received an invalid response from the AI service.');
  }
  return data;
}

export async function saveSession(session) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      topic: session.topic,
      input_text: session.inputText,
      flashcards: session.flashcards,
      quiz: session.quiz,
    })
    .select('id, created_at')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listSessions() {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('id, topic, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSession(id) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase.from('study_sessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
