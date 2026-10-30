/** Objective mini-assessment: scores are indicative, not medical or hiring judgments. */
export type Domain = 'logic' | 'numeracy' | 'digital';
export interface Question {
  id: string;
  domain: Domain;
  prompt: string;
  choices: readonly string[];
  correct: number;
  explanation: string;
}
export const QUESTIONS: readonly Question[] = [
  { id: 'logic-1', domain: 'logic', prompt: '2, 4, 8, 16, ... keyingi son?', choices: ['18', '24', '32', '64'], correct: 2, explanation: 'Har safar son 2 ga ko‘paymoqda.' },
  { id: 'logic-2', domain: 'logic', prompt: 'Barcha A lar B. Barcha B lar C. Qaysi xulosa to‘g‘ri?', choices: ['Barcha A lar C', 'Barcha C lar A', 'Hech bir A C emas', 'Aniqlab bo‘lmaydi'], correct: 0, explanation: 'To‘plamlar orasidagi tranzitiv munosabat.' },
  { id: 'num-1', domain: 'numeracy', prompt: '200 ning 15 foizi nechaga teng?', choices: ['15', '20', '30', '40'], correct: 2, explanation: '200 × 0.15 = 30.' },
  { id: 'num-2', domain: 'numeracy', prompt: '3, 5, 7, 9 sonlarining o‘rtachasi?', choices: ['5', '6', '7', '8'], correct: 1, explanation: '(3+5+7+9)/4 = 6.' },
  { id: 'dig-1', domain: 'digital', prompt: 'Git versiya nazorati asosan nima uchun ishlatiladi?', choices: ['Videolarni kesish', 'Kod o‘zgarishlarini kuzatish', 'Monitor yorqinligi', 'Fayllarni siqish'], correct: 1, explanation: 'Git o‘zgarishlar tarixini boshqaradi.' },
  { id: 'dig-2', domain: 'digital', prompt: 'API nima?', choices: ['Dasturlar o‘zaro muloqot qilish interfeysi', 'Faqat grafik muharrir', 'Operatsion tizim', 'Protsessor turi'], correct: 0, explanation: 'API dasturiy interfeysni ifodalaydi.' },
];
export type Answers = Record<string, number>;
export function scoreAssessment(answers: Answers) {
  const domains: Domain[] = ['logic', 'numeracy', 'digital'];
  const scores = Object.fromEntries(domains.map(domain => {
    const subset = QUESTIONS.filter(q => q.domain === domain);
    const correct = subset.filter(q => answers[q.id] === q.correct).length;
    return [domain, { correct, total: subset.length, percent: Math.round(correct / subset.length * 100) }];
  })) as Record<Domain, { correct: number; total: number; percent: number }>;
  const answered = QUESTIONS.filter(q => Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] < q.choices.length).length;
  return { version: '2.0' as const, answered, total: QUESTIONS.length, complete: answered === QUESTIONS.length, scores };
}
