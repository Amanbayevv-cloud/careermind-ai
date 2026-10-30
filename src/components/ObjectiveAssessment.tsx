import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { QUESTIONS, scoreAssessment, type Answers, type Domain } from '../assessment/assessmentV2';
import { saveAssessment } from '../services/careerBackend';
import { requireSupabase } from '../services/supabaseClient';

type Score = { correct: number; total: number; percent: number };
type SavedAttempt = { id: string; created_at: string; version: string; results: { scores?: Partial<Record<Domain, Score>>; total?: number } };
const labels: Record<Domain,string> = { logic: 'Mantiq', numeracy: 'Matematika', digital: 'Raqamli savodxonlik' };
const recommendations: Record<Domain,string> = {
  logic: 'Mantiqiy ketma-ketliklar, sabab-oqibat aloqalari va muammoli vaziyatlarni yechishni mashq qiling.',
  numeracy: 'Foizlar, o‘rtacha qiymat va jadvaldagi sonlarni tushunish bo‘yicha kichik masalalar ishlang.',
  digital: 'API, Git va dasturlash asoslariga oid kirish mavzularini amalda sinab ko‘ring.'
};
const domains: Domain[] = ['logic', 'numeracy', 'digital'];

export default function ObjectiveAssessment({ session }: { session: Session | null }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<SavedAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const result = scoreAssessment(answers);

  const refreshHistory = useCallback(async () => {
    if (!session) { setHistory([]); return; }
    setLoadingHistory(true);
    try {
      const { data, error } = await requireSupabase().from('assessment_attempts')
        .select('id,created_at,version,results')
        .eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setHistory((data || []) as SavedAttempt[]);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Testlar tarixi yuklanmadi');
    } finally { setLoadingHistory(false); }
  }, [session?.user.id]);

  useEffect(() => { void refreshHistory(); }, [refreshHistory]);

  const save = async () => {
    if (!session || saving || !result.complete) return;
    setSaving(true); setNotice('');
    try {
      await saveAssessment(session.access_token, answers, result);
      setNotice('Natija bulutga saqlandi');
      await refreshHistory();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Saqlashda xato');
    } finally { setSaving(false); }
  };
  const sorted = [...domains].sort((a,b)=>result.scores[a].percent-result.scores[b].percent);
  const points = domains.map((domain,index)=>{
    const angle = -Math.PI/2 + index * 2*Math.PI/3;
    const radius = (result.scores[domain].percent/100)*92;
    return `${120+Math.cos(angle)*radius},${120+Math.sin(angle)*radius}`;
  }).join(' ');

  return <section className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 mt-6 space-y-6">
    <div><h3 className="font-bold text-white text-lg">Career Assessment 2.0 — amaliy savollar</h3>
      <p className="text-slate-400 text-sm">Boshlang‘ich mashq savollari. Natijalar kasb yoki qobiliyatni qat’iy baholamaydi.</p></div>
    {QUESTIONS.map((q,i)=><fieldset key={q.id} className="border-t border-slate-700 pt-4">
      <legend className="text-sm font-semibold text-white pt-3">{i+1}. {q.prompt}</legend>
      <div className="grid sm:grid-cols-2 gap-2 mt-2">{q.choices.map((choice,index)=><label key={index} className="flex gap-2 text-sm p-2 rounded bg-slate-950 border border-slate-800">
        <input type="radio" name={q.id} checked={answers[q.id]===index} onChange={()=>setAnswers(prev=>({...prev,[q.id]:index}))}/>{choice}
      </label>)}</div>
    </fieldset>)}
    <div className="text-sm text-slate-300">Javoblar: {result.answered}/{result.total}</div>
    {result.complete && <div className="space-y-5" aria-live="polite">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div><h4 className="text-white font-bold mb-2">Ko‘nikmalar diagrammasi</h4>
          <svg viewBox="0 0 240 240" role="img" aria-label="Mantiq, matematika va raqamli savodxonlikning uch o‘qli radar diagrammasi" className="w-full max-w-xs mx-auto">
            {[25,50,75,100].map(v=><polygon key={v} points={domains.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/3;return `${120+Math.cos(a)*v*.92},${120+Math.sin(a)*v*.92}`}).join(' ')} fill="none" stroke="#475569" strokeWidth="1"/>)}
            {domains.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/3;return <line key={i} x1="120" y1="120" x2={120+Math.cos(a)*92} y2={120+Math.sin(a)*92} stroke="#64748b"/>})}
            <polygon points={points} fill="#22d3ee" fillOpacity=".3" stroke="#22d3ee" strokeWidth="3"/>
          </svg></div>
        <div className="space-y-4">{domains.map(domain=><div key={domain}>
          <div className="flex justify-between text-sm text-slate-200"><span>{labels[domain]}</span><strong>{result.scores[domain].percent}%</strong></div>
          <div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-cyan-400" style={{width:`${result.scores[domain].percent}%`}}/></div>
        </div>)}</div>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
        <h4 className="font-bold text-white">Shaxsiy o‘quv tavsiyasi</h4>
        <p className="text-slate-300 text-sm mt-2">{recommendations[sorted[0]]}</p>
        <p className="text-xs text-slate-400 mt-2">Savollar soni kamligi sabab bu faqat mashq uchun tavsiya, standartlashtirilgan baholash emas.</p>
      </div>
      <details className="text-sm text-slate-300"><summary className="cursor-pointer font-semibold">Savollarning izohlari</summary>
        {QUESTIONS.map(q=><p key={q.id} className="mt-2">{q.id}: {answers[q.id]===q.correct?'To‘g‘ri':'Noto‘g‘ri'} — {q.explanation}</p>)}
      </details>
      <button disabled={!session||saving} onClick={()=>void save()} className="bg-indigo-600 rounded-lg px-4 py-2 disabled:opacity-40">{saving?'Saqlanmoqda…':'Natijani bulutga saqlash'}</button>
      {!session && <p className="text-xs text-amber-300">Bulutda saqlash uchun Profil bo‘limida hisobga kiring.</p>}
    </div>}
    {notice && <p role="status" className="text-sm text-cyan-300">{notice}</p>}
    {session && <div className="border-t border-slate-700 pt-5 space-y-3">
      <div className="flex items-center justify-between gap-3"><h4 className="text-white font-bold">Testlar tarixi</h4>
        <button disabled={loadingHistory} onClick={()=>void refreshHistory()} className="text-cyan-300 text-sm underline disabled:opacity-50">Yangilash</button></div>
      {loadingHistory && <p className="text-slate-400 text-sm">Yuklanmoqda…</p>}
      {!loadingHistory && !history.length && <p className="text-slate-400 text-sm">Hali saqlangan test natijasi yo‘q.</p>}
      {history.map(attempt=><div key={attempt.id} className="rounded-lg border border-slate-700 p-3">
        <div className="text-slate-400 text-xs mb-2">{new Date(attempt.created_at).toLocaleString()} · v{attempt.version}</div>
        <div className="flex flex-wrap gap-3 text-xs text-white">{domains.map(domain=><span key={domain}>{labels[domain]}: {typeof attempt.results?.scores?.[domain]?.percent==='number'?attempt.results.scores[domain]?.percent+'%':'—'}</span>)}</div>
      </div>)}
    </div>}
  </section>;
}
