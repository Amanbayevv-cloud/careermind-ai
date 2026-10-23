import { useState } from 'react';
import { QUESTIONS, scoreAssessment, type Answers } from '../assessment/assessmentV2';
import { saveAssessment, type AuthTokens } from '../services/careerBackend';
export default function ObjectiveAssessment({ session }: { session: AuthTokens | null }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const result = scoreAssessment(answers);
  return <section className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 mt-6 space-y-5">
    <div><h3 className="font-bold text-white text-lg">Career Assessment 2.0 — amaliy savollar</h3>
    <p className="text-slate-400 text-sm">Bular boshlang‘ich mashq savollari. Natijalar kasbingizni qat’iy belgilamaydi.</p></div>
    {QUESTIONS.map((q, i)=><fieldset key={q.id} className="border-t border-slate-700 pt-4">
      <legend className="text-sm font-semibold text-white pt-3">{i+1}. {q.prompt}</legend>
      <div className="grid sm:grid-cols-2 gap-2 mt-2">{q.choices.map((choice, index)=><label key={index} className="flex gap-2 text-sm p-2 rounded bg-slate-950 border border-slate-800">
        <input type="radio" name={q.id} checked={answers[q.id]===index} onChange={()=>setAnswers(prev=>({...prev,[q.id]:index}))}/>{choice}</label>)}</div>
    </fieldset>)}
    <div className="text-sm text-slate-300">Javoblar: {result.answered}/{result.total}</div>
    {result.complete && <div className="space-y-2" aria-live="polite">
      <p className="font-semibold text-cyan-300">Natija: mantiq {result.scores.logic.percent}%, matematika {result.scores.numeracy.percent}%, raqamli savodxonlik {result.scores.digital.percent}%</p>
      {QUESTIONS.map(q=><p key={q.id} className="text-xs text-slate-400">{q.id}: {answers[q.id]===q.correct?'To‘g‘ri':'Noto‘g‘ri'} — {q.explanation}</p>)}
      <button disabled={!session||saving} onClick={async()=>{if(!session)return;setSaving(true);setNotice('');try{await saveAssessment(session.access_token,answers,result);setNotice('Natija bulutga saqlandi');}catch(e){setNotice(e instanceof Error?e.message:'Saqlashda xato');}finally{setSaving(false)}}} className="bg-indigo-600 rounded-lg px-4 py-2 disabled:opacity-40">
        {saving?'Saqlanmoqda…':'Natijani bulutga saqlash'}
      </button>
      {!session && <p className="text-xs text-amber-300">Bulutda saqlash uchun Profil bo‘limida hisobga kiring.</p>}
    </div>}
    {notice && <p role="status" className="text-sm text-cyan-300">{notice}</p>}
  </section>;
}
