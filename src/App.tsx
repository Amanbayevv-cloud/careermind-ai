import { useState, useEffect, useMemo } from 'react';
import AccountPanel from './components/AccountPanel';
import SupportPage from './components/SupportPage';
import ObjectiveAssessment from './components/ObjectiveAssessment';
import AssessmentV3 from './components/AssessmentV3';
import AdaptiveAssessment from './components/AdaptiveAssessment';
import SmartRoadmap from './components/SmartRoadmap';
import CareerMatchingV3 from './components/CareerMatchingV3';
import DashboardV2 from './components/DashboardV2';
import { askCareerAI } from './services/careerBackend';
import { requireSupabase, supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import {
  Compass,
  Briefcase,
  BrainCircuit,
  BarChart3,
  Laptop,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  Send,
  User,
  Settings as SettingsIcon,
  Flame,
  Award,
  Zap,
  Search,
  Check,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Target,
  Layers,
  BriefcaseBusiness,
  Menu,
  X,
  Sliders,
  Scale
} from 'lucide-react';

type Language = 'uz' | 'ru' | 'en';

type EducationLevel = 'high_school' | 'bachelor' | 'master' | 'phd' | 'bootcamp_self';

type WorkType = 'remote' | 'hybrid' | 'office';

type CareerGoal = 'technical_expert' | 'maximize_salary' | 'start_company' | 'international_remote';

interface SkillRatings {
  programming: number;
  mathematics: number;
  problemSolving: number;
  dataAnalysis: number;
  communication: number;
  creativity: number;
  leadership: number;
  research: number;
  design: number;
  management: number;
}

interface PersonalityTraits {
  analyticalThinking: number;
  creativity: number;
  leadership: number;
  socialInteraction: number;
  independence: number;
  riskTolerance: number;
  attentionToDetail: number;
  adaptability: number;
}

interface WorkPreferences {
  workType: WorkType;
  salaryImportance: number;
  workLifeBalance: number;
  careerGrowth: number;
  jobStability: number;
  internationalOpportunities: number;
}

interface UserProfile {
  name: string;
  age: number;
  educationLevel: EducationLevel;
  university: string;
  fieldOfStudy: string;
  yearsOfExperience: number;
  skills: SkillRatings;
  interests: string[];
  personality: PersonalityTraits;
  preferences: WorkPreferences;
  careerGoal: CareerGoal;
  assessmentCompleted: boolean;
  selectedCareerId: string | null;
  xp: number;
  streakDays: number;
  completedTasks: Record<string, boolean>;
  unlockedBadges: string[];
}

interface CareerRequirement {
  id: string;
  titleKey: string;
  category: string;
  descriptionKey: string;
  baseSalary: string;
  demand: 'Very High' | 'High' | 'Moderate';
  growthRate: string;
  remoteScore: number; // 1-100
  difficulty: 'Beginner' | 'Moderate' | 'Advanced' | 'Expert';
  requiredSkills: { [key in keyof SkillRatings]?: number };
  associatedInterests: string[];
  personalityFit: { [key in keyof PersonalityTraits]?: number };
  goalFit: CareerGoal[];
  typicalRoles: string[];
  advantagesKeys: string[];
  challengesKeys: string[];
  roadmapMonths: {
    month: number;
    title: string;
    focus: string;
    tasks: { id: string; name: string; resource: string }[];
  }[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

const TRANSLATIONS = {
  uz: {
    appName: "CareerMind AI",
    tagline: "Sizga mos keladigan kasbni kashf eting.",
    subtagline: "Ko'nikmalaringiz, shaxsiyatingiz, qiziqishlaringiz va maqsadlaringiz asosida sun'iy intellekt yordamida yo'naltirilgan karyera platformasi.",
    startAssessment: "Karyera testini boshlash",
    exploreCareers: "Kasblarni ko'rish",
    dashboard: "Boshqaruv paneli",
    assessment: "Testdan o'tish",
    careers: "Kasblar katalogi",
    myCareer: "Mening yo'nalishim",
    skillGap: "Ko'nikmalar tahlili",
    roadmap: "O'quv yo'l xaritasi",
    aiAssistant: "AI Maslahatchi",
    profile: "Profil",
    settings: "Sozlamalar",
    compare: "Taqqoslash",
    home: "Bosh sahifa",
    xpLabel: "XP Ball",
    streakLabel: "kunlik faollik",
    level: "Daraja",
    welcome: "Xush kelibsiz",
    matchScore: "Moslik ko'rsatkichi",
    targetCareer: "Tavsiya etilgan kasb",
    skillsOverview: "Ko'nikmalar holati",
    activeRoadmap: "Aktiv yo'l xaritasi",
    completedTasksCount: "Bajarilgan vazifalar",
    achievements: "Yutuqlar",
    needAssessmentNotice: "Shaxsiy tavsiyalarni olish uchun avval karyera testini yakunlang.",
    goAssessment: "Testni boshlash",
    whyMatches: "Nima uchun mos keladi?",
    strengths: "Kuchli tomonlaringiz",
    missingSkills: "Rivojlantirish kerak bo'lgan sohalar",
    salaryRange: "Kutilayotgan maosh",
    demandLevel: "Bozordagi talab",
    remotePotential: "Masofaviy ishlash imkoniyati",
    growthForecast: "O'sish sur'ati",
    difficulty: "Murakkablik",
    startThisRoadmap: "Ushbu yo'l xaritasini tanlash",
    alreadyActiveRoadmap: "Aktiv yo'nalish qilib belgilangan",
    filterByCategory: "Kategoriya bo'yicha saralash",
    allCategories: "Barcha kategoriyalar",
    searchPlaceholder: "Kasb nomi yoki kalit so'z bo'yicha izlash...",
    skillGapTitle: "Ko'nikmalar orasidagi farq tahlili (Skill Gap)",
    skillGapDesc: "Tanlangan kasb uchun talab qilinadigan bilimlar va sizning hozirgi darajangiz solishtirmasi.",
    userCurrent: "Sizning darajangiz",
    requiredLevel: "Talab darajasi",
    gap: "Farq",
    strong: "Yuqori daraja",
    medium: "O'rta daraja",
    weak: "Rivojlantirish zarur",
    roadmapTitle: "Shaxsiy 6 oylik o'rganish rejasi",
    roadmapSubtitle: "Nazariyadan amaliyotga va ish topishgacha bo'lgan bosqichma-bosqich reja.",
    chatPlaceholder: "Karyerangiz haqida savol bering...",
    send: "Yuborish",
    suggestedQuestions: "Tavsiya etilgan savollar:",
    compareTitle: "Kasblarni o'zaro taqqoslash",
    compareSubtitle: "Ikkita yoki uchta kasbni parametrlar bo'yicha solishtiring.",
    selectCareersToCompare: "Taqqoslash uchun kamida 2 ta kasbni tanlang:",
    metric: "Parametr",
    saveProfile: "Profilni saqlash",
    profileUpdated: "Profil muvaffaqiyatli yangilandi!",
    settingsTitle: "Tizim sozlamalari",
    languageSelect: "Tizim tili",
    resetAssessment: "Karyera testini qayta topshirish",
    resetConfirm: "Haqiqatan ham barcha test natijalarini tozalab, boshidan boshlamoqchimisiz?",
    clearData: "Barcha ma'lumotlarni o'chirish",
    clearConfirm: "Barcha saqlangan ma'lumotlar o'chiriladi. Rozimisiz?",
    features: "Imkoniyatlar",
    howItWorks: "Qanday ishlaydi?",
    step1Title: "1. Shaxsiy test",
    step1Desc: "6 bosqichli intellektual so'rovnomada ko'nikma, qiziqish va ish uslubingizni baholaysiz.",
    step2Title: "2. AI Tahlil",
    step2Desc: "Algoritm 6 xil mezon asosida kasbiy moslik darajasini 100% lik shkala bo'yicha hisoblaydi.",
    step3Title: "3. O'quv xaritasi",
    step3Desc: "Har bir oy uchun moslashtirilgan vazifalar va bepul/pullik manbalar orqali maqsad sari yurasiz.",
    testimonials: "Foydalanuvchilar fikrlari",
    faq: "Tez-tez beriladigan savollar",
    footerText: "CareerMind AI — Sun'iy intellekt asosidagi zamonaviy karyera yo'riqnomasi platformasi.",
    allRightsReserved: "Barcha huquqlar himoyalangan.",
    step: "Bosqich",
    of: "dan",
    next: "Keyingisi",
    prev: "Oldingisi",
    finishAssessment: "Natijani hisoblash",
    customInterestPlaceholder: "Yangi qiziqish qo'shish...",
    add: "Qo'shish"
  },
  ru: {
    appName: "CareerMind AI",
    tagline: "Найдите профессию, которая подходит именно вам.",
    subtagline: "Интеллектуальная карьерная платформа на базе ИИ с учетом ваших навыков, психотипа, интересов и карьерных целей.",
    startAssessment: "Пройти карьерный тест",
    exploreCareers: "Каталог профессий",
    dashboard: "Панель управления",
    assessment: "Тестирование",
    careers: "Профессии",
    myCareer: "Моя карьера",
    skillGap: "Анализ навыков",
    roadmap: "План обучения",
    aiAssistant: "AI Ассистент",
    profile: "Профиль",
    settings: "Настройки",
    compare: "Сравнение",
    home: "Главная",
    xpLabel: "Очки XP",
    streakLabel: "дней подряд",
    level: "Уровень",
    welcome: "Добро пожаловать",
    matchScore: "Совместимость",
    targetCareer: "Рекомендованная профессия",
    skillsOverview: "Обзор навыков",
    activeRoadmap: "Текущий роадмап",
    completedTasksCount: "Выполнено задач",
    achievements: "Достижения",
    needAssessmentNotice: "Пройдите первичное тестирование, чтобы разблокировать персональные рекомендации ИИ.",
    goAssessment: "Начать тест",
    whyMatches: "Почему это подходит вам?",
    strengths: "Ваши сильные стороны",
    missingSkills: "Зоны роста и пробелы",
    salaryRange: "Ожидаемая зарплата",
    demandLevel: "Востребованность",
    remotePotential: "Удаленная работа",
    growthForecast: "Прогноз роста",
    difficulty: "Сложность входа",
    startThisRoadmap: "Выбрать этот роадмап",
    alreadyActiveRoadmap: "Активный план развития",
    filterByCategory: "Фильтр по категориям",
    allCategories: "Все категории",
    searchPlaceholder: "Поиск по названию профессии...",
    skillGapTitle: "Анализ дефицита навыков (Skill Gap)",
    skillGapDesc: "Сравнение ваших текущих компетенций с требованиями выбранной профессии.",
    userCurrent: "Ваш уровень",
    requiredLevel: "Требуемый уровень",
    gap: "Дефицит",
    strong: "Сильный навык",
    medium: "Средний уровень",
    weak: "Требует внимания",
    roadmapTitle: "Персональный 6-месячный план развития",
    roadmapSubtitle: "Пошаговое руководство от теории до первого предложения о работе.",
    chatPlaceholder: "Спросите AI о вашей карьере...",
    send: "Отправить",
    suggestedQuestions: "Рекомендуемые вопросы:",
    compareTitle: "Сравнение профессий",
    compareSubtitle: "Наглядное сопоставление 2 или 3 специальностей по ключевым параметрам.",
    selectCareersToCompare: "Выберите профессии для сравнения:",
    metric: "Параметр",
    saveProfile: "Сохранить профиль",
    profileUpdated: "Профиль успешно обновлен!",
    settingsTitle: "Настройки системы",
    languageSelect: "Язык интерфейса",
    resetAssessment: "Пересдать тест",
    resetConfirm: "Вы уверены, что хотите сбросить ответы теста?",
    clearData: "Очистить все данные",
    clearConfirm: "Все сохраненные данные будут удалены. Продолжить?",
    features: "Возможности",
    howItWorks: "Как это работает?",
    step1Title: "1. Экспресс-опрос",
    step1Desc: "6 шагов для оценки ваших навыков, характера, целей и предпочтений.",
    step2Title: "2. ИИ-скоринг",
    step2Desc: "Алгоритм сопоставляет профиль с базой индустрии по взвешенной модели.",
    step3Title: "3. Практический трек",
    step3Desc: "Получите помесячные задачи, полезные ссылки и отслеживайте прогресс.",
    testimonials: "Отзывы специалистов",
    faq: "Частые вопросы",
    footerText: "CareerMind AI — Высокотехнологичная платформа для карьерной навигации.",
    allRightsReserved: "Все права защищены.",
    step: "Шаг",
    of: "из",
    next: "Далее",
    prev: "Назад",
    finishAssessment: "Рассчитать совместимость",
    customInterestPlaceholder: "Добавить интерес...",
    add: "Добавить"
  },
  en: {
    appName: "CareerMind AI",
    tagline: "Discover the career that fits you.",
    subtagline: "AI-powered career guidance based on your skills, personality, interests, and ambitious goals.",
    startAssessment: "Start Career Assessment",
    exploreCareers: "Explore Careers",
    dashboard: "Dashboard",
    assessment: "Career Assessment",
    careers: "Career Directory",
    myCareer: "My Path",
    skillGap: "Skill Gap Analysis",
    roadmap: "Learning Roadmap",
    aiAssistant: "AI Assistant",
    profile: "Profile",
    settings: "Settings",
    compare: "Compare",
    home: "Home",
    xpLabel: "XP Points",
    streakLabel: "day streak",
    level: "Level",
    welcome: "Welcome back",
    matchScore: "Match Score",
    targetCareer: "Top Recommendation",
    skillsOverview: "Skills Overview",
    activeRoadmap: "Active Learning Roadmap",
    completedTasksCount: "Tasks Completed",
    achievements: "Achievements & Badges",
    needAssessmentNotice: "Complete the 6-step assessment to reveal your AI recommendations and skill gap analysis.",
    goAssessment: "Take Assessment Now",
    whyMatches: "Why it matches you",
    strengths: "Your core strengths",
    missingSkills: "Skills to develop",
    salaryRange: "Expected Salary",
    demandLevel: "Market Demand",
    remotePotential: "Remote Potential",
    growthForecast: "Projected Growth",
    difficulty: "Difficulty",
    startThisRoadmap: "Set as Active Roadmap",
    alreadyActiveRoadmap: "Current Active Career",
    filterByCategory: "Filter by Category",
    allCategories: "All Categories",
    searchPlaceholder: "Search careers by title or skill...",
    skillGapTitle: "Skill Gap Analysis",
    skillGapDesc: "Comparison between your current abilities and benchmark industry expectations.",
    userCurrent: "Your Rating",
    requiredLevel: "Benchmark Level",
    gap: "Skill Delta",
    strong: "Strong Fit",
    medium: "Moderate Fit",
    weak: "Needs Improvement",
    roadmapTitle: "Personalized 6-Month Roadmap",
    roadmapSubtitle: "Actionable month-by-month checklist with verified resources and milestones.",
    chatPlaceholder: "Ask career advisor anything...",
    send: "Send",
    suggestedQuestions: "Quick prompts:",
    compareTitle: "Career Comparison Matrix",
    compareSubtitle: "Side-by-side evaluation of high-growth technology and business careers.",
    selectCareersToCompare: "Select 2 or 3 careers to compare side-by-side:",
    metric: "Metric",
    saveProfile: "Save Profile",
    profileUpdated: "Profile updated successfully!",
    settingsTitle: "Platform Settings",
    languageSelect: "Language",
    resetAssessment: "Retake Assessment",
    resetConfirm: "Are you sure you want to reset your career assessment answers?",
    clearData: "Reset All Local Data",
    clearConfirm: "This will erase all progress, XP, and chat history. Continue?",
    features: "Platform Features",
    howItWorks: "How It Works",
    step1Title: "1. Diagnostic Audit",
    step1Desc: "6 interactive steps analyzing hard skills, cognitive traits, and compensation targets.",
    step2Title: "2. Weighted AI Engine",
    step2Desc: "Proprietary multi-dimensional formula computes your explainable match percentage.",
    step3Title: "3. Action Roadmap",
    step3Desc: "Receive monthly curated milestones, learning checkpoints, and portfolio tasks.",
    testimonials: "Success Stories",
    faq: "Frequently Asked Questions",
    footerText: "CareerMind AI — Intelligent career navigation platform.",
    allRightsReserved: "All rights reserved.",
    step: "Step",
    of: "of",
    next: "Next",
    prev: "Previous",
    finishAssessment: "Analyze Career Match",
    customInterestPlaceholder: "Add custom interest...",
    add: "Add"
  }
};

const CAREER_DATABASE: CareerRequirement[] = [
  {
    id: 'ai-engineer',
    titleKey: 'AI Engineer / Machine Learning Specialist',
    category: 'AI & Machine Learning',
    descriptionKey: 'Designs, develops, and deploys deep neural networks, LLM integrations, and generative AI pipelines for enterprise systems.',
    baseSalary: '$110,000 - $185,000',
    demand: 'Very High',
    growthRate: '+38% (Next 5 yrs)',
    remoteScore: 92,
    difficulty: 'Advanced',
    requiredSkills: {
      programming: 9,
      mathematics: 8,
      problemSolving: 9,
      dataAnalysis: 8,
      research: 8,
      creativity: 6
    },
    associatedInterests: ['Artificial Intelligence', 'Data Science', 'Robotics', 'Research', 'Software Development'],
    personalityFit: {
      analyticalThinking: 9,
      attentionToDetail: 8,
      adaptability: 8,
      independence: 8
    },
    goalFit: ['technical_expert', 'maximize_salary', 'international_remote'],
    typicalRoles: ['Prompt Engineer', 'MLOps Specialist', 'Algorithm Researcher', 'AI Solutions Architect'],
    advantagesKeys: [
      'Top-tier compensation and global relocation packages',
      'At the cutting edge of global technological innovation',
      'Extremely high remote international job availability'
    ],
    challengesKeys: [
      'Rapidly shifting paradigms requiring continuous upskilling',
      'Demands deep abstract mathematics and computational complexity'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Core Python & Applied Math',
        focus: 'Mastering vector calculus, linear algebra, and optimized Python 3.12 syntax.',
        tasks: [
          { id: 'ai-m1-1', name: 'Complete 30 Linear Algebra & Matrix decomposition exercises', resource: 'Khan Academy / 3Blue1Brown' },
          { id: 'ai-m1-2', name: 'Build 5 Python OOP algorithms without external libraries', resource: 'LeetCode Medium' }
        ]
      },
      {
        month: 2,
        title: 'Scientific Data Stack',
        focus: 'NumPy arrays, Pandas high-performance ETL, Matplotlib/Seaborn visualization.',
        tasks: [
          { id: 'ai-m2-1', name: 'Scrape and clean a real-world messy dataset (100k+ rows)', resource: 'Kaggle Datasets' },
          { id: 'ai-m2-2', name: 'Perform exploratory statistical data analysis with hypotheses', resource: 'Scikit-Learn Docs' }
        ]
      },
      {
        month: 3,
        title: 'Supervised & Unsupervised ML',
        focus: 'Regression, Decision Trees, XGBoost, Random Forests, and Clustering algorithms.',
        tasks: [
          { id: 'ai-m3-1', name: 'Deploy a house price prediction model with Cross-Validation', resource: 'Fast.ai Part 1' },
          { id: 'ai-m3-2', name: 'Implement PCA dimensional reduction and clustering visualization', resource: 'Hands-on ML Book' }
        ]
      },
      {
        month: 4,
        title: 'Deep Learning & PyTorch',
        focus: 'Convolutional neural networks, Transformers, attention mechanisms, loss optimization.',
        tasks: [
          { id: 'ai-m4-1', name: 'Train custom CNN for multi-class image classification', resource: 'PyTorch Official Tutorials' },
          { id: 'ai-m4-2', name: 'Fine-tune an open-source HuggingFace LLM on custom domain data', resource: 'Hugging Face Course' }
        ]
      },
      {
        month: 5,
        title: 'MLOps & Scalable Deployment',
        focus: 'Docker containerization, FastAPI inference microservices, Triton/TensorRT.',
        tasks: [
          { id: 'ai-m5-1', name: 'Package model into Docker container with FastAPI endpoints', resource: 'Full Stack Deep Learning' },
          { id: 'ai-m5-2', name: 'Set up MLflow experiment tracking and latency benchmarks', resource: 'MLflow Docs' }
        ]
      },
      {
        month: 6,
        title: 'Capstone & Global Outreach',
        focus: 'Publishing production demo on HuggingFace Spaces & technical interviews.',
        tasks: [
          { id: 'ai-m6-1', name: 'Publish end-to-end fullstack AI portfolio with interactive UI', resource: 'HuggingFace Spaces' },
          { id: 'ai-m6-2', name: 'Conduct 4 mock technical system design interviews', resource: 'Pramp / Interviewing.io' }
        ]
      }
    ]
  },
  {
    id: 'data-scientist',
    titleKey: 'Data Scientist & Predictive Modeler',
    category: 'Data Science',
    descriptionKey: 'Extracts strategic enterprise insights from structured and unstructured data using predictive statistical models and BI.',
    baseSalary: '$95,000 - $155,000',
    demand: 'High',
    growthRate: '+25% (Next 5 yrs)',
    remoteScore: 88,
    difficulty: 'Moderate',
    requiredSkills: {
      dataAnalysis: 9,
      mathematics: 8,
      programming: 7,
      problemSolving: 8,
      communication: 7,
      research: 8
    },
    associatedInterests: ['Data Science', 'Finance', 'Business', 'Artificial Intelligence', 'Research'],
    personalityFit: {
      analyticalThinking: 9,
      attentionToDetail: 8,
      socialInteraction: 6,
      adaptability: 7
    },
    goalFit: ['technical_expert', 'maximize_salary', 'international_remote'],
    typicalRoles: ['BI Analyst', 'Quantitative Researcher', 'Customer Insights Lead', 'Data Architect'],
    advantagesKeys: [
      'High influence on strategic corporate executive decisions',
      'Broad applicability across fintech, healthcare, and retail',
      'Balanced blend of code, statistics, and business acumen'
    ],
    challengesKeys: [
      'Heavy time spent on dirty data wrangling and governance',
      'Need to translate complex mathematical formulas for non-technical stakeholders'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Advanced SQL & Data Modeling',
        focus: 'Window functions, CTEs, PostgreSQL optimization, and Star schemas.',
        tasks: [
          { id: 'ds-m1-1', name: 'Write 40 complex multi-join SQL analytics queries', resource: 'Stratascratch' },
          { id: 'ds-m1-2', name: 'Design normalized and denormalized relational database schema', resource: 'Mode SQL Tutorial' }
        ]
      },
      {
        month: 2,
        title: 'Python for Data Science',
        focus: 'Data wrangling, cleaning missing values, outliers, and feature scaling.',
        tasks: [
          { id: 'ds-m2-1', name: 'Perform EDA on real-world e-commerce sales dataset', resource: 'Kaggle Competitions' },
          { id: 'ds-m2-2', name: 'Formulate and test 5 A/B test null hypotheses', resource: 'StatQuest with Josh Starmer' }
        ]
      },
      {
        month: 3,
        title: 'Machine Learning for Prediction',
        focus: 'Logistic regression, churn prediction models, AUC-ROC evaluation.',
        tasks: [
          { id: 'ds-m3-1', name: 'Build customer churn classification model with 85%+ accuracy', resource: 'Scikit-Learn User Guide' },
          { id: 'ds-m3-2', name: 'Perform SHAP value explainability on feature imports', resource: 'SHAP Library Docs' }
        ]
      },
      {
        month: 4,
        title: 'Business Intelligence & Dashboards',
        focus: 'Tableau, PowerBI, and interactive Streamlit applications.',
        tasks: [
          { id: 'ds-m4-1', name: 'Create executive C-suite KPI financial dashboard', resource: 'Tableau Public Gallery' },
          { id: 'ds-m4-2', name: 'Build Streamlit app allowing users to upload CSVs and see forecasts', resource: 'Streamlit.io' }
        ]
      },
      {
        month: 5,
        title: 'Big Data & Cloud Pipelines',
        focus: 'Apache Spark, Databricks, BigQuery, and automated scheduled jobs.',
        tasks: [
          { id: 'ds-m5-1', name: 'Execute PySpark distributed transformations on 5M+ row dataset', resource: 'Spark Docs' },
          { id: 'ds-m5-2', name: 'Connect pipeline to Google BigQuery or Snowflake', resource: 'GCP Free Tier' }
        ]
      },
      {
        month: 6,
        title: 'Portfolio & Case Interviews',
        focus: 'Publishing business case studies and metrics teardowns.',
        tasks: [
          { id: 'ds-m6-1', name: 'Write 2 comprehensive Medium/Substack data story articles', resource: 'Towards Data Science' },
          { id: 'ds-m6-2', name: 'Prepare for product sense and SQL coding live tests', resource: 'Exponent Interview Prep' }
        ]
      }
    ]
  },
  {
    id: 'cybersecurity-engineer',
    titleKey: 'Cybersecurity & Infosec Engineer',
    category: 'Cybersecurity',
    descriptionKey: 'Protects critical cloud networks, servers, and sensitive data against sophisticated cyber threats and zero-day exploits.',
    baseSalary: '$100,000 - $165,000',
    demand: 'Very High',
    growthRate: '+32% (Next 5 yrs)',
    remoteScore: 82,
    difficulty: 'Advanced',
    requiredSkills: {
      problemSolving: 9,
      programming: 7,
      research: 8,
      dataAnalysis: 6,
      leadership: 6,
      management: 6
    },
    associatedInterests: ['Cybersecurity', 'Software Development', 'Robotics', 'Business'],
    personalityFit: {
      attentionToDetail: 9,
      analyticalThinking: 8,
      riskTolerance: 4,
      independence: 8
    },
    goalFit: ['technical_expert', 'maximize_salary', 'international_remote'],
    typicalRoles: ['SOC Analyst', 'Penetration Tester', 'Cloud Security Architect', 'DevSecOps Specialist'],
    advantagesKeys: [
      'Unsurpassed job security and recession-resilient demand',
      'Exciting adversarial mindset and ethical hacking',
      'Substantial corporate & government consulting budgets'
    ],
    challengesKeys: [
      'High-stakes emergency incident response duty cycles',
      'Constant surveillance of emerging threat vectors and vulnerabilities'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Networking & Linux Internals',
        focus: 'TCP/IP protocol suites, subnetting, bash scripting, system calls.',
        tasks: [
          { id: 'cs-m1-1', name: 'Analyze packet captures in Wireshark and identify anomalies', resource: 'Wireshark University' },
          { id: 'cs-m1-2', name: 'Harden an Ubuntu server, configure UFW firewall and SSH keys', resource: 'Linux Foundation' }
        ]
      },
      {
        month: 2,
        title: 'Vulnerability Analysis & Pentesting',
        focus: 'OWASP Top 10 vulnerabilities, Nmap scanning, Burp Suite intercepting.',
        tasks: [
          { id: 'cs-m2-1', name: 'Complete 15 challenges on TryHackMe or HackTheBox', resource: 'TryHackMe.com' },
          { id: 'cs-m2-2', name: 'Perform simulated SQL injection and XSS defense audits', resource: 'PortSwigger Web Academy' }
        ]
      },
      {
        month: 3,
        title: 'SIEM & Threat Detection',
        focus: 'Splunk, Elastic SIEM, log forensics, and alert triage.',
        tasks: [
          { id: 'cs-m3-1', name: 'Set up ELK stack and ingest simulated breach logs', resource: 'Elastic Free Tier' },
          { id: 'cs-m3-2', name: 'Write Sigma rules for detecting credential dumping', resource: 'SigmaHQ' }
        ]
      },
      {
        month: 4,
        title: 'Cloud Security (AWS / Azure)',
        focus: 'IAM policies, VPC peering, KMS encryption, Zero Trust frameworks.',
        tasks: [
          { id: 'cs-m4-1', name: 'Audit an AWS environment with Prowler or ScoutSuite', resource: 'AWS Security Fundamentals' },
          { id: 'cs-m4-2', name: 'Implement strict least-privilege role-based access control', resource: 'Cloud Security Alliance' }
        ]
      },
      {
        month: 5,
        title: 'DevSecOps & Automation',
        focus: 'SAST/DAST tooling in CI/CD pipelines, container security (Trivy).',
        tasks: [
          { id: 'cs-m5-1', name: 'Add Snyk and SonarQube automated checks into GitHub Actions', resource: 'GitHub Actions Marketplace' },
          { id: 'cs-m5-2', name: 'Run vulnerability scan on Docker images and fix CVEs', resource: 'Trivy Docs' }
        ]
      },
      {
        month: 6,
        title: 'Certification & Auditing',
        focus: 'CompTIA Security+, CEH preparation, and professional incident reports.',
        tasks: [
          { id: 'cs-m6-1', name: 'Draft a full executive vulnerability assessment report', resource: 'OffSec Templates' },
          { id: 'cs-m6-2', name: 'Complete 3 full-length Security+ simulated exams with 90% score', resource: 'Professor Messer' }
        ]
      }
    ]
  },
  {
    id: 'fullstack-developer',
    titleKey: 'Full Stack Software Engineer',
    category: 'Software Development',
    descriptionKey: 'Builds end-to-end web applications, robust APIs, database architectures, and reactive responsive user interfaces.',
    baseSalary: '$85,000 - $145,000',
    demand: 'Very High',
    growthRate: '+22% (Next 5 yrs)',
    remoteScore: 96,
    difficulty: 'Moderate',
    requiredSkills: {
      programming: 9,
      problemSolving: 8,
      design: 6,
      creativity: 7,
      communication: 6,
      dataAnalysis: 5
    },
    associatedInterests: ['Software Development', 'UI/UX', 'Gaming', 'Artificial Intelligence', 'Entrepreneurship'],
    personalityFit: {
      adaptability: 9,
      analyticalThinking: 8,
      independence: 8,
      attentionToDetail: 7
    },
    goalFit: ['start_company', 'international_remote', 'maximize_salary'],
    typicalRoles: ['Frontend Architect', 'Backend API Specialist', 'Technical Co-founder', 'Mobile Dev'],
    advantagesKeys: [
      'Ultimate autonomy to build and ship independent digital ventures',
      'The single highest volume of remote international job postings',
      'Immediate tangible feedback when shipping live features'
    ],
    challengesKeys: [
      'Fast-paced JavaScript/TypeScript framework ecosystem churn',
      'Balancing UI pixel-perfection with backend throughput stability'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Modern JS/TS & React',
        focus: 'TypeScript strict mode, React hooks, component lifecycle, Tailwind CSS.',
        tasks: [
          { id: 'fs-m1-1', name: 'Build 3 TypeScript responsive components with Tailwind', resource: 'React.dev Docs' },
          { id: 'fs-m1-2', name: 'Implement custom state management with Zustand or Redux Toolkit', resource: 'Frontend Masters' }
        ]
      },
      {
        month: 2,
        title: 'Backend Node.js & Express / NestJS',
        focus: 'RESTful architecture, JWT authentication, middleware, rate limiting.',
        tasks: [
          { id: 'fs-m2-1', name: 'Develop secure auth system with bcrypt and JWT refresh tokens', resource: 'Nodejs.org' },
          { id: 'fs-m2-2', name: 'Build validation pipes with Zod and error interceptors', resource: 'Zod Docs' }
        ]
      },
      {
        month: 3,
        title: 'Databases & ORM Mastery',
        focus: 'PostgreSQL, Redis caching, Prisma ORM, migrations, ACID principles.',
        tasks: [
          { id: 'fs-m3-1', name: 'Build multi-tenant database schema with Prisma ORM', resource: 'Prisma.io Docs' },
          { id: 'fs-m3-2', name: 'Implement Redis caching layer for sub-50ms query responses', resource: 'Redis University' }
        ]
      },
      {
        month: 4,
        title: 'Full Stack Next.js & Server Actions',
        focus: 'SSR, SSG, Server Actions, edge runtime, Stripe payments integration.',
        tasks: [
          { id: 'fs-m4-1', name: 'Build and deploy a functional SaaS boilerplate with Next.js 15', resource: 'Next.js Official Learn' },
          { id: 'fs-m4-2', name: 'Integrate Stripe checkout webhooks with database synchronization', resource: 'Stripe Docs' }
        ]
      },
      {
        month: 5,
        title: 'Testing & Cloud CI/CD',
        focus: 'Jest, Playwright E2E testing, Docker, GitHub Actions, AWS deployment.',
        tasks: [
          { id: 'fs-m5-1', name: 'Write Playwright test suite for critical user purchase flow', resource: 'Playwright.dev' },
          { id: 'fs-m5-2', name: 'Automate build and deployment to Vercel/AWS ECS with CI pipeline', resource: 'GitHub Actions Guide' }
        ]
      },
      {
        month: 6,
        title: 'Polished SaaS Launch & Interviews',
        focus: 'Product Hunt launch, open-source contributions, system design practice.',
        tasks: [
          { id: 'fs-m6-1', name: 'Launch fully functioning micro-SaaS with real active users', resource: 'Product Hunt' },
          { id: 'fs-m6-2', name: 'Review System Design Primer and 50 top frontend coding queries', resource: 'System Design Primer Repo' }
        ]
      }
    ]
  },
  {
    id: 'ux-ui-designer',
    titleKey: 'Senior Product & UX/UI Designer',
    category: 'Design',
    descriptionKey: 'Shapes user journeys, interactive design systems, wireframes, and high-fidelity micro-interactions for digital products.',
    baseSalary: '$75,000 - $130,000',
    demand: 'High',
    growthRate: '+18% (Next 5 yrs)',
    remoteScore: 94,
    difficulty: 'Moderate',
    requiredSkills: {
      design: 10,
      creativity: 9,
      communication: 8,
      problemSolving: 7,
      research: 7,
      programming: 4
    },
    associatedInterests: ['UI/UX', 'Design', 'Marketing', 'Software Development', 'Gaming'],
    personalityFit: {
      creativity: 9,
      socialInteraction: 7,
      attentionToDetail: 9,
      adaptability: 8
    },
    goalFit: ['start_company', 'international_remote', 'technical_expert'],
    typicalRoles: ['Design Systems Architect', 'UX Researcher', 'Interaction Designer', 'Product Lead'],
    advantagesKeys: [
      'Direct visual impact on how millions interact with digital technology',
      'Thriving freelance, consulting, and digital nomad ecosystem',
      'No heavy mathematical background required'
    ],
    challengesKeys: [
      'Subjective critique cycles requiring high emotional resilience',
      'Bridging design specs into feasible frontend engineering constraints'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Design Foundations & Figma Pro',
        focus: 'Typography hierarchy, 8pt spatial grid, color theory, Figma auto-layout.',
        tasks: [
          { id: 'ux-m1-1', name: 'Recreate 5 award-winning SaaS interfaces pixel-by-pixel in Figma', resource: 'Figma Community' },
          { id: 'ux-m1-2', name: 'Master Auto Layout 5.0, variants, and component properties', resource: 'Figma YouTube Academy' }
        ]
      },
      {
        month: 2,
        title: 'UX Research & Information Architecture',
        focus: 'User interviews, personas, journey maps, card sorting, wireframing.',
        tasks: [
          { id: 'ux-m2-1', name: 'Conduct 5 user problem discovery interviews for a mobile app idea', resource: 'The Mom Test Book' },
          { id: 'ux-m2-2', name: 'Map out complete interactive user flow and low-fi wireframe', resource: 'Nielsen Norman Group' }
        ]
      },
      {
        month: 3,
        title: 'Design Systems & Accessibility (WCAG)',
        focus: 'Design tokens, dark/light theme systems, contrast ratios, accessible forms.',
        tasks: [
          { id: 'ux-m3-1', name: 'Construct a 50+ tokenized UI library inspired by Radix / Tailwind', resource: 'Refactoring UI Book' },
          { id: 'ux-m3-2', name: 'Run WCAG AAA contrast audits across mobile components', resource: 'WebAIM.org' }
        ]
      },
      {
        month: 4,
        title: 'Interactive Prototyping & Motion',
        focus: 'Smart animate, micro-interactions, Framer, Lottie animations.',
        tasks: [
          { id: 'ux-m4-1', name: 'Build high-fidelity prototype with interactive sliding drawers', resource: 'Framer Academy' },
          { id: 'ux-m4-2', name: 'Conduct unmoderated usability tests with 10 real users on Maze', resource: 'Maze.co' }
        ]
      },
      {
        month: 5,
        title: 'Frontend Fundamentals for Designers',
        focus: 'HTML5, CSS Flexbox/Grid, Tailwind utility mapping, handoff specs.',
        tasks: [
          { id: 'ux-m5-1', name: 'Inspect live production CSS and build exact frontend replica', resource: 'Kevin Powell CSS' },
          { id: 'ux-m5-2', name: 'Set up developer handoff tokens in Zeplin or Figma Dev Mode', resource: 'Figma Dev Mode Docs' }
        ]
      },
      {
        month: 6,
        title: 'Killer Case Study Portfolio',
        focus: 'Publishing 3 in-depth case studies solving measurable business problems.',
        tasks: [
          { id: 'ux-m6-1', name: 'Launch custom portfolio website with 3 business case studies', resource: 'Bento.me / Framer' },
          { id: 'ux-m6-2', name: 'Practice 3 whiteboard design challenge rounds', resource: 'Artiom Dashinsky Guide' }
        ]
      }
    ]
  },
  {
    id: 'product-manager',
    titleKey: 'Technical Product Manager',
    category: 'Business',
    descriptionKey: 'Aligns business vision, user empathy, and engineering sprints to deliver high-impact software products to market.',
    baseSalary: '$105,000 - $170,000',
    demand: 'High',
    growthRate: '+20% (Next 5 yrs)',
    remoteScore: 80,
    difficulty: 'Advanced',
    requiredSkills: {
      leadership: 9,
      management: 9,
      communication: 9,
      problemSolving: 8,
      dataAnalysis: 7,
      creativity: 7
    },
    associatedInterests: ['Business', 'Entrepreneurship', 'Marketing', 'UI/UX', 'Finance'],
    personalityFit: {
      leadership: 9,
      socialInteraction: 9,
      adaptability: 8,
      riskTolerance: 7
    },
    goalFit: ['start_company', 'maximize_salary', 'international_remote'],
    typicalRoles: ['Growth PM', 'Platform PM', 'Director of Product', 'Chief Product Officer'],
    advantagesKeys: [
      'Direct path to executive leadership (CEO, COO, CPO)',
      'High variety of daily work across design, tech, and marketing',
      'Tremendous strategic ownership of consumer experience'
    ],
    challengesKeys: [
      'High responsibility with no direct line authority over engineers',
      'Constant prioritization battles and multi-stakeholder negotiations'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Product Discovery & Market Validation',
        focus: 'Jobs-to-be-done (JTBD), competitive moats, TAM/SAM/SOM estimation.',
        tasks: [
          { id: 'pm-m1-1', name: 'Write a comprehensive 1-pager PRD for an innovative feature', resource: 'Reforge Product Guides' },
          { id: 'pm-m1-2', name: 'Execute competitive analysis matrix across 5 competitors', resource: 'Inspired by Marty Cagan' }
        ]
      },
      {
        month: 2,
        title: 'Product Analytics & North Star Metrics',
        focus: 'Cohort retention, funnel drop-offs, Mixpanel, Amplitude, SQL basics.',
        tasks: [
          { id: 'pm-m2-1', name: 'Define North Star metric and 4 input metrics for a SaaS app', resource: 'Amplitude Playbook' },
          { id: 'pm-m2-2', name: 'Design and simulate an onboarding funnel optimization test', resource: 'Mixpanel University' }
        ]
      },
      {
        month: 3,
        title: 'Agile Execution & Roadmapping',
        focus: 'Scrum vs Kanban, backlog grooming, user story slicing, Jira management.',
        tasks: [
          { id: 'pm-m3-1', name: 'Create 2-quarter strategic roadmap using RICE framework', resource: 'Atlassian Agile Coach' },
          { id: 'pm-m3-2', name: 'Write 10 granular Jira user stories with acceptance criteria', resource: 'Scrum.org' }
        ]
      },
      {
        month: 4,
        title: 'Tech Architecture for PMs',
        focus: 'REST vs GraphQL, microservices, databases, latency tradeoffs.',
        tasks: [
          { id: 'pm-m4-1', name: 'Map system architecture diagram for payment checkout', resource: 'System Design for PMs' },
          { id: 'pm-m4-2', name: 'Participate in engineering tech feasibility estimation workshop', resource: 'Exponent Technical PM' }
        ]
      },
      {
        month: 5,
        title: 'Go-to-Market (GTM) Strategy',
        focus: 'Product-led growth (PLG), pricing tier models, viral loops, marketing synergy.',
        tasks: [
          { id: 'pm-m5-1', name: 'Formulate PLG freemium upgrade monetization strategy', resource: 'OpenView Partners PLG' },
          { id: 'pm-m5-2', name: 'Draft full launch communication plan across email and socials', resource: 'HubSpot GTM Plan' }
        ]
      },
      {
        month: 6,
        title: 'Executive Presentations & Interviewing',
        focus: 'Product sense, execution metrics, leadership interview mastery.',
        tasks: [
          { id: 'pm-m6-1', name: 'Present a 10-slide product strategy deck to mentor/peers', resource: 'Cracking the PM Interview' },
          { id: 'pm-m6-2', name: 'Complete 6 mock product estimation & design interview cases', resource: 'Exponent / StellarPeers' }
        ]
      }
    ]
  },
  {
    id: 'cloud-devops',
    titleKey: 'Cloud DevOps & Site Reliability Engineer',
    category: 'Software Development',
    descriptionKey: 'Automates cloud infrastructure, Kubernetes clusters, continuous delivery pipelines, and zero-downtime scalability.',
    baseSalary: '$105,000 - $160,000',
    demand: 'Very High',
    growthRate: '+28% (Next 5 yrs)',
    remoteScore: 90,
    difficulty: 'Advanced',
    requiredSkills: {
      programming: 8,
      problemSolving: 9,
      dataAnalysis: 6,
      management: 6,
      mathematics: 6,
      leadership: 6
    },
    associatedInterests: ['Software Development', 'Cybersecurity', 'Robotics', 'Artificial Intelligence'],
    personalityFit: {
      attentionToDetail: 9,
      analyticalThinking: 8,
      adaptability: 8,
      independence: 8
    },
    goalFit: ['technical_expert', 'maximize_salary', 'international_remote'],
    typicalRoles: ['Infrastructure Engineer', 'Platform Engineer', 'Kubernetes Administrator', 'SRE'],
    advantagesKeys: [
      'Massive global enterprise demand with very high salary floors',
      'Infrastructure as code allows reproducible, clean architecture',
      'Tremendous leverage over company-wide engineering velocity'
    ],
    challengesKeys: [
      'On-call alerts for production system outages and downtime',
      'Deep complexity of distributed networking, DNS, and cloud costs'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'Linux Systems & Advanced Bash',
        focus: 'Systemd, storage, permissions, networking sockets, shell scripting.',
        tasks: [
          { id: 'do-m1-1', name: 'Write modular Bash script for automated server health checks', resource: 'Linux Journey' },
          { id: 'do-m1-2', name: 'Configure Nginx reverse proxy with SSL certificates', resource: 'DigitalOcean Community' }
        ]
      },
      {
        month: 2,
        title: 'Containers & Docker Architecture',
        focus: 'Multi-stage builds, rootless containers, volume persistence, networks.',
        tasks: [
          { id: 'do-m2-1', name: 'Optimize a Node/Python Docker image from 1.2GB down to 110MB', resource: 'Docker Official Docs' },
          { id: 'do-m2-2', name: 'Orchestrate 4 microservices with Docker Compose', resource: 'Docker Mastery Course' }
        ]
      },
      {
        month: 3,
        title: 'Infrastructure as Code (Terraform)',
        focus: 'HCL syntax, state management, AWS VPC, EC2, RDS automated provisioning.',
        tasks: [
          { id: 'do-m3-1', name: 'Write reusable Terraform modules for AWS VPC and ECS', resource: 'HashiCorp Learn' },
          { id: 'do-m3-2', name: 'Set up remote S3 state backend with DynamoDB locking', resource: 'Terraform Up & Running' }
        ]
      },
      {
        month: 4,
        title: 'Kubernetes (K8s) Cluster Management',
        focus: 'Pods, Deployments, Services, Ingress, Helm charts, ConfigMaps.',
        tasks: [
          { id: 'do-m4-1', name: 'Deploy resilient high-availability app on Minikube or K3s', resource: 'Kubernetes The Hard Way' },
          { id: 'do-m4-2', name: 'Create custom Helm chart with dynamic environment variables', resource: 'Helm.sh Docs' }
        ]
      },
      {
        month: 5,
        title: 'CI/CD & GitOps Automation',
        focus: 'GitHub Actions, ArgoCD, automated rollbacks, semantic release.',
        tasks: [
          { id: 'do-m5-1', name: 'Implement GitOps pipeline with ArgoCD syncing to K8s', resource: 'ArgoCD Docs' },
          { id: 'do-m5-2', name: 'Build zero-downtime blue/green deployment workflow', resource: 'DevOps Toolkit YouTube' }
        ]
      },
      {
        month: 6,
        title: 'Observability & SRE Practice',
        focus: 'Prometheus, Grafana, OpenTelemetry, SLO/SLA management.',
        tasks: [
          { id: 'do-m6-1', name: 'Build custom Grafana dashboard tracking P99 latency and CPU', resource: 'Prometheus.io' },
          { id: 'do-m6-2', name: 'Draft a blameless post-mortem incident report for simulated outage', resource: 'Google SRE Book' }
        ]
      }
    ]
  },
  {
    id: 'robotics-engineer',
    titleKey: 'Robotics & Embedded Systems Engineer',
    category: 'Robotics',
    descriptionKey: 'Programs microcontrollers, kinematics, ROS2 frameworks, and sensor-actuator feedback systems for autonomous hardware.',
    baseSalary: '$90,000 - $150,000',
    demand: 'Moderate',
    growthRate: '+24% (Next 5 yrs)',
    remoteScore: 45,
    difficulty: 'Expert',
    requiredSkills: {
      mathematics: 9,
      programming: 8,
      problemSolving: 9,
      research: 8,
      creativity: 7,
      dataAnalysis: 7
    },
    associatedInterests: ['Robotics', 'Artificial Intelligence', 'Software Development', 'Gaming'],
    personalityFit: {
      analyticalThinking: 9,
      attentionToDetail: 9,
      independence: 8,
      riskTolerance: 6
    },
    goalFit: ['technical_expert', 'start_company', 'maximize_salary'],
    typicalRoles: ['Automation Engineer', 'Robotics Software Dev', 'Firmware Engineer', 'Computer Vision Dev'],
    advantagesKeys: [
      'Tangible real-world hardware impact: seeing machines come alive',
      'High technological barrier to entry protects against automation',
      'Rapidly accelerating investments in robotics and manufacturing'
    ],
    challengesKeys: [
      'Hardware debugging requires on-site laboratory presence',
      'Lower remote work flexibility compared to purely web-based roles'
    ],
    roadmapMonths: [
      {
        month: 1,
        title: 'C++ & Low-Level Architecture',
        focus: 'C++20 features, pointers, memory allocation, registers, microcontrollers.',
        tasks: [
          { id: 'rob-m1-1', name: 'Write bare-metal C++ firmware for STM32 or ESP32', resource: 'Fastbit Embedded Academy' },
          { id: 'rob-m1-2', name: 'Interface with I2C and SPI sensors (IMU, Barometer)', resource: 'Embedded C Programming' }
        ]
      },
      {
        month: 2,
        title: 'Kinematics & Spatial Math',
        focus: 'Forward and inverse kinematics, homogeneous transformations, quaternions.',
        tasks: [
          { id: 'rob-m2-1', name: 'Calculate forward kinematics for 3-DOF robotic arm in Python', resource: 'Modern Robotics Book' },
          { id: 'rob-m2-2', name: 'Simulate PID motor speed and angle control loop in MATLAB/Python', resource: 'Brian Douglas Control Videos' }
        ]
      },
      {
        month: 3,
        title: 'Robot Operating System 2 (ROS 2)',
        focus: 'Nodes, topics, services, actions, DDS communication, RViz2.',
        tasks: [
          { id: 'rob-m3-1', name: 'Build a multi-node ROS2 package communicating via custom messages', resource: 'ROS 2 Humble Docs' },
          { id: 'rob-m3-2', name: 'Visualize URDF 3D model of a robot inside RViz', resource: 'Articulated Robotics YouTube' }
        ]
      },
      {
        month: 4,
        title: 'Computer Vision & Sensor Fusion',
        focus: 'OpenCV, LiDAR point clouds, Kalman filters, object localization.',
        tasks: [
          { id: 'rob-m4-1', name: 'Implement Extended Kalman Filter fusing IMU and wheel odometry', resource: 'Probabilistic Robotics Book' },
          { id: 'rob-m4-2', name: 'Detect and track objects using OpenCV and depth cameras', resource: 'OpenCV Official Guides' }
        ]
      },
      {
        month: 5,
        title: 'Autonomous Navigation (SLAM & Nav2)',
        focus: 'Simultaneous localization and mapping, path planning (A*, Dijkstra).',
        tasks: [
          { id: 'rob-m5-1', name: 'Map simulated indoor warehouse using Gazebo and Nav2', resource: 'Nav2 Documentation' },
          { id: 'rob-m5-2', name: 'Implement collision avoidance and dynamic obstacle re-routing', resource: 'Gazebo Simulation Labs' }
        ]
      },
      {
        month: 6,
        title: 'Hardware Capstone & Portfolio',
        focus: 'Construct physical rover or high-fidelity simulation and video demo.',
        tasks: [
          { id: 'rob-m6-1', name: 'Complete documented autonomous rover project on GitHub', resource: 'GitHub Showcases' },
          { id: 'rob-m6-2', name: 'Publish technical video demonstration with architecture breakdown', resource: 'LinkedIn & YouTube' }
        ]
      }
    ]
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: 0,
  educationLevel: '' as EducationLevel,
  university: '',
  fieldOfStudy: '',
  yearsOfExperience: 0,
  skills: {
    programming: 0, mathematics: 0, problemSolving: 0, dataAnalysis: 0,
    communication: 0, creativity: 0, leadership: 0, research: 0,
    design: 0, management: 0
  },
  interests: [],
  personality: {
    analyticalThinking: 0, creativity: 0, leadership: 0, socialInteraction: 0,
    independence: 0, riskTolerance: 0, attentionToDetail: 0, adaptability: 0
  },
  preferences: {
    workType: '' as WorkType, salaryImportance: 0, workLifeBalance: 0,
    careerGrowth: 0, jobStability: 0, internationalOpportunities: 0
  },
  careerGoal: '' as CareerGoal,
  assessmentCompleted: false,
  selectedCareerId: null,
  xp: 0,
  streakDays: 0,
  completedTasks: {},
  unlockedBadges: []
};

function calculateCareerScores(profile: UserProfile): { career: CareerRequirement; matchScore: number; strengths: string[]; missingSkills: string[] }[] {
  return CAREER_DATABASE.map((career) => {
    // 1. Skills Weight: 30%
    let skillTotalDiff = 0;
    let skillCount = 0;
    const strengths: string[] = [];
    const missingSkills: string[] = [];

    Object.entries(career.requiredSkills).forEach(([skillKey, reqValue]) => {
      const userValue = profile.skills[skillKey as keyof SkillRatings] || 1;
      skillCount++;
      const diff = userValue - (reqValue || 5);
      if (diff >= 0) {
        strengths.push(skillKey);
        skillTotalDiff += 100;
      } else {
        missingSkills.push(skillKey);
        // Penalty proportional to deficit
        const partial = Math.max(0, 100 - Math.abs(diff) * 16);
        skillTotalDiff += partial;
      }
    });
    const skillsScore = skillCount > 0 ? skillTotalDiff / skillCount : 70;

    // 2. Interests Weight: 20%
    const sharedInterests = career.associatedInterests.filter(i => profile.interests.includes(i));
    const interestsScore = career.associatedInterests.length > 0
      ? Math.min(100, (sharedInterests.length / Math.min(3, career.associatedInterests.length)) * 100)
      : 60;

    // 3. Personality Weight: 15%
    let personalityTotal = 0;
    let pCount = 0;
    Object.entries(career.personalityFit).forEach(([pKey, pVal]) => {
      const uVal = profile.personality[pKey as keyof PersonalityTraits] || 5;
      pCount++;
      const pDiff = Math.abs(uVal - (pVal || 5));
      personalityTotal += Math.max(0, 100 - pDiff * 14);
    });
    const personalityScore = pCount > 0 ? personalityTotal / pCount : 70;

    // 4. Career Goals Weight: 15%
    const goalMatch = career.goalFit.includes(profile.careerGoal);
    const goalsScore = goalMatch ? 100 : 65;

    // 5. Work Preferences Weight: 10%
    let prefScore = 75;
    if (profile.preferences.workType === 'remote') {
      prefScore = career.remoteScore;
    } else if (profile.preferences.workType === 'hybrid') {
      prefScore = Math.max(70, career.remoteScore * 0.9);
    } else {
      prefScore = 80;
    }

    // 6. Education / Experience: 10%
    let expScore = 70;
    if (career.difficulty === 'Beginner') {
      expScore = 95;
    } else if (career.difficulty === 'Moderate') {
      expScore = profile.yearsOfExperience >= 1 ? 90 : 75;
    } else if (career.difficulty === 'Advanced') {
      expScore = profile.yearsOfExperience >= 2 ? 90 : 70;
    } else {
      expScore = profile.yearsOfExperience >= 3 ? 90 : 65;
    }

    // Final Weighted Composition
    const totalMatch = Math.round(
      skillsScore * 0.30 +
      interestsScore * 0.20 +
      personalityScore * 0.15 +
      goalsScore * 0.15 +
      prefScore * 0.10 +
      expScore * 0.10
    );

    return {
      career,
      matchScore: Math.min(99, Math.max(48, totalMatch)),
      strengths: strengths.slice(0, 3),
      missingSkills: missingSkills.slice(0, 3)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('careermind_lang');
      return (saved as Language) || 'uz';
    } catch {
      return 'uz';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence of Profile
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Selected Career ID for details view
  const [inspectedCareerId, setInspectedCareerId] = useState<string>('ai-engineer');

  // Comparison drawer/selection
  const [compareCareerIds, setCompareCareerIds] = useState<string[]>(['ai-engineer', 'data-scientist']);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Keep cached profile/chat separate for each auth identity; never share guest data with accounts.
  const [localDataOwner, setLocalDataOwner] = useState('guest');
  const [authReady, setAuthReady] = useState(false);
  const defaultChat: ChatMessage[] = [{
    id: 'msg-1', sender: 'ai',
    text: "Assalomu alaykum! Men CareerMind AI karyera maslahatchisiman.",
    timestamp: '10:30'
  }];
  const readScopedData = (owner: string) => {
    try {
      const rawProfile = owner === 'guest' ? null : localStorage.getItem('careermind_profile_' + owner);
      const rawChat = owner === 'guest' ? null : localStorage.getItem('careermind_chat_' + owner);
      return {
        profile: rawProfile ? JSON.parse(rawProfile) as UserProfile : { ...INITIAL_PROFILE },
        chat: rawChat ? JSON.parse(rawChat) as ChatMessage[] : defaultChat
      };
    } catch {
      return { profile: { ...INITIAL_PROFILE }, chat: defaultChat };
    }
  };

  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setAuthReady(true); } }).catch(() => { if (mounted) setAuthReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (mounted) { setSession(next); setAuthReady(true); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const owner = session?.user.id ?? 'guest';
    if (owner === localDataOwner) return;
    const stored = readScopedData(owner);
    setProfile(stored.profile);
    setChatMessages(stored.chat);
    setLocalDataOwner(owner);
  }, [authReady, session?.user.id, localDataOwner]);

  const saveProfileToCloud = async () => {
    if (!session) throw new Error('Avval tizimga kiring');
    const { error } = await requireSupabase().from('profiles').upsert({
      user_id: session.user.id, display_name: profile.name, profile_data: profile,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) throw error;
  };
  const loadProfileFromCloud = async () => {
    if (!session) throw new Error('Avval tizimga kiring');
    const { data, error } = await requireSupabase().from('profiles')
      .select('profile_data').eq('user_id', session.user.id).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Bulutda profil hali yo‘q');
    // Keep the local profile intact if the stored record is malformed.
    const incoming = data.profile_data;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)
      || typeof incoming.name !== 'string' || !incoming.skills
      || !incoming.personality || !incoming.preferences) throw new Error('Bulutdagi profil noto‘g‘ri');
    setProfile(incoming as unknown as UserProfile);
  };

  // Save updates to LocalStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('careermind_lang', lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  useEffect(() => {
    try {
      if (authReady && session && localDataOwner === session.user.id) localStorage.setItem('careermind_profile_' + localDataOwner, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile, session?.user.id, authReady, localDataOwner]);

  useEffect(() => {
    try {
      if (authReady && session && localDataOwner === session.user.id) localStorage.setItem('careermind_chat_' + localDataOwner, JSON.stringify(chatMessages));
    } catch (e) {
      console.error(e);
    }
  }, [chatMessages, session?.user.id, authReady, localDataOwner]);

  const t = TRANSLATIONS[lang];

  // Calculated Matches
  const careerScores = useMemo(() => {
    return calculateCareerScores(profile);
  }, [profile]);

  const bestMatch = careerScores[0] || {
    career: CAREER_DATABASE[0],
    matchScore: 90,
    strengths: ['programming', 'problemSolving'],
    missingSkills: ['mathematics']
  };

  const selectedCareer = useMemo(() => {
    return CAREER_DATABASE.find(c => c.id === (profile.selectedCareerId || inspectedCareerId)) || CAREER_DATABASE[0];
  }, [profile.selectedCareerId, inspectedCareerId]);

  const inspectedCareer = useMemo(() => {
    return CAREER_DATABASE.find(c => c.id === inspectedCareerId) || selectedCareer;
  }, [inspectedCareerId, selectedCareer]);

  // Gamification helpers
  const handleToggleTask = (taskId: string) => {
    const isCompleted = !!profile.completedTasks[taskId];
    const newTasks = { ...profile.completedTasks, [taskId]: !isCompleted };
    const xpChange = !isCompleted ? 50 : -50;
    const newXp = Math.max(0, profile.xp + xpChange);

    let updatedBadges = [...profile.unlockedBadges];
    if (Object.values(newTasks).filter(Boolean).length >= 5 && !updatedBadges.includes('task_master')) {
      updatedBadges.push('task_master');
    }

    setProfile(prev => ({
      ...prev,
      completedTasks: newTasks,
      xp: newXp,
      unlockedBadges: updatedBadges
    }));
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 200) + 1;
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isAiTyping) return;
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsAiTyping(true);

    if (session) {
      try {
        const context = JSON.stringify({ language: lang, career: selectedCareer.titleKey, skillsToImprove: bestMatch.missingSkills });
        const result = await askCareerAI(query, session.access_token, context);
        setChatMessages(prev => [...prev, {
          id: `ai-${Date.now()}`, sender: 'ai', text: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } catch {
        setChatMessages(prev => [...prev, {
          id: `error-${Date.now()}`, sender: 'ai',
          text: "AI xizmatiga ulanib bo‘lmadi. Hisobingiz yoki server sozlamalarini tekshiring. Savolni qayta yuborishingiz mumkin.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } finally {
        setIsAiTyping(false);
      }
      return;
    }
    // Guest mode: local keyword-based suggestions, not an AI model.
    // Realistic smart response generator based on user's exact profile and query
    setTimeout(() => {
      let replyText = "";
      const lower = query.toLowerCase();
      const userName = profile.name || "Do'stim";
      const topCareer = bestMatch.career.titleKey;

      if (lang === 'uz') {
        if (lower.includes('mos') || lower.includes('qaysi kasb') || lower.includes('tavsiya')) {
          replyText = `Sizning javoblaringiz tahlili bo'yicha sizga eng mos kasb — **${topCareer}** (${bestMatch.matchScore}% moslik). Kuchli tomonlaringiz: ${bestMatch.strengths.join(', ')}. Ushbu yo'nalish sizning ${profile.preferences.workType} formatidagi ishlash xohishingizga to'liq javob beradi.`;
        } else if (lower.includes('nimani') || lower.includes("o'rganish") || lower.includes('oy')) {
          replyText = `Rejangiz bo'yicha 1-oyda asosiy e'tiborni **${selectedCareer.roadmapMonths[0]?.title}**ga qaratish lozim. Hozirda sizda ${bestMatch.missingSkills.join(' va ')} bo'yicha bilimlarni kuchaytirish ustuvor vazifadir. Kuniga 45 daqiqa ajratib, yo'l xaritasidagi 1-vazifani bajaring!`;
        } else if (lower.includes('masofaviy') || lower.includes('remote') || lower.includes('dollar') || lower.includes('maosh')) {
          replyText = `${selectedCareer.titleKey} yo'nalishida masofaviy ishlash salohiyati juda yuqori (${selectedCareer.remoteScore}%). O'rtacha yillik daromad esa jahon bozorida **${selectedCareer.baseSalary}** atrofida baholanadi. Upwork, Wellfound yoki LinkedIn orqali xalqaro shartnomalarga kirish mumkin.`;
        } else if (lower.includes('yetishmayapti') || lower.includes('kamchilik') || lower.includes('skill')) {
          replyText = `Sizda hozirda benchmark me'yoridan ortda qolayotgan ko'nikmalar: **${bestMatch.missingSkills.join(', ')}**. "Ko'nikmalar tahlili" (Skill Gap) bo'limida har bir ko'nikma uchun tavsiya etilgan amaliy mashg'ulotlarni ko'rishingiz mumkin.`;
        } else {
          replyText = `Ajoyib savol, ${userName}! ${selectedCareer.titleKey} sohasida muvaffaqiyatga erishish uchun eng muhimi — amaliy loyihalar portfoliolarini yig'ishdir. O'quv rejasidagi topshiriqlarni belgilab boring va XP ballaringizni oshiring. Boshqa savolingiz bormi?`;
        }
      } else if (lang === 'ru') {
        if (lower.includes('подходит') || lower.includes('профессия') || lower.includes('лучше')) {
          replyText = `Исходя из вашего профиля, наилучшая совместимость у специальности **${topCareer}** (${bestMatch.matchScore}%). Ваши ключевые преимущества: ${bestMatch.strengths.join(', ')}. Это полностью отвечает вашей цели: ${profile.careerGoal}.`;
        } else if (lower.includes('учить') || lower.includes('навыки') || lower.includes('месяц')) {
          replyText = `Вам рекомендуется сфокусироваться на первом месяце роадмапа: **${selectedCareer.roadmapMonths[0]?.title}**. Главная зона роста сейчас — ${bestMatch.missingSkills.join(', ')}. Выполняйте интерактивные чек-листы в разделе "План обучения".`;
        } else if (lower.includes('удален') || lower.includes('зарплат') || lower.includes('remote')) {
          replyText = `Потенциал удаленной работы для этой профессии составляет **${selectedCareer.remoteScore}%**, а ожидаемый диапазон дохода: **${selectedCareer.baseSalary}**. Начните с подготовки профиля на международных платформах.`;
        } else {
          replyText = `Отличный вопрос, ${userName}! Для успешного старта в направлении ${selectedCareer.titleKey} крайне важно не только изучать теорию, но и регулярно пополнять GitHub репозитории реальными кейсами. Могу ли я подсказать что-то по конкретному навыку?`;
        }
      } else {
        if (lower.includes('best') || lower.includes('fit') || lower.includes('career')) {
          replyText = `Based on your diagnostic profile, your top career match is **${topCareer}** at **${bestMatch.matchScore}% compatibility**. Your strongest pillars are ${bestMatch.strengths.join(', ')}.`;
        } else if (lower.includes('learn') || lower.includes('month') || lower.includes('first')) {
          replyText = `For Month 1, prioritize: **${selectedCareer.roadmapMonths[0]?.title}**. You should primarily bridge the gap in ${bestMatch.missingSkills.join(' and ')}. Check out the tasks in your Learning Roadmap!`;
        } else if (lower.includes('remote') || lower.includes('salary') || lower.includes('earn')) {
          replyText = `This career features an impressive **${selectedCareer.remoteScore}% remote index** with global compensation benchmarked at **${selectedCareer.baseSalary}**.`;
        } else {
          replyText = `Great question, ${userName}! Building momentum in ${selectedCareer.titleKey} comes down to consistent weekly roadmap execution. Keep tracking your progress here to earn more XP!`;
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 850);
  };

  const renderNavbar = () => (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition duration-300" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CareerMind <span className="text-cyan-400 font-mono">AI</span>
            </span>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              Guidance System
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center space-x-1">
          {[
            { id: 'home', label: t.home, icon: Compass },
            { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
            { id: 'assessment', label: t.assessment, icon: Sliders },
            { id: 'careers', label: t.careers, icon: Briefcase },
            { id: 'skillGap', label: t.skillGap, icon: Target },
            { id: 'roadmap', label: t.roadmap, icon: BookOpen },
            { id: 'compare', label: t.compare, icon: Scale },
            { id: 'assistant', label: t.aiAssistant, icon: Bot }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'myCareer') setInspectedCareerId(profile.selectedCareerId || 'ai-engineer');
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-cyan-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Badges, Lang Switcher & Mobile Menu Trigger */}
        <div className="flex items-center space-x-3">
          {/* XP & Streak */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs">
            <div className="flex items-center space-x-1 text-amber-400 font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
              <span>{profile.streakDays} {t.streakLabel}</span>
            </div>
            <div className="w-1 h-3 bg-slate-700 rounded-full" />
            <div className="flex items-center space-x-1 text-cyan-400 font-semibold">
              <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
              <span>{profile.xp} XP</span>
            </div>
          </div>

          {/* Lang Selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            {(['uz', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded font-semibold uppercase transition ${
                  lang === l
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button onClick={() => setActiveTab('support')}
            className={`px-3 py-2 rounded-lg text-xs border ${activeTab === 'support' ? 'bg-indigo-600/30 border-indigo-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'}`}
            title="Qo‘llab-quvvatlash">Yordam</button>
          {/* User Profile / Settings */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-lg border transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600/30 border-indigo-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={t.profile}
          >
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-lg border transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600/30 border-indigo-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={t.settings}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 backdrop-blur-2xl">
          {[
            { id: 'home', label: t.home, icon: Compass },
            { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
            { id: 'assessment', label: t.assessment, icon: Sliders },
            { id: 'careers', label: t.careers, icon: Briefcase },
            { id: 'skillGap', label: t.skillGap, icon: Target },
            { id: 'roadmap', label: t.roadmap, icon: BookOpen },
            { id: 'compare', label: t.compare, icon: Scale },
            { id: 'assistant', label: t.aiAssistant, icon: Bot },
            { id: 'profile', label: t.profile, icon: User },
            { id: 'support', label: 'Qo‘llab-quvvatlash', icon: BookOpen },
            { id: 'settings', label: t.settings, icon: SettingsIcon }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );

  const renderLandingPage = () => (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-24 pb-16 px-4 max-w-7xl mx-auto text-center">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-cyan-500/20 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-cyan-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Career Guidance Intelligence Engine v2.6</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          {t.tagline}
        </h1>

        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          {t.subtagline}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('assessment')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2 transition duration-200 group"
          >
            <span>{t.startAssessment}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => setActiveTab('careers')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-sm transition flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>{t.exploreCareers}</span>
          </button>
        </div>

        {/* Trust Badges & Numbers */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          {[
            { val: "94.8%", label: "Accuracy Rating", sub: "Algorithm satisfaction" },
            { val: "8+", label: "In-Depth Fields", sub: "Tech & Product tracks" },
            { val: "6-Month", label: "Structured Roadmaps", sub: "Milestone-driven" },
            { val: "100%", label: "Explainable Match", sub: "Multi-factor formula" }
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-2xl font-black text-white">{stat.val}</div>
              <div className="text-xs font-semibold text-cyan-400 mt-0.5">{stat.label}</div>
              <div className="text-[11px] text-slate-500">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold">{t.howItWorks}</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            3 bosqichda aniq karyera traektoriyasi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Sliders,
              title: t.step1Title,
              desc: t.step1Desc,
              stepNum: '01'
            },
            {
              icon: BrainCircuit,
              title: t.step2Title,
              desc: t.step2Desc,
              stepNum: '02'
            },
            {
              icon: Target,
              title: t.step3Title,
              desc: t.step3Desc,
              stepNum: '03'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 group hover:-translate-y-1"
              >
                <span className="absolute top-4 right-4 text-3xl font-black text-slate-800 group-hover:text-slate-700 transition">
                  {item.stepNum}
                </span>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400 mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Career Previews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Top High-Demand Paths</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Zamonaviy talabgir kasblar</p>
          </div>
          <button
            onClick={() => setActiveTab('careers')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>{t.exploreCareers}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAREER_DATABASE.slice(0, 4).map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setInspectedCareerId(c.id);
                setActiveTab('myCareer');
              }}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-indigo-400 tracking-wide uppercase">{c.category}</span>
                <h4 className="text-base font-bold text-white mt-1 group-hover:text-cyan-300 transition line-clamp-1">
                  {c.titleKey}
                </h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {c.descriptionKey}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{c.baseSalary}</span>
                <span className="text-emerald-400 font-semibold">{c.growthRate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs uppercase tracking-widest text-purple-400 font-bold">{t.testimonials}</h2>
          <p className="text-2xl font-extrabold text-white mt-1">Muvaffaqiyatli foydalanuvchilar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Madina Aliyeva",
              role: "Junior ML Engineer",
              company: "Remote (USA Client)",
              text: "CareerMind AI testi menga matematik bilimlarim yetarli, ammo MLOps bo'yicha kamchiligim borligini ko'rsatib berdi. 4 oy ichida yo'l xaritasidagi topshiriqlarni bajarib, birinchi chet el kontraktimni oldim."
            },
            {
              name: "Javohir Toshpulatov",
              role: "Full Stack Developer",
              company: "Fintech Startup",
              text: "Qaysi texnologiyani o'rganishni bilmay yurgan edim. Skill Gap tahlili orqali aynan kerakli kutubxonalarga vaqt ajratdim va vaqtimni tejedim."
            },
            {
              name: "Elena Voronova",
              role: "Product Designer",
              company: "SaaS Platform",
              text: "Система очень точно определила баланс креативности и логики. Персональный роадмап сэкономил месяцы хаотичного обучения на YouTube."
            }
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/70">
              <p className="text-xs text-slate-300 italic leading-relaxed">"{t.text}"</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <div className="text-[11px] text-cyan-400">{t.role}</div>
                </div>
                <span className="text-[10px] text-slate-500">{t.company}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">{t.faq}</h2>
          <p className="text-2xl font-extrabold text-white mt-1">Ko'p so'raladigan savollar</p>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "Test natijalari qanchalik aniq hisoblanadi?",
              a: "CareerMind AI test natijalari 6 xil asosiy parametrlar: bilim darajasi (30%), shaxsiy qiziqishlar (20%), psixologik portret (15%), karyera maqsadlari (15%), ish sharoiti (10%) va mavjud tajribaga (10%) asoslangan shaffof og'irlik formulasidan foydalanadi."
            },
            {
              q: "Tavsiya etilgan o'quv xaritasi (Roadmap) bepulmi?",
              a: "Ha, barcha o'quv yo'l xaritalari ochiq manbalar, rasmiy hujjatlar va tasdiqlangan bepul kurslar asosida tuzilgan."
            },
            {
              q: "Ma'lumotlarim qayerda saqlanadi?",
              a: "Barcha test natijalaringiz, saqlangan profillar va chat xabarlari brauzeringizning mahalliy xotirasida (LocalStorage) to'liq xavfsiz saqlanadi."
            }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-sm font-semibold text-white">{item.q}</div>
              <div className="text-xs text-slate-400 mt-2 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 pt-10 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-300">CareerMind AI Platform</span>
        </div>
        <p>{t.footerText}</p>
        <p className="mt-2 text-slate-600">© 2026 CareerMind AI. {t.allRightsReserved}</p>
      </footer>
    </div>
  );

  const [assessmentStep, setAssessmentStep] = useState(1);
  const [customInterestInput, setCustomInterestInput] = useState('');

  const renderAssessment = () => {
    const handleNext = () => {
      if (assessmentStep < 6) {
        setAssessmentStep(assessmentStep + 1);
      } else {
        // Finalize assessment
        let updatedBadges = [...profile.unlockedBadges];
        if (!updatedBadges.includes('first_assessment')) {
          updatedBadges.push('first_assessment');
        }
        setProfile(prev => ({
          ...prev,
          assessmentCompleted: true,
          xp: prev.xp + 100,
          unlockedBadges: updatedBadges
        }));
        setActiveTab('dashboard');
      }
    };

    const handleBack = () => {
      if (assessmentStep > 1) setAssessmentStep(assessmentStep - 1);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar & Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-cyan-400">
              {t.step} {assessmentStep} {t.of} 6
            </span>
            <span>{Math.round((assessmentStep / 6) * 100)}% yakunlandi</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(assessmentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {/* Step 1: Personal Info */}
          {assessmentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">1-Qadam: Shaxsiy va ta'lim ma'lumotlari</h3>
                <p className="text-xs text-slate-400 mt-1">Karyera boshlang'ich nuqtasini aniqlash uchun ushbu maydonlarni to'ldiring.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ism va familiya</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Ismingizni kiriting"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Yosh</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ta'lim darajasi</label>
                  <select
                    value={profile.educationLevel}
                    onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value as EducationLevel })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>Ta’lim darajasini tanlang</option>
                    <option value="high_school">Maktab / Kollej / Litsey</option>
                    <option value="bachelor">Bakalavr talabasi / Bitiruvchi</option>
                    <option value="master">Magistratura</option>
                    <option value="phd">PhD / Ilmiy daraja</option>
                    <option value="bootcamp_self">Mustaqil ta'lim / Bootcamp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Universitet / Ta'lim dargohi</label>
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Universitet nomi"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Yo'nalish / Mutaxassislik</label>
                  <input
                    type="text"
                    value={profile.fieldOfStudy}
                    onChange={(e) => setProfile({ ...profile, fieldOfStudy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Masalan: Axborot xavfsizligi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tajriba (yillar)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={profile.yearsOfExperience || ''}
                    onChange={(e) => setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills Rating (1-10) */}
          {assessmentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">2-Qadam: Ko'nikmalarni baholash (1-10)</h3>
                <p className="text-xs text-slate-400 mt-1">Har bir soha bo'yicha o'zingizning hozirgi amaliy bilimingizni 1 dan 10 gacha baholang.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(profile.skills).map(([key, value]) => (
                  <div key={key} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-slate-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-cyan-300 border border-indigo-500/40">
                        {value}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProfile({
                          ...profile,
                          skills: { ...profile.skills, [key]: val }
                        });
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Interests Multi-Select + Custom */}
          {assessmentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">3-Qadam: Qiziqishlar va sohalar</h3>
                <p className="text-xs text-slate-400 mt-1">Sizni eng ko'p jalb qiladigan texnologik va biznes yo'nalishlarni tanlang.</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  'Artificial Intelligence',
                  'Software Development',
                  'Cybersecurity',
                  'Data Science',
                  'Business',
                  'Finance',
                  'Marketing',
                  'UI/UX',
                  'Robotics',
                  'Research',
                  'Entrepreneurship',
                  'Gaming',
                  'Cloud Architecture'
                ].map((item) => {
                  const isSelected = profile.interests.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        const newInterests = isSelected
                          ? profile.interests.filter(i => i !== item)
                          : [...profile.interests, item];
                        setProfile({ ...profile, interests: newInterests });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Interest */}
              <div className="pt-4 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  placeholder={t.customInterestPlaceholder}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (customInterestInput.trim() && !profile.interests.includes(customInterestInput.trim())) {
                      setProfile({
                        ...profile,
                        interests: [...profile.interests, customInterestInput.trim()]
                      });
                      setCustomInterestInput('');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 transition"
                >
                  {t.add}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Personality (1-10) */}
          {assessmentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">4-Qadam: Shaxsiy xarakter xususiyatlari</h3>
                <p className="text-xs text-slate-400 mt-1">O'z xulq-atvoringiz va ishlash uslubingizni baholang.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(profile.personality).map(([key, value]) => (
                  <div key={key} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-slate-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/40">
                        {value}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setProfile({
                          ...profile,
                          personality: { ...profile.personality, [key]: val }
                        });
                      }}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Work Preferences */}
          {assessmentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">5-Qadam: Ish sharoiti va ustuvorliklar</h3>
                <p className="text-xs text-slate-400 mt-1">Sizga qulay bo'lgan ish formati va hayotiy balans talablari.</p>
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Ma'qul ish formati</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'remote', label: 'Masofaviy (Remote)', icon: Laptop },
                    { id: 'hybrid', label: 'Gibrid (Hybrid)', icon: Layers },
                    { id: 'office', label: 'Ofisda (On-site)', icon: BriefcaseBusiness }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSel = profile.preferences.workType === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, workType: item.id as WorkType }
                        })}
                        className={`p-4 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-2 ${
                          isSel
                            ? 'bg-indigo-600/20 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSel ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority sliders */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {[
                  { key: 'salaryImportance', label: "Maosh muhimligi" },
                  { key: 'workLifeBalance', label: "Ish va shaxsiy hayot balansi" },
                  { key: 'careerGrowth', label: "Karyerada o'sish tezligi" },
                  { key: 'jobStability', label: "Ish barqarorligi" },
                  { key: 'internationalOpportunities', label: "Xalqaro imkoniyatlar" }
                ].map((item) => {
                  const val = profile.preferences[item.key as keyof WorkPreferences] as number;
                  return (
                    <div key={item.key} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-cyan-400">{val}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={val}
                        onChange={(e) => {
                          const nVal = Number(e.target.value);
                          setProfile({
                            ...profile,
                            preferences: { ...profile.preferences, [item.key]: nVal }
                          });
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Career Goals */}
          {assessmentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">6-Qadam: Karyera maqsadi</h3>
                <p className="text-xs text-slate-400 mt-1">Kelgusi 3-5 yilda erishmoqchi bo'lgan asosiy strategik maqsadingiz.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'technical_expert',
                    title: "Chuqur texnik ekspert bo'lish",
                    desc: "Yirik arxitekturalar va eng murakkab texnologiyalar bo'yicha Staff/Principal darajasiga chiqish."
                  },
                  {
                    id: 'maximize_salary',
                    title: "Maksimal maosh va daromadga chiqish",
                    desc: "Bozorda eng yuqori to'lanadigan sohalarga e'tibor qaratib, kapital yig'ish."
                  },
                  {
                    id: 'start_company',
                    title: "O'z startapim yoki biznesimni boshlash",
                    desc: "Mahsulot yaratish, jamoa boshqarish va mustaqil texnologik biznes qurish."
                  },
                  {
                    id: 'international_remote',
                    title: "Xalqaro kompaniyalarda masofaviy ishlash",
                    desc: "AQSh yoki Yevropa kompaniyalariga O'zbekistondan turib masofaviy xizmat ko'rsatish."
                  }
                ].map((item) => {
                  const isSel = profile.careerGoal === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setProfile({ ...profile, careerGoal: item.id as CareerGoal })}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3.5 ${
                        isSel
                          ? 'bg-indigo-600/20 border-cyan-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSel ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                      }`}>
                        {isSel && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{item.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {assessmentStep === 6 && <ObjectiveAssessment session={session} />}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={assessmentStep === 1}
              className={`px-5 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                assessmentStep === 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.prev}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:opacity-95 flex items-center space-x-2 transition"
            >
              <span>{assessmentStep === 6 ? t.finishAssessment : t.next}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const activeCareer = selectedCareer;
    const completedTasksCount = Object.values(profile.completedTasks).filter(Boolean).length;
    const totalRoadmapTasks = activeCareer.roadmapMonths.reduce((acc, m) => acc + m.tasks.length, 0);
    const progressPercent = totalRoadmapTasks > 0 ? Math.round((completedTasksCount / totalRoadmapTasks) * 100) : 0;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-900/40 overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Karyera holati tahlil qilindi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.welcome}, {profile.name || 'Foydalanuvchi'} 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Sizning eng yuqori moslikdagi yo'nalishingiz: <span className="font-bold text-cyan-300">{bestMatch.career.titleKey}</span>. 
                O'quv rejasida qolgan vazifalarni bajarishda davom eting!
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-center px-2">
                <div className="text-2xl font-black text-cyan-400">{bestMatch.matchScore}%</div>
                <div className="text-[11px] text-slate-400 font-semibold">{t.matchScore}</div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-2xl font-black text-purple-400">Lv.{calculateLevel(profile.xp)}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{profile.xp} XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Career Matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>Eng mos keladigan 3 ta kasb</span>
            </h3>
            <button
              onClick={() => setActiveTab('careers')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Hammasini ko'rish →
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {careerScores.slice(0, 3).map((item, idx) => {
              const isSelected = profile.selectedCareerId === item.career.id;
              return (
                <div
                  key={item.career.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-400/80 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                      Tanlangan yo'nalish
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        Rank #{idx + 1}
                      </span>
                      <span className="text-sm font-black text-cyan-300">{item.matchScore}% moslik</span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-1.5">{item.career.titleKey}</h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.career.descriptionKey}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Maosh:</span>
                        <span className="font-semibold">{item.career.baseSalary}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Talab:</span>
                        <span className="font-semibold text-emerald-400">{item.career.demand}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => {
                        setInspectedCareerId(item.career.id);
                        setActiveTab('myCareer');
                      }}
                      className="flex-1 py-2 text-center rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                    >
                      Batafsil
                    </button>
                    {!isSelected && (
                      <button
                        onClick={() => {
                          setProfile(prev => ({ ...prev, selectedCareerId: item.career.id }));
                        }}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
                      >
                        Tanlash
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap Progress & Daily Focus */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Roadmap Progress */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Aktiv Yo'l Xaritasi: {activeCareer.titleKey}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Vazifalarni bajarib, tajribangizni oshiring.</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400">{progressPercent}%</span>
                <span className="text-[10px] text-slate-500 block">bajarildi</span>
              </div>
            </div>

            {/* Overall Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Immediate Next Tasks */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Navbatdagi amaliy vazifalar:</h5>
              {activeCareer.roadmapMonths[0].tasks.map((task) => {
                const isDone = !!profile.completedTasks[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isDone
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                      <div>
                        <span className={`text-xs font-semibold ${isDone ? 'line-through' : ''}`}>
                          {task.name}
                        </span>
                        <span className="block text-[10px] text-cyan-500">{task.resource}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400/90">+50 XP</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('roadmap')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-cyan-300 transition"
            >
              To'liq 6 oylik rejani ko'rish →
            </button>
          </div>

          {/* Gamification & Badges */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{t.achievements}</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'first_assessment', title: 'Birinchi test', desc: "Testni yakunladi", icon: Sparkles },
                  { id: 'streak_starter', title: 'Faol foydalanuvchi', desc: "Doimiy tashrif", icon: Flame },
                  { id: 'task_master', title: 'Vazifalar ustasi', desc: "5+ vazifa bajarildi", icon: CheckCircle2 },
                  { id: 'ai_explorer', title: 'AI Karyerachi', desc: "Suhbatdan o'tdi", icon: Bot }
                ].map((badge) => {
                  const Icon = badge.icon;
                  const isUnlocked = profile.unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center ${
                        isUnlocked
                          ? 'bg-slate-950 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-600 opacity-60'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1.5" />
                      <div className="text-[11px] font-bold leading-tight">{badge.title}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{badge.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Keyingi darajagacha:</span>
                <span className="text-cyan-400 font-bold">{200 - (profile.xp % 200)} XP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${(profile.xp % 200) / 2}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const renderCareerDirectory = () => {
    const categories = ['All', 'AI & Machine Learning', 'Data Science', 'Software Development', 'Cybersecurity', 'Design', 'Business', 'Robotics'];

    const filtered = CAREER_DATABASE.filter(c => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchSearch = c.titleKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.descriptionKey.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.careers}</h2>
          <p className="text-xs text-slate-400 mt-1">Bozorda yuqori talabga ega bo'lgan zamonaviy yo'nalishlar katalogi.</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? t.allCategories : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Career Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((career) => {
            const scoreObj = careerScores.find(cs => cs.career.id === career.id);
            const score = scoreObj ? scoreObj.matchScore : 75;

            return (
              <div
                key={career.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                      {career.category}
                    </span>
                    <span className="text-xs font-black text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {score}% {t.matchScore}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-2 group-hover:text-cyan-300 transition">
                    {career.titleKey}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {career.descriptionKey}
                  </p>

                  <div className="mt-5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{t.salaryRange}:</span>
                      <span className="font-semibold text-white">{career.baseSalary}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{t.remotePotential}:</span>
                      <span className="font-semibold text-cyan-400">{career.remoteScore}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{t.growthForecast}:</span>
                      <span className="font-semibold text-emerald-400">{career.growthRate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => {
                      setInspectedCareerId(career.id);
                      setActiveTab('myCareer');
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition text-center"
                  >
                    Batafsil ko'rish
                  </button>
                  <button
                    onClick={() => {
                      setProfile(prev => ({ ...prev, selectedCareerId: career.id }));
                      setInspectedCareerId(career.id);
                      setActiveTab('roadmap');
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
                    title={t.startThisRoadmap}
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCareerDetails = () => {
    const career = inspectedCareer;
    const scoreObj = careerScores.find(cs => cs.career.id === career.id);
    const score = scoreObj ? scoreObj.matchScore : 80;
    const isCurrentActive = profile.selectedCareerId === career.id;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 relative backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{career.category}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">{career.titleKey}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {career.descriptionKey}
              </p>
            </div>

            <div className="flex flex-col items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 min-w-[130px]">
              <span className="text-3xl font-black text-cyan-400">{score}%</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{t.matchScore}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block">{t.salaryRange}</span>
              <span className="font-bold text-white mt-0.5 block">{career.baseSalary}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.demandLevel}</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{career.demand}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.remotePotential}</span>
              <span className="font-bold text-cyan-400 mt-0.5 block">{career.remoteScore}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.growthForecast}</span>
              <span className="font-bold text-purple-400 mt-0.5 block">{career.growthRate}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setProfile(prev => ({ ...prev, selectedCareerId: career.id }));
                setActiveTab('roadmap');
              }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center space-x-2 ${
                isCurrentActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isCurrentActive ? t.alreadyActiveRoadmap : t.startThisRoadmap}</span>
            </button>

            <button
              onClick={() => setActiveTab('skillGap')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Ko'nikmalar farqini ko'rish
            </button>
          </div>
        </div>

        {/* Advantages & Challenges */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Afzalliklari</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {career.advantagesKeys.map((adv, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Qiyinchiliklari va talablari</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {career.challengesKeys.map((ch, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{ch}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Typical Roles in Industry */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3">Sohadagi xos rollar va lavozimlar:</h4>
          <div className="flex flex-wrap gap-2">
            {career.typicalRoles.map((role, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-semibold"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSkillGap = () => {
    const career = selectedCareer;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.skillGapTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{t.skillGapDesc} (Yo'nalish: <span className="text-cyan-400 font-bold">{career.titleKey}</span>)</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="grid gap-5">
            {Object.entries(career.requiredSkills).map(([skillKey, requiredVal]) => {
              const userVal = profile.skills[skillKey as keyof SkillRatings] || 1;
              const delta = userVal - (requiredVal || 5);
              const isMedium = delta === -1 || delta === -2;
              const isWeak = delta < -2;

              let statusLabel = t.strong;
              let statusColor = "text-emerald-400 bg-emerald-950/60 border-emerald-800/40";
              if (isMedium) {
                statusLabel = t.medium;
                statusColor = "text-amber-400 bg-amber-950/60 border-amber-800/40";
              } else if (isWeak) {
                statusLabel = t.weak;
                statusColor = "text-rose-400 bg-rose-950/60 border-rose-800/40";
              }

              return (
                <div key={skillKey} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-sm font-bold text-white capitalize">
                        {skillKey.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        (Siz: {userVal}/10 vs Talab: {requiredVal}/10)
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Visual Dual Progress Bars */}
                  <div className="space-y-1.5 text-[10px]">
                    {/* User bar */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>{t.userCurrent}</span>
                        <span>{userVal * 10}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${userVal * 10}%` }}
                        />
                      </div>
                    </div>

                    {/* Benchmark bar */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>{t.requiredLevel}</span>
                        <span>{(requiredVal || 5) * 10}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(requiredVal || 5) * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation action */}
                  {isWeak && (
                    <div className="mt-3 pt-2 text-[11px] text-rose-300 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Tavsiya: Ushbu soha bo'yicha amaliy topshiriqlarni yo'l xaritasida 1-o'ringa qo'ying.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRoadmap = () => {
    const career = selectedCareer;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">{t.roadmapTitle}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Tanlangan yo'nalish: <span className="text-cyan-400 font-bold">{career.titleKey}</span>
            </p>
          </div>

          <button
            onClick={() => setActiveTab('careers')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 self-start sm:self-auto"
          >
            Boshqa kasb rejasini ko'rish →
          </button>
        </div>

        {/* 6-Month Timeline Cards */}
        <div className="space-y-6">
          {career.roadmapMonths.map((month) => {
            const completedCount = month.tasks.filter(tk => !!profile.completedTasks[tk.id]).length;
            const isAllCompleted = completedCount === month.tasks.length && month.tasks.length > 0;

            return (
              <div
                key={month.month}
                className={`p-6 rounded-2xl border transition-all ${
                  isAllCompleted
                    ? 'bg-slate-900/40 border-emerald-500/40'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-black text-cyan-300">
                      M{month.month}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{month.title}</h4>
                      <p className="text-xs text-slate-400">{month.focus}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">
                    {completedCount} / {month.tasks.length} vazifa bajarildi
                  </span>
                </div>

                {/* Tasks List */}
                <div className="mt-4 space-y-2.5">
                  {month.tasks.map((task) => {
                    const done = !!profile.completedTasks[task.id];
                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                          done
                            ? 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <div>
                            <span className={`text-xs font-semibold ${done ? 'line-through' : ''}`}>
                              {task.name}
                            </span>
                            <span className="block text-[10px] text-cyan-400 mt-0.5">
                              Tavsiya etilgan manba: {task.resource}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-amber-400/90 ml-2 whitespace-nowrap">
                          {done ? 'Bajarildi' : '+50 XP'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAiAssistant = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl h-[650px] flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>CareerMind AI Maslahatchi</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <span className="text-[10px] text-slate-400">
                  {profile.name} profili & {selectedCareer.titleKey} asosida sozlangan
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([
                  {
                    id: 'msg-init',
                    sender: 'ai',
                    text: "Suhbat tozalandi. Karyerangiz bo'yicha yana qanday savollaringiz bor?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
              title="Chatni tozalash"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span className="block text-[9px] text-slate-400 text-right mt-1.5">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Quick replies underneath AI message if any */}
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[85%]">
                    {msg.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qr)}
                        className="px-2.5 py-1 rounded-full bg-slate-950 border border-indigo-500/40 text-[11px] text-cyan-300 hover:bg-indigo-900/40 transition text-left"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-3 rounded-2xl w-24">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/70">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderCareerComparison = () => {
    const selectedCareers = CAREER_DATABASE.filter(c => compareCareerIds.includes(c.id));

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.compareTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{t.compareSubtitle}</p>
        </div>

        {/* Selection Checkboxes */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <label className="block text-xs font-bold text-slate-300 mb-2">{t.selectCareersToCompare}</label>
          <div className="flex flex-wrap gap-2">
            {CAREER_DATABASE.map(c => {
              const isChecked = compareCareerIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    if (isChecked && compareCareerIds.length > 2) {
                      setCompareCareerIds(compareCareerIds.filter(id => id !== c.id));
                    } else if (!isChecked && compareCareerIds.length < 3) {
                      setCompareCareerIds([...compareCareerIds, c.id]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {c.titleKey.split('/')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                <th className="p-4 text-slate-400 font-semibold">{t.metric}</th>
                {selectedCareers.map(c => (
                  <th key={c.id} className="p-4 text-white font-bold text-sm">
                    {c.titleKey}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-4 text-slate-400 font-medium">Moslik ko'rsatkichi</td>
                {selectedCareers.map(c => {
                  const s = careerScores.find(item => item.career.id === c.id)?.matchScore || 70;
                  return (
                    <td key={c.id} className="p-4 font-black text-cyan-400 text-sm">
                      {s}%
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-4 text-slate-400 font-medium">{t.salaryRange}</td>
                {selectedCareers.map(c => (
                  <td key={c.id} className="p-4 font-semibold text-white">
                    {c.baseSalary}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-slate-400 font-medium">{t.demandLevel}</td>
                {selectedCareers.map(c => (
                  <td key={c.id} className="p-4 font-semibold text-emerald-400">
                    {c.demand}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-slate-400 font-medium">{t.remotePotential}</td>
                {selectedCareers.map(c => (
                  <td key={c.id} className="p-4 font-semibold text-cyan-400">
                    {c.remoteScore}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-slate-400 font-medium">{t.difficulty}</td>
                {selectedCareers.map(c => (
                  <td key={c.id} className="p-4 font-semibold text-purple-400">
                    {c.difficulty}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-slate-400 font-medium">{t.growthForecast}</td>
                {selectedCareers.map(c => (
                  <td key={c.id} className="p-4 font-semibold text-slate-200">
                    {c.growthRate}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.profile}</h2>
          <p className="text-xs text-slate-400 mt-1">Shaxsiy diagnostika ma'lumotlaringizni tahrirlash.</p>
        </div>

        <AccountPanel session={session} onSession={setSession} onSaveProfile={saveProfileToCloud} onLoadProfile={loadProfileFromCloud} />
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ism</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ta'lim muassasasi</label>
              <input
                type="text"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tanlangan qiziqishlar</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.interests.map(i => (
                <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-semibold">{t.profileUpdated}</span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
            >
              Boshqaruv paneliga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.settingsTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">Tizim parametrlari va ma'lumotlar boshqaruvi.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          {/* Language Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">{t.languageSelect}</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'uz', label: "🇺🇿 O'zbek tili" },
                { id: 'ru', label: "🇷🇺 Русский язык" },
                { id: 'en', label: "🇬🇧 English" }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setLang(item.id as Language)}
                  className={`p-3 rounded-xl border text-xs font-bold transition ${
                    lang === item.id
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Assessment */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">{t.resetAssessment}</div>
              <div className="text-xs text-slate-400">Yangi ma'lumotlar bilan qayta test topshirish.</div>
            </div>
            <button
              onClick={() => {
                setAssessmentStep(1);
                setActiveTab('assessment');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
            >
              Testni boshlash
            </button>
          </div>

          {/* Clear Storage */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-rose-400">{t.clearData}</div>
              <div className="text-xs text-slate-400">Barcha saqlangan progress va xabarlarni tozalash.</div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('careermind_profile_' + localDataOwner);
                localStorage.removeItem('careermind_chat_' + localDataOwner);
                setProfile(INITIAL_PROFILE);
                setActiveTab('home');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold transition"
            >
              O'chirish
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
      <div>
        {renderNavbar()}

        {!authReady || localDataOwner !== (session?.user.id ?? 'guest') ? (
          <main className="max-w-4xl mx-auto p-10 text-slate-300" role="status">
            Hisob ma’lumotlari ajratilmoqda…
          </main>
        ) : <main className="transition-all duration-300">
          {activeTab === 'home' && renderLandingPage()}
          {activeTab === 'assessment' && <><div className="max-w-4xl mx-auto px-4 pt-6"><button onClick={() => setActiveTab('assessmentV3')} className="bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl px-5 py-3 font-bold">Yangi: Assessment 3.0 — 30 savolni boshlash</button></div>{renderAssessment()}</>}
          {activeTab === 'assessmentV3' && <><div className="max-w-4xl mx-auto px-4 pt-6"><button onClick={() => setActiveTab('adaptiveAssessment')} className="bg-purple-700 hover:bg-purple-600 text-white rounded-xl px-5 py-3 font-bold">Adaptive Assessment 3.1 ni boshlash</button></div><AssessmentV3 session={session} /></>}
          {activeTab === 'adaptiveAssessment' && <AdaptiveAssessment session={session} />}
          {activeTab === 'dashboard' && <><div className="max-w-6xl mx-auto px-4 pt-6"><button onClick={() => setActiveTab('dashboardV2')} className="px-5 py-3 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-white font-bold">Dashboard 2.0 ni ochish</button></div>{renderDashboard()}</>}
          {activeTab === 'dashboardV2' && <DashboardV2 session={session} onGo={setActiveTab} />}
          {activeTab === 'careers' && <><div className="max-w-5xl mx-auto px-4 pt-6"><button onClick={() => setActiveTab('careerMatchingV3')} className="bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl px-5 py-3 font-bold">Career Matching 3.0 — aqlli tavsiyalar</button></div>{renderCareerDirectory()}</>}
          {activeTab === 'careerMatchingV3' && <CareerMatchingV3 session={session} profile={{interests:profile.interests,skills:{...profile.skills}}} careers={CAREER_DATABASE.map(c=>({id:c.id,title:c.titleKey,category:c.category,description:c.descriptionKey,requiredSkills:c.requiredSkills as Record<string,number>,associatedInterests:c.associatedInterests}))} onChoose={(id)=>{setProfile(p=>({...p,selectedCareerId:id}));setActiveTab('smartRoadmap');}} />}
          {activeTab === 'myCareer' && renderCareerDetails()}
          {activeTab === 'skillGap' && renderSkillGap()}
          {activeTab === 'roadmap' && <><div className="max-w-5xl mx-auto px-4 pt-6"><button onClick={() => setActiveTab('smartRoadmap')} className="px-5 py-3 rounded-xl bg-cyan-700 font-bold text-white">Smart Roadmap 2.0 ni ochish</button></div>{renderRoadmap()}</>}
          {activeTab === 'smartRoadmap' && <SmartRoadmap session={session} career={selectedCareer.titleKey} />}
          {activeTab === 'compare' && renderCareerComparison()}
          {activeTab === 'assistant' && renderAiAssistant()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'support' && <SupportPage session={session} onGoProfile={() => setActiveTab('profile')} />}
        </main>}
      </div>
    </div>
  );
}