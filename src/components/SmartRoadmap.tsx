import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';
import { DOMAIN_LABELS, DOMAIN_PRACTICE, DOMAINS_V3, type Domain3 } from '../assessment/assessmentV3';

type Task = {id:string; week:number; title:string; domain:Domain3};
function errorMessage(e: unknown): string {
 if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') {
  const code = 'code' in e && typeof e.code === 'string' ? ` (${e.code})` : '';
  return e.message + code;
 }
 return 'Noma’lum xatolik. Supabase SQL jadvali va RLS qoidalarini tekshiring.';
}
type AssessmentRow = {id:string;version:string;results:{scores?:Partial<Record<Domain3,{percent:number}>>}};
const subjects:Record<Domain3,string[]> = {
 logic:['Mantiqiy ketma-ketliklarni tahlil qilish','Mantiqiy masalalardan 5 tasini yechish'],
 numeracy:['Foiz va ulushga doir masalalar','Ma’lumotlarning o‘rtacha qiymatini hisoblash'],
 programming:['JavaScript asoslari bo‘yicha mashq','Kichik amaliy dastur yaratish'],
 analysis:['Oddiy ma’lumotlar jadvalini tahlil qilish','Natijalarni grafik orqali tushuntirish'],
 digital:['Git versiya nazorati bilan ishlash','API va kiberxavfsizlik asoslarini mashq qilish']
};
function makePlan(months:3|6, weak:Domain3[],career:string):Task[]{
 return Array.from({length:months*4},(_,i)=>{
 const domain=weak[i%weak.length];
 return {id:`week-${i+1}`,week:i+1,domain,title:`${career}: ${subjects[domain][Math.floor(i/weak.length)%2]}`};
 });
}
const ui = {"uz":["Test natijalariga ko‘ra amaliy o‘quv rejasi. Tavsiyalar mashq uchun, kasbiy natijaga kafolat emas.","Tanlangan kasb:","oy","Test ma’lumotlari yuklanmoqda…","natijasidan foydalanilmoqda.","Assessment 3.0 natijasi topilmadi; umumiy mashqlar tanlanadi.","Yangi reja yaratish","Bulutdan yuklash","Saqlanmoqda…","Reja va progressni saqlash","Bulutda saqlash uchun Profil orqali tizimga kiring.","Progress","hafta","O‘zgarishlardan keyin progressni bulutga qayta saqlang.","Reja tayyor. Bulutga saqlash uchun alohida tugmani bosing.","Reja va progress Supabase ga saqlandi","Reja va progress bulutdan yuklandi","Saqlashda muammo: ","Yuklashda xato: ","Bu kasb va muddat bo‘yicha bulutda reja yo‘q","Saqlangan reja formati noto‘g‘ri"],"ru":["Практический учебный план по результатам теста. Упражнения не гарантируют карьерный результат.","Выбранная профессия:","мес.","Загружаются результаты теста…","используется для составления плана.","Результат Assessment 3.0 не найден; используются общие упражнения.","Создать план","Загрузить из облака","Сохранение…","Сохранить план и прогресс","Для облачного сохранения войдите в аккаунт через профиль.","Прогресс","неделя","После изменений сохраните прогресс в облаке.","План готов. Нажмите кнопку сохранения в облако.","План и прогресс сохранены в Supabase","План и прогресс загружены из облака","Ошибка сохранения: ","Ошибка загрузки: ","Для этой профессии и срока план в облаке не найден","Неверный формат сохранённого плана"],"en":["A practical study plan based on your assessment. Exercises do not guarantee career outcomes.","Selected career:","months","Loading assessment results…","is used to generate your plan.","No Assessment 3.0 results found; general exercises will be selected.","Create new plan","Load from cloud","Saving…","Save plan and progress","Sign in through Profile to save to the cloud.","Progress","week","Save your progress to the cloud again after making changes.","Plan generated. Use the separate cloud save button.","Plan and progress saved to Supabase","Plan and progress loaded from the cloud","Save failed: ","Load failed: ","No cloud plan exists for this career and duration","Saved plan has an invalid format"]};
export default function SmartRoadmap({session,career,lang}:{session:Session|null;career:string;lang:'uz'|'ru'|'en'}) {
 const tr=(i:number)=>ui[lang][i];
 const [months,setMonths]=useState<3|6>(3);
 const [assessment,setAssessment]=useState<AssessmentRow|null>(null);
 const [tasks,setTasks]=useState<Task[]>([]);
 const [completed,setCompleted]=useState<Record<string,boolean>>({});
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [loadedKey,setLoadedKey]=useState('');
 const [saved,setSaved]=useState(false);
 const key=career+'-'+months;
 const load=async()=>{
  if(!session){setAssessment(null);return;}
  setLoading(true);
  try{
   const client=requireSupabase();
   const {data:tests,error:te}=await client.from('assessment_attempts').select('id,version,results').eq('user_id',session.user.id).in('version',['3.0','3.1-adaptive']).order('created_at',{ascending:false}).limit(1);
   if(te)throw te;
   setAssessment((tests?.[0] as AssessmentRow)||null);
  }catch(e){setNotice(errorMessage(e));}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[session?.user.id]);
 useEffect(()=>{setTasks([]);setCompleted({});setLoadedKey('');setSaved(false);setNotice('');},[session?.user.id,key]);
 const weak = [...DOMAINS_V3].sort((a,b)=>(assessment?.results?.scores?.[a]?.percent??50)-(assessment?.results?.scores?.[b]?.percent??50)).slice(0,2);
 const generate=()=>{setTasks(makePlan(months,weak,career));setCompleted({});setLoadedKey(key);setSaved(false);setNotice(tr(14));};
 const save=async()=>{
  if(!session||!tasks.length||busy||loadedKey!==key)return;
  setBusy(true);setNotice('');
  try{
   const client=requireSupabase();
   const {error}=await client.from('learning_roadmaps').upsert({
    user_id:session.user.id,career_id:career,duration_months:months,
    source_assessment_id:assessment?.id??null,
    plan_data:tasks,completed_tasks:completed,updated_at:new Date().toISOString()
   },{onConflict:'user_id,career_id,duration_months'});
   if(error)throw error;setSaved(true);setNotice(tr(15));
  }catch(e){setNotice(tr(17)+errorMessage(e));}finally{setBusy(false);}
 };
 const retrieve=async()=>{
  if(!session)return;setBusy(true);setNotice('');
  try{
   const {data,error}=await requireSupabase().from('learning_roadmaps').select('plan_data,completed_tasks').eq('user_id',session.user.id).eq('career_id',career).eq('duration_months',months).maybeSingle();
   if(error)throw error;if(!data)throw new Error(tr(19));
   if(!Array.isArray(data.plan_data)||!data.completed_tasks||typeof data.completed_tasks!=='object')throw new Error(tr(20));
   setTasks(data.plan_data as Task[]);setCompleted(data.completed_tasks as Record<string,boolean>);setLoadedKey(key);setSaved(true);setNotice(tr(16));
  }catch(e){setNotice(tr(18)+errorMessage(e));}finally{setBusy(false);}
 };
 const count=tasks.filter(t=>completed[t.id]).length;
 return <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
 <div><h1 className="text-2xl font-black text-white">Smart Roadmap 2.0</h1><p className="text-slate-400 text-sm mt-2">{tr(0)}</p></div>
 <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
 <p className="text-sm text-slate-300">{tr(1)} <strong>{career}</strong></p>
 <div className="flex gap-2"><button onClick={()=>setMonths(3)} className={`px-4 py-2 rounded-lg ${months===3?'bg-indigo-600':'bg-slate-800'}`}>3 {tr(2)}</button><button onClick={()=>setMonths(6)} className={`px-4 py-2 rounded-lg ${months===6?'bg-indigo-600':'bg-slate-800'}`}>6 {tr(2)}</button></div>
 {loading&&<p className="text-sm text-slate-400">{tr(3)}</p>}
 <p className="text-sm text-slate-400">{assessment?'Assessment '+assessment.version+' '+tr(4):tr(5)}</p>
 <div className="space-y-2 text-sm">{weak.map(d=><p key={d}><strong>{DOMAIN_LABELS[d]}:</strong> {DOMAIN_PRACTICE[d]}</p>)}</div>
 <div className="flex flex-wrap gap-2"><button disabled={loading} onClick={generate} className="rounded-lg bg-cyan-700 px-4 py-2 disabled:opacity-40">{tr(6)}</button>
 <button disabled={!session||busy} onClick={()=>void retrieve()} className="rounded-lg bg-slate-700 px-4 py-2 disabled:opacity-40">{tr(7)}</button>
 <button disabled={!session||!tasks.length||busy||saved} onClick={()=>void save()} className="rounded-lg bg-indigo-600 px-4 py-2 disabled:opacity-40">{busy?tr(8):tr(9)}</button></div>
 {!session&&<p className="text-amber-300 text-sm">{tr(10)}</p>}
 {notice&&<p role="status" className="text-cyan-300 text-sm">{notice}</p>}
 {tasks.length>0&&<div className="border-t border-slate-700 pt-5 space-y-4">
 <div className="flex justify-between"><strong>{tr(11)}</strong><strong>{count}/{tasks.length} ({Math.round(count/tasks.length*100)}%)</strong></div>
 <div className="h-3 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-400" style={{width:`${count/tasks.length*100}%`}}/></div>
 {tasks.map(t=><label key={t.id} className="flex gap-3 items-start p-3 bg-slate-950 rounded-lg border border-slate-800">
 <input type="checkbox" checked={!!completed[t.id]} onChange={e=>{setCompleted(prev=>({...prev,[t.id]:e.target.checked}));setSaved(false);}}/>
 <span className="text-sm"><strong>{t.week}- {tr(12)}:</strong> {t.title}</span></label>)}
 <p className="text-xs text-slate-400">{tr(13)}</p>
 </div>}
 </div></section>;
}
