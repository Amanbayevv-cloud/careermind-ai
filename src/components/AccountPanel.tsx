import { useState } from 'react';
import { signIn, signUp, type AuthTokens } from '../services/careerBackend';
interface Props { session: AuthTokens | null; onSession: (value: AuthTokens | null) => void }
export default function AccountPanel({ session, onSession }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  if (session) return <section className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
    <h3 className="text-white font-bold">Bulutli hisob faol</h3>
    <p className="text-slate-400 text-sm">Ushbu sessiya sahifa yangilanganda tugaydi. Lokal profilingiz avtomatik yuborilmaydi.</p>
    <button className="bg-slate-700 rounded-lg px-4 py-2" onClick={() => onSession(null)}>Chiqish</button>
  </section>;
  return <form className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3"
    onSubmit={async e => { e.preventDefault(); setNotice(''); setBusy(true); try {
      if (mode === 'signup') {
        const result = await signUp(email, password);
        if (result.session) onSession(result.session);
        else setNotice('Email tasdiqlash xatini tekshiring. Keyin tizimga kiring.');
      } else { onSession(await signIn(email, password)); }
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
