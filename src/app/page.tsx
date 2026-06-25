"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  Award, 
  Users, 
  Globe, 
  Layers, 
  CreditCard, 
  FileText, 
  CalendarDays, 
  CheckCircle2, 
  Plus, 
  Minus,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Star,
  Cpu,
  Briefcase,
  TrendingUp,
  BarChart2,
  Tv,
  CheckCircle
} from "lucide-react";
import { motion, useScroll, useTransform, useInView, MotionValue } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { SpiralAnimation } from "@/components/ui/spiral-animation";

// --- Data Constants ---
const stats = [
  { value: "25,000+", label: "Students Assisted", sub: "Registered aspirants", icon: Users },
  { value: "50+", label: "Global Programs", sub: "Multi-discipline paths", icon: Globe },
  { value: "100+", label: "Accredited Recruits", sub: "Corporate partnerships", icon: Briefcase },
  { value: "100%", label: "Merit Scholarship", sub: "Financial aid threshold", icon: Layers },
];

const features = [
  {
    title: "100% Merit Scholarships",
    description: "Access elite education tiers through score-matching tuition waivers up to 100%.",
    icon: Award,
    col: "#00C9A7"
  },
  {
    title: "Flexible Exam Slots",
    description: "Book customized date and window sessions that seamlessly match your availability.",
    icon: CalendarDays,
    col: "#00B4FF"
  },
  {
    title: "AI Proctored Assessments",
    description: "Secure browser consoles with full-screen locks and smart tracking controls.",
    icon: ShieldCheck,
    col: "#7C3AED"
  },
  {
    title: "Fast Admissions Process",
    description: "Instant document evaluation and digital results publishing in real-time.",
    icon: Clock,
    col: "#00C9A7"
  },
  {
    title: "National-Level Recognition",
    description: "High-repute certifications accredited and approved by leading bodies.",
    icon: Sparkles,
    col: "#00B4FF"
  },
  {
    title: "Career-Oriented Programs",
    description: "Advanced curriculum layouts matching industry expectations for immediate placement.",
    icon: TrendingUp,
    col: "#7C3AED"
  },
];

const programsList = [
  {
    category: "Engineering & Tech",
    title: "B.Tech Computer Science & AI",
    desc: "Develop advanced logic systems, neural computing schemas, and deep cloud databases.",
    duration: "4 Years",
    icon: Cpu
  },
  {
    category: "Management Studies",
    title: "BBA Business Analytics & Fintech",
    desc: "Gain expertise in quantitative modeling, market operations, and digital ledger systems.",
    duration: "3 Years",
    icon: BarChart2
  },
  {
    category: "Advanced Sciences",
    title: "B.Sc Data Analytics",
    desc: "Master mathematical analysis, deep learning, statistical computation, and big data.",
    duration: "3 Years",
    icon: TrendingUp
  },
  {
    category: "Design & Arts",
    title: "B.Des Digital Product Architecture",
    desc: "Learn modern interface principles, human-centered design systems, and interaction physics.",
    duration: "4 Years",
    icon: Globe
  },
];

const timelineSteps = [
  { step: "01", title: "Apply Online", desc: "Fill personal/academic credentials in less than 5 minutes." },
  { step: "02", title: "Book Exam Slot", desc: "Select from customized time windows that suit your routine." },
  { step: "03", title: "Take RGUSAT", desc: "Complete the online proctored entrance exam in full-screen mode." },
  { step: "04", title: "Get Scholarship", desc: "Unlock tuition waivers based on qualified entrance score standing." },
  { step: "05", title: "Secure Admission", desc: "Generate qualifying certificates and finalize administrative verification." },
];

const faqs = [
  {
    q: "What is RGUSAT 2026?",
    a: "Rathinam Global University Scholastic Aptitude Test (RGUSAT) is the gateway entrance examination for securing admission and merit scholarships across undergraduate programs."
  },
  {
    q: "What is the application and registration fee?",
    a: "The registration fee is a one-time non-refundable payment of ₹999. It grants access to slot booking, mock preparation, and official entrance exams."
  },
  {
    q: "How does the exam slot booking work?",
    a: "After successful payment, students gain access to the Slot Booking portal where they can choose a date and time session that suits them. Once selected, capacities update in real-time."
  },
  {
    q: "Can I take mock tests before the final exam?",
    a: "Yes! Students can take mock tests on their dashboard to get familiar with the test interface, proctoring controls, and question formatting."
  },
  {
    q: "What are the rules during the official exam?",
    a: "The official exam requires camera/screen sharing access and is taken in full-screen proctored mode. Closing the window or tab switching triggers proctor alerts; 3 warnings result in auto-disqualification."
  },
];

const testimonials = [
  {
    name: "Sanjay Kumar",
    course: "B.Tech CSE Graduate",
    text: "Securing a 100% scholarship through RGUSAT allowed me to focus on research and placement prep. I got placed as an AI engineer right after graduation!",
    stars: 5,
    role: "AI Developer at Google India"
  },
  {
    name: "Roshini Sharma",
    course: "B.Sc Data Analytics",
    text: "The proctored test environment was so smooth. Slot booking allowed me to pick a weekend slot, and my merit assessment came in immediately.",
    stars: 5,
    role: "Analyst at Deloitte"
  },
  {
    name: "Vikram Malhotra",
    course: "BBA Fintech Student",
    text: "Highly intuitive portal. Bypassing manual document checks meant I booked my slot, did the mock, and secured my seat in just a few clicks.",
    stars: 5,
    role: "Fintech Lead at Razorpay"
  },
];

interface FeatureCardProps {
  feat: typeof features[number];
  index: number;
  scrollYProgress: MotionValue<number>;
}

function FeatureCard({ feat, index, scrollYProgress }: FeatureCardProps) {
  const Icon = feat.icon;
  const isCenter = index === 1 || index === 4;

  // Stagger mapping for center vs corner cards:
  // Center cards start earlier and collapse later
  const inputScroll = isCenter
    ? [0, 0.15, 0.35, 0.70, 0.90, 1]
    : [0, 0.22, 0.42, 0.63, 0.83, 1];

  const cardProgress = useTransform(scrollYProgress, inputScroll, [0, 0, 1, 1, 0, 0]);

  // Calculate relative offset to collapse to center
  const col = index % 3;
  const row = Math.floor(index / 3);

  // We have a 3x2 grid.
  // Horizontal offset from column center (1)
  const targetXVal = (1 - col) * 110; // offset in %
  // Vertical offset from center line (between row 0 and row 1)
  const targetYVal = (0.5 - row) * 120; // offset in %

  // Map progress to transformations
  const x = useTransform(cardProgress, [0, 1], [`${targetXVal}%`, "0%"]);
  const y = useTransform(cardProgress, [0, 1], [`${targetYVal}%`, "0%"]);
  const scale = useTransform(cardProgress, [0, 1], [0.4, 1.0]);
  const opacity = useTransform(cardProgress, [0, 1], [0, 1]);
  const blurVal = useTransform(cardProgress, [0, 1], [8, 0]);
  const filter = useTransform(blurVal, (v) => `blur(${v}px)`);

  // Ambient glows: intensifies briefly as card lands, then settles
  const glowOpacity = useTransform(cardProgress, [0, 0.8, 1], [0, 0.8, 0.15]);
  const glowScale = useTransform(cardProgress, [0, 0.8, 1], [0.9, 1.08, 1]);

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        opacity,
        filter,
      }}
      className="relative group h-full select-none"
    >
      {/* Landing ambient glow that pulse once and settles */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
        style={{
          opacity: glowOpacity,
          scale: glowScale,
          background: `radial-gradient(circle at 50% 50%, ${feat.col}25 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      {/* Per-card ambient hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${feat.col}18 0%, transparent 70%)`,
          filter: "blur(12px)",
          transform: "scaleX(1.1) scaleY(1.2) translateY(4px)",
        }}
      />

      <div
        className="relative p-8 rounded-2xl transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col justify-between"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px -6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-6 right-6 h-[1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${feat.col}60, transparent)` }}
        />

        <div>
          {/* Icon container */}
          <div
            className="p-3.5 rounded-2xl w-fit mb-6 transition-all duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${feat.col}18, ${feat.col}08)`,
              border: `1px solid ${feat.col}25`,
              color: feat.col,
              boxShadow: `0 0 15px ${feat.col}15`,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-black text-white">{feat.title}</h3>
          <p className="text-xs text-slate-400 mt-3.5 leading-relaxed">{feat.description}</p>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
          <span
            className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1"
            style={{ color: feat.col }}
          >
            Learn More <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── ScrollFade: fades content in on scroll-enter, out on scroll-exit ──────────
interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** How far from the edge the fade triggers. Negative = inside viewport. */
  margin?: string;
}

function ScrollFade({ children, className = "", delay = 0, margin = "-8% 0px -8% 0px" }: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: margin as `${number}% ${number}px ${number}% ${number}px` });

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 24,
        filter: isInView ? "blur(0px)" : "blur(4px)",
      }}
      transition={{
        duration: 0.65,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}


interface ProcessStepCardProps {
  proc: typeof timelineSteps[number];
  index: number;
  processScrollProgress: MotionValue<number>;
}

function ProcessStepCard({ proc, index, processScrollProgress }: ProcessStepCardProps) {
  const isCenter = index === 2; // Step 03 is index 2

  // Entry start and end bounds
  const entryStart = 0.08 + index * 0.04;
  const entryEnd = 0.22 + index * 0.04;
  
  // Exit start and end bounds
  const exitStart = 0.65 + index * 0.03;
  const exitEnd = 0.8 + index * 0.03;

  // x translation: starts left, settles, then exits right
  const x = useTransform(
    processScrollProgress,
    [0, entryStart, entryEnd, exitStart, exitEnd, 1],
    ["-80vw", "-80vw", "0px", "0px", "80vw", "80vw"]
  );

  // opacity
  const opacity = useTransform(
    processScrollProgress,
    [0, entryStart, entryEnd, exitStart, exitEnd, 1],
    [0, 0, 1, 1, 0, 0]
  );

  // scale
  const scale = useTransform(
    processScrollProgress,
    [0, entryStart, entryEnd, exitStart, exitEnd, 1],
    [0.9, 0.9, isCenter ? 1.05 : 1.0, isCenter ? 1.05 : 1.0, 0.9, 0.9]
  );

  // motion blur
  const blurVal = useTransform(
    processScrollProgress,
    [0, entryStart, (entryStart + entryEnd) / 2, entryEnd, exitStart, (exitStart + exitEnd) / 2, exitEnd, 1],
    [8, 8, 4, 0, 0, 4, 8, 8]
  );
  const filter = useTransform(blurVal, (v) => `blur(${v}px)`);

  // center card premium cyan glow shadow
  const shadowValue = useTransform(
    processScrollProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [
      "0px 0px 0px rgba(0, 229, 212, 0)",
      isCenter ? "0px 15px 45px rgba(0, 229, 212, 0.25)" : "0px 5px 15px rgba(0,0,0,0.1)",
      isCenter ? "0px 15px 45px rgba(0, 229, 212, 0.25)" : "0px 5px 15px rgba(0,0,0,0.1)",
      "0px 0px 0px rgba(0, 229, 212, 0)"
    ]
  );

  return (
    <motion.div
      style={{
        x,
        opacity,
        scale,
        filter,
        boxShadow: shadowValue,
      }}
      className={`flex flex-col items-center text-center group bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm relative select-none ${
        isCenter ? "border-[#00E5D4]/30" : ""
      }`}
    >
      {isCenter && (
        <div className="absolute inset-0 rounded-3xl border border-[#00E5D4]/35 pointer-events-none" />
      )}
      <div className={`w-16 h-16 rounded-2xl bg-black border-2 shadow-md flex items-center justify-center transition-all duration-300 ${
        isCenter 
          ? "border-[#00E5D4]/40 text-[#00E5D4] group-hover:border-[#00E5D4] group-hover:scale-105" 
          : "border-white/10 text-[#00C9A7] group-hover:border-[#00C9A7] group-hover:scale-105"
      }`}>
        <span className="text-lg font-black font-mono">{proc.step}</span>
      </div>
      <span className={`text-[10px] font-black mt-5 uppercase tracking-widest ${isCenter ? "text-[#00E5D4]" : "text-[#00C9A7]"}`}>
        Step {proc.step}
      </span>
      <h3 className="text-base font-extrabold text-white mt-2">{proc.title}</h3>
      <p className="text-xs text-slate-350 mt-2 leading-relaxed font-medium">{proc.desc}</p>
    </motion.div>
  );
}

interface ProgramCardProps {
  prog: typeof programsList[number];
  index: number;
}

// Per-category glow/accent config for dark glassmorphism cards
const categoryConfig: Record<string, {
  edgeGlow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeShadow: string;
  iconGlow: string;
  iconText: string;
  hoverBorder: string;
  hoverGlow: string;
  accentLine: string;
}> = {
  "Engineering & Tech": {
    edgeGlow: "rgba(0,229,212,0.18)",
    badgeBg: "rgba(0,229,212,0.12)",
    badgeText: "#67e8f9",
    badgeBorder: "rgba(0,229,212,0.30)",
    badgeShadow: "0 0 12px rgba(0,229,212,0.25)",
    iconGlow: "rgba(0,229,212,0.15)",
    iconText: "#00E5D4",
    hoverBorder: "rgba(0,229,212,0.40)",
    hoverGlow: "0 0 40px rgba(0,229,212,0.20), 0 32px 64px rgba(0,0,0,0.60)",
    accentLine: "from-cyan-400/60 via-cyan-400/20 to-transparent",
  },
  "Management Studies": {
    edgeGlow: "rgba(29,161,255,0.18)",
    badgeBg: "rgba(29,161,255,0.12)",
    badgeText: "#60a5fa",
    badgeBorder: "rgba(29,161,255,0.30)",
    badgeShadow: "0 0 12px rgba(29,161,255,0.25)",
    iconGlow: "rgba(29,161,255,0.15)",
    iconText: "#1DA1FF",
    hoverBorder: "rgba(29,161,255,0.40)",
    hoverGlow: "0 0 40px rgba(29,161,255,0.20), 0 32px 64px rgba(0,0,0,0.60)",
    accentLine: "from-blue-400/60 via-blue-400/20 to-transparent",
  },
  "Advanced Sciences": {
    edgeGlow: "rgba(139,92,246,0.18)",
    badgeBg: "rgba(139,92,246,0.12)",
    badgeText: "#c4b5fd",
    badgeBorder: "rgba(139,92,246,0.30)",
    badgeShadow: "0 0 12px rgba(139,92,246,0.25)",
    iconGlow: "rgba(139,92,246,0.15)",
    iconText: "#a78bfa",
    hoverBorder: "rgba(139,92,246,0.40)",
    hoverGlow: "0 0 40px rgba(139,92,246,0.20), 0 32px 64px rgba(0,0,0,0.60)",
    accentLine: "from-violet-400/60 via-violet-400/20 to-transparent",
  },
  "Design & Arts": {
    edgeGlow: "rgba(251,191,36,0.16)",
    badgeBg: "rgba(251,191,36,0.10)",
    badgeText: "#fcd34d",
    badgeBorder: "rgba(251,191,36,0.28)",
    badgeShadow: "0 0 12px rgba(251,191,36,0.22)",
    iconGlow: "rgba(251,191,36,0.12)",
    iconText: "#fbbf24",
    hoverBorder: "rgba(251,191,36,0.38)",
    hoverGlow: "0 0 40px rgba(251,191,36,0.18), 0 32px 64px rgba(0,0,0,0.60)",
    accentLine: "from-amber-400/60 via-amber-400/20 to-transparent",
  },
};

function ProgramCard({ prog, index }: ProgramCardProps) {
  const Icon = prog.icon;
  const cfg = categoryConfig[prog.category] ?? categoryConfig["Engineering & Tech"];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        y: hovered ? -8 : 0,
        scale: hovered ? 1.02 : 1,
        boxShadow: hovered ? cfg.hoverGlow : "0 24px 56px rgba(0,0,0,0.55)",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="h-full"
    >
      <div
        className="h-full rounded-3xl p-px relative overflow-hidden flex flex-col select-none"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${cfg.hoverBorder} 0%, rgba(255,255,255,0.06) 50%, ${cfg.hoverBorder} 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)`,
          transition: "background 0.4s ease",
        }}
      >
        {/* Outer ambient edge glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ boxShadow: `inset 0 0 0 1px ${cfg.hoverBorder}` }}
        />

        {/* Inner card surface */}
        <div
          className="flex-1 rounded-[22px] p-7 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0d1628 0%, #0b1220 45%, #111827 100%)",
          }}
        >
          {/* Top-edge glass reflection streak */}
          <div
            className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${cfg.accentLine} pointer-events-none`}
          />

          {/* Subtle inner corner highlight (top-left) */}
          <div
            className="absolute -top-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${cfg.edgeGlow} 0%, transparent 70%)`,
              opacity: hovered ? 0.9 : 0.45,
              transition: "opacity 0.4s ease",
            }}
          />

          {/* Bottom-right depth shadow blob */}
          <div
            className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0,0,0,0.40) 0%, transparent 70%)",
            }}
          />

          {/* Hover shimmer overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[22px]"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `linear-gradient(125deg, ${cfg.edgeGlow} 0%, transparent 55%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Badge + Duration row */}
            <div className="flex justify-between items-center mb-7">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
                style={{
                  background: cfg.badgeBg,
                  color: cfg.badgeText,
                  border: `1px solid ${cfg.badgeBorder}`,
                  boxShadow: hovered ? cfg.badgeShadow : "none",
                  transition: "box-shadow 0.35s ease",
                }}
              >
                {prog.category}
              </span>
              <span className="text-[11px] text-slate-500 font-bold tracking-wide tabular-nums">
                {prog.duration}
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <motion.div
                animate={{
                  background: hovered ? cfg.iconGlow : "rgba(255,255,255,0.04)",
                  boxShadow: hovered ? cfg.badgeShadow : "none",
                }}
                transition={{ duration: 0.3 }}
                className="p-2.5 rounded-xl flex-shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Icon
                  className="h-5 w-5 transition-colors duration-300"
                  style={{ color: hovered ? cfg.iconText : "#94a3b8" }}
                />
              </motion.div>
              <h3
                className="text-[17px] font-black leading-snug transition-colors duration-300"
                style={{ color: hovered ? cfg.iconText : "#f1f5f9" }}
              >
                {prog.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
              {prog.desc}
            </p>
          </div>

          {/* Footer CTA */}
          <div
            className="relative z-10 mt-8 pt-5 flex justify-end"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <Link
              href="/apply"
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all duration-300"
              style={{
                color: cfg.iconText,
                textShadow: hovered ? `0 0 10px ${cfg.iconText}` : "none",
              }}
            >
              Initiate Application
              <motion.span
                animate={{ x: hovered ? 4 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [score, setScore] = useState(85);
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(1);
  const testimonialContainerRef = useRef<HTMLDivElement>(null);
  const processScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTestimonialScroll = () => {
    const container = testimonialContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 360;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveTestimonial(Math.max(0, Math.min(testimonials.length - 1, index)));
  };

  const scrollToTestimonial = (idx: number) => {
    const container = testimonialContainerRef.current;
    if (!container) return;
    const cardWidth = 360;
    container.scrollTo({
      left: idx * cardWidth,
      behavior: "smooth"
    });
    setActiveTestimonial(idx);
  };

  const { scrollYProgress: processScrollProgress } = useScroll({
    target: processScrollRef,
    offset: ["start end", "end start"],
  });
  const lineScaleX = useTransform(processScrollProgress, [0.08, 0.45, 0.65, 0.8], [0, 1, 1, 0]);




  const statsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const statsItemVariants = {
    hidden: {
      opacity: 0,
      y: -120,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  // Features section scroll tracking for the assembly animation
  const featuresRef = useRef<HTMLElement>(null);
  const { scrollYProgress: featuresScrollProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"],
  });

  // Energy wave transforms
  const waveSize = useTransform(featuresScrollProgress, [0, 0.15, 0.45, 0.55, 0.85, 1], [100, 100, 1200, 1200, 100, 100]);
  const waveOpacity = useTransform(featuresScrollProgress, [0, 0.12, 0.35, 0.5, 0.72, 0.85, 1], [0, 0.9, 0, 0, 0.9, 0, 0]);

  // Light trails opacity
  const trailOpacity = useTransform(featuresScrollProgress, [0, 0.15, 0.38, 0.62, 0.85, 1], [0, 0.5, 0, 0, 0.5, 0]);

  // Score to Scholarship logic
  const getScholarshipDetails = (scoreVal: number) => {
    if (scoreVal >= 95) return { pct: 100, tier: "Grand Presidential Scholarship", col: "#00C9A7" };
    if (scoreVal >= 90) return { pct: 75, tier: "Executive Merit Fellowship", col: "#00B4FF" };
    if (scoreVal >= 80) return { pct: 50, tier: "Dean's Honors Honorarium", col: "#7C3AED" };
    if (scoreVal >= 70) return { pct: 25, tier: "Aspirant Entry Waiver", col: "#f59e0b" };
    return { pct: 10, tier: "Standard Academic Aid", col: "#64748b" };
  };
  const scholarship = getScholarshipDetails(score);

  return (
    <div className="relative bg-black overflow-hidden flex flex-col font-sans text-white isolate">

      {/* ── Announcement Marquee Ribbon ─────────────────────────────────────── */}
      <div className="w-full bg-[#0F172A] text-slate-200 overflow-hidden py-2 px-4 text-[11px] font-black uppercase tracking-wider border-b border-slate-800 select-none z-50 flex items-center shrink-0">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          <span>Admissions Open for 2026–27 | Scholarships up to 100% | Limited Seats Available</span>
          <span>•</span>
          <span>Register online for RGUSAT 2026 • Entrance test window booking open</span>
          <span>•</span>
          <span>Admissions Open for 2026–27 | Scholarships up to 100% | Limited Seats Available</span>
          <span>•</span>
          <span>Register online for RGUSAT 2026 • Entrance test window booking open</span>
        </div>
      </div>

      <Header />

      {/* ── Hero Section (Centered Layout) ────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 z-10 bg-black overflow-hidden" style={{isolation: "isolate"}}>
        {/* Spiral Animation confined to hero */}
        <SpiralAnimation
          backgroundColor="black"
          particleColor="white"
          trailColor="white"
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C9A7]/5 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00B4FF]/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="mx-auto max-w-4xl w-full text-center space-y-6 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20 uppercase">
              Admissions Open 2026-27
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Shape Your Future with <span className="text-primary-gradient">RGUSAT 2026</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-350 max-w-2xl mx-auto leading-relaxed"
          >
            Rathinam Global University Scholastic Aptitude Test (RGUSAT) 2026 is your gateway to world-class education. Secure your admissions, qualify for up to 100% merit scholarships, book flexible exam slots, and practice with advanced proctored mock assessments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/apply" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl text-sm font-bold shadow-lg shadow-[#00C9A7]/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-[#00C9A7] to-[#00B4FF] text-white border-transparent">
                Apply Online Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl text-sm font-bold bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white transition-all">
                Student Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Section (Below Hero Fold) ─────────────────────────────────── */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #050816 0%, #0B1228 40%, #130A2A 75%, #1E0A3C 100%)",
        }}
      >
        {/* ── Top fade from hero ── */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none z-0" />

        {/* ── Bottom fade to next section ── */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1E0A3C]/20 to-transparent pointer-events-none z-0" />

        {/* ── Aurora glow: cyan left ── */}
        <div
          className="absolute -left-32 top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(0,201,167,0.09) 0%, rgba(0,201,167,0.03) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* ── Aurora glow: violet right ── */}
        <div
          className="absolute -right-32 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* ── Aurora glow: midnight blue centre ── */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse, rgba(0,180,255,0.05) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* ── Micro star-field ── */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 28% 72%, rgba(255,255,255,0.25) 0%, transparent 100%),
              radial-gradient(1px 1px at 44% 34%, rgba(255,255,255,0.3) 0%, transparent 100%),
              radial-gradient(1px 1px at 58% 88%, rgba(255,255,255,0.2) 0%, transparent 100%),
              radial-gradient(1px 1px at 73% 22%, rgba(255,255,255,0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 86% 61%, rgba(255,255,255,0.25) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 6% 52%, rgba(0,201,167,0.4) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 92% 40%, rgba(124,58,237,0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 36% 9%, rgba(255,255,255,0.2) 0%, transparent 100%),
              radial-gradient(1px 1px at 67% 95%, rgba(255,255,255,0.18) 0%, transparent 100%)
            `,
          }}
        />

        {/* ── Subtle grid overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* ── Content ── */}
        <ScrollFade className="mx-auto max-w-7xl relative z-10">
          {/* Section label */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#00C9A7]/8 text-[#00C9A7] border border-[#00C9A7]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
              Trusted by Thousands
            </span>
          </div>

          <motion.div
            variants={statsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const glowColors = ["#00C9A7", "#00B4FF", "#7C3AED", "#00C9A7"];
              const glowCol = glowColors[i % glowColors.length];
              return (
                <motion.div
                  key={i}
                  variants={statsItemVariants}
                  className="relative group"
                >
                  {/* Landing ambient glow that intensifies briefly */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: {
                        opacity: [0, 0.7, 0.15],
                        scale: [0.95, 1.08, 1],
                        transition: {
                          delay: 0.35,
                          duration: 1.2,
                          ease: "easeOut",
                        }
                      }
                    }}
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${glowCol}25 0%, transparent 70%)`,
                      filter: "blur(18px)",
                    }}
                  />

                  {/* Per-card ambient glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${glowCol}18 0%, transparent 70%)`,
                      filter: "blur(12px)",
                      transform: "scaleX(1.1) scaleY(1.2) translateY(4px)",
                    }}
                  />
                  <div
                    className="p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 h-full"
                    style={{
                      background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 4px 24px -6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-6 right-6 h-[1px] rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${glowCol}50, transparent)` }}
                    />

                    {/* Icon */}
                    <div
                      className="p-3 rounded-xl mb-4 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${glowCol}18, ${glowCol}08)`,
                        border: `1px solid ${glowCol}25`,
                        color: glowCol,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Value */}
                    <h3
                      className="text-3xl font-black tracking-tight text-white"
                      style={{ textShadow: `0 0 20px ${glowCol}30` }}
                    >
                      {stat.value}
                    </h3>

                    {/* Label */}
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2" style={{ color: glowCol }}>
                      {stat.label}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stat.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </ScrollFade>
      </section>


      {/* ── Why Choose RGUSAT (Features Section) ────────────────────────────── */}
      <section
        id="features"
        ref={featuresRef}
        className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050816] z-10"
      >
        {/* Top smooth gradient transition from the purple stats section above */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#1E0A3C] to-transparent pointer-events-none z-0" />

        {/* Campus background image (22% intensity) */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 pointer-events-none"
          style={{
            backgroundImage: "url('/rgu.png')",
            opacity: 0.22,
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Soft cyan spotlight glow behind the heading area */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(0, 201, 167, 0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Bottom smooth fade gradually into deep black (#050816) */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050816] to-transparent pointer-events-none z-0" />

        {/* ── Central energy wave that expands as cards emerge ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <motion.div
            style={{
              width: waveSize,
              height: waveSize,
              opacity: waveOpacity,
            }}
            className="rounded-full absolute"
            aria-hidden="true"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(0, 201, 167, 0.25)",
                boxShadow: "0 0 60px 20px rgba(0, 180, 255, 0.08), inset 0 0 60px 20px rgba(124, 58, 237, 0.08)",
              }}
            />
            {/* Inner ring */}
            <div className="absolute inset-[15%] rounded-full"
              style={{
                border: "1px solid rgba(124, 58, 237, 0.2)",
              }}
            />
            {/* Core glow */}
            <div className="absolute inset-[40%] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0, 201, 167, 0.5) 0%, rgba(124, 58, 237, 0.3) 50%, transparent 100%)",
                filter: "blur(8px)",
              }}
            />
          </motion.div>
        </div>

        {/* ── Light trail network SVG between cards ── */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <motion.svg
            className="w-full h-full"
            style={{ opacity: trailOpacity }}
            aria-hidden="true"
          >
            <defs>
              {/* Horizontal Gradients */}
              <linearGradient id="trailGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,201,167,0)" />
                <stop offset="50%" stopColor="rgba(0,201,167,0.5)" />
                <stop offset="100%" stopColor="rgba(0,201,167,0)" />
              </linearGradient>
              <linearGradient id="trailGradViolet" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(124,58,237,0)" />
                <stop offset="50%" stopColor="rgba(124,58,237,0.5)" />
                <stop offset="100%" stopColor="rgba(124,58,237,0)" />
              </linearGradient>
              <linearGradient id="trailGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,180,255,0)" />
                <stop offset="50%" stopColor="rgba(0,180,255,0.5)" />
                <stop offset="100%" stopColor="rgba(0,180,255,0)" />
              </linearGradient>

              {/* Vertical Gradients */}
              <linearGradient id="trailGradCyanVert" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,201,167,0)" />
                <stop offset="50%" stopColor="rgba(0,201,167,0.5)" />
                <stop offset="100%" stopColor="rgba(0,201,167,0)" />
              </linearGradient>
              <linearGradient id="trailGradVioletVert" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(124,58,237,0)" />
                <stop offset="50%" stopColor="rgba(124,58,237,0.5)" />
                <stop offset="100%" stopColor="rgba(124,58,237,0)" />
              </linearGradient>
              <linearGradient id="trailGradBlueVert" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,180,255,0)" />
                <stop offset="50%" stopColor="rgba(0,180,255,0.5)" />
                <stop offset="100%" stopColor="rgba(0,180,255,0)" />
              </linearGradient>
            </defs>
            {/* Horizontal connections */}
            <line x1="20%" y1="35%" x2="50%" y2="35%" stroke="url(#trailGradCyan)" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="50%" y1="35%" x2="80%" y2="35%" stroke="url(#trailGradBlue)" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="20%" y1="65%" x2="50%" y2="65%" stroke="url(#trailGradViolet)" strokeWidth="1" strokeDasharray="6 4" />
            <line x1="50%" y1="65%" x2="80%" y2="65%" stroke="url(#trailGradCyan)" strokeWidth="1" strokeDasharray="6 4" />
            {/* Vertical connections */}
            <line x1="20%" y1="35%" x2="20%" y2="65%" stroke="url(#trailGradVioletVert)" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="50%" y1="35%" x2="50%" y2="65%" stroke="url(#trailGradBlueVert)" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="80%" y1="35%" x2="80%" y2="65%" stroke="url(#trailGradCyanVert)" strokeWidth="1" strokeDasharray="4 6" />
          </motion.svg>
        </div>

        <ScrollFade className="mx-auto max-w-7xl relative z-20">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#00C9A7]/8 text-[#00C9A7] border border-[#00C9A7]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
              Academic Excellence
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Next-Gen Examination &amp; Admissions
            </h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base max-w-xl mx-auto">
              A secure, automated system built on modern principles of integrity, transparency, and student convenience.
            </p>
          </div>

          {/* Cards grid with scroll-driven assembly animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <FeatureCard
                key={i}
                feat={feat}
                index={i}
                scrollYProgress={featuresScrollProgress}
              />
            ))}
          </div>
        </ScrollFade>
      </section>

      {/* ── Scholarship Calculator Section ──────────────────────────────────── */}
      <section id="scholarships" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-white/10 relative z-10">
        <ScrollFade className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Text description */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-black tracking-widest text-[#7C3AED] uppercase">Interactive Estimator</span>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl leading-tight">
                Calculate Your Merit Scholarships
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                RGUSAT is dedicated to nurturing academic talent. Slide or toggle your targeted entrance test scorecard percentage below to view qualified tuition fee waiver tiers.
              </p>
              <div className="space-y-2.5 pt-4 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00C9A7] shrink-0" />
                  <span>Tuition fee waivers apply for all global courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00C9A7] shrink-0" />
                  <span>Scholarships awarded based on qualifying score</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#00C9A7] shrink-0" />
                  <span>Up to 100% tuition fee waiver available</span>
                </div>
              </div>
            </div>

            {/* Right: Slider Widget Card */}
            <div className="lg:col-span-7">
              <div className="dark-glass-card p-6 sm:p-8 shadow-2xl border border-white/10 bg-black/85 backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

                  {/* Slider Input */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target score percentage</span>
                      <span className="text-3xl font-black font-mono text-white">{score}%</span>
                    </div>

                    <div className="relative pt-2">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-teal"
                        style={{
                          background: `linear-gradient(to right, #00C9A7 0%, #00C9A7 ${(score - 50) * 2}%, rgba(255,255,255,0.1) ${(score - 50) * 2}%, rgba(255,255,255,0.1) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 font-mono">
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Fellowship Designation</p>
                      <h4 className="font-extrabold text-sm text-white mt-1">{scholarship.tier}</h4>
                    </div>
                  </div>

                  {/* Circular Indicator */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center py-4 border-t md:border-t-0 md:border-l border-white/10">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle cx="72" cy="72" r="60" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="transparent" />
                        <circle cx="72" cy="72" r="60" stroke={scholarship.col} strokeWidth="10" fill="transparent"
                          strokeDasharray="376.9"
                          strokeDashoffset={376.9 - (376.9 * scholarship.pct) / 100}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-black font-mono leading-none" style={{ color: scholarship.col }}>
                          {scholarship.pct}%
                        </span>
                        <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 mt-1">Scholarship</span>
                      </div>
                    </div>

                    <Link href="/apply" className="w-full mt-6">
                      <Button size="sm" className="w-full rounded-xl text-xs font-bold py-2 bg-gradient-to-r from-primary-teal to-primary-sky text-white border-transparent">
                        Lock in Scholarship
                      </Button>
                    </Link>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </ScrollFade>
      </section>

      {/* ── How it Works (Timeline Section) ─────────────────────────────────── */}
      <section id="process" ref={processScrollRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#050816] to-[#071028] border-t border-white/10 relative z-10 overflow-hidden">
        {/* Subtle ambient cyan lighting behind center step */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#00C9A7]/8 rounded-full blur-[100px] pointer-events-none -z-10" />

        <ScrollFade className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#00C9A7] uppercase">Timeline Checklist</span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple 5-Step Process
            </h2>
            <p className="text-slate-400 font-medium">
              Start your admission journey without manual verification blocks.
            </p>
          </div>

          <div className="relative">
            {/* Desktop Connective Line */}
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-white/10 z-0" />
            <motion.div 
              style={{ scaleX: lineScaleX, transformOrigin: "left" }}
              className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-[#00E5D4] via-[#1DA1FF] to-[#7C3AED] z-0"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
              {timelineSteps.map((proc, i) => (
                <ProcessStepCard
                  key={i}
                  proc={proc}
                  index={i}
                  processScrollProgress={processScrollProgress}
                />
              ))}
            </div>
          </div>
        </ScrollFade>
      </section>

      {/* ── Programs Offered ────────────────────────────────────────────────── */}
      <section id="programs" className="py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#071126] to-white border-t border-slate-900 relative z-10 overflow-hidden select-none">
        
        {/* Ambient glows: pastel gradient blends */}
        <div className="absolute top-12 left-1/3 w-[500px] h-[350px] bg-[#1DA1FF]/5 rounded-full blur-[110px] pointer-events-none z-0" />
        <div className="absolute bottom-12 right-1/4 w-[600px] h-[400px] bg-[#7C3AED]/4 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Giant curved glass arc on the right */}
        <div
          className="absolute -right-48 -top-24 w-[750px] h-[750px] rounded-full border border-white/15 pointer-events-none z-0 backdrop-blur-[2px]"
          style={{
            background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 70%)",
            boxShadow: "inset -15px 15px 40px rgba(255,255,255,0.03), 0 0 30px rgba(255,255,255,0.05)",
          }}
        />


        {/* Soft floating light particles */}
        {mounted && [...Array(6)].map((_, idx) => (
          <motion.div
            key={idx}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#1DA1FF]/15 pointer-events-none z-0"
            style={{
              top: `${20 + idx * 12}%`,
              left: `${10 + (idx * 17) % 80}%`,
            }}
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 5 + (idx % 2) * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <ScrollFade className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                Global Curricula
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-[0_2px_10px_rgba(0,229,212,0.15)]">
                Qualified Undergraduate Programs
              </h2>
              <p className="text-slate-400 max-w-xl font-medium">
                Choose from highly repute undergraduate pathways leading to secure corporate placements and research fellowships.
              </p>
            </div>
            <Link href="/apply" className="shrink-0">
              <Button className="rounded-xl font-bold px-6 shadow-md shadow-[#00E5D4]/10 bg-gradient-to-r from-primary-teal to-primary-sky text-white border-transparent hover:scale-105 active:scale-95 transition-all">
                Apply to any Program
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programsList.map((prog, i) => (
              <ProgramCard
                key={i}
                prog={prog}
                index={i}
              />
            ))}
          </div>
        </ScrollFade>
      </section>

      {/* ── Testimonials Section (Student Success) ──────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 relative z-10 overflow-hidden select-none">
        



        {/* Soft floating light particles */}
        {mounted && [...Array(6)].map((_, idx) => (
          <motion.div
            key={idx}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#1DA1FF]/15 pointer-events-none z-0"
            style={{
              top: `${20 + idx * 12}%`,
              left: `${10 + (idx * 17) % 80}%`,
            }}
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 5 + (idx % 2) * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <ScrollFade className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest bg-slate-200/80 text-slate-800 border border-slate-300/30 uppercase">
              Candidate Testimonials
            </span>
            <h2 className="text-3xl font-extrabold text-[#061126] sm:text-4xl">
              Student Success Stories
            </h2>
            <p className="text-slate-600 font-medium">
              Read how qualifying for merit fellowships transformed academic pathways for our graduates.
            </p>
          </div>

          <div
            ref={testimonialContainerRef}
            onScroll={handleTestimonialScroll}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar snap-x snap-mandatory relative z-10"
          >
            {testimonials.map((test, i) => {
              const isActive = activeTestimonial === i;
              return (
                <motion.div
                  key={i}
                  whileHover={{
                    y: -6,
                    scale: isActive ? 1.07 : 1.03,
                    boxShadow: "0 28px 60px rgba(0,180,200,0.14), 0 0 0 1.5px rgba(0,229,212,0.35), 0 8px 24px rgba(0,0,0,0.10)",
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className={`group min-w-[300px] sm:min-w-[360px] md:min-w-[400px] snap-center relative rounded-3xl p-8 border backdrop-blur-xl flex flex-col justify-between transition-colors duration-500 ease-out cursor-pointer ${
                    isActive
                      ? "bg-white/95 border-white shadow-[0_25px_60px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.9)] scale-105 z-20"
                      : "bg-white/70 border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.03)] scale-100 opacity-90 z-10"
                  }`}
                >
                  {/* Hover shimmer overlay */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, rgba(0,229,212,0.06) 0%, rgba(0,180,255,0.04) 50%, transparent 100%)" }} />

                  <span className="absolute top-2 right-6 text-8xl font-serif text-slate-200/40 group-hover:text-slate-300/55 pointer-events-none select-none transition-colors duration-300">"</span>

                  <div className="relative z-10">
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {[...Array(test.stars)].map((_, idx) => (
                        <Star key={idx} className="h-4.5 w-4.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                      &ldquo;{test.text}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3.5 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00C9A7] to-[#00B4FF] flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:shadow-[0_0_14px_rgba(0,229,212,0.45)] transition-shadow duration-300">
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">{test.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{test.course}</p>
                      <p className="text-[9px] text-[#00C9A7] font-black uppercase mt-0.5">{test.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-8 relative z-10">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToTestimonial(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeTestimonial === idx
                    ? "w-8 bg-[#00D4B4]"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </ScrollFade>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────── */}
      {/* Transition wrapper: white → deep navy */}
      <div
        className="relative z-10"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f0f4ff 8%, #d8e6ff 18%, #b8d0f5 28%, #7ba7e8 40%, #3d6fa8 52%, #1a3a6b 63%, #0d2247 74%, #071530 84%, #050f24 93%, #050816 100%)",
        }}
      >
        {/* Soft top-glow bridging from testimonials */}
        <div
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(147,197,253,0.25) 0%, transparent 100%)",
          }}
        />

        <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

          {/* Ambient glows */}
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,229,212,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)", filter: "blur(70px)" }} />

          {/* Floating particles */}
          {mounted && [...Array(8)].map((_, idx) => (
            <motion.div
              key={`faq-p-${idx}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: idx % 2 === 0 ? "3px" : "2px",
                height: idx % 2 === 0 ? "3px" : "2px",
                top: `${10 + idx * 11}%`,
                left: `${5 + (idx * 13) % 90}%`,
                background: idx % 3 === 0 ? "rgba(0,229,212,0.5)" : idx % 3 === 1 ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.3)",
              }}
              animate={{ y: [0, -14, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 5 + idx * 0.7, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          <ScrollFade className="mx-auto max-w-4xl relative z-10">

            {/* ── Dark frosted heading panel for guaranteed readability ── */}
            <div className="relative mb-16">
              <div
                className="absolute inset-0 -mx-8 -my-6 rounded-3xl pointer-events-none"
                style={{
                  background: "linear-gradient(160deg, rgba(8,18,38,0.88) 0%, rgba(11,18,32,0.82) 100%)",
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 0 60px rgba(0,229,212,0.04), 0 32px 64px rgba(0,0,0,0.35)",
                }}
              />
              <div className="relative z-10 text-center space-y-4 py-6 px-8">
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(167,100,255,0.12) 100%)",
                    color: "#c4b5fd",
                    border: "1px solid rgba(139,92,246,0.45)",
                    boxShadow: "0 0 16px rgba(124,58,237,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
                    letterSpacing: "0.15em",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Common Inquiries
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 }}
                  className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                  style={{
                    color: "#ffffff",
                    textShadow: "0 2px 24px rgba(0,229,212,0.18), 0 0 60px rgba(124,58,237,0.15)",
                  }}
                >
                  Frequently Asked Questions
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.14 }}
                  className="text-sm sm:text-base font-medium max-w-xl mx-auto"
                  style={{ color: "#cbd5e1" }}
                >
                  Find solutions to queries regarding exams, fees, mock-tests, and results.
                </motion.p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group rounded-2xl overflow-hidden"
                    whileHover={!isOpen ? {
                      boxShadow: "0 0 28px rgba(0,229,212,0.10), 0 16px 40px rgba(0,0,0,0.40)",
                    } : {}}
                    style={{
                      background: isOpen
                        ? "linear-gradient(160deg, #0d1a32 0%, #0b1220 100%)"
                        : "linear-gradient(160deg, rgba(13,26,50,0.88) 0%, rgba(11,18,32,0.80) 100%)",
                      border: isOpen
                        ? "1px solid rgba(0,229,212,0.30)"
                        : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isOpen
                        ? "0 0 28px rgba(0,229,212,0.12), 0 20px 48px rgba(0,0,0,0.45)"
                        : "0 8px 24px rgba(0,0,0,0.30)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      transition: "border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
                    }}
                  >
                    {/* Top cyan accent line when active */}
                    {isOpen && (
                      <div className="h-px w-full"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.60) 30%, rgba(0,229,212,0.70) 60%, transparent 100%)" }} />
                    )}
                    {/* Left accent bar on hover (non-open) */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "linear-gradient(180deg, rgba(0,229,212,0.5) 0%, rgba(124,58,237,0.5) 100%)" }} />
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <span
                        className="text-sm sm:text-[15px] font-bold leading-snug pr-4 transition-colors duration-300"
                        style={{ color: isOpen ? "#00E5D4" : "#f1f5f9" }}
                      >
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: isOpen ? "rgba(0,229,212,0.16)" : "rgba(255,255,255,0.07)",
                          border: isOpen ? "1px solid rgba(0,229,212,0.35)" : "1px solid rgba(255,255,255,0.12)",
                          boxShadow: isOpen ? "0 0 10px rgba(0,229,212,0.20)" : "none",
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" style={{ color: isOpen ? "#00E5D4" : "#94a3b8" }} />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-[13px] leading-relaxed font-medium"
                        style={{ color: "#cbd5e1", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="pt-4">{faq.a}</div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollFade>
        </section>


        {/* ── Call to Action — Visual Climax ───────────────────────────────── */}
        <section className="relative py-36 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">

          {/* Deep radial cyan megaglow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,229,212,0.12) 0%, rgba(0,100,180,0.06) 45%, transparent 80%)" }} />

          {/* Aurora left sweep */}
          <div className="absolute -left-32 top-0 bottom-0 w-[500px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse 100% 80% at 0% 50%, rgba(0,229,212,0.07) 0%, transparent 70%)" }} />
          {/* Aurora right sweep */}
          <div className="absolute -right-32 top-0 bottom-0 w-[500px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse 100% 80% at 100% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />

          {/* Animated star field */}
          {mounted && [...Array(28)].map((_, idx) => (
            <motion.div
              key={`star-${idx}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: idx % 4 === 0 ? "2.5px" : "1.5px",
                height: idx % 4 === 0 ? "2.5px" : "1.5px",
                top: `${(idx * 37) % 100}%`,
                left: `${(idx * 29 + 7) % 100}%`,
                background: idx % 5 === 0 ? "rgba(0,229,212,0.7)" : "rgba(255,255,255,0.45)",
              }}
              animate={{
                opacity: [0.2, idx % 3 === 0 ? 1 : 0.7, 0.2],
                scale: [1, idx % 4 === 0 ? 1.8 : 1.3, 1],
              }}
              transition={{ duration: 3 + (idx % 5) * 1.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.15 }}
            />
          ))}

          {/* Floating geometric shapes */}
          {mounted && (
            <>
              <motion.div
                className="absolute top-12 left-16 w-16 h-16 rounded-2xl pointer-events-none"
                style={{ background: "rgba(0,229,212,0.05)", border: "1px solid rgba(0,229,212,0.15)", backdropFilter: "blur(4px)" }}
                animate={{ y: [0, -12, 0], rotate: [12, 20, 12] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-16 right-20 w-12 h-12 rounded-xl pointer-events-none"
                style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)", backdropFilter: "blur(4px)" }}
                animate={{ y: [0, 10, 0], rotate: [-8, -16, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              <motion.div
                className="absolute top-1/2 right-12 w-8 h-8 rounded-lg pointer-events-none"
                style={{ background: "rgba(0,180,255,0.05)", border: "1px solid rgba(0,180,255,0.15)" }}
                animate={{ y: [0, -8, 0], rotate: [5, 15, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              />
            </>
          )}

          <ScrollFade className="mx-auto max-w-4xl text-center space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <span
                className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
                style={{
                  background: "rgba(0,229,212,0.10)",
                  color: "#67e8f9",
                  border: "1px solid rgba(0,229,212,0.25)",
                  boxShadow: "0 0 14px rgba(0,229,212,0.18)",
                }}
              >
                Applications Open 2026–27
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]"
              style={{
                color: "#ffffff",
                textShadow: "0 0 60px rgba(0,229,212,0.20), 0 4px 20px rgba(0,0,0,0.5)",
              }}
            >
              Begin Your Academic
              <br />
              <span style={{
                background: "linear-gradient(135deg, #00E5D4 0%, #00B4FF 50%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Application Today
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              className="max-w-xl mx-auto leading-relaxed font-medium text-[15px]"
              style={{ color: "#94a3b8" }}
            >
              Register and book your preferred online examination slots. Entrance results grant merit opportunities and scholarship benefits up to 100%.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/apply" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(0,229,212,0.35), 0 16px 40px rgba(0,0,0,0.50)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm tracking-wide text-white"
                  style={{
                    background: "linear-gradient(135deg, #00C9A7 0%, #00B4FF 50%, #0066CC 100%)",
                    boxShadow: "0 0 20px rgba(0,229,212,0.20), 0 8px 32px rgba(0,0,0,0.40)",
                    border: "1px solid rgba(0,229,212,0.25)",
                  }}
                >
                  Apply Online Now
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.08)", boxShadow: "0 0 20px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.40)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm tracking-wide transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "#e2e8f0",
                  }}
                >
                  Log In to Dashboard
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32 }}
              className="flex items-center justify-center gap-8 pt-4"
            >
              {[
                { label: "25,000+ Students", icon: "✦" },
                { label: "100% Scholarship Possible", icon: "✦" },
                { label: "5-Minute Registration", icon: "✦" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "#64748b" }}>
                  <span style={{ color: "#00E5D4", fontSize: "8px" }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </motion.div>
          </ScrollFade>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer id="footer" className="relative z-10 overflow-hidden"
          style={{ background: "linear-gradient(180deg, #050f24 0%, #050816 100%)", borderTop: "1px solid rgba(0,229,212,0.08)" }}>

          {/* Top cyan glow divider */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,212,0.30), rgba(0,180,255,0.20), transparent)" }} />
          <div className="absolute top-0 left-1/4 right-1/4 h-8 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,229,212,0.06) 0%, transparent 100%)" }} />

          {/* Subtle footer floating particles */}
          {mounted && [...Array(10)].map((_, idx) => (
            <motion.div
              key={`fp-${idx}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "2px", height: "2px",
                top: `${(idx * 41) % 100}%`,
                left: `${(idx * 31 + 5) % 100}%`,
                background: idx % 2 === 0 ? "rgba(0,229,212,0.25)" : "rgba(255,255,255,0.15)",
              }}
              animate={{ y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 6 + idx * 0.5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
            />
          ))}

          {/* Ambient corner glows */}
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,229,212,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)", filter: "blur(50px)" }} />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

              {/* Brand Column */}
              <div className="md:col-span-2 space-y-5">
                <div className="flex items-center">
                  <img src="/logo.png" alt="Rathinam Global University"
                    className="h-11 w-auto object-contain" />
                </div>
                <p className="text-xs leading-relaxed max-w-sm" style={{ color: "#475569" }}>
                  Empowering future leaders through advanced computational sciences, global standards, and research-focused undergraduate curricula. Secure your path today.
                </p>
                <div className="space-y-2.5 pt-1 text-[11px]" style={{ color: "#475569" }}>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 flex-none" style={{ color: "#00E5D4" }} />
                    <span>Rathinam Techzone Campus, Pollachi Main Rd, Coimbatore, Tamil Nadu 641021</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 flex-none" style={{ color: "#00E5D4" }} />
                    <a href="mailto:admissions@rathinamglobal.edu"
                      className="transition-colors hover:text-slate-200">admissions@rathinamglobal.edu</a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 flex-none" style={{ color: "#00E5D4" }} />
                    <a href="tel:+914224040900"
                      className="transition-colors hover:text-slate-200">+91 (422) 4040 900</a>
                  </div>
                </div>
              </div>

              {/* Admissions */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Admissions</h4>
                <ul className="space-y-2.5 text-[12px] font-semibold" style={{ color: "#475569" }}>
                  {[
                    { label: "Apply Online", href: "/apply" },
                    { label: "Admission Status", href: "/login" },
                    { label: "Academic Programs", href: "#programs" },
                    { label: "Admission Steps", href: "#process" },
                    { label: "Fee Structure", href: "#faq" },
                  ].map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-slate-300">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portals */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Portals</h4>
                <ul className="space-y-2.5 text-[12px] font-semibold" style={{ color: "#475569" }}>
                  {[
                    { label: "Student Console", href: "/login" },
                    { label: "Administrative Panel", href: "/admin/login" },
                    { label: "Examination Room", href: "/exam" },
                    { label: "Scorecard Portal", href: "/results" },
                    { label: "Practice Platform", href: "/mock-test" },
                  ].map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-slate-300">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Support</h4>
                <ul className="space-y-2.5 text-[12px] font-semibold" style={{ color: "#475569" }}>
                  {[
                    { label: "Help Desk", href: "#" },
                    { label: "Technical Guidelines", href: "#" },
                    { label: "Terms of Service", href: "#" },
                    { label: "Privacy Charter", href: "#" },
                    { label: "SLA & Refund Policy", href: "#" },
                  ].map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="transition-colors hover:text-slate-300">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] gap-4"
              style={{ color: "#334155" }}>
              <p>© 2026 Rathinam Global University. All rights reserved. Powered by RGUSAT Admission Engine.</p>
              <div className="flex gap-6">
                {["Terms of Use", "Privacy Policy", "Cookie Settings"].map(t => (
                  <Link key={t} href="#" className="transition-colors hover:text-slate-400">{t}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
