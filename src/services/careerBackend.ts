import { requireSupabase } from './supabaseClient';
/** API adapters for the upcoming UI integration. Never put provider secrets in Vite variables. */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export interface AuthTokens { access_token: string; refresh_token: string; expires_in: number }
function configured() {
  if (!url || !anonKey) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  return { url: url.replace(/\/$/, ''), anonKey };
}
async function post<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  const config = configured();
  const response = await fetch(config.url + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: config.anonKey, ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}) },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || data.error || 'Request failed');
  return data as T;
}
export function signUp(email: string, password: string) {
  return post<{ user: { id: string } | null; session: AuthTokens | null }>('/auth/v1/signup', { email, password });
}
export function signIn(email: string, password: string) {
  return post<AuthTokens>('/auth/v1/token?grant_type=password', { email, password });
}
export function askCareerAI(message: string, accessToken: string, context = '') {
  return post<{ reply: string }>('/functions/v1/career-chat', { message, context }, accessToken);
}
export async function saveAssessment(_accessToken: string, answers: unknown, results: unknown) {
  const client = requireSupabase();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new Error('Sessiya topilmadi. Qayta login qiling.');
  const { error } = await client.from('assessment_attempts').insert({
    user_id: user.id,
    answers,
    results,
    version: '2.0'
  });
  if (error) throw new Error('Natijani saqlashda xatolik: ' + error.message);
}
