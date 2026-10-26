import { QUESTIONS_V3, DOMAINS_V3, scoreV3, type Answers3, type Domain3, type Question3 } from './assessmentV3';

/** Adapt difficulty within each subject; all 30 items are eventually answered.
 * This is a learning-oriented sequence, not a validated adaptive ability estimate.
 */
export function chooseNext(answers: Answers3, sequence: readonly string[]): Question3 | null {
 const used = new Set(sequence);
 const remaining = QUESTIONS_V3.filter(q => !used.has(q.id));
 if (!remaining.length) return null;
 // Rotate domains based on how many questions have already been shown.
 const domain = [...DOMAINS_V3].sort((a,b) =>
   sequence.filter(id=>QUESTIONS_V3.find(q=>q.id===id)?.domain===a).length -
   sequence.filter(id=>QUESTIONS_V3.find(q=>q.id===id)?.domain===b).length)[0];
 const choices = remaining.filter(q=>q.domain===domain);
 const prior = [...sequence].reverse().map(id=>QUESTIONS_V3.find(q=>q.id===id))
    .find((q):q is Question3=>!!q && q.domain===domain);
 const target = prior ? Math.max(1,Math.min(3,prior.difficulty + (answers[prior.id]===prior.correct?1:-1))) : 2;
 return choices.sort((a,b)=>Math.abs(a.difficulty-target)-Math.abs(b.difficulty-target) || a.id.localeCompare(b.id))[0] || null;
}
export function adaptiveSummary(answers:Answers3,sequence:readonly string[]) {
 const base=scoreV3(answers);
 const difficultyMix=Object.fromEntries(DOMAINS_V3.map(domain=>[domain,sequence.filter(id=>QUESTIONS_V3.find(q=>q.id===id)?.domain===domain).map(id=>QUESTIONS_V3.find(q=>q.id===id)?.difficulty)])) as Record<Domain3,(1|2|3)[]>;
 return {...base,version:'3.1-adaptive',difficultyMix,selectionMethod:'previous-answer-difficulty'};
}
