import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { ReactTyped } from 'react-typed';
import { useInView } from 'react-intersection-observer';
import { 
  Zap, 
  User, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2,
  Calendar,
  Layers,
  BarChart3,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '@/src/lib/utils';
import { Article, SummaryResult } from '../types';

// --- Utilities ---

const getUnsplashUrl = (keywords: string[]) => {
  const query = keywords.slice(0, 3).join(',');
  return `https://images.unsplash.com/photo-1585829365234-78dcd69c887b?auto=format&fit=crop&q=80&w=800&q=${query}`;
  // Note: source.unsplash is deprecated, using a specific placeholder image with query hints or picsum
  // Actually, for real logic, picsum is more reliable in this environment if Unsplash requires keys
  // but the user asked for Source Unsplash. I'll use a high-quality placeholder with seed.
};

const getKeywordsFromTitle = (title: any) => {
  if (typeof title !== 'string') return [];
  return title
    .split(' ')
    .filter(word => word.length > 4)
    .map(word => word.replace(/[^a-zA-Z]/g, ''))
    .slice(0, 3);
};

// --- Components ---

export const SkeletonLoader = () => (
  <div className="space-y-4 w-full animate-pulse">
    <div className="h-10 bg-white/5 rounded-lg w-3/4" />
    <div className="h-64 bg-white/5 rounded-2xl w-full" />
    <div className="space-y-2">
      <div className="h-4 bg-white/5 rounded w-full" />
      <div className="h-4 bg-white/5 rounded w-5/6" />
      <div className="h-4 bg-white/5 rounded w-4/6" />
    </div>
  </div>
);

export const InteractiveCard = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn("glass-card w-full rounded-2xl overflow-hidden relative group", className)}
      {...props}
    >
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="relative z-10"
      >
        {children}
      </div>
      
      {/* Background Glow */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [mouseXSpring, mouseYSpring],
            ([mx, my]) => `radial-gradient(circle at ${((mx as number) + 0.5) * 100}% ${((my as number) + 0.5) * 100}%, rgba(99, 102, 241, 0.15) 0%, transparent 80%)`
          )
        }}
      />
    </motion.div>
  );
};

export const Headline = ({ text }: { text: string }) => {
  return (
    <h2 className="text-3xl md:text-5xl font-display font-medium text-white leading-[1.1] tracking-tight">
      <ReactTyped
        strings={[text]}
        typeSpeed={40}
        showCursor={false}
      />
    </h2>
  );
};

export const TypingHeadline = ({ text, delay = 300 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (typeof text !== 'string') return;
    let timeout: NodeJS.Timeout;
    
    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setComplete(true);
        }
      }, 60);
      
      return () => clearInterval(interval);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeout) clearTimeout(timeout);
    };
  }, [text, delay]);

  const words = (displayedText || "").split(" ");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white leading-[0.9]"
    >
      {(displayedText || "").split("").map((char, i) => {
        // Find index of "Redefined" if present to apply gradient
        const redefinedStart = (text || "").indexOf("Redefined");
        const isRedefined = redefinedStart !== -1 && i >= redefinedStart;
        
        return (
          <span 
            key={i} 
            className={cn(
              isRedefined && "text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-100 to-indigo-500"
            )}
          >
            {char}
          </span>
        );
      })}
      
      <motion.span
        animate={{ 
          opacity: complete ? [1, 0] : [1, 0, 1] 
        }}
        transition={{ 
          duration: complete ? 1.5 : 0.8, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="inline-block w-[3px] h-[0.8em] bg-indigo-400 ml-1 translate-y-[0.1em]"
      />
    </motion.div>
  );
};

export const ImageSection = ({ title, url }: { title: string; url?: string }) => {
  const [error, setError] = useState(false);
  
  // Clean placeholder image
  const placeholderUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";
  const finalImageUrl = (url && !error) ? url : placeholderUrl;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative h-[400px] w-full rounded-[2rem] overflow-hidden mt-8 group/img border border-white/10 shadow-2xl"
    >
      <img
        src={finalImageUrl}
        alt={title}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover/img:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
      
      {/* Scanning Beam Effect */}
      <motion.div 
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-20 w-full pointer-events-none"
      />
    </motion.div>
  );
};

export const AuthorInfo = ({ author, publisher, date }: { author?: string; publisher?: string; date?: string }) => {
  const hasAuthor = author && author.trim() !== '' && author.toLowerCase() !== 'unknown' && author.toLowerCase() !== 'null';
  const hasPublisher = publisher && publisher.trim() !== '' && publisher.toLowerCase() !== 'unknown';

  if (!hasAuthor && !hasPublisher) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
      {hasPublisher && (
        <div className="flex items-center gap-1.5 uppercase tracking-wider text-indigo-400 font-bold">
          <Globe className="w-3 h-3" />
          {publisher}
        </div>
      )}
      {hasAuthor && (
        <div className={cn("flex items-center gap-1.5", hasPublisher && "border-l border-zinc-800 pl-4")}>
          <User className="w-3 h-3" />
          {author}
        </div>
      )}
      {date && (
        <div className={cn("flex items-center gap-1.5", (hasAuthor || hasPublisher) && "border-l border-zinc-800 pl-4")}>
          <Calendar className="w-3 h-3" />
          {new Date(date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export const KeyPoint = ({ point, index }: { point: string; index: number; key?: React.Key }) => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.8, delay: index * 0.1, type: 'spring', damping: 20 }}
      className={cn(
        "p-6 rounded-2xl transition-all duration-700 border relative overflow-hidden group/point",
        inView 
          ? "bg-zinc-900/40 border-indigo-500/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="flex gap-6 items-start relative z-10">
        <div className="mt-1.5 shrink-0 flex items-center justify-center">
          <div className={cn(
            "w-3 h-3 rotate-45 border-2 transition-all duration-1000",
            inView ? "border-indigo-500 bg-indigo-500/20 scale-100 shadow-[0_0_15px_#6366f1]" : "border-zinc-700 scale-50"
          )} />
        </div>
        <p className={cn(
          "text-base sm:text-lg leading-relaxed font-medium transition-colors duration-1000",
          inView ? "text-zinc-100" : "text-zinc-600"
        )}>
          {point}
        </p>
      </div>
    </motion.div>
  );
};

export const KeyPoints = ({ points }: { points: string[] }) => {
  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2 text-sm font-bold text-amber-500 uppercase tracking-widest pl-2">
        <Zap className="w-4 h-4 fill-amber-500" />
        Executive Summary Highlights
      </div>
      <div className="grid grid-cols-1 gap-3">
        {points.map((point, i) => (
          <KeyPoint key={i} point={point} index={i} />
        ))}
      </div>
    </div>
  );
};

export const NewsCard = ({ result, activeLang, activeReportIndex = -1 }: { result: SummaryResult; activeLang: string; activeReportIndex?: number }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Decide what to display based on index
  let summaryText = '';
  let displayHeadline = '';
  let displayHighlights: string[] = [];
  let displayImage = result.articles[0]?.image;
  let displayAuthor = result.articles[0]?.author;
  let displaySource = result.articles[0]?.source;
  let displayDate = result.articles[0]?.publishedDate;

  if (activeReportIndex === -1) {
    // Combined Report
    summaryText = result.summaries[activeLang] || '';
    displayHeadline = result.translatedHeadlines?.[activeLang] || result.articles[0]?.title || "Article Summary";
    displayHighlights = result.translatedHighlights?.[activeLang] || result.highlights || [];
  } else {
    // Individual Report
    const individual = result.individualReports?.[activeReportIndex]?.[activeLang];
    const article = result.articles[activeReportIndex];
    
    summaryText = individual?.summary || '';
    displayHeadline = individual?.headline || article?.title || "Source Summary";
    displayHighlights = individual?.highlights || [];
    displayImage = article?.image;
    displayAuthor = article?.author;
    displaySource = article?.source;
    displayDate = article?.publishedDate;
  }
  
  const cardRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: displayHeadline,
        text: summaryText,
        url: window.location.href,
      });
    }
  };

  const exportPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      const title = displayHeadline;
      const titleLines = doc.splitTextToSize(title, contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 8) + 10;

      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      if (displaySource) {
        doc.text(`Source: ${displaySource}`, margin, currentY);
        currentY += 5;
      }
      if (displayAuthor) {
        doc.text(`Author: ${displayAuthor}`, margin, currentY);
        currentY += 5;
      }
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, currentY);
      currentY += 15;

      // Summary
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Comprehensive Summary", margin, currentY);
      currentY += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const cleanedSummary = summaryText.replace(/\*\*/g, ''); // Remove markdown bolds for PDF
      const summaryLines = doc.splitTextToSize(cleanedSummary, contentWidth);
      doc.text(summaryLines, margin, currentY);
      currentY += (summaryLines.length * 6) + 15;

      // Key Points
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text("Key Takeaways", margin, currentY);
      currentY += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      displayHighlights.forEach((point) => {
        const pointLines = doc.splitTextToSize(`• ${point}`, contentWidth - 5);
        if (currentY + (pointLines.length * 5) > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(pointLines, margin + 2, currentY);
        currentY += (pointLines.length * 5) + 3;
      });

      // Watermark
      doc.setTextColor(200);
      doc.setFontSize(10);
      const watermark = "AI News Summarizer";
      doc.text(watermark, pageWidth / 2, pageHeight - 10, { align: 'center' });

      doc.save(`Summary_${title.substring(0, 20)}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const renderHighlightedContent = (content: any) => {
    if (typeof content !== 'string') return '';
    // Process markdown-like bold text manually for custom styling if needed
    // or just use dangerouslySetInnerHTML with caution after sanitization
    // Since it's from our controlled AI prompt, we can trust it for simple **bold**
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-zinc-50 font-bold border-b border-indigo-500/30">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <InteractiveCard className="p-8 md:p-14 mb-12 border-white/5 bg-zinc-900/40 backdrop-blur-3xl shadow-2xl">
      <div className="space-y-8">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-4">
             <AuthorInfo 
              publisher={displaySource} 
              author={displayAuthor} 
              date={displayDate} 
             />
             <Headline text={displayHeadline} />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportPDF}
              disabled={downloading}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
              title="Download PDF"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
            <button 
              onClick={copyToClipboard}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button 
              onClick={share}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <ImageSection title={displayHeadline} url={displayImage} />

        <div className="mt-8">
          <div className="flex items-center gap-2 text-zinc-400 mb-4 text-xs font-bold uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            Comprehensive Summary
          </div>
          <div className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
            {renderHighlightedContent(summaryText)}
          </div>
        </div>

        <KeyPoints points={displayHighlights} />

        <div className="pt-8 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {result.topics.map((t, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                #{t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
             <div className={cn(
               "w-2 h-2 rounded-full",
               result.sentiment === 'Positive' ? "bg-emerald-500" :
               result.sentiment === 'Negative' ? "bg-rose-500" : "bg-zinc-500"
             )} />
             <span className="text-[10px] font-bold text-zinc-500 uppercase">{result.sentiment}</span>
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
};
