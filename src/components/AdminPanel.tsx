import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';

type Ticket = { id: string; user_id: string; subject: string; category: string; status: string; created_at: string };
type Profile = { user_id: string; display_name: string; updated_at: string };

export default function AdminPanel({ session }: { session: Session | null }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  async function refresh(userId: string) {
    const db = requireSupabase();
    const [people, issues] = await Promise.all([
      db.from('profiles').select('user_id,display_name,updated_at').order('updated_at', { ascending: false }).limit(100),
      db.from('support_tickets').select('id,user_id,subject,category,status,created_at').order('created_at', { ascending: false }).limit(100),
    ]);
    if (people.error || issues.error) throw people.error || issues.error;
    // The server enforces admin access through RLS; this only guards stale UI responses.
    if ((await db.auth.getUser()).data.user?.id !== userId) return;
    setProfiles((people.data || []) as Profile[]);
    setTickets((issues.data || []) as Ticket[]);
  }

  useEffect(() => {
    let alive = true;
    setLoading(true); setAuthorized(false); setTickets([]); setProfiles([]); setError('');
    if (!session) { setLoading(false); return; }
    const userId = session.user.id;
    void (async () => {
      try {
        const db = requireSupabase();
        const { data, error: rpcError } = await db.rpc('is_careermind_admin');
        if (rpcError) throw rpcError;
        if (!alive) return;
        if (data !== true) { setAuthorized(false); return; }
        setAuthorized(true);
        await refresh(userId);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Admin ma’lumotlarini yuklab bo‘lmadi');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [session?.user.id]);

  async function changeStatus(id: string, status: string) {
    if (!session || !authorized || saving) return;
    setSaving(id); setError('');
    try {
      const db = requireSupabase();
      const { error: updateError } = await db.from('support_tickets').update({ status }).eq('id', id);
      if (updateError) throw updateError;
      await refresh(session.user.id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Status yangilanmadi'); }
    finally { setSaving(null); }
  }

  return <section className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-white">
    <h1 className="text-3xl font-black">Admin Panel 1.0</h1>
    {loading && <p role="status" className="text-slate-300">Tekshirilmoqda…</p>}
    {!loading && !session && <p className="text-amber-300">Administrator sifatida tizimga kiring.</p>}
    {!loading && session && !authorized && <p className="text-amber-300">Administrator ruxsati mavjud emas.</p>}
    {error && <p role="alert" className="text-amber-300">{error}</p>}
    {!loading && authorized && <>
      <p className="text-slate-400 text-sm">Oxirgi 100 ta profil va murojaat. To‘liq statistika emas.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-slate-400">Ko‘rsatilgan profillar</p><p className="text-3xl font-bold">{profiles.length}{profiles.length===100?'+':''}</p></div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-slate-400">Ko‘rsatilgan murojaatlar</p><p className="text-3xl font-bold">{tickets.length}{tickets.length===100?'+':''}</p></div>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h2 className="text-xl font-bold">Murojaatlarni boshqarish</h2>
        {tickets.length === 0 && <p className="text-slate-400">Murojaatlar mavjud emas.</p>}
        {tickets.map(t => <div key={t.id} className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-800 py-3">
          <div><p className="font-semibold">{t.subject}</p><p className="text-xs text-slate-400">{t.category} · {new Date(t.created_at).toLocaleDateString()}</p></div>
          <label className="text-sm">Holati <select className="ml-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2" value={t.status} disabled={saving===t.id} onChange={e => void changeStatus(t.id,e.target.value)}>
            <option value="open">Ochiq</option><option value="in_progress">Jarayonda</option><option value="resolved">Yechilgan</option>
          </select></label>
        </div>)}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h2 className="text-xl font-bold">Foydalanuvchilar</h2>
        {profiles.map(p => <div key={p.user_id} className="flex justify-between gap-4 border-b border-slate-800 py-2">
          <span>{p.display_name || 'Nomsiz profil'}</span><span className="text-xs text-slate-400">{new Date(p.updated_at).toLocaleDateString()}</span>
        </div>)}
      </div>
    </>}
  </section>;
}
