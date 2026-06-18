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
import { motion } from "framer-motion";
import { useState } from "react";

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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [score, setScore] = useState(85);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  } as const;

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
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden flex flex-col font-sans grid-overlay text-[#0F172A]">
      
      {/* ── Background Blurred Gradient Orbs ─────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C9A7]/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-[#00B4FF]/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] bg-[#7C3AED]/5 rounded-full blur-[90px] pointer-events-none z-0" />

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
      <section className="relative min-h-[85vh] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-4xl w-full text-center space-y-6 relative">
          
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
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
          >
            Shape Your Future with <span className="text-primary-gradient">RGUSAT 2026</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
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
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl text-sm font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all">
                Student Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Section (Below Hero Fold) ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-100 bg-white/40 backdrop-blur-md relative z-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={itemVariants} 
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-md shadow-slate-100/20 flex flex-col items-center text-center group"
                >
                  <div className="p-3 bg-[#F8FAFC] rounded-xl mb-4 text-[#00C9A7] group-hover:scale-105 transition-transform duration-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{stat.sub}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose RGUSAT (Features Section) ────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#00C9A7] uppercase">Academic Excellence</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
              Next-Gen Examination &amp; Admissions
            </h2>
            <p className="text-slate-550 font-medium">
              A secure, automated system built on modern principles of integrity, transparency, and student convenience.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <div className="relative p-8 rounded-2xl border border-slate-100 bg-[#F8FAFC]/50 hover:bg-white shadow-sm hover:shadow-xl hover:shadow-slate-100/40 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col justify-between">
                    <div>
                      <div className="p-3.5 rounded-2xl w-fit mb-6 text-white bg-gradient-to-tr from-[#00C9A7] to-[#00B4FF] shadow-md shadow-[#00C9A7]/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">{feat.title}</h3>
                      <p className="text-xs text-slate-500 mt-3.5 leading-relaxed">{feat.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <span className="text-[10px] font-black uppercase text-[#00C9A7] tracking-wider group-hover:translate-x-1.5 transition-transform duration-200 flex items-center gap-1">
                        Learn More <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Scholarship Calculator Section ──────────────────────────────────── */}
      <section id="scholarships" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-[#F8FAFC] border-t border-slate-100 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text description */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-black tracking-widest text-[#7C3AED] uppercase">Interactive Estimator</span>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
                Calculate Your Merit Scholarships
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                RGUSAT is dedicated to nurturing academic talent. Slide or toggle your targeted entrance test scorecard percentage below to view qualified tuition fee waiver tiers.
              </p>
              <div className="space-y-2.5 pt-4 text-xs font-bold text-slate-650">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-[#00C9A7] shrink-0" />
                  <span>Tuition fee waivers apply for all global courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-[#00C9A7] shrink-0" />
                  <span>Renewable based on annual academic CGPA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-[#00C9A7] shrink-0" />
                  <span>Guaranteed qualifications published in official scorecards</span>
                </div>
              </div>
            </div>

            {/* Slider Widget Card */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-8 shadow-2xl border border-white bg-white/70">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left part: Slider Input */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target score percentage</span>
                      <span className="text-3xl font-black font-mono text-slate-900">{score}%</span>
                    </div>
                    
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={score} 
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-teal"
                        style={{
                          background: `linear-gradient(to right, #00C9A7 0%, #00C9A7 ${(score - 50) * 2}%, #e2e8f0 ${(score - 50) * 2}%, #e2e8f0 100%)`
                        }}
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 font-mono">
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Fellowship Designation</p>
                      <h4 className="font-extrabold text-sm text-slate-800 mt-1">{scholarship.tier}</h4>
                    </div>
                  </div>

                  {/* Right part: Circular Indicator Visual */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center text-center py-4 border-t md:border-t-0 md:border-l border-slate-100">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
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
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#00C9A7] uppercase">Timeline Checklist</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple 5-Step Process
            </h2>
            <p className="text-slate-550 font-medium">
              Start your admission journey without manual verification blocks.
            </p>
          </div>

          <div className="relative">
            {/* Desktop Connective Line */}
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-slate-100 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
              {timelineSteps.map((proc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center group bg-[#F8FAFC]/50 p-6 rounded-3xl border border-slate-50 hover:bg-white hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center text-[#00C9A7] group-hover:border-[#00C9A7] group-hover:scale-105 transition-all duration-300">
                    <span className="text-lg font-black font-mono">{proc.step}</span>
                  </div>
                  <span className="text-[10px] font-black text-[#00C9A7] mt-5 uppercase tracking-widest">
                    Step {proc.step}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">{proc.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">{proc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs Offered ────────────────────────────────────────────────── */}
      <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]/60 border-t border-slate-100 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#7C3AED] uppercase">Global Curricula</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Qualified Undergraduate Programs
              </h2>
              <p className="text-slate-500 max-w-xl font-medium">
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
                  <div className="glass-card hover:bg-white hover:shadow-xl hover:shadow-slate-100/40 hover:-translate-y-1 transition-all duration-300 border border-white p-8 h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black bg-[#00B4FF]/10 text-[#00B4FF] uppercase tracking-wider">
                          {prog.category}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{prog.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-800 group-hover:scale-110 transition-transform">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-teal transition-colors">
                          {prog.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{prog.desc}</p>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-100/50 flex justify-end">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#00C9A7] uppercase">Candidate Testimonials</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Student Success Stories
            </h2>
            <p className="text-slate-500 font-medium">
              Read how qualifying for merit fellowships transformed academic pathways for our graduates.
            </p>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar snap-x snap-mandatory">
            {testimonials.map((test, i) => (
              <div key={i} className="min-w-[300px] sm:min-w-[360px] md:min-w-[400px] glass-card p-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-100/30 transition-all duration-300 snap-center flex flex-col justify-between">
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(test.stars)].map((_, idx) => (
                      <Star key={idx} className="h-4.5 w-4.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed font-medium italic">
                    "{test.text}"
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00C9A7] to-[#00B4FF] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">{test.name}</h4>
                    <p className="text-[10px] text-slate-455 font-bold mt-0.5">{test.course}</p>
                    <p className="text-[9px] text-[#00C9A7] font-black uppercase mt-0.5">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/40 border-t border-slate-100 relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-black tracking-widest text-[#7C3AED] uppercase">Common Inquiries</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-550 font-medium">
              Find solutions to queries regarding exams, fees, mock-tests, and results.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card overflow-hidden transition-all duration-300 border border-white bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 hover:text-primary-teal transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="h-5 w-5 text-primary-teal shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-slate-500 text-xs leading-relaxed border-t border-slate-50/50 bg-[#F8FAFC]/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 text-center relative z-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl leading-tight">
            Begin Your Academic Application Today
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
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
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl border-slate-200 px-8 text-slate-700">
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
            <div className="flex items-center space-x-2 text-white">
              <div className="p-2 bg-gradient-to-tr from-[#00C9A7] to-[#00B4FF] rounded-xl text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Rathinam<span className="text-primary-teal">Global</span>
              </span>
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
