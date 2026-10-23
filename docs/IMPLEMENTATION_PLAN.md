# CareerMind AI — staged implementation

## Current state (before this branch)
- React + Vite + TypeScript single large App.tsx (~3,367 lines).
- 6-factor self-reported matching formula; percentages are heuristic.
- Chatbot is keyword/template-based, not connected to an AI model.
- Profile, chat and progress use localStorage; no login or cloud sync.

## Stage 1 (this branch): secure foundation
- Add SQL schema with authenticated per-user RLS for profiles and assessment attempts.
- Add authenticated Supabase Edge Function as server-side OpenAI proxy.
- Add UI-independent authentication, chat and assessment API adapters.
- Add 6 objective starter questions and a pure scoring function.
- Keep existing UI untouched to avoid breaking established user workflows.

## Stage 2: interactive integration (NOT yet complete)
- Implement login/signup/logout and confirmation/recovery UX.
- Keep tokens in Supabase-supported session handling; avoid manual localStorage tokens.
- Replace rule-based chat UI with authenticated async function; loading, retry, abuse throttling, rate limits and clear AI fallback.
- Add objective questions as optional step within Assessment 2.0; store results with user approval.
- Migrate legacy localStorage profiles to cloud *only after* explicit sign-in and consent; avoid data loss.
- Add tests, responsive checks and CI build before merge.

## Activation checklist
1. Create Supabase project and apply SQL migration.
2. Set Edge Function secrets OPENAI_API_KEY and ALLOWED_ORIGIN; deploy career-chat with JWT verification enabled.
3. Set public VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY locally or on hosting. NEVER publish OpenAI secret.
4. Configure Auth site URL, redirect origins and email verification in Supabase dashboard.
5. Before production, apply per-user rate limits, usage budgets, server-side abuse checks, and privacy/deletion controls.
6. Do not merge until UI integration and build/tests are completed.

## Known limitations
No live Supabase project, OpenAI API key, or deployment credentials were provided. This branch supplies functional backend/source components but does not yet activate login or replace the current on-screen chatbot. Assessment question bank is intentionally small and not psychometrically validated; no diagnostic or guarantee claims.
