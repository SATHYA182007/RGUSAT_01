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
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const stats = [
  { value: "25,000+", label: "Successful Applicants", icon: Users },
  { value: "48+", label: "Global Programs", icon: Globe },
  { value: "98.7%", label: "Placement Success", icon: Award },
  { value: "₹4.5Cr+", label: "Academic Scholarships", icon: Layers },
];

const features = [
  {
    title: "AI-Proctored Examination",
    description: "Secure, reliable, and advanced online assessment console with full-screen locks and smart tracking.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible Slot Booking",
    description: "Select from multiple test dates and sessions that seamlessly align with your schedule.",
    icon: CalendarDays,
  },
  {
    title: "Instant Mock Preparation",
    description: "Try adaptive mock tests that simulate the real entrance test environment to help you prepare.",
    icon: BookOpen,
  },
  {
    title: "Comprehensive Results",
    description: "Obtain a high-fidelity breakdown of scores, rankings, and cut-off qualification statuses.",
    icon: FileText,
  },
];

const programs = [
  {
    category: "Engineering & Tech",
    title: "B.Tech Computer Science & AI",
    desc: "Develop advanced logic systems, neural computing schemas, and deep cloud databases.",
    duration: "4 Years",
  },
  {
    category: "Management Studies",
    title: "BBA Business Analytics & Fintech",
    desc: "Gain expertise in quantitative modeling, market operations, and digital ledger systems.",
    duration: "3 Years",
  },
  {
    category: "Advanced Sciences",
    title: "B.Sc Data Analytics",
    desc: "Master mathematical analysis, deep learning, statistical computation, and big data.",
    duration: "3 Years",
  },
  {
    category: "Design & Arts",
    title: "B.Des Digital Product Architecture",
    desc: "Learn modern interface principles, human-centered design systems, and interaction physics.",
    duration: "4 Years",
  },
];

const faqs = [
  {
    q: "What is RGUSAT 2026?",
    a: "Rathinam Global University Scholastic Aptitude Test (RGUSAT) is the mandatory gateway entrance test for securing admission and scholarships across undergraduate and postgraduate programs.",
  },
  {
    q: "What is the application and exam registration fee?",
    a: "The registration fee is a one-time non-refundable payment of ₹999. It grants access to slot booking, mock preparation, and official entrance exams.",
  },
  {
    q: "How does the exam slot booking work?",
    a: "After successful payment, students gain access to the Slot Booking portal where they can choose a date and time session that suits them. Once selected, capacities update in real-time.",
  },
  {
    q: "Can I take mock tests before the final exam?",
    a: "Yes! Students can take mock tests on their dashboard to get familiar with the test interface and question formatting.",
  },
  {
    q: "What are the rules during the official exam?",
    a: "The official exam requires a stable internet connection. It is taken in full-screen proctored mode. Closing full-screen or switching windows is prohibited and is flagged immediately.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  } as const;

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Background glow effects */}
      <div className="glow-bg w-[400px] h-[400px] bg-primary-teal top-10 left-[-100px]" />
      <div className="glow-bg w-[500px] h-[500px] bg-primary-sky bottom-20 right-[-150px]" />

      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center z-10 relative my-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary-teal/10 text-primary-teal mb-6 border border-primary-teal/20 uppercase tracking-widest">
              Admissions Open 2026-27
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight"
          >
            Shape Your Future with <span className="text-primary-gradient">RGUSAT 2026</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed"
          >
            Rathinam Global University Scholastic Aptitude Test (RGUSAT) 2026 is your gateway to world-class education. Secure admissions, qualify for up to 100% merit scholarships, book flexible exam slots, and practice with advanced proctored mock assessments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/apply">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm font-semibold shadow-lg shadow-primary-teal/20 transition-all duration-200 hover:scale-[1.02]">
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                Student Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-slate-50/50 border-y border-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={itemVariants} className="p-4 flex flex-col items-center">
                  <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl mb-4 text-primary-teal">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Next-Gen Examination Experience
            </h2>
            <p className="mt-4 text-slate-500">
              Built on modern principles of integrity, transparency, and student convenience.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card hoverable className="h-full flex flex-col justify-between">
                    <CardContent className="pt-6">
                      <div className="p-3 bg-gradient-to-tr from-primary-teal/10 to-primary-sky/10 text-primary-teal rounded-2xl w-fit mb-6">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                      <p className="text-sm text-slate-500 mt-3 leading-relaxed">{feat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Programs Offered */}
      <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/30 border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Programs Offered
              </h2>
              <p className="mt-4 text-slate-500 max-w-xl">
                Choose from undergraduate pathways leading to secure research fellowships and career placements.
              </p>
            </div>
            <Link href="/apply" className="mt-4 md:mt-0">
              <Button className="rounded-xl font-semibold">
                Apply to any Program
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((prog, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Card hoverable className="h-full flex flex-col justify-between border border-slate-100">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-sky/10 text-primary-sky uppercase tracking-wider">
                        {prog.category}
                      </span>
                      <span className="text-sm text-slate-400 font-semibold">{prog.duration}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{prog.title}</h3>
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed">{prog.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple 5-Step Process
            </h2>
            <p className="mt-4 text-slate-500">
              Start your admission journey without manual verification blocks.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
              {[
                { step: "01", title: "Apply Online", desc: "Fill personal/academic details", icon: FileText },
                { step: "02", title: "Secure Payment", desc: "Pay ₹999 entrance fee", icon: CreditCard },
                { step: "03", title: "Book Exam Slot", desc: "Choose date & time slot", icon: CalendarDays },
                { step: "04", title: "Take Assessment", desc: "Interactive online exams", icon: Clock },
                { step: "05", title: "Check Scorecard", desc: "Download qualified result", icon: Award },
              ].map((proc, i) => {
                const Icon = proc.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex flex-col items-center text-center group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center text-primary-teal group-hover:border-primary-teal transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-primary-teal mt-4 uppercase tracking-widest">
                      Step {proc.step}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{proc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 px-4 leading-normal">{proc.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/30 border-t border-slate-100">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-slate-500">
              Find solutions to queries regarding exams, fees, and results.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card overflow-hidden transition-all duration-300 border border-slate-100"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-800 hover:text-primary-teal transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="h-5 w-5 text-primary-teal" />
                  ) : (
                    <Plus className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-slate-500 text-sm leading-relaxed border-t border-slate-50/50 bg-slate-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 text-center relative">
        <div className="glow-bg w-[300px] h-[300px] bg-primary-teal/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="mx-auto max-w-4xl relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Begin your academic application today
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-relaxed">
            Register and book your preferred online examination slots. Entrance results grant merit opportunities and scholarship benefits.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apply">
              <Button size="lg" className="w-full sm:w-auto rounded-xl">
                Apply Online Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl border-slate-200">
                Log In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Description Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="p-2 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-xl text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Rathinam<span className="text-primary-teal">Global</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering future leaders through advanced computational sciences, global standards, and research-focused undergraduate curricula. Secure your path today.
            </p>
            <div className="space-y-2.5 pt-2 text-xs">
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
            <ul className="space-y-2 text-sm">
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
            <ul className="space-y-2 text-sm">
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
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Help Desk</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Technical Guidelines</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Charter</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">SLA & Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mx-auto max-w-7xl pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
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
