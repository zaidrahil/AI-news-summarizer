import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Settings, 
  Newspaper,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  AlertCircle,
  Languages,
  Zap,
  Globe,
  Sparkles,
  LayoutDashboard,
  Layers,
  ExternalLink,
  Moon,
  Sun,
  Search,
  ChevronDown,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Article, SummaryResult, LANGUAGE_OPTIONS, LanguageKey } from './types';
import { summarizeArticles, translateText } from './lib/gemini';
import axios from 'axios';
import { 
  NewsCard, 
  SkeletonLoader, 
  InteractiveCard, 
  Headline,
  TypingHeadline,
  ImageSection,
  AuthorInfo,
  KeyPoints
} from './components/PremiumUI';

// --- Components ---

const Logo = ({ size = 'md', className, onClick }: { size?: 'sm' | 'md' | 'lg', className?: string, onClick?: () => void }) => {
  const iconSizes = { sm: 'w-8 h-8', md: 'w-11 h-11', lg: 'w-16 h-16' };
  
  return (
    <div onClick={onClick} className={cn("flex items-center gap-4 group cursor-pointer", className)}>
      <div className={cn(
        iconSizes[size],
        "relative flex items-center justify-center shrink-0"
      )}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 hover:from-indigo-500/30 to-purple-500/10 border border-white/10 rounded-2xl backdrop-blur-md group-hover:scale-105 group-hover:border-white/20 transition-all duration-700 shadow-lg overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-10" />
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="relative w-1/2 h-1/2 flex items-center justify-center">
             <motion.div 
               animate={{ height: ['40%', '100%', '40%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
               className="w-[3px] bg-white rounded-full mx-[2px] shadow-[0_0_8px_rgba(255,255,255,0.3)]"
             />
             <motion.div 
               animate={{ height: ['100%', '40%', '100%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
               className="w-[3px] bg-gradient-to-t from-indigo-400 to-purple-400 rounded-full mx-[2px] shadow-[0_0_8px_rgba(124,58,237,0.3)]"
             />
             <motion.div 
               animate={{ height: ['40%', '100%', '40%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
               className="w-[3px] bg-white rounded-full mx-[2px] shadow-[0_0_8px_rgba(255,255,255,0.3)]"
             />
          </div>
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-2">
          <span className={cn("font-display font-black tracking-tighter text-white", size === 'lg' ? 'text-5xl' : 'text-2xl')}>AI</span>
          <div className="flex flex-col">
            <span className={cn("font-medium tracking-tight text-zinc-300", size === 'lg' ? 'text-xl' : 'text-sm')}>News</span>
            <span className={cn("font-black tracking-[0.2em] text-indigo-400 uppercase", size === 'lg' ? 'text-sm' : 'text-[9px]')}>Summarizer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeSection = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const headlines = [
    "AI Synthesizer reaches 99% accuracy in linguistic compression",
    "Global news nodes expanding to 50+ languages",
    "Neural intelligence mapping real-time world events",
    "Deep-learning summaries optimized for professional decision makers",
    "Breaking: Global market trends analyzed in 4.2 seconds"
  ];

  return (
    <div className="relative h-full flex flex-col items-center justify-center p-8 lg:p-24 text-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 space-y-12 flex flex-col items-center"
      >
        <div className="relative inline-block">
          <Logo size="lg" className="mb-0" />
        </div>

        <div className="space-y-8 max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white leading-[0.9] text-balance">
            AI News <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400">Summarizer.</span>
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl font-medium leading-relaxed max-w-xl mx-auto">
            The definitive terminal for global intelligence. Synthesize complex news into crisp, multi-lingual summaries.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <button
            onClick={onGetStarted}
            className="group relative px-14 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[35deg]" />
            <span>Click to Enter</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative Digital elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

const LandingPage = ({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) => {
  const [stage, setStage] = useState<'welcome' | 'auth'>('welcome');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  
  return (
    <div className="min-h-screen relative bg-[#030712] overflow-hidden flex items-center justify-center">
      {/* Global Background Particles/Mesh */}
      <div className="bg-mesh pointer-events-none" />

      <AnimatePresence mode="wait">
        {stage === 'welcome' ? (
          <motion.div 
            key="welcome-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full"
          >
            <WelcomeSection onGetStarted={() => setStage('auth')} />
          </motion.div>
        ) : (
          <motion.div
            key="auth-stage"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            className="w-full max-w-md p-8 relative z-10"
          >
            <AnimatePresence mode="wait">
              {authView === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass p-10 lg:p-14 rounded-[3rem] space-y-10 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 glow-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="text-center space-y-3 relative z-10">
                    <h2 className="text-4xl font-display font-black text-white tracking-tighter">Login</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Authorized Access Only</p>
                  </div>
                  
                  <div className="relative z-10">
                    <LoginForm 
                      onLoginSuccess={onAuthSuccess} 
                      onGoToSignup={() => setAuthView('signup')} 
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass p-10 lg:p-14 rounded-[3rem] space-y-10 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 glow-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  
                  <div className="text-center space-y-3 relative z-10">
                    <h2 className="text-4xl font-display font-black text-white tracking-tighter">Register</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Create Your Account</p>
                  </div>

                  <div className="relative z-10">
                    <SignupForm 
                      onSignupSuccess={onAuthSuccess} 
                      onGoToLogin={() => setAuthView('login')} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoginForm = ({ onLoginSuccess, onGoToSignup }: { onLoginSuccess: (user: any) => void, onGoToSignup: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/login', { email, password });
      onLoginSuccess(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || "Connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-medium text-zinc-500 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors z-10" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all placeholder:text-zinc-700 relative z-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-medium text-zinc-500 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors z-10" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all placeholder:text-zinc-700 relative z-10"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <div className="space-y-6 pt-4">
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group border border-white/10"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Login</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>

        <button 
          type="button"
          onClick={onGoToSignup}
          className="w-full py-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] transition-all"
        >
          Create a New Account
        </button>
      </div>
    </form>
  );
};

const SignupForm = ({ onSignupSuccess, onGoToLogin }: { onSignupSuccess: (user: any) => void, onGoToLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/register', { username, email, password });
      onSignupSuccess(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-medium text-zinc-500 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            Name
          </label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors z-10" />
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Agent_M"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all placeholder:text-zinc-700 relative z-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-medium text-zinc-500 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors z-10" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="id@nexus.ai"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all placeholder:text-zinc-700 relative z-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-medium text-zinc-500 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors z-10" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all placeholder:text-zinc-700 relative z-10"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      <div className="space-y-6 pt-4">
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group border border-white/10"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign Up</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>

        <button 
          type="button"
          onClick={onGoToLogin}
          className="w-full py-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] transition-all"
        >
          Go to Login
        </button>
      </div>
    </form>
  );
};

const Card = ({ children, className, onClick, ...props }: any) => (
  <div 
    onClick={onClick}
    className={cn("bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl", className)}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'positive' | 'negative' | 'neutral' | 'topic' }) => {
  const styles = {
    positive: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    negative: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    neutral: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    topic: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
  };
  
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", styles[variant])}>
      {children}
    </span>
  );
};

const SummarizePage = ({ onSummarize }: { onSummarize: (result: SummaryResult) => void }) => {
  const [urls, setUrls] = useState<string[]>(['']);
  const [selectedLangs, setSelectedLangs] = useState<LanguageKey[]>(['English (en)']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUrl = () => setUrls([...urls, '']);
  const removeUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const updateUrl = (index: number, val: string) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setUrls(newUrls);
  };

  const toggleLang = (lang: LanguageKey) => {
    if (selectedLangs.includes(lang)) {
      if (selectedLangs.length > 1) setSelectedLangs(selectedLangs.filter(l => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const handleSummarize = async () => {
    const validUrls = urls.filter(u => u.trim() !== '');
    if (validUrls.length === 0) {
      setError("Please enter at least one URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allUrlsToFetch: string[] = [];
      urls.filter(u => u.trim() !== '').forEach(rawUrl => {
        const matches = rawUrl.match(/https?:\/\/[^\s]+/g);
        if (matches) {
          matches.forEach(m => {
            const indices = [...m.matchAll(/https?:\/\//g)].map(match => match.index);
            if (indices.length > 1) {
              for (let i = 0; i < indices.length; i++) {
                const start = indices[i];
                const end = indices[i + 1];
                allUrlsToFetch.push(m.substring(start!, end).trim());
              }
            } else {
              allUrlsToFetch.push(m.trim());
            }
          });
        }
      });

      if (allUrlsToFetch.length === 0) {
        throw new Error("Please enter at least one valid URL starting with http:// or https://");
      }

      const fetchTasks = allUrlsToFetch.map(async (url) => {
        try {
          const res = await axios.post('/api/extract', { url });
          return { success: true, data: { ...res.data, url } };
        } catch (e: any) {
          const msg = e.response?.data?.error || e.message;
          return { success: false, url, error: msg };
        }
      });

      const fetchResults = await Promise.all(fetchTasks);
      const extractedArticles = fetchResults.filter(r => r.success).map(r => (r as any).data);
      const failures = fetchResults.filter(r => !r.success);

      if (extractedArticles.length === 0) {
        throw new Error(`Failed to extract any articles.\n\n${failures.map(f => `${(f as any).error} (source: ${(f as any).url})`).join('\n')}`);
      }

      // If some failed, maybe we should warn the user but proceed?
      if (failures.length > 0) {
        console.warn("Some articles failed to load", failures);
        // We could set a warning state here if we wanted to show it in the UI
      }

      const targetLangs = selectedLangs.map(l => LANGUAGE_OPTIONS[l]);
      const result = await summarizeArticles(extractedArticles, targetLangs);

      if (!result || typeof result !== 'object') {
        throw new Error("Invalid response format from AI service.");
      }

      const individualReportsRaw = result.individual_reports || {};
      const individualReports: Record<number, Record<string, { headline: string; summary: string; highlights: string[] }>> = {};
      
      // Supported internal names for normalization
      const supportedLangs = ['English', 'Hindi', 'Telugu', 'Urdu', ...INDIAN_LANGUAGES];
      const normalize = (l: string) => {
        const found = supportedLangs.find(s => l.toLowerCase().includes(s.toLowerCase()));
        return found || l;
      };

      // Normalize all reports to ensure keys match our UI buttons
      Object.entries(individualReportsRaw).forEach(([idx, report]: [string, any]) => {
        const index = parseInt(idx);
        individualReports[index] = {};
        Object.entries(report).forEach(([lang, data]: [string, any]) => {
          const normLang = normalize(lang);
          individualReports[index][normLang] = data;
        });
      });

      const firstReport = individualReports[0] || {};
      
      const summaries: Record<string, string> = {};
      const translatedHeadlines: Record<string, string> = {};
      const translatedHighlights: Record<string, string[]> = {};
      
      Object.entries(firstReport).forEach(([lang, data]: [string, any]) => {
        summaries[lang] = data.summary || "";
        translatedHeadlines[lang] = data.headline || "";
        translatedHighlights[lang] = data.highlights || [];
      });

      const summaryResult: SummaryResult = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        articles: extractedArticles.map(a => ({ 
          url: a.url, title: a.title, content: a.content, source: a.source,
          image: a.image, author: a.author, publishedDate: a.publishedDate
        })),
        summaries,
        translatedHeadlines,
        translatedHighlights,
        individualReports,
        pivotSummary: firstReport["English"]?.summary,
        topics: result.topics || [],
        sentiment: result.sentiment || 'Neutral',
        highlights: firstReport["English"]?.highlights || []
      };

      onSummarize(summaryResult);
    } catch (err: any) {
      console.error("handleSummarize error:", err);
      setError(err.message || "An error occurred during summarization");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
        <div className="text-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl mx-auto absolute inset-0 -z-10"
          />
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <h2 className="text-3xl font-display font-bold text-white">Synthesizing Information...</h2>
          <p className="text-zinc-500 max-w-sm mx-auto font-medium">Reading articles and preparing a multi-language report.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="space-y-4 text-center md:text-left">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2"
        >
          <Sparkles className="w-3 h-3" />
          Advanced AI Analysis
        </motion.div>
        <TypingHeadline text="News, Redefined." />
        <p className="text-zinc-500 text-xl max-w-xl font-medium leading-relaxed">Summarize multiple sources into one cohesive report. Fast, intelligent, and beautifully presented.</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          {urls.map((url, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-12 pr-12 py-5 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-bold"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {urls.length > 1 && (
                  <button onClick={() => removeUrl(i)} className="text-zinc-500 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-500/10">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          <button 
            onClick={addUrl} 
            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/10 hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Article Link
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Languages className="w-3 h-3" />
            Target Reporting Languages
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LANGUAGE_OPTIONS) as LanguageKey[]).map(lang => (
              <button
                key={lang}
                onClick={() => toggleLang(lang)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                  selectedLangs.includes(lang) 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/40 translate-y-[-1px]" 
                    : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <button 
          onClick={handleSummarize}
          className="w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Report"}
          {!isLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};

const INDIAN_LANGUAGES = [
  "Assamese", "Bengali", "Bodo", "Dogri", "Gujarati", "Kannada", "Kashmiri", 
  "Konkani", "Maithili", "Malayalam", "Marathi", "Meitei (Manipuri)", "Nepali", 
  "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi", "Tamil"
].sort();

const ResultsPage = ({ result, onTranslate }: { result: SummaryResult | null, onTranslate: (id: string, lang: string, translation: { headline: string, summary: string, highlights: string[] }, reportIndex?: number) => void }) => {
  const [activeLang, setActiveLang] = useState<string>(() => {
    if (result && result.summaries) {
      const keys = Object.keys(result.summaries);
      if (keys.includes('English')) return 'English';
      if (keys.length > 0) return keys[0];
    }
    return 'English';
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeReportIndex, setActiveReportIndex] = useState(0);
  const [isMoreLangsOpen, setIsMoreLangsOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreLangsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (result) {
      const currentSummaries = activeReportIndex === -1 
        ? (result.summaries || {})
        : (result.individualReports?.[activeReportIndex] ? Object.fromEntries(
            Object.entries(result.individualReports[activeReportIndex]).map(([l, d]) => [l, d.summary])
          ) : {});

      if (Object.keys(currentSummaries).length > 0) {
        if (!activeLang || !currentSummaries[activeLang]) {
          if (currentSummaries['English']) {
            setActiveLang('English');
          } else {
            setActiveLang(Object.keys(currentSummaries)[0]);
          }
        }
      }
    }
  }, [result, activeLang, activeReportIndex]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-600 space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center animate-pulse">
          <Layers className="w-12 h-12 opacity-20" />
        </div>
        <div className="text-center px-6">
          <h3 className="text-xl font-bold text-zinc-400">Analysis Pending</h3>
          <p className="text-zinc-600 font-medium">Please generate a summary to view results.</p>
        </div>
      </div>
    );
  }

  const summaries = activeReportIndex === -1 
    ? (result.summaries || {})
    : (result.individualReports?.[activeReportIndex] ? Object.fromEntries(
        Object.entries(result.individualReports[activeReportIndex]).map(([l, d]) => [l, d.summary])
      ) : {});

  const handleLangSwitch = async (lang: string) => {
    if (summaries[lang]) {
      setActiveLang(lang);
      return;
    }

    // On-the-fly translation requested
    setIsTranslating(true);
    try {
      let sourceSummary = '';
      let sourceHeadline = '';

      if (activeReportIndex === -1) {
        sourceSummary = result.pivotSummary || result.summaries['English'] || Object.values(result.summaries)[0];
        sourceHeadline = result.articles[0]?.title || "News Summary";
      } else {
        const report = result.individualReports?.[activeReportIndex];
        const EnglishReport = report?.['English'] || report?.['English (en)'] || Object.values(report || {})[0];
        sourceSummary = EnglishReport?.summary || result.articles[activeReportIndex].content.substring(0, 500);
        sourceHeadline = EnglishReport?.headline || result.articles[activeReportIndex].title;
      }

      const translation = await translateText(sourceSummary, lang, sourceHeadline);
      onTranslate(result.id, lang, translation, activeReportIndex);
      setActiveLang(lang);
    } catch (err) {
      console.error("Translation failed:", err);
      alert("Failed to translate summary. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 sm:py-24 px-4 space-y-16 sm:space-y-28 relative">
      {/* Immersive Atmospheric Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex flex-col gap-14 sm:gap-20">
        <div className="space-y-10 text-center md:text-left relative">
          <div className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.2 }
                }
              }}
              className="flex flex-col gap-1 md:gap-4"
            >
              <h1 className="flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8">
                <motion.span 
                  variants={{ hidden: { opacity: 0, y: 40, rotateX: 45 }, visible: { opacity: 1, y: 0, rotateX: 0 } }}
                  className="text-7xl sm:text-[10rem] font-display font-black text-white tracking-tighter leading-[0.85] drop-shadow-2xl"
                >
                  News
                </motion.span>
                <motion.span 
                  variants={{ hidden: { opacity: 0, y: 40, rotateX: 45 }, visible: { opacity: 1, y: 0, rotateX: 0 } }}
                  className="text-7xl sm:text-[10rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-600 via-zinc-800 to-zinc-950 tracking-tighter leading-[0.85] select-none"
                >
                  Brief
                </motion.span>
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center md:justify-start gap-5"
            >
              <div className="h-[2px] w-16 bg-gradient-to-r from-indigo-500/50 to-transparent" />
              <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] sm:text-xs antialiased">
                Data Stream {result.id.substring(0, 8)} • Generated {result.timestamp}
              </p>
            </motion.div>
          </div>

          {result.articles.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-5 pt-10 justify-center md:justify-start"
            >
              {result.articles.map((art, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveReportIndex(idx)}
                  className={cn(
                    "px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-3xl border-2 relative overflow-hidden group",
                    activeReportIndex === idx 
                      ? "bg-white text-zinc-950 border-white scale-110 z-20 shadow-white/20" 
                      : "bg-zinc-900/40 border-white/5 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/60 backdrop-blur-3xl"
                  )}
                  title={art.title}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {activeReportIndex === idx && (
                      <motion.div
                        layoutId="active-dot" 
                        className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse"
                      />
                    )}
                    Source {idx + 1}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/40 via-zinc-900/20 to-black/60 border border-white/5 backdrop-blur-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative group"
        >
          <div className="absolute inset-0 bg-indigo-500/[0.03] pointer-events-none group-hover:bg-indigo-500/[0.06] transition-colors duration-700" />
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group/icon border border-indigo-500/20 shadow-2xl">
                <Languages className="w-6 h-6 group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-500" />
             </div>
             <div className="text-left space-y-1">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Target Dimension</div>
                <div className="text-xl font-black text-white tracking-tighter drop-shadow-lg">{activeLang || 'Analyzing...'}</div>
             </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center relative z-10">
            {['English', 'Hindi', 'Telugu', 'Urdu', ...Object.keys(summaries).filter(l => !['English', 'Hindi', 'Telugu', 'Urdu', ...INDIAN_LANGUAGES].includes(l))].map(lang => (
              <button
                key={lang}
                onClick={() => handleLangSwitch(lang)}
                disabled={isTranslating}
                className={cn(
                  "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 whitespace-nowrap overflow-hidden relative group/btn",
                  activeLang === lang 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/40 translate-y-[-2px] ring-4 ring-indigo-500/20" 
                    : "bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-50 hover:bg-white/10 hover:border-white/10 hover:translate-y-[-1px] shadow-sm"
                )}
              >
                <span className="relative z-10">{lang}</span>
                {activeLang === lang && (
                  <motion.div 
                    initial={{ x: '-150%' }}
                    animate={{ x: '150%' }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[45deg]"
                  />
                )}
              </button>
            ))}

            {/* Indian Languages Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMoreLangsOpen(!isMoreLangsOpen)}
                disabled={isTranslating}
                className={cn(
                  "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 whitespace-nowrap flex items-center gap-2",
                  INDIAN_LANGUAGES.includes(activeLang)
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-2xl translate-y-[-2px]" 
                    : "bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-50 hover:bg-white/10"
                )}
              >
                <span>{INDIAN_LANGUAGES.includes(activeLang) ? activeLang : 'Indian Dialects'}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isMoreLangsOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isMoreLangsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-64 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input 
                          type="text"
                          placeholder="Search dialects..."
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {INDIAN_LANGUAGES.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).map(lang => (
                        <button
                          key={lang}
                          onClick={() => {
                            handleLangSwitch(lang);
                            setIsMoreLangsOpen(false);
                            setLangSearch('');
                          }}
                          className={cn(
                            "w-full text-left px-5 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                            activeLang === lang 
                              ? "bg-indigo-600 text-white shadow-lg" 
                              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 80, damping: 25 }}
        className="relative perspective-2000"
      >
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}
        <NewsCard result={result} activeLang={activeLang} activeReportIndex={activeReportIndex} />
      </motion.div>

      {result.articles.length > 1 && (
        <section className="space-y-8">
          <div className="flex items-center gap-6">
             <div className="h-[1px] flex-1 bg-white/10" />
             <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] whitespace-nowrap">Input Feed</h3>
             <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {result.articles.map((art, i) => (
              <InteractiveCard key={i} className="group/card bg-zinc-900/20 border-white/5">
                <a href={art.url} target="_blank" rel="noopener noreferrer" className="block p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="topic">{art.source || 'Source'}</Badge>
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover/card:text-indigo-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-white line-clamp-2 leading-relaxed tracking-tight group-hover/card:text-indigo-300 transition-colors">
                    {art.title}
                  </h4>
                  <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                    Coverage: {art.publishedDate ? new Date(art.publishedDate).toLocaleDateString() : 'Real-time'}
                  </div>
                </a>
              </InteractiveCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
const HistoryPage = ({ history, onSelect }: { history: SummaryResult[], onSelect: (res: SummaryResult) => void }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-600 space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center">
          <History className="w-12 h-12 opacity-20" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-zinc-400">Empty Archive</h3>
          <p className="text-zinc-600 font-medium">Your generated summaries will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="space-y-2">
        <h1 className="text-5xl font-display font-black text-white tracking-tight">Archive</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Recent Reports</p>
      </div>
      <div className="grid gap-4">
        {history.map((item) => (
          <InteractiveCard 
            key={item.id} 
            className="group/item cursor-pointer" 
            onClick={() => onSelect(item)}
          >
            <div className="p-6 flex justify-between items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white group-hover/item:text-indigo-400 transition-colors">{item.timestamp}</span>
                  <Badge variant="topic">{item.articles.length} Sources</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(item.summaries).map(l => (
                    <span key={l} className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{l}</span>
                  ))}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover/item:text-white group-hover/item:bg-indigo-600 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </InteractiveCard>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [appPhase, setAppPhase] = useState<'welcome' | 'login' | 'signup' | 'authenticated'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePage, setActivePage] = useState<'summarize' | 'results' | 'history' | 'settings'>('summarize');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [history, setHistory] = useState<SummaryResult[]>([]);
  const [latestResult, setLatestResult] = useState<SummaryResult | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Session check disabled temporarily for testing to force login page visibility
    /*
    const savedUser = localStorage.getItem('news_summarizer_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setAppPhase('authenticated');
    }
    */

    const savedHistory = localStorage.getItem('news_summarizer_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    // Force Dark Mode for performance and premium aesthetics
    document.documentElement.classList.add('dark');
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('news_summarizer_user', JSON.stringify(user));
    setAppPhase('authenticated');
  };

  const handleLogout = () => {
    localStorage.removeItem('news_summarizer_user');
    setCurrentUser(null);
    setAppPhase('welcome');
  };

  const handleSummarize = (result: SummaryResult) => {
    const newHistory = [result, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('news_summarizer_history', JSON.stringify(newHistory));
    setLatestResult(result);
    setActivePage('results');
  };

  const handleTranslate = (id: string, lang: string, translation: { headline: string, summary: string, highlights: string[] }, reportIndex?: number) => {
    const updateItem = (item: SummaryResult) => {
      if (item.id !== id) return item;

      const newIndividualReports = { ...(item.individualReports || {}) };
      let newSummaries = { ...item.summaries };
      let newHeadlines = { ...(item.translatedHeadlines || {}) };
      let newHighlights = { ...(item.translatedHighlights || {}) };

      if (reportIndex !== undefined && reportIndex !== -1) {
        if (!newIndividualReports[reportIndex]) newIndividualReports[reportIndex] = {};
        newIndividualReports[reportIndex][lang] = translation;
        
        // If we are currently editing Source 1 (index 0), also sync to the main fields for legacy/compat
        if (reportIndex === 0) {
          newSummaries[lang] = translation.summary;
          newHeadlines[lang] = translation.headline;
          newHighlights[lang] = translation.highlights;
        }
      } else {
        newSummaries[lang] = translation.summary;
        newHeadlines[lang] = translation.headline;
        newHighlights[lang] = translation.highlights;
      }

      return {
        ...item,
        summaries: newSummaries,
        translatedHeadlines: newHeadlines,
        translatedHighlights: newHighlights,
        individualReports: newIndividualReports
      };
    };

    const updatedHistory = history.map(updateItem);
    setHistory(updatedHistory);
    localStorage.setItem('news_summarizer_history', JSON.stringify(updatedHistory));

    if (latestResult?.id === id) {
      setLatestResult(updateItem(latestResult));
    }
  };

  const navItems = [
    { id: 'summarize', label: 'Summarize', icon: Globe },
    { id: 'results', label: 'Reports', icon: LayoutDashboard },
    { id: 'history', label: 'Archive', icon: History },
    { id: 'settings', label: 'Labs', icon: Settings },
  ] as const;

  // Authentication Flow
  if (appPhase === 'welcome' || appPhase === 'login' || appPhase === 'signup') {
    return <LandingPage onAuthSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row selection:bg-indigo-500/30">
      {/* Background Mesh */}
      <div className="bg-mesh pointer-events-none">
        <div />
        <div />
        <div />
      </div>

      {/* Desktop Sidebar ( > 1024px ) */}
      <aside className="hidden lg:flex w-64 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex-col fixed h-full z-50">
        <Logo className="p-8" />

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all relative group overflow-hidden",
                activePage === item.id 
                  ? "bg-white/10 text-white" 
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", activePage === item.id ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400")} />
              <span>{item.label}</span>
              {activePage === item.id && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all mt-12"
          >
            <Plus className="w-4 h-4 rotate-45" />
            <span>Terminate Session</span>
          </button>
        </nav>

        <div className="p-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl glass-card bg-white/[0.02] relative group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-black tracking-tighter shadow-lg shrink-0">
              {currentUser?.username?.substring(0, 2).toUpperCase() || 'AI'}
            </div>
            <div className="truncate">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-100 truncate">{currentUser?.username || 'Active Node'}</div>
              <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" /> Online
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Tablet Header ( 640px - 1024px ) */}
      <header className="hidden sm:flex lg:hidden w-full border-b border-white/5 bg-black/40 backdrop-blur-3xl sticky top-0 z-50 items-center justify-between px-6 py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activePage === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-zinc-500 hover:text-zinc-200"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white border border-white/10">
             {currentUser?.username?.substring(0, 2).toUpperCase() || 'AI'}
          </div>
        </div>
      </header>

      {/* Mobile Header ( < 640px ) */}
      <header className="flex sm:hidden w-full border-b border-white/5 bg-black/40 backdrop-blur-3xl sticky top-0 z-50 items-center justify-between px-6 py-4">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white border border-white/10">
             {currentUser?.username?.substring(0, 2).toUpperCase() || 'AI'}
          </div>
          <button className="text-zinc-500 p-2 rounded-xl bg-white/5 border border-white/5" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <Layers className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-8 sm:hidden flex flex-col justify-center gap-8"
          >
            <button className="absolute top-6 right-6 text-zinc-500" onClick={() => setIsMobileMenuOpen(false)}>
              <Plus className="rotate-45 w-8 h-8" />
            </button>
            <Logo size="lg" className="mb-8" />
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setIsMobileMenuOpen(false); }}
                className={cn(
                  "text-3xl font-display font-black tracking-tighter flex items-center gap-4",
                  activePage === item.id ? "text-indigo-500" : "text-zinc-700"
                )}
              >
                <item.icon className="w-8 h-8" />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="text-xl font-bold text-rose-500/60 uppercase tracking-widest flex items-center gap-4 mt-8"
            >
              <Plus className="w-6 h-6 rotate-45" />
              Terminate Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 relative min-h-screen overflow-y-auto overflow-x-hidden pt-8 lg:pt-12 px-2 sm:px-4",
        "lg:ml-64 transition-all"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full pb-24"
          >
            {activePage === 'summarize' && <SummarizePage onSummarize={handleSummarize} />}
            {activePage === 'results' && <ResultsPage result={latestResult} onTranslate={handleTranslate} />}
            {activePage === 'history' && <HistoryPage history={history} onSelect={(res) => { setLatestResult(res); setActivePage('results'); }} />}
            {activePage === 'settings' && (
              <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 text-center">
                 <div className="space-y-4">
                   <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white">System Settings</h1>
                   <p className="text-zinc-500 text-base sm:text-lg font-medium">Fine-tune your personal intelligence engine.</p>
                 </div>
                 
                 <div className="grid gap-4 sm:gap-6">
                    <InteractiveCard className="p-6 sm:p-8 group/item">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="text-left space-y-1">
                           <div className="font-bold text-lg group-hover/item:text-indigo-400 transition-colors">Interface Theme</div>
                           <div className="text-sm text-zinc-500 font-medium">Switch between high-contrast and soft modes.</div>
                         </div>
                         <button 
                           onClick={() => {
                             const isDark = document.documentElement.classList.toggle('dark');
                             setIsDarkMode(isDark);
                           }} 
                           className="w-14 h-8 rounded-full bg-white/5 border border-white/10 relative p-1 transition-all self-end sm:self-auto"
                         >
                           <motion.div 
                             animate={{ x: isDarkMode ? 24 : 0 }}
                             className="w-6 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] flex items-center justify-center" 
                           >
                             {isDarkMode ? <Moon className="w-3 h-3 text-white" /> : <Sun className="w-3 h-3 text-white" />}
                           </motion.div>
                         </button>
                       </div>
                    </InteractiveCard>

                    <InteractiveCard className="p-6 sm:p-8 group/item">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="text-left space-y-1">
                           <div className="font-bold text-lg group-hover/item:text-rose-400 transition-colors pointer-events-none">Clear History</div>
                           <div className="text-sm text-zinc-500 font-medium">Remove all cached reports and analysis. Irreversible.</div>
                         </div>
                         <button 
                           onClick={() => { if(confirm('Are you sure?')) { localStorage.clear(); setHistory([]); } }}
                           className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg self-end sm:self-auto"
                         >
                           Wipe Data
                         </button>
                       </div>
                    </InteractiveCard>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav (Persistent) */}
      <nav className="flex sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl border border-white/5 rounded-2xl px-4 py-2 z-[90] items-center gap-2 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all relative",
              activePage === item.id ? "bg-indigo-600 text-white" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            {activePage === item.id && (
              <motion.div 
                layoutId="mobile-dot"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
