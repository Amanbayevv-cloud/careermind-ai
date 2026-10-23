import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';
interface Props { session: Session | null; onSession: (value: Session | null) => void; onSaveProfile: () => Promise<void>; onLoadProfile: () => Promise<void> }
export default function AccountPanel({ session, onSession, onSaveProfile, onLoadProfile }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);
  const sync = async (fn: () => Promise<void>, success: string) => {
    setSyncBusy(true); setNotice('');
    try { await fn(); setNotice(success); }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Amal bajarilmadi'); }
    finally { setSyncBusy(false); }
  };
  if (session) return <section className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
    <h3 className="text-white font-bold">Bulutli hisob: {session.user.email}</h3>
    <p className="text-slate-400 text-xs">Profil bulutga faqat siz tugmani bosganingizda yuboriladi.</p>
    <div className="flex flex-wrap gap-2">
      <button disabled={syncBusy} className="bg-indigo-600 rounded-lg px-4 py-2 disabled:opacity-50" onClick={() => void sync(onSaveProfile, 'Profil bulutga saqlandi')}>Profilni saqlash</button>
      <button disabled={syncBusy} className="bg-slate-700 rounded-lg px-4 py-2 disabled:opacity-50" onClick={() => {
        if (window.confirm('Lokal profil o‘rniga bulutdagi profilni yuklaysizmi?')) void sync(onLoadProfile, 'Profil yuklandi');
      }}>Bulutdan yuklash</button>
      <button disabled={syncBusy} className="bg-slate-800 rounded-lg px-4 py-2 disabled:opacity-50" onClick={() => void sync(async () => {
        const { error } = await requireSupabase().auth.signOut();
        if (error) throw error;
        onSession(null);
      }, 'Hisobdan chiqildi')}>Chiqish</button>
    </div>
    {notice && <p role="status" className="text-amber-300 text-sm">{notice}</p>}
  </section>;
  return <form className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3"
    onSubmit={async e => { e.preventDefault(); setNotice(''); setBusy(true); try {
      const client = requireSupabase();
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) onSession(data.session);
        else setNotice('Email tasdiqlash xatini tekshiring. Keyin tizimga kiring.');
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSession(data.session);
      }
      setPassword('');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Kirish amalga oshmadi'); }
    finally { setBusy(false); } }}>
    <h3 className="font-bold text-white">CareerMind hisobingiz</h3>
    <p className="text-xs text-slate-400">Supabase sozlangandan keyin ishlaydi. Ma’lumotlaringiz roziligingizsiz bulutga yuborilmaydi.</p>
    <label className="block text-sm">Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="block w-full mt-1 p-2 rounded bg-slate-950 border border-slate-700" /></label>
    <label className="block text-sm">Parol<input type="password" minLength={8} required autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="block w-full mt-1 p-2 rounded bg-slate-950 border border-slate-700" /></label>
    {notice && <p role="status" className="text-amber-300 text-sm">{notice}</p>}
    <div className="flex flex-wrap gap-2"><button disabled={busy} type="submit" className="bg-indigo-600 rounded-lg px-4 py-2 disabled:opacity-40">{busy?'Tekshirilmoqda…':mode==='login'?'Kirish':'Ro‘yxatdan o‘tish'}</button>
    <button type="button" onClick={()=>{setMode(mode==='login'?'signup':'login');setNotice('')}} className="rounded-lg border border-slate-600 px-4 py-2">{mode==='login'?'Yangi hisob yaratish':'Kirishga qaytish'}</button></div>
  </form>;
}
