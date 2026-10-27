import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';
import { matchText, type UiLanguage } from '../services/matchTranslations';
import { hasMatchingData, rankCareers, type MatchCareer, type MatchProfile, type MatchTest } from '../services/careerMatching';

export default function CareerMatchingV3({session,profile,careers,onChoose,lang}:{session:Session|null;profile:MatchProfile;careers:MatchCareer[];onChoose:(id:string)=>void;lang:UiLanguage}) {
 const tr=(i:number)=>matchText(lang,i);
 const [test,setTest]=useState<MatchTest|null>(null);
 const [notice,setNotice]=useState('');
 const [loading,setLoading]=useState(false);
 useEffect(()=>{
  let alive=true;
  if(!session){setTest(null);return;}
  setLoading(true);setNotice('');
  void (async()=>{
   const {data,error}=await requireSupabase().from('assessment_attempts').select('version,results').eq('user_id',session.user.id).in('version',['3.0','3.1-adaptive']).order('created_at',{ascending:false}).limit(1);
   if(!alive)return;
   if(error){setTest(null);setNotice('Test ma’lumotini olishda xatolik: '+error.message);}
   else setTest((data?.[0] as MatchTest)||null);
   setLoading(false);
  })().catch(e=>{if(alive){setNotice(String(e));setLoading(false);}});
  return ()=>{alive=false;};
 },[session?.user.id]);
 const hasEnoughData = hasMatchingData(profile);
 const ranked=useMemo(()=>rankCareers(careers,profile,test).slice(0,5),[careers,profile,test]);
 return <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
  <header><h1 className="text-2xl font-black text-white">Career Matching 3.1</h1>
   <p className="text-slate-400 text-sm mt-2">{tr(0)}</p>
   <p className="text-cyan-300 text-xs mt-2">{loading?tr(1):test?`Assessment ${test.version} ${tr(2)}`:tr(3)}</p>
   {notice&&<p className="text-amber-300 text-xs mt-2">{notice}</p>}
  </header>
  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-xs text-slate-300">
   {tr(4)}{test?tr(5):tr(6)}.
   {tr(7)}
  </div>
  {!hasEnoughData && <p className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-200">{tr(8)}</p>}
  {hasEnoughData && ranked.map((m,i)=><article key={m.career.id} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 space-y-3">
    <div className="flex flex-wrap justify-between gap-3"><div><div className="text-xs text-cyan-300">#{i+1} · {m.career.category}</div>
     <h2 className="font-bold text-white text-xl">{m.career.title}</h2></div><strong className="text-cyan-300 text-2xl">{m.score}%</strong></div>
    <div className="bg-slate-800 rounded-full h-2"><div className="h-2 bg-cyan-400 rounded-full" style={{width:`${m.score}%`}}/></div>
    <p className="text-slate-400 text-sm">{m.career.description}</p>
    <p className="text-slate-300 text-sm"><strong>{tr(9)}</strong> {m.interestHits.length?m.interestHits.join(', ')+' '+tr(10):tr(11)} {m.strengths.length?tr(12)+m.strengths.join(', ')+'.':''}</p>
    {m.gaps.length>0&&<p className="text-sm text-amber-200"><strong>{tr(13)}</strong> {m.gaps.join(', ')}</p>}
    {m.testMatch!==null&&<p className="text-xs text-slate-400">{tr(14)}{Math.round(m.testMatch)}%</p>}
    <button type="button" onClick={()=>onChoose(m.career.id)} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white text-sm font-bold">{tr(15)}</button>
  </article>)}
 </main>;
}
