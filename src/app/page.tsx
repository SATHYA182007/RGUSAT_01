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
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useState, useRef } from "react";
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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [score, setScore] = useState(85);




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
        <div className="mx-auto max-w-7xl relative z-10">
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
        </div>
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

        <div className="mx-auto max-w-7xl relative z-20">
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
        </div>
      </section>

      {/* ── Scholarship Calculator Section ──────────────────────────────────── */}
      <section id="scholarships" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-white/10 relative z-10">
        <div className="mx-auto max-w-7xl">
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
        </div>
      </section>

      {/* ── How it Works (Timeline Section) ─────────────────────────────────── */}
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-white/10 relative z-10">
        <div className="mx-auto max-w-7xl">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
              {timelineSteps.map((proc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center group bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 hover:shadow-lg transition-all backdrop-blur-sm"
                >
                  <div className="w-16 h-16 rounded-2xl bg-black border-2 border-white/10 shadow-md flex items-center justify-center text-[#00C9A7] group-hover:border-[#00C9A7] group-hover:scale-105 transition-all duration-300">
                    <span className="text-lg font-black font-mono">{proc.step}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#00C9A7] mt-5 uppercase tracking-widest">
                    Step {proc.step}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-2">{proc.title}</h3>
                  <p className="text-xs text-slate-350 mt-2 leading-relaxed font-medium">{proc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs Offered ────────────────────────────────────────────────── */}
      <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#050816] to-[#0B1228] border-t border-white/10 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#7C3AED] uppercase">Global Curricula</span>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Qualified Undergraduate Programs
              </h2>
              <p className="text-slate-400 max-w-xl font-medium">
                Choose from highly repute undergraduate pathways leading to secure corporate placements and research fellowships.
              </p>
            </div>
            <Link href="/apply" className="shrink-0">
              <Button className="rounded-xl font-bold px-6 shadow-md shadow-[#00C9A7]/10 bg-gradient-to-r from-primary-teal to-primary-sky text-white border-transparent">
                Apply to any Program
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programsList.map((prog, i) => {
              const Icon = prog.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="dark-glass-card hover:bg-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/10 bg-white/5 p-8 h-full flex flex-col justify-between group backdrop-blur-sm">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black bg-[#00B4FF]/10 text-[#00B4FF] uppercase tracking-wider">
                          {prog.category}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{prog.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-primary-teal transition-colors">
                          {prog.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-350 leading-relaxed font-medium">{prog.desc}</p>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                      <Link href="/apply" className="text-xs font-black uppercase text-[#00C9A7] tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Initiate Application <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials Section (Student Success) ──────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0B1228] to-[#050816] border-t border-white/10 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#00C9A7] uppercase">Candidate Testimonials</span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Student Success Stories
            </h2>
            <p className="text-slate-400 font-medium">
              Read how qualifying for merit fellowships transformed academic pathways for our graduates.
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar snap-x snap-mandatory">
            {testimonials.map((test, i) => (
              <div key={i} className="min-w-[300px] sm:min-w-[360px] md:min-w-[400px] dark-glass-card p-6 border border-white/10 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 snap-center flex flex-col justify-between">
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(test.stars)].map((_, idx) => (
                      <Star key={idx} className="h-4.5 w-4.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                    &ldquo;{test.text}&rdquo;
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00C9A7] to-[#00B4FF] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">{test.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{test.course}</p>
                    <p className="text-[9px] text-[#00C9A7] font-black uppercase mt-0.5">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-white/10 relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#7C3AED] uppercase">Common Inquiries</span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 font-medium">
              Find solutions to queries regarding exams, fees, mock-tests, and results.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="dark-glass-card overflow-hidden transition-all duration-300 border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-white hover:text-primary-teal transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="h-5 w-5 text-primary-teal shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-slate-300 text-xs leading-relaxed border-t border-white/10 bg-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-white/10 text-center relative z-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
            Begin Your Academic Application Today
          </h2>
          <p className="text-slate-450 max-w-xl mx-auto leading-relaxed font-medium">
            Register and book your preferred online examination slots. Entrance results grant merit opportunities and scholarship benefits.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apply" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-xl px-8 shadow-md shadow-[#00C9A7]/10 bg-gradient-to-r from-primary-teal to-primary-sky text-white border-transparent">
                Apply Online Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl bg-transparent border-white/20 px-8 text-white hover:bg-white/10 hover:text-white transition-all">
                Log In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer id="footer" className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8 relative z-10 mt-auto">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Description Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center text-white">
              <img
                src="/logo.png"
                alt="Rathinam Global University"
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering future leaders through advanced computational sciences, global standards, and research-focused undergraduate curricula. Secure your path today.
            </p>
            <div className="space-y-2.5 pt-2 text-[11px]">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary-teal flex-none" />
                <span>Rathinam Techzone Campus, Pollachi Main Rd, Coimbatore, Tamil Nadu 641021</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary-teal flex-none" />
                <a href="mailto:admissions@rathinamglobal.edu" className="hover:text-white transition-colors">admissions@rathinamglobal.edu</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary-teal flex-none" />
                <a href="tel:+914224040900" className="hover:text-white transition-colors">+91 (422) 4040 900</a>
              </div>
            </div>
          </div>

          {/* Admissions Directory Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Admissions</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/apply" className="hover:text-white transition-colors">Apply Online</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Admission Status</Link></li>
              <li><a href="#programs" className="hover:text-white transition-colors">Academic Programs</a></li>
              <li><a href="#process" className="hover:text-white transition-colors">Admission Steps</a></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">Fee Structure</Link></li>
            </ul>
          </div>

          {/* Portals Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Portals</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/login" className="hover:text-white transition-colors">Student Console</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Administrative Panel</Link></li>
              <li><Link href="/exam" className="hover:text-white transition-colors">Examination Room</Link></li>
              <li><Link href="/results" className="hover:text-white transition-colors">Scorecard Portal</Link></li>
              <li><Link href="/mock-test" className="hover:text-white transition-colors">Practice Platform</Link></li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Support</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="#" className="hover:text-white transition-colors">Help Desk</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Technical Guidelines</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Charter</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">SLA & Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mx-auto max-w-7xl pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 Rathinam Global University. All rights reserved. Powered by RGUSAT Admission Engine.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-400">Terms of Use</Link>
            <Link href="#" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400">Cookie Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
