/** Educational starter question bank; not a validated aptitude examination. */
export type Domain3 = 'logic' | 'numeracy' | 'programming' | 'analysis' | 'digital';
export type Answers3 = Record<string, number>;
export interface Question3 { id:string; domain:Domain3; difficulty:1|2|3; prompt:string; choices:readonly string[]; correct:number }
export const QUESTIONS_V3:readonly Question3[] = [
  { id: 'v3-1', domain: 'logic', difficulty: 1, prompt: "2, 4, 8, 16, ...?", choices: ["24","32","30","18"], correct: 1 },
  { id: 'v3-2', domain: 'logic', difficulty: 1, prompt: "Barcha A lar B, barcha B lar C. Qaysi xulosa to‘g‘ri?", choices: ["Barcha A lar C","Barcha C lar A","A va C bog‘liq emas","Hech biri"], correct: 0 },
  { id: 'v3-3', domain: 'logic', difficulty: 2, prompt: "1, 1, 2, 3, 5, ...?", choices: ["6","7","8","10"], correct: 2 },
  { id: 'v3-4', domain: 'logic', difficulty: 2, prompt: "Bir xil shartda ikkita tasdiq bir-biriga zid bo‘lsa?", choices: ["Ikkalasi to‘g‘ri","Kamida bittasi noto‘g‘ri","Ikkalasi shart","Bilish mumkin emas"], correct: 1 },
  { id: 'v3-5', domain: 'logic', difficulty: 3, prompt: "3, 6, 12, 24, ...?", choices: ["30","36","48","42"], correct: 2 },
  { id: 'v3-6', domain: 'logic', difficulty: 3, prompt: "Agar bugun dushanba bo‘lsa, 10 kundan keyin?", choices: ["Payshanba","Chorshanba","Juma","Yakshanba"], correct: 0 },
  { id: 'v3-7', domain: 'numeracy', difficulty: 1, prompt: "200 ning 15 foizi?", choices: ["20","25","30","35"], correct: 2 },
  { id: 'v3-8', domain: 'numeracy', difficulty: 1, prompt: "3, 5, 7, 9 o‘rtachasi?", choices: ["5","6","7","8"], correct: 1 },
  { id: 'v3-9', domain: 'numeracy', difficulty: 2, prompt: "80 ning 25 foizi?", choices: ["10","20","30","40"], correct: 1 },
  { id: 'v3-10', domain: 'numeracy', difficulty: 2, prompt: "x+7=19, x=?", choices: ["10","11","12","13"], correct: 2 },
  { id: 'v3-11', domain: 'numeracy', difficulty: 3, prompt: "0.5 + 0.25 = ?", choices: ["0.55","0.65","0.75","1"], correct: 2 },
  { id: 'v3-12', domain: 'numeracy', difficulty: 3, prompt: "To‘rtburchak tomonlari 5 va 4; yuzasi?", choices: ["9","18","20","25"], correct: 2 },
  { id: 'v3-13', domain: 'programming', difficulty: 1, prompt: "JavaScript da o‘zgarmas bog‘lanish e’lon qilish?", choices: ["const","switch","while","break"], correct: 0 },
  { id: 'v3-14', domain: 'programming', difficulty: 1, prompt: "Massivning birinchi indeksi JavaScript da?", choices: ["1","0","-1","2"], correct: 1 },
  { id: 'v3-15', domain: 'programming', difficulty: 2, prompt: "Qaysi sikl shartni tekshiradi?", choices: ["if","while","return","const"], correct: 1 },
  { id: 'v3-16', domain: 'programming', difficulty: 2, prompt: "Boolean qiymatga misol?", choices: ["42","true","hello","null"], correct: 1 },
  { id: 'v3-17', domain: 'programming', difficulty: 3, prompt: "Funksiyadan qiymat qaytaruvchi so‘z?", choices: ["print","yield","return","import"], correct: 2 },
  { id: 'v3-18', domain: 'programming', difficulty: 3, prompt: "Git commit vazifasi?", choices: ["Tarixga o‘zgarishni qayd qilish","Serverni o‘chirish","Parol yaratish","Rasm chizish"], correct: 0 },
  { id: 'v3-19', domain: 'analysis', difficulty: 1, prompt: "Mijozlar soni 100 dan 120 ga ko‘tarildi. O‘sish foizi?", choices: ["10%","15%","20%","25%"], correct: 2 },
  { id: 'v3-20', domain: 'analysis', difficulty: 1, prompt: "Ikki o‘zgaruvchi bog‘liq bo‘lsa, bu har doim sababiyatmi?", choices: ["Ha","Yo‘q","Faqat kattada","Faqat kichikda"], correct: 1 },
  { id: 'v3-21', domain: 'analysis', difficulty: 2, prompt: "Median: 1, 2, 100?", choices: ["1","2","34.3","100"], correct: 1 },
  { id: 'v3-22', domain: 'analysis', difficulty: 2, prompt: "Grafikda keskin sakrash bo‘lsa nima qilish foydali?", choices: ["Sababini tekshirish","E’tiborsiz qoldirish","O‘chirish","Darhol xulosa"], correct: 0 },
  { id: 'v3-23', domain: 'analysis', difficulty: 3, prompt: "Noto‘g‘ri ma’lumot topilganda?", choices: ["Tekshirish va tuzatish","Saqlab qo‘yish","Yashirish","Ko‘paytirish"], correct: 0 },
  { id: 'v3-24', domain: 'analysis', difficulty: 3, prompt: "100 ta yozuvdan 25 tasi muvaffaqiyatli. Ulush?", choices: ["15%","20%","25%","30%"], correct: 2 },
  { id: 'v3-25', domain: 'digital', difficulty: 1, prompt: "API nima?", choices: ["Dasturlar muloqot interfeysi","Grafik muharrir","Protsessor","Operatsion tizim"], correct: 0 },
  { id: 'v3-26', domain: 'digital', difficulty: 1, prompt: "Git asosan nimaga xizmat qiladi?", choices: ["Tasvir tahriri","Versiyalarni kuzatish","Video ko‘rish","Antivirus"], correct: 1 },
  { id: 'v3-27', domain: 'digital', difficulty: 2, prompt: "Phishing belgisiga misol?", choices: ["Shubhali havola orqali parol so‘rash","Rasm yuklash","Kompyuterni yoqish","Fayl nomlash"], correct: 0 },
  { id: 'v3-28', domain: 'digital', difficulty: 2, prompt: "Ikki bosqichli tasdiqlash nimani oshiradi?", choices: ["Xotirani","Hisob xavfsizligini","Ekran hajmini","Tezlikni"], correct: 1 },
  { id: 'v3-29', domain: 'digital', difficulty: 3, prompt: "HTTPS nimani anglatadi?", choices: ["Himoyalangan tarmoq ulanishi","Rasm turi","USB port","Kod tili"], correct: 0 },
  { id: 'v3-30', domain: 'digital', difficulty: 3, prompt: "Bulutda saqlashga misol?", choices: ["Onlayn fayl xizmati","Faqat fleshka","Qog‘oz daftar","Printer"], correct: 0 }
];
export const DOMAINS_V3:readonly Domain3[] = ['logic','numeracy','programming','analysis','digital'];
export const DOMAIN_LABELS:Record<Domain3,string> = { logic:'Mantiq',numeracy:'Matematika',programming:'Dasturlash',analysis:'Tahlil',digital:'Raqamli savodxonlik' };
export const DOMAIN_PRACTICE:Record<Domain3,string> = {
 logic:'Ketma-ketliklar va mantiqiy masalalardan har kuni bir nechtasini yeching.',
 numeracy:'Foiz, tenglama va o‘rtacha qiymatni amaliy misollar bilan mashq qiling.',
 programming:'JavaScript asoslari, funksiyalar va kichik dasturlar yozishni o‘rganing.',
 analysis:'Ma’lumotlar jadvali, median va sababiyat masalalarini mashq qiling.',
 digital:'Git, xavfsiz parollar, ikki bosqichli tasdiqlash va API asoslarini o‘rganing.'
};
export function scoreV3(answers:Answers3) {
 const scores = Object.fromEntries(DOMAINS_V3.map(domain=>{
 const questions=QUESTIONS_V3.filter(q=>q.domain===domain);
 const correct=questions.filter(q=>answers[q.id]===q.correct).length;
 return [domain,{correct,total:questions.length,percent:Math.round(correct/questions.length*100)}];
 })) as Record<Domain3,{correct:number;total:number;percent:number}>;
 const answered=QUESTIONS_V3.filter(q=>Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<q.choices.length).length;
 return {version:'3.0',answered,total:QUESTIONS_V3.length,complete:answered===QUESTIONS_V3.length,scores};
}
/** A transparent, indicative recommendation based only on five quiz dimensions. */
export function recommendV3(scores:ReturnType<typeof scoreV3>['scores']) {
 const options=[
 {career:'Software Developer', weights:{programming:0.45,logic:0.25,digital:0.20,analysis:0.10,numeracy:0}},
 {career:'Data Analyst',weights:{analysis:0.35,numeracy:0.30,digital:0.20,logic:0.15,programming:0}},
 {career:'AI Engineer',weights:{programming:0.30,numeracy:0.30,analysis:0.25,logic:0.15,digital:0}},
 {career:'Cybersecurity Analyst',weights:{digital:0.45,logic:0.30,analysis:0.25,numeracy:0,programming:0}},
 {career:'Business Analyst',weights:{analysis:0.45,logic:0.25,numeracy:0.20,digital:0.10,programming:0}}
 ];
 return options.map(o=>({career:o.career,score:Math.round(DOMAINS_V3.reduce((sum,d)=>sum+scores[d].percent*o.weights[d],0))}))
 .sort((a,b)=>b.score-a.score).slice(0,3);
}
