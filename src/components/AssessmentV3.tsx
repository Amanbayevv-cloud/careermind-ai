import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';
import { QUESTIONS_V3, DOMAINS_V3, DOMAIN_LABELS, DOMAIN_PRACTICE, scoreV3, recommendV3, type Answers3 } from '../assessment/assessmentV3';

type History = { id:string; created_at:string; version:string; results:{ scores?:Record<string,{percent:number}> } };
export default function AssessmentV3({session}:{session:Session|null}) {
 const [answers,setAnswers]=useState<Answers3>({});
 const [current,setCurrent]=useState(0);
 const [saved,setSaved]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [history,setHistory]=useState<History[]>([]);
 const result=scoreV3(answers);
 const question=QUESTIONS_V3[current];
 const load=async()=>{if(!session){setHistory([]);return;}const {data,error}=await requireSupabase().from('assessment_attempts').select('id,created_at,version,results').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(20);if(error)throw error;setHistory((data||[]) as History[]);};
 useEffect(()=>{void load().catch(e=>setNotice(e instanceof Error?e.message:'Tarix yuklanmadi'));},[session?.user.id]);
 const submit=async()=>{if(!session||busy||!result.complete||saved)return;setBusy(true);setNotice('');try{
 const {error}=await requireSupabase().from('assessment_attempts').insert({user_id:session.user.id,version:'3.0',answers,results:{...result,recommendations:recommendV3(result.scores)}});
 if(error)throw error;setSaved(true);setNotice('Assessment 3.0 bulutga saqlandi');await load();
 }catch(e){setNotice(e instanceof Error?e.message:'Saqlanmadi');}finally{setBusy(false);}};
 const weak=[...DOMAINS_V3].sort((a,b)=>result.scores[a].percent-result.scores[b].percent).slice(0,2);
 return <section className="max-w-4xl mx-auto p-6 my-8 rounded-2xl border border-cyan-500/30 bg-slate-900/70 space-y-5">
  <div><h2 className="text-2xl font-black text-white">Career Assessment 3.0</h2><p className="text-sm text-slate-400">30 savol, beshta yo‘nalish. Bu mashq testi, kasbiy qobiliyatning ilmiy tashxisi emas.</p></div>
  <div className="flex justify-between text-xs text-cyan-300"><span>Savol {current+1}/30</span><span>Javoblar {result.answered}/30</span></div>
  <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-400" style={{width:`${result.answered/30*100}%`}}/></div>
  <fieldset className="space-y-3"><legend className="font-semibold text-white">{question.prompt}</legend>
   {question.choices.map((choice,i)=><label key={i} className="flex gap-3 cursor-pointer rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-200">
    <input name={question.id} type="radio" checked={answers[question.id]===i} onChange={()=>{setAnswers(a=>({...a,[question.id]:i}));setSaved(false)}}/>{choice}
   </label>)}</fieldset>
  <div className="flex justify-between"><button type="button" disabled={current===0} onClick={()=>setCurrent(c=>c-1)} className="px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-40">Oldingi</button>
   <button type="button" disabled={current===29} onClick={()=>setCurrent(c=>c+1)} className="px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-40">Keyingi</button></div>
  <div className="grid grid-cols-6 sm:grid-cols-10 gap-1">{QUESTIONS_V3.map((q,i)=><button key={q.id} type="button" onClick={()=>setCurrent(i)} aria-label={`Savol ${i+1}`} className={`rounded p-1 text-xs ${current===i?'ring-2 ring-cyan-300 ':''}${answers[q.id]!==undefined?'bg-indigo-600':'bg-slate-800'}`}>{i+1}</button>)}</div>
  {result.complete&&<div className="border-t border-slate-700 pt-5 space-y-5">
   <h3 className="text-lg font-bold text-white">Natijalar va radar diagramma</h3>
   <div className="grid md:grid-cols-2 gap-6 items-center"><svg viewBox="0 0 280 280" role="img" aria-label="Besh yo‘nalishdagi test natijalari radar grafigi" className="w-full max-w-xs">
   {[25,50,75,100].map(p=><polygon key={p} fill="none" stroke="#475569" points={DOMAINS_V3.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;return `${140+Math.cos(a)*p},${140+Math.sin(a)*p}`}).join(' ')}/>)}
   <polygon fill="#22d3ee" fillOpacity=".3" stroke="#22d3ee" strokeWidth="3" points={DOMAINS_V3.map((d,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;const p=result.scores[d].percent;return `${140+Math.cos(a)*p},${140+Math.sin(a)*p}`}).join(' ')}/>
   </svg><div className="space-y-3">{DOMAINS_V3.map(d=><div key={d}><div className="flex justify-between text-sm"><span>{DOMAIN_LABELS[d]}</span><strong>{result.scores[d].percent}%</strong></div><div className="bg-slate-800 h-2 rounded-full mt-1"><div className="bg-cyan-400 h-full rounded-full" style={{width:`${result.scores[d].percent}%`}}/></div></div>)}</div></div>
   <div><h3 className="text-lg font-bold mb-2">Tavsiya etiladigan 3 kasb</h3><p className="text-xs text-slate-400 mb-3">Ko‘rsatkichlar faqat shu kichik test bo‘yicha hisoblangan taxminiy moslik, ishga qabul qilish ehtimoli emas.</p>
   {recommendV3(result.scores).map((c,i)=><p className="text-sm py-2 border-b border-slate-700" key={c.career}>{i+1}. {c.career} — {c.score}%</p>)}</div>
   <div><h3 className="text-lg font-bold mb-2">Shaxsiy o‘quv rejasi</h3>{weak.map((d,i)=><p className="text-sm text-slate-300 mb-2" key={d}>{i+1}. <strong>{DOMAIN_LABELS[d]}:</strong> {DOMAIN_PRACTICE[d]}</p>)}</div>
   <button disabled={!session||busy||saved} onClick={()=>void submit()} className="px-5 py-3 rounded-xl bg-indigo-600 disabled:opacity-40">{busy?'Saqlanmoqda…':saved?'Saqlangan':'Natijani bulutga saqlash'}</button>
   {!session&&<p className="text-xs text-amber-300">Bulutga saqlash uchun hisobga kiring.</p>}
  </div>}
  {notice&&<p role="status" className="text-cyan-300 text-sm">{notice}</p>}
  {session&&<div className="pt-4 border-t border-slate-700"><div className="flex justify-between"><h3 className="font-bold">Avvalgi testlar</h3><button onClick={()=>void load().catch(e=>setNotice(String(e)))} className="underline text-cyan-300 text-sm">Yangilash</button></div>{history.map(h=><div key={h.id} className="p-3 border-b border-slate-700 text-sm text-slate-300">{new Date(h.created_at).toLocaleString()} · Assessment {h.version}</div>)}{history.length===0&&<p className="text-slate-400 text-sm mt-2">Hozircha tarix bo‘sh.</p>}</div>}
 </section>;
}
