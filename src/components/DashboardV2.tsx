import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';
import { DOMAIN_LABELS, DOMAINS_V3, type Domain3 } from '../assessment/assessmentV3';

type Attempt = {id:string;created_at:string;version:string;results:{scores?:Partial<Record<Domain3,{percent:number}>>;recommendations?:{career:string;score:number}[]}};
type Roadmap = {career_id:string;duration_months:number;plan_data:unknown;completed_tasks:unknown;updated_at:string};
type ProfileRecommendation = { title:string; score:number };
export default function DashboardV2({session,onGo,recommendations,profileAssessed,selectedCareer}:{session:Session|null;onGo:(page:string)=>void;recommendations:ProfileRecommendation[];profileAssessed:boolean;selectedCareer:string|null}) {
 const [attempts,setAttempts]=useState<Attempt[]>([]);
 const [roadmaps,setRoadmaps]=useState<Roadmap[]>([]);
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('');
 const reload=useCallback(async()=>{
  if(!session){setAttempts([]);setRoadmaps([]);return;}
  setLoading(true);setMessage('');
  try{
   const client=requireSupabase();
   const [tests,plans]=await Promise.all([
    client.from('assessment_attempts').select('id,created_at,version,results').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(50),
    client.from('learning_roadmaps').select('career_id,duration_months,plan_data,completed_tasks,updated_at').eq('user_id',session.user.id).order('updated_at',{ascending:false}).limit(20)
   ]);
   if(tests.error)throw tests.error;
   if(plans.error)throw plans.error;
   setAttempts((tests.data||[]) as Attempt[]);
   setRoadmaps((plans.data||[]) as Roadmap[]);
  }catch(e){setMessage(e instanceof Error?e.message:'Ma’lumotlarni yuklashda xatolik');}
  finally{setLoading(false);}
 },[session?.user.id]);
 useEffect(()=>{void reload();},[reload]);
 const latest=attempts.find(a=>a.version==='3.0'||a.version==='3.1-adaptive');
 const latestPlan=roadmaps.find(p=>p.career_id===selectedCareer) ?? roadmaps[0];
 const tasks=Array.isArray(latestPlan?.plan_data)?latestPlan.plan_data:[];
 const completed=(latestPlan?.completed_tasks && typeof latestPlan.completed_tasks==='object' && !Array.isArray(latestPlan.completed_tasks))?latestPlan.completed_tasks as Record<string,boolean>:{};
 const done=tasks.filter((t:unknown)=>t && typeof t==='object' && 'id' in t && typeof t.id==='string' && completed[t.id]).length;
 const pct=tasks.length?Math.round(done/tasks.length*100):0;
 const chart=attempts.filter(a=>a.results?.scores && (a.version==='3.0'||a.version==='3.1-adaptive')).slice(0,8).reverse();
 return <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
   <div className="flex flex-wrap justify-between gap-3 items-start"><div><h1 className="text-3xl font-black text-white">Dashboard 3.0</h1><p className="text-sm text-slate-400 mt-2">Testlar, tavsiyalar va o‘quv rejasidagi yutuqlar bitta joyda.</p></div><button onClick={()=>void reload()} disabled={loading} className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-40">Yangilash</button></div>
   {!session ? <div className="border border-amber-500/30 rounded-xl p-5 text-amber-200">Bulutdagi natijalarni ko‘rish uchun Profil bo‘limida tizimga kiring. <button className="underline ml-2" onClick={()=>onGo('profile')}>Profilga o‘tish</button></div> :
   <>
    {loading&&<p className="text-cyan-300 text-sm">Ma’lumotlar yuklanmoqda…</p>}
    {message&&<p role="status" className="text-amber-300 text-sm">{message}</p>}
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5"><p className="text-slate-400 text-sm">Saqlangan testlar</p><p className="text-3xl font-black mt-2">{attempts.length}{attempts.length===50?'+':''}</p><p className="text-xs text-slate-500">Oxirgi 50 ta yozuv doirasida</p></div>
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5"><p className="text-slate-400 text-sm">O‘quv rejalari</p><p className="text-3xl font-black mt-2">{roadmaps.length}</p><p className="text-xs text-slate-500">Oxirgi 20 ta reja doirasida</p></div>
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5"><p className="text-slate-400 text-sm">Oxirgi reja progressi</p><p className="text-3xl font-black mt-2">{pct}%</p><div className="rounded-full bg-slate-800 h-2 mt-2"><div className="h-2 rounded-full bg-cyan-400" style={{width:pct+'%'}}/></div></div>
    </div>
    <div className="grid lg:grid-cols-2 gap-5">
     <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4"><h2 className="text-xl font-bold">Oxirgi test ko‘rsatkichlari</h2>
       {latest?<><p className="text-xs text-slate-400">{new Date(latest.created_at).toLocaleString()} · {latest.version}</p>{DOMAINS_V3.map(d=><div key={d}><div className="flex justify-between text-sm"><span>{DOMAIN_LABELS[d]}</span><strong>{latest.results.scores?.[d]?.percent??'—'}%</strong></div><div className="h-2 bg-slate-800 rounded-full mt-1"><div className="h-2 rounded-full bg-indigo-400" style={{width:(latest.results.scores?.[d]?.percent??0)+'%'}}/></div></div>)}</>:
       <p className="text-sm text-slate-400">Assessment 3.0 yoki 3.1 natijasi hali yo‘q.</p>}
       <button onClick={()=>onGo('assessmentV3')} className="text-cyan-300 underline text-sm">Testga o‘tish</button>
     </div>
     <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4"><h2 className="text-xl font-bold">Tavsiya etilgan kasblar</h2>
       {profileAssessed && recommendations.length ? <>
         <p className="text-xs text-slate-400">Profil ma’lumotlari asosida hisoblangan taxminiy tavsiyalar (eski Dashboard bilan bir xil)</p>
         {recommendations.slice(0,3).map((c,i)=><div key={i} className="flex justify-between gap-3 text-sm border-b border-slate-800 pb-2"><span>{c.title}</span><strong>{c.score}%</strong></div>)}
       </> : <p className="text-sm text-slate-400">Profil bo‘yicha moslik hali baholanmagan. Ko‘nikmalar va qiziqishlarni kiriting.</p>}
       {latest?.results.recommendations?.length ? <details className="text-xs text-slate-400"><summary className="cursor-pointer">Assessment {latest.version} testining alohida tavsiyalari</summary><div className="space-y-2 pt-2">{latest.results.recommendations.slice(0,3).map((c,i)=><p key={i}>{c.career}: {c.score}%</p>)}</div><p className="pt-1">Bu boshqa baholash metodikasi, profil mosligi bilan bevosita solishtirilmaydi.</p></details> : null}
       <button onClick={()=>onGo('careerMatchingV3')} className="text-cyan-300 underline text-sm">Career Matching 3.0 ni ochish</button>
     </div>
    </div>
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 space-y-4"><h2 className="text-xl font-bold">Testlar bo‘yicha rivojlanish</h2>
      {chart.length===1 && <p className="text-sm text-slate-300">Hozircha bitta test mavjud. Keyingi testdan so‘ng natijalarni solishtirish mumkin.</p>}
      {chart.length>0?<div className="flex items-end gap-2 h-36">{chart.map(a=>{const values=DOMAINS_V3.map(d=>a.results.scores?.[d]?.percent).filter((n):n is number=>typeof n==='number');const avg=values.length?Math.round(values.reduce((x,y)=>x+y,0)/values.length):0;return <div key={a.id} className="flex-1 h-full flex flex-col justify-end items-center gap-1" title={new Date(a.created_at).toLocaleString()+' · '+a.version+' · '+avg+'%'}>
       <span className="text-xs text-slate-400">{avg}%</span><div className="w-full bg-cyan-500 rounded-t" style={{height:Math.max(4,avg)+'%'}}/></div>})}</div>:<p className="text-sm text-slate-400">Grafik uchun kamida bitta saqlangan Assessment 3.0 yoki 3.1 testi kerak.</p>}
      <p className="text-xs text-slate-500">Oxirgi 8 ta testning 5 yo‘nalish bo‘yicha o‘rtacha foizi. Savol darajalari o‘zgargani sabab bu qiymatlar to‘g‘ridan-to‘g‘ri qobiliyat o‘sishini isbotlamaydi.</p>
    </div>
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 space-y-2"><h2 className="text-xl font-bold">Smart Roadmap</h2>
     <p className="text-xs text-slate-400">Profil tanlovi: {selectedCareer || 'Hali tanlanmagan'}</p>
     {latestPlan?<><p className="text-slate-300 text-sm">{latestPlan.career_id} · {latestPlan.duration_months} oy</p><p className="text-sm">{done} / {tasks.length} vazifa bajarilgan</p></>:<p className="text-slate-400 text-sm">Saqlangan o‘quv rejasi hali yo‘q.</p>}
     <button onClick={()=>onGo('smartRoadmap')} className="text-cyan-300 underline text-sm">Smart Roadmap 2.0 ni ochish</button>
    </div>
   </>}
 </section>;
}
