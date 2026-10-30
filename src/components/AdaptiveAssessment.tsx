import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { chooseNext, adaptiveSummary } from '../assessment/adaptiveV3';
import { DOMAIN_LABELS, DOMAINS_V3, DOMAIN_PRACTICE, recommendV3, type Answers3 } from '../assessment/assessmentV3';
import { requireSupabase } from '../services/supabaseClient';

export default function AdaptiveAssessment({session}:{session:Session|null}) {
 const [answers,setAnswers]=useState<Answers3>({});
 const [sequence,setSequence]=useState<string[]>([]);
 const [choice,setChoice]=useState<number|null>(null);
 const [notice,setNotice]=useState('');
 const [saving,setSaving]=useState(false);
 const [saved,setSaved]=useState(false);
 const question=chooseNext(answers,sequence);
 const summary=adaptiveSummary(answers,sequence);
 const finished=!question && sequence.length===30;
 const advance=()=>{
  if(!question||choice===null)return;
  setAnswers(prev=>({...prev,[question.id]:choice}));
  setSequence(prev=>[...prev,question.id]);
  setChoice(null);
 };
 const save=async()=>{
  if(!session||!finished||saving||saved)return;
  setSaving(true);setNotice('');
  try{
   const {error}=await requireSupabase().from('assessment_attempts').insert({
    user_id:session.user.id,version:'3.1-adaptive',answers,
    results:{...summary,recommendations:recommendV3(summary.scores)}
   });
   if(error)throw error;
   setSaved(true);setNotice('Moslashuvchan test natijasi bulutga saqlandi');
  }catch(e){setNotice(e instanceof Error?e.message:'Saqlashda xato');}
  finally{setSaving(false);}
 };
 const reset=()=>{setAnswers({});setSequence([]);setChoice(null);setSaved(false);setNotice('');};
 const weakest=[...DOMAINS_V3].sort((a,b)=>summary.scores[a].percent-summary.scores[b].percent).slice(0,2);
 return <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
  <div><h1 className="text-2xl font-black text-white">Adaptive Assessment 3.1</h1>
    <p className="text-sm text-slate-400">30 savol. Har bir yo‘nalishda keyingi savol qiyinligi oldingi javobga qarab tanlanadi. Natijalar faqat o‘quv maqsadida.</p></div>
  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">
  <div className="flex justify-between text-sm text-cyan-300"><span>{sequence.length}/30 savol bajarildi</span><button type="button" onClick={reset} className="underline">Qayta boshlash</button></div>
  <div className="h-2 rounded bg-slate-800"><div className="h-2 rounded bg-cyan-400" style={{width:`${sequence.length/30*100}%`}}/></div>
  {question&&<div className="space-y-4">
    <p className="text-xs text-purple-300">{DOMAIN_LABELS[question.domain]} · Daraja {question.difficulty}/3</p>
    <h2 className="font-bold text-white">{question.prompt}</h2>
    <div className="grid sm:grid-cols-2 gap-2">{question.choices.map((answer,i)=><button key={i} onClick={()=>setChoice(i)}
      className={`text-left border rounded-lg p-3 text-sm ${choice===i?'border-cyan-400 bg-indigo-800':'border-slate-700 bg-slate-950'}`}>{answer}</button>)}</div>
    <button onClick={advance} disabled={choice===null} className="px-5 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40">Javobni tasdiqlash va davom etish</button>
    <p className="text-xs text-slate-400">Javob tasdiqlangach uni orqaga qaytarib bo‘lmaydi, chunki keyingi savol shu javobga bog‘liq.</p>
  </div>}
  {finished&&<div className="space-y-5">
    <h2 className="text-xl font-bold text-white">Natijalar</h2>
    <div className="grid md:grid-cols-2 gap-4 items-center">
    <svg viewBox="0 0 280 280" className="w-full max-w-xs" role="img" aria-label="Besh yo‘nalishdagi test natijalari radar diagrammasi">
     {[25,50,75,100].map(p=><polygon key={p} fill="none" stroke="#475569" points={DOMAINS_V3.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;return `${140+Math.cos(a)*p},${140+Math.sin(a)*p}`}).join(' ')}/>)}
     <polygon fill="#22d3ee" fillOpacity=".3" stroke="#22d3ee" strokeWidth="3" points={DOMAINS_V3.map((d,i)=>{const a=-Math.PI/2+i*2*Math.PI/5;const p=summary.scores[d].percent;return `${140+Math.cos(a)*p},${140+Math.sin(a)*p}`}).join(' ')}/>
    </svg>
    <div className="space-y-3">{DOMAINS_V3.map(d=><div key={d}><div className="flex justify-between text-sm"><span>{DOMAIN_LABELS[d]}</span><strong>{summary.scores[d].percent}%</strong></div><div className="h-2 rounded bg-slate-800"><div className="h-2 rounded bg-cyan-400" style={{width:`${summary.scores[d].percent}%`}}/></div></div>)}</div></div>
    <div><h3 className="font-bold">3 ta taxminiy kasb tavsiyasi</h3><p className="text-xs text-slate-400">Foizlar kasbni aniq belgilamaydi; savollar darajasi o‘zgargani sabab testlar o‘rtasida to‘g‘ridan-to‘g‘ri solishtirilmasin.</p>
    {recommendV3(summary.scores).map((c,i)=><p className="mt-2 text-sm" key={c.career}>{i+1}. {c.career} — {c.score}%</p>)}</div>
    <div><h3 className="font-bold">Mashg‘ulot rejasi</h3>{weakest.map(d=><p key={d} className="mt-2 text-sm text-slate-300"><strong>{DOMAIN_LABELS[d]}:</strong> {DOMAIN_PRACTICE[d]}</p>)}</div>
    <button disabled={!session||saving||saved} onClick={()=>void save()} className="bg-indigo-600 rounded-lg px-5 py-2 disabled:opacity-40">{saved?'Saqlangan':saving?'Saqlanmoqda…':'Natijani Supabase ga saqlash'}</button>
    {!session&&<p className="text-amber-300 text-sm">Saqlash uchun Profil bo‘limida login qiling.</p>}
  </div>}
  {notice&&<p role="status" className="text-sm text-cyan-300">{notice}</p>}
  </div>
 </section>;
}
