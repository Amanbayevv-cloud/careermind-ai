import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';

type Ticket = { id: string; subject: string; category: string; status: string; created_at: string };
const faqs = [
  { q: 'Test natijalari qayerda saqlanadi?', a: 'Tizimga kirgan bo‘lsangiz, Assessment 2.0 natijalarini maxsus tugma orqali bulutga saqlashingiz mumkin.' },
  { q: 'Profilimni boshqa qurilmada ochsam bo‘ladimi?', a: 'Bir xil hisobga kiring, Profil sahifasidagi “Bulutdan yuklash” tugmasini bosing.' },
  { q: 'AI maslahatchi ishlamayaptimi?', a: 'Haqiqiy AI xizmati hozircha API kalitisiz faol emas. Mehmon rejimida oddiy avtomatik maslahatlar mavjud.' },
  { q: 'Parolimni unutdim. Nima qilaman?', a: 'Hisobni tiklash funksiyasi hali ishlab chiqilmoqda. Parolingizni yoki maxfiy kalitlaringizni murojaatga yozmang.' },
];

export default function SupportPage({ session, onGoProfile }: { session: Session | null; onGoProfile: () => void }) {
  const [category, setCategory] = useState('technical');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const loadTickets = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await requireSupabase().from('support_tickets')
        .select('id,subject,category,status,created_at')
        .eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setTickets((data || []) as Ticket[]);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Murojaatlar yuklanmadi');
    } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!session) { setTickets([]); return; }
    void loadTickets();
    // Loading history on account change only; manual Refresh button for updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || busy) return;
    if (subject.trim().length < 5 || description.trim().length < 15) {
      setNotice('Sarlavha kamida 5, xabar kamida 15 belgidan iborat bo‘lsin.'); return;
    }
    setBusy(true); setNotice('');
    try {
      const { error } = await requireSupabase().from('support_tickets').insert({
        user_id: session.user.id, category, subject: subject.trim(), description: description.trim()
      });
      if (error) throw error;
      setSubject(''); setDescription('');
      setNotice('Murojaat saqlandi. Holatini quyidagi ro‘yxatdan tekshirishingiz mumkin.');
      await loadTickets();
    } catch (e) {
      setNotice('Murojaat yuborilmadi: ' + (e instanceof Error ? e.message : 'noma’lum xatolik'));
    } finally { setBusy(false); }
  };

  return <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
    <div><h1 className="text-3xl font-black text-white">Qo‘llab-quvvatlash</h1>
      <p className="text-slate-400 mt-2">Savollaringizni toping yoki muammo haqida murojaat qoldiring.</p></div>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Ko‘p so‘raladigan savollar</h2>
      <div className="space-y-3">{faqs.map(({q,a}) => <details key={q} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <summary className="text-white cursor-pointer font-semibold">{q}</summary>
        <p className="text-slate-300 text-sm mt-3">{a}</p>
      </details>)}</div>
    </section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">Yangi murojaat</h2>
      <p className="text-sm text-slate-400">Maxfiy parollar, API kalitlari, tokenlar yoki shaxsiy hujjatlarni yubormang. Murojaatlar faqat loyihaning Supabase bazasiga yoziladi; avtomatik email xabarnomasi hozircha yo‘q.</p>
      {!session ? <div className="space-y-3"><p className="text-amber-300">Murojaat yuborish uchun hisobga kiring.</p>
        <button onClick={onGoProfile} className="px-5 py-2 rounded-xl bg-indigo-600 text-white">Profilga o‘tish</button></div>
      : <form className="space-y-4" onSubmit={e => void submit(e)}>
          <label className="block text-sm text-slate-300">Mavzu turi
            <select value={category} onChange={e=>setCategory(e.target.value)} className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-3">
              <option value="technical">Texnik muammo</option><option value="account">Hisob va login</option>
              <option value="assessment">Test natijalari</option><option value="suggestion">Taklif</option><option value="other">Boshqa</option>
            </select></label>
          <label className="block text-sm text-slate-300">Sarlavha
            <input required minLength={5} maxLength={120} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Masalan: Test natijam saqlanmayapti" className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" /></label>
          <label className="block text-sm text-slate-300">Muammo tafsilotlari
            <textarea required minLength={15} maxLength={3000} rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Qanday muammo yuz berdi? Maxfiy ma'lumotlarni kiritmang." className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" /></label>
          <button disabled={busy} type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold text-white">{busy ? 'Yuborilmoqda…' : 'Murojaat yuborish'}</button>
        </form>}
      {notice && <p role="status" className="text-cyan-300 text-sm">{notice}</p>}
    </section>
    {session && <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex justify-between items-center gap-3"><h2 className="text-xl font-bold text-white">Mening murojaatlarim</h2>
        <button onClick={() => void loadTickets()} disabled={loading} className="text-cyan-300 text-sm underline disabled:opacity-50">Yangilash</button></div>
      {loading && <p className="text-slate-400 text-sm">Yuklanmoqda…</p>}
      {!loading && tickets.length === 0 && <p className="text-slate-400 text-sm">Hozircha murojaat yo‘q.</p>}
      {tickets.map(t => <div key={t.id} className="border border-slate-700 rounded-xl p-3 flex flex-wrap justify-between gap-2">
        <div><p className="text-white font-semibold">{t.subject}</p><p className="text-slate-500 text-xs">{new Date(t.created_at).toLocaleString()}</p></div>
        <span className="text-cyan-300 text-sm">{t.status === 'resolved' ? 'Yechilgan' : t.status === 'in_progress' ? 'Ko‘rib chiqilmoqda' : 'Ochiq'}</span>
      </div>)}
    </section>}
  </main>;
}
