import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';

type Ticket = { id: string; user_id: string; subject: string; category: string; status: string; description: string; created_at: string };
type PublicReply = { id: string; ticket_id: string; message: string; created_at: string };
type AdminNote = { id: string; ticket_id: string; note: string; created_at: string };
type Audit = { id: number; ticket_id: string; old_status: string; new_status: string; changed_at: string };
type Profile = { user_id: string; display_name: string; updated_at: string };

export default function AdminPanel({ session }: { session: Session | null }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replies,setReplies] = useState<PublicReply[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [testingQuota,setTestingQuota] = useState(false);
  const [quotaCodes,setQuotaCodes] = useState<number[]>([]);
  const [quotaDiagnostic,setQuotaDiagnostic] = useState('');

  async function refresh(userId: string) {
    const db = requireSupabase();
    const [people, issues, noteRows, auditRows, replyRows] = await Promise.all([
      db.from('profiles').select('user_id,display_name,updated_at').order('updated_at', { ascending: false }).limit(100),
      db.from('support_tickets').select('id,user_id,subject,category,status,description,created_at').order('created_at', { ascending: false }).limit(100),
      db.from('support_admin_notes').select('id,ticket_id,note,created_at').order('created_at', { ascending: false }).limit(100),
      db.from('support_status_audit').select('id,ticket_id,old_status,new_status,changed_at').order('changed_at', { ascending: false }).limit(100),
      db.from('support_replies').select('id,ticket_id,message,created_at').order('created_at', { ascending: false }).limit(100),
    ]);
    if (people.error || issues.error || noteRows.error || auditRows.error || replyRows.error) throw people.error || issues.error || noteRows.error || auditRows.error || replyRows.error;
    // The server enforces admin access through RLS; this only guards stale UI responses.
    if ((await db.auth.getUser()).data.user?.id !== userId) return;
    setProfiles((people.data || []) as Profile[]);
    setTickets((issues.data || []) as Ticket[]);
    setNotes((noteRows.data || []) as AdminNote[]);
    setAudit((auditRows.data || []) as Audit[]);
    setReplies((replyRows.data || []) as PublicReply[]);
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

  async function addNote(ticketId: string) {
    if (!session || !authorized || !noteText.trim() || saving) return;
    setSaving(ticketId); setError('');
    try {
      const { error: saveError } = await requireSupabase().from('support_admin_notes').insert({ticket_id: ticketId, admin_user_id: session.user.id, note: noteText.trim().slice(0,2000)});
      if (saveError) throw saveError;
      setNoteText(''); await refresh(session.user.id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Izoh saqlanmadi'); }
    finally { setSaving(null); }
  }
  async function addReply(ticketId: string) {
    if (!session || !authorized || !replyText.trim() || saving) return;
    setSaving(ticketId); setError('');
    try {
      const { error: insertError } = await requireSupabase().from('support_replies').insert({ticket_id:ticketId,admin_user_id:session.user.id,message:replyText.trim().slice(0,3000)});
      if (insertError) throw insertError;
      setReplyText(''); await refresh(session.user.id);
    } catch(e) { setError(e instanceof Error ? e.message : 'Javob yuborilmadi'); }
    finally { setSaving(null); }
  }
  async function testQuota() {
    if (!session || !authorized || testingQuota) return;
    setTestingQuota(true); setQuotaCodes([]); setQuotaDiagnostic(''); setError('');
    const codes: number[] = [];
    try {
      const db = requireSupabase();
      for (let i=0; i<6; i++) {
        if ((await db.auth.getUser()).data.user?.id !== session.user.id) throw new Error('Sessiya o‘zgardi. Test to‘xtatildi.');
        const { data, error } = await db.functions.invoke('career-chat',{body:{message:'CareerMind API rate limit sinovi'}});
        void data;
        const context = error && 'context' in error ? error.context : null;
        const status = error ? (context && typeof context === 'object' && 'status' in context && typeof context.status === 'number' ? context.status : 0) : 200;
        if (error) setQuotaDiagnostic(`${error.name}: ${error.message}${status===0?' — HTTP javobi olinmadi. CORS, tarmoq yoki Edge Function sozlamasini tekshiring.':''}`);
        codes.push(status); setQuotaCodes([...codes]);
        if (status===0) break;
      }
    } catch(e) {setError(e instanceof Error ? e.message : 'HTTP sinovda xatolik yuz berdi');}
    finally {setTestingQuota(false);}
  }
  const filtered = tickets.filter(t => (filter === 'all' || t.status === filter) && [t.subject,t.category,t.description].some(v => v.toLowerCase().includes(query.toLowerCase())));
  const statusCounts = {open:tickets.filter(t=>t.status==='open').length,in_progress:tickets.filter(t=>t.status==='in_progress').length,resolved:tickets.filter(t=>t.status==='resolved').length};
  return <section className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-white">
    <h1 className="text-3xl font-black">Admin Panel 3.0</h1>
    {loading && <p role="status" className="text-slate-300">Tekshirilmoqda…</p>}
    {!loading && !session && <p className="text-amber-300">Administrator sifatida tizimga kiring.</p>}
    {!loading && session && !authorized && <p className="text-amber-300">Administrator ruxsati mavjud emas.</p>}
    {error && <p role="alert" className="text-amber-300">{error}</p>}
    {!loading && authorized && <>
      <p className="text-slate-400 text-sm">Oxirgi 100 ta profil va murojaat. To‘liq statistika emas.</p>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h2 className="text-xl font-bold">Release Audit — HTTP Rate Limiting</h2>
        <p className="text-sm text-slate-400">Test 6 ta API so‘rov yuboradi. Token ko‘rsatilmaydi. Har bir so‘rov foydalanuvchi limitini vaqtincha band qiladi. API kaliti bo‘lmasa dastlabki javoblar 503 bo‘lishi mumkin; limit oshganda 429 kutiladi.</p>
        <button type="button" disabled={testingQuota} onClick={()=>void testQuota()} className="rounded-lg bg-indigo-600 px-4 py-2 disabled:opacity-50">{testingQuota?'Sinov bajarilmoqda…':'6 ta HTTP so‘rov bilan tekshirish'}</button>
        {quotaDiagnostic && <p role="alert" className="text-sm text-amber-300 break-words">{quotaDiagnostic}</p>}
        {quotaCodes.length>0 && <p role="status" className="text-sm text-cyan-200">HTTP statuslar: {quotaCodes.join(' → ')}</p>}
        {!testingQuota && quotaCodes.length===6 && <p className="text-sm">{quotaCodes[5]===429?'✅ Oltinchi so‘rov HTTP 429 qaytardi.': '⚠️ Oltinchi so‘rov 429 qaytarmadi — qo‘shimcha tekshiruv kerak.'}</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-slate-400">Ko‘rsatilgan profillar</p><p className="text-3xl font-bold">{profiles.length}{profiles.length===100?'+':''}</p></div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5"><p className="text-slate-400">Ko‘rsatilgan murojaatlar</p><p className="text-3xl font-bold">{tickets.length}{tickets.length===100?'+':''}</p></div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">{([['Ochiq',statusCounts.open],['Jarayonda',statusCounts.in_progress],['Yechilgan',statusCounts.resolved]] as const).map(([label,n])=><div key={label} className="rounded-xl bg-slate-900 border border-slate-700 p-4"><p className="text-slate-400 text-sm">{label}</p><p className="text-2xl font-bold">{n}</p></div>)}</div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <h2 className="text-xl font-bold">Murojaatlarni boshqarish</h2>
        <div className="flex flex-wrap gap-3"><input aria-label="Murojaatlarni qidirish" className="flex-1 min-w-40 rounded-lg bg-slate-950 border border-slate-700 p-2" placeholder="Murojaat qidirish..." value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Holat filtri" className="rounded-lg bg-slate-950 border border-slate-700 p-2" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Barchasi</option><option value="open">Ochiq</option><option value="in_progress">Jarayonda</option><option value="resolved">Yechilgan</option></select></div>
        {tickets.length === 0 && <p className="text-slate-400">Murojaatlar mavjud emas.</p>}
        {filtered.map(t => <div key={t.id} className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-800 py-3">
          <div className="min-w-0"><button className="font-semibold text-left hover:underline" onClick={()=>{setExpanded(expanded===t.id?null:t.id);setNoteText('');setReplyText('')}}>{t.subject} {expanded===t.id?'▴':'▾'}</button><p className="text-xs text-slate-400">{t.category} · {new Date(t.created_at).toLocaleDateString()}</p></div>
          <label className="text-sm">Holati <select className="ml-2 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2" value={t.status} disabled={saving===t.id} onChange={e => void changeStatus(t.id,e.target.value)}>
            <option value="open">Ochiq</option><option value="in_progress">Jarayonda</option><option value="resolved">Yechilgan</option>
          </select></label>
          {expanded===t.id && <div className="w-full space-y-3 rounded-lg border border-slate-700 bg-slate-950/60 p-4"><p className="whitespace-pre-wrap break-words text-sm">{t.description}</p><h3 className="font-semibold text-sm">Ichki administrator izohlari</h3>{notes.filter(n=>n.ticket_id===t.id).map(n=><p key={n.id} className="text-xs text-slate-300 whitespace-pre-wrap break-words">{n.note} · {new Date(n.created_at).toLocaleString()}</p>)}<textarea aria-label="Yangi ichki izoh" className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2" maxLength={2000} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Ichki izoh (foydalanuvchiga ko‘rinmaydi)" /><button disabled={!noteText.trim() || !!saving} className="rounded-lg bg-indigo-600 px-4 py-2 disabled:opacity-50" onClick={()=>void addNote(t.id)}>Izohni saqlash</button><h3 className="font-semibold text-sm">Foydalanuvchiga javoblar</h3>{replies.filter(x=>x.ticket_id===t.id).map(x=><p key={x.id} className="text-xs text-cyan-200 whitespace-pre-wrap break-words">{x.message} · {new Date(x.created_at).toLocaleString()}</p>)}<textarea aria-label="Foydalanuvchiga javob" className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2" maxLength={3000} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Foydalanuvchi ko‘radigan javob..." /><button disabled={!replyText.trim() || !!saving} className="rounded-lg bg-emerald-700 px-4 py-2 disabled:opacity-50" onClick={()=>void addReply(t.id)}>Javob yuborish</button><h3 className="font-semibold text-sm">Status tarixi</h3>{audit.filter(a=>a.ticket_id===t.id).map(a=><p key={a.id} className="text-xs text-slate-400">{a.old_status} → {a.new_status} · {new Date(a.changed_at).toLocaleString()}</p>)}</div>}
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
