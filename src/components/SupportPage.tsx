import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '../services/supabaseClient';

type Ticket = { id: string; subject: string; category: string; status: string; created_at: string };
const strings = {"uz":["Qo‘llab-quvvatlash","Savollaringizni toping yoki muammo haqida murojaat qoldiring.","Ko‘p so‘raladigan savollar","Test natijalari qayerda saqlanadi?","Tizimga kirgan bo‘lsangiz, Assessment 2.0 natijalarini maxsus tugma orqali bulutga saqlashingiz mumkin.","Profilimni boshqa qurilmada ochsam bo‘ladimi?","Bir xil hisobga kiring, Profil sahifasidagi “Bulutdan yuklash” tugmasini bosing.","AI maslahatchi ishlamayaptimi?","Haqiqiy AI xizmati hozircha API kalitisiz faol emas. Mehmon rejimida oddiy avtomatik maslahatlar mavjud.","Parolimni unutdim. Nima qilaman?","Hisobni tiklash funksiyasi hali ishlab chiqilmoqda. Parolingizni yoki maxfiy kalitlaringizni murojaatga yozmang.","Yangi murojaat","Maxfiy parollar, API kalitlari, tokenlar yoki shaxsiy hujjatlarni yubormang. Murojaatlar faqat loyihaning Supabase bazasiga yoziladi; avtomatik email xabarnomasi hozircha yo‘q.","Murojaat yuborish uchun hisobga kiring.","Profilga o‘tish","Mavzu turi","Texnik muammo","Hisob va login","Test natijalari","Taklif","Boshqa","Sarlavha","Masalan: Test natijam saqlanmayapti","Muammo tafsilotlari","Qanday muammo yuz berdi? Maxfiy ma'lumotlarni kiritmang.","Yuborilmoqda…","Murojaat yuborish","Mening murojaatlarim","Yangilash","Yuklanmoqda…","Hozircha murojaat yo‘q.","Yechilgan","Ko‘rib chiqilmoqda","Ochiq","Murojaatlar yuklanmadi","Sarlavha kamida 5, xabar kamida 15 belgidan iborat bo‘lsin.","Murojaat saqlandi. Holatini quyidagi ro‘yxatdan tekshirishingiz mumkin.","Murojaat yuborilmadi: ","noma’lum xatolik"],"ru":["Поддержка","Найдите ответ или отправьте обращение.","Частые вопросы","Где сохраняются результаты теста?","После входа результаты тестов можно сохранить в облаке специальной кнопкой.","Можно ли открыть профиль на другом устройстве?","Войдите в тот же аккаунт и нажмите «Загрузить из облака» в профиле.","Почему не работает AI-консультант?","Для полноценного AI необходим серверный API-ключ. Гостевой режим предлагает простые автоматические подсказки.","Я забыл пароль. Что делать?","Восстановление аккаунта ещё разрабатывается. Не отправляйте пароли или секретные ключи.","Новое обращение","Не отправляйте пароли, API-ключи, токены или личные документы. Обращения сохраняются в Supabase; уведомлений по email пока нет.","Для отправки обращения войдите в аккаунт.","Перейти в профиль","Категория","Техническая проблема","Аккаунт и вход","Результаты теста","Предложение","Другое","Тема","Например: результат теста не сохраняется","Описание проблемы","Опишите проблему. Не указывайте секретные данные.","Отправка…","Отправить обращение","Мои обращения","Обновить","Загрузка…","Обращений пока нет.","Решено","На рассмотрении","Открыто","Не удалось загрузить обращения","Тема должна содержать минимум 5 символов, описание — минимум 15.","Обращение сохранено. Статус отображается ниже.","Не удалось отправить: ","неизвестная ошибка"],"en":["Support","Find answers or submit a support request.","Frequently asked questions","Where are assessment results saved?","When signed in, you can save assessment results to the cloud using the save button.","Can I access my profile on another device?","Sign in to the same account and select “Load from cloud” on your profile.","Why isn't the AI assistant working?","The real AI service needs a server-side API key. Guest mode offers basic automated suggestions.","I forgot my password. What should I do?","Account recovery is being developed. Do not include passwords or secret keys in support requests.","New request","Do not send passwords, API keys, tokens, or identity documents. Requests are saved in Supabase; email notifications are not enabled.","Sign in to submit a request.","Go to profile","Category","Technical issue","Account and login","Assessment results","Suggestion","Other","Subject","Example: My assessment result is not saving","Issue details","Describe what happened. Do not include sensitive information.","Sending…","Submit request","My requests","Refresh","Loading…","No requests yet.","Resolved","In progress","Open","Couldn't load requests","Subject must be at least 5 characters, and the description at least 15.","Request saved. You can check its status below.","Submission failed: ","unknown error"]};
export default function SupportPage({ session, onGoProfile, lang }: { session: Session | null; onGoProfile: () => void; lang: 'uz'|'ru'|'en' }) {
  const tx=(i:number)=>strings[lang][i];
  const faqs = [[3,4],[5,6],[7,8],[9,10]];
  const [category, setCategory] = useState('technical');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const loadTickets = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await requireSupabase().from('support_tickets')
        .select('id,subject,category,status,created_at')
        .eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      setTickets((data || []) as Ticket[]);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : tx(34));
    } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!session) { setTickets([]); return; }
    void loadTickets();
    // Loading history on account change only; manual Refresh button for updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || busy) return;
    if (subject.trim().length < 5 || description.trim().length < 15) {
      setNotice(tx(35)); return;
    }
    setBusy(true); setNotice('');
    try {
      const { error } = await requireSupabase().from('support_tickets').insert({
        user_id: session.user.id, category, subject: subject.trim(), description: description.trim()
      });
      if (error) throw error;
      setSubject(''); setDescription('');
      setNotice(tx(36));
      await loadTickets();
    } catch (e) {
      setNotice(tx(37) + (e instanceof Error ? e.message : tx(38)));
    } finally { setBusy(false); }
  };

  return <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
    <div><h1 className="text-3xl font-black text-white">{tx(0)}</h1>
      <p className="text-slate-400 mt-2">{tx(1)}</p></div>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-bold text-white mb-4">{tx(2)}</h2>
      <div className="space-y-3">{faqs.map(([q,a]) => <details key={q} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <summary className="text-white cursor-pointer font-semibold">{tx(q)}</summary>
        <p className="text-slate-300 text-sm mt-3">{tx(a)}</p>
      </details>)}</div>
    </section>
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">{tx(11)}</h2>
      <p className="text-sm text-slate-400">{tx(12)}</p>
      {!session ? <div className="space-y-3"><p className="text-amber-300">{tx(13)}</p>
        <button onClick={onGoProfile} className="px-5 py-2 rounded-xl bg-indigo-600 text-white">{tx(14)}</button></div>
      : <form className="space-y-4" onSubmit={e => void submit(e)}>
          <label className="block text-sm text-slate-300">{tx(15)}
            <select value={category} onChange={e=>setCategory(e.target.value)} className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-3">
              <option value="technical">{tx(16)}</option><option value="account">{tx(17)}</option>
              <option value="assessment">{tx(18)}</option><option value="suggestion">{tx(19)}</option><option value="other">{tx(20)}</option>
            </select></label>
          <label className="block text-sm text-slate-300">{tx(21)}
            <input required minLength={5} maxLength={120} value={subject} onChange={e=>setSubject(e.target.value)} placeholder={tx(22)} className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" /></label>
          <label className="block text-sm text-slate-300">{tx(23)}
            <textarea required minLength={15} maxLength={3000} rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder={tx(24)} className="block w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white" /></label>
          <button disabled={busy} type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold text-white">{busy ? tx(25) : tx(26)}</button>
        </form>}
      {notice && <p role="status" className="text-cyan-300 text-sm">{notice}</p>}
    </section>
    {session && <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex justify-between items-center gap-3"><h2 className="text-xl font-bold text-white">{tx(27)}</h2>
        <button onClick={() => void loadTickets()} disabled={loading} className="text-cyan-300 text-sm underline disabled:opacity-50">{tx(28)}</button></div>
      {loading && <p className="text-slate-400 text-sm">{tx(29)}</p>}
      {!loading && tickets.length === 0 && <p className="text-slate-400 text-sm">{tx(30)}</p>}
      {tickets.map(t => <div key={t.id} className="border border-slate-700 rounded-xl p-3 flex flex-wrap justify-between gap-2">
        <div><p className="text-white font-semibold">{t.subject}</p><p className="text-slate-500 text-xs">{new Date(t.created_at).toLocaleString()}</p></div>
        <span className="text-cyan-300 text-sm">{t.status === 'resolved' ? tx(31) : t.status === 'in_progress' ? tx(32) : tx(33)}</span>
      </div>)}
    </section>}
  </main>;
}
