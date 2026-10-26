import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';
import type { Domain3 } from '../assessment/assessmentV3';

export interface MatchCareer {id:string;title:string;category:string;requiredSkills:Record<string,number>;associatedInterests:string[];description:string}
export interface MatchProfile {interests:string[];skills:Record<string,number>}
type Test = {version:string;results:{scores?:Partial<Record<Domain3,{percent:number}>>}};
const links:Record<Domain3,string>={logic:'problemSolving',numeracy:'mathematics',programming:'programming',analysis:'dataAnalysis',digital:'programming'};
const metricKeys:Domain3[]=['logic','numeracy','programming','analysis','digital'];
function rate(career:MatchCareer,profile:MatchProfile,test:Test|null) {
 const requirements=Object.entries(career.requiredSkills);
 const skillMatch=requirements.length?requirements.reduce((total,[k,target])=>total+Math.max(0,100-Math.abs((profile.skills[k]??5)-target)*10),0)/requirements.length:50;
 const interestHits=career.associatedInterests.filter(i=>profile.interests.some(p=>p.toLowerCase()===i.toLowerCase()));
 const interestMatch=career.associatedInterests.length?Math.round(interestHits.length/career.associatedInterests.length*100):50;
 const relevant=metricKeys.filter(d=>career.requiredSkills[links[d]]!==undefined&&test?.results?.scores?.[d]?.percent!==undefined);
 const testMatch=relevant.length?relevant.reduce((sum,d)=>sum+(test?.results.scores?.[d]?.percent??0),0)/relevant.length:null;
 const score=Math.round(testMatch===null?skillMatch*.65+interestMatch*.35:skillMatch*.45+interestMatch*.25+testMatch*.30);
 const strengths=requirements.filter(([k,need])=>(profile.skills[k]??0)>=need).map(([k])=>k).slice(0,3);
 const gaps=requirements.filter(([k,need])=>(profile.skills[k]??0)<need).sort((a,b)=>(b[1]-(profile.skills[b[0]]??0))-(a[1]-(profile.skills[a[0]]??0))).map(([k])=>k).slice(0,3);
 return {career,score,interestHits,strengths,gaps,testMatch};
}
export default function CareerMatchingV3({session,profile,careers,onChoose}:{session:Session|null;profile:MatchProfile;careers:MatchCareer[];onChoose:(id:string)=>void}) {
 const [test,setTest]=useState<Test|null>(null);
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
   else setTest((data?.[0] as Test)||null);
   setLoading(false);
  })().catch(e=>{if(alive){setNotice(String(e));setLoading(false);}});
  return ()=>{alive=false;};
 },[session?.user.id]);
 const ranked=useMemo(()=>careers.map(c=>rate(c,profile,test)).sort((a,b)=>b.score-a.score).slice(0,5),[careers,profile,test]);
 return <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
  <header><h1 className="text-2xl font-black text-white">Career Matching 3.0</h1>
   <p className="text-slate-400 text-sm mt-2">Qiziqishlar, o‘zingiz baholagan ko‘nikmalar va oxirgi test birgalikda hisobga olinadi. Moslik foizi taxminiy ko‘rsatkich, ishga joylashish ehtimoli emas.</p>
   <p className="text-cyan-300 text-xs mt-2">{loading?'Test ma’lumotlari yuklanmoqda…':test?`Assessment ${test.version} qo‘shildi`:'Test ma’lumotisiz profil bo‘yicha hisoblandi'}</p>
   {notice&&<p className="text-amber-300 text-xs mt-2">{notice}</p>}
  </header>
  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-xs text-slate-300">
   Hisoblash usuli: {test?'45% ko‘nikmalar + 25% qiziqishlar + 30% test':'65% ko‘nikmalar + 35% qiziqishlar'}.
   Bu dastlabki evristik formula bo‘lib, ilmiy jihatdan kalibrlanmagan.
  </div>
  {ranked.map((m,i)=><article key={m.career.id} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 space-y-3">
    <div className="flex flex-wrap justify-between gap-3"><div><div className="text-xs text-cyan-300">#{i+1} · {m.career.category}</div>
     <h2 className="font-bold text-white text-xl">{m.career.title}</h2></div><strong className="text-cyan-300 text-2xl">{m.score}%</strong></div>
    <div className="bg-slate-800 rounded-full h-2"><div className="h-2 bg-cyan-400 rounded-full" style={{width:`${m.score}%`}}/></div>
    <p className="text-slate-400 text-sm">{m.career.description}</p>
    <p className="text-slate-300 text-sm"><strong>Nega tavsiya qilindi:</strong> {m.interestHits.length?m.interestHits.join(', ')+' qiziqishlaringizga mos. ':'Profil ko‘nikmalari asosida hisoblandi.'} {m.strengths.length?'Kuchli tomonlar: '+m.strengths.join(', ')+'.':''}</p>
    {m.gaps.length>0&&<p className="text-sm text-amber-200"><strong>Rivojlantirish mumkin:</strong> {m.gaps.join(', ')}</p>}
    {m.testMatch!==null&&<p className="text-xs text-slate-400">Tegishli test yo‘nalishlari bo‘yicha o‘rtacha: {Math.round(m.testMatch)}%</p>}
    <button type="button" onClick={()=>onChoose(m.career.id)} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white text-sm font-bold">Shu kasb uchun Roadmap ochish</button>
  </article>)}
 </main>;
}
