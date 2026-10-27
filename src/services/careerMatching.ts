import type { Domain3 } from '../assessment/assessmentV3';

export interface MatchCareer {id:string;title:string;category:string;requiredSkills:Record<string,number>;associatedInterests:string[];description:string}
export interface MatchProfile {interests:string[];skills:Record<string,number>}
export type MatchTest = {version:string;results:{scores?:Partial<Record<Domain3,{percent:number}>>}};
const links:Record<Domain3,string>={logic:'problemSolving',numeracy:'mathematics',programming:'programming',analysis:'dataAnalysis',digital:'programming'};
const keys:Domain3[]=['logic','numeracy','programming','analysis','digital'];
export function hasMatchingData(profile:MatchProfile) {
 return Object.values(profile.skills).filter(v=>Number.isFinite(v)&&v>0).length>=3 && profile.interests.length>0;
}
export function rankCareers(careers:MatchCareer[],profile:MatchProfile,test:MatchTest|null) {
 return careers.map(career=>{
  const requirements=Object.entries(career.requiredSkills);
  const skillMatch=requirements.length ? requirements.reduce((sum,[k,target])=>{
   const measured=profile.skills[k];
   return sum+(measured>0?Math.max(0,100-Math.abs(measured-target)*10):0);
  },0)/requirements.length : 0;
  const interestHits=career.associatedInterests.filter(i=>profile.interests.some(p=>p.toLowerCase()===i.toLowerCase()));
  const interestMatch=career.associatedInterests.length?Math.round(interestHits.length/career.associatedInterests.length*100):0;
  const relevant=keys.filter(d=>career.requiredSkills[links[d]]!==undefined&&test?.results?.scores?.[d]?.percent!==undefined);
  const testMatch=relevant.length?relevant.reduce((sum,d)=>sum+(test?.results.scores?.[d]?.percent??0),0)/relevant.length:null;
  const score=Math.max(0,Math.min(100,Math.round(testMatch===null?skillMatch*.65+interestMatch*.35:skillMatch*.45+interestMatch*.25+testMatch*.30)));
  const strengths=requirements.filter(([k,need])=>(profile.skills[k]??0)>=need).map(([k])=>k).slice(0,3);
  const gaps=requirements.filter(([k,need])=>(profile.skills[k]??0)>0&&(profile.skills[k]??0)<need).sort((a,b)=>(b[1]-(profile.skills[b[0]]??0))-(a[1]-(profile.skills[a[0]]??0))).map(([k])=>k).slice(0,3);
  return {career,score,interestHits,strengths,gaps,testMatch};
 }).sort((a,b)=>b.score-a.score);
}
