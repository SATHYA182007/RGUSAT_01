"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { statesData } from "@/lib/india_locations";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { logActivity } from "@/services/activityLogger";
import { sendNotification } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GraduationCap, ArrowLeft, ArrowRight, CheckCircle2, User, BookOpen, Layers, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    state: "",
    city: "",
    // Step 2
    schoolName: "",
    board: "",
    percentage: "",
    // Step 3
    courseApplied: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Full Name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        newErrors.phone = "Phone must be exactly 10 digits";
      }
      if (!formData.dob) newErrors.dob = "Date of Birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.city) newErrors.city = "City is required";
    } else if (step === 2) {
      if (!formData.schoolName.trim()) newErrors.schoolName = "School Name is required";
      if (!formData.board) newErrors.board = "Educational Board is required";
      if (!formData.percentage) {
        newErrors.percentage = "Percentage is required";
      } else {
        const pct = parseFloat(formData.percentage);
        if (isNaN(pct) || pct < 0 || pct > 100) {
          newErrors.percentage = "Percentage must be between 0 and 100";
        }
      }
    } else if (step === 3) {
      if (!formData.courseApplied) newErrors.courseApplied = "Please select a course";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please fix the validation errors before proceeding.");
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "state") {
        updated.city = ""; // Reset city when state changes
      }
      return updated;
    });
    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        if (name === "state") {
          delete updated.city;
        }
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Generate unique Application ID: RGU-2026-XXXXX
      const randomId = Math.floor(10000 + Math.random() * 90000);
      const applicationId = `RGU-2026-${randomId}`;

      // 2. Prepare database document
      const applicationDoc = {
        applicationId,
        personalInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          state: formData.state,
          city: formData.city,
        },
        academicInfo: {
          schoolName: formData.schoolName,
          board: formData.board,
          percentage: parseFloat(formData.percentage),
        },
        courseApplied: formData.courseApplied,
        status: "submitted",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(), // Use simple ISO string to prevent client-server de-sync
      };

      // 3. Write application to Firestore applications collection
      await setDoc(doc(db, "applications", applicationId), applicationDoc);

      // 4. Log the activity
      await logActivity(
        applicationId,
        formData.email,
        "Application Submitted",
        `Submitted application for ${formData.courseApplied}. ID: ${applicationId}`
      );

      // 5. Send notification to admin
      await sendNotification(
        "admin",
        "New Application Submitted",
        `Application ${applicationId} submitted by ${formData.name} for ${formData.courseApplied}`
      );

      toast.success("Application submitted successfully!");
      
      // 6. Redirect to payment portal
      router.push(`/payment?appId=${applicationId}`);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const courses = [
    { value: "B.Tech Computer Science & AI", label: "B.Tech Computer Science & AI" },
    { value: "BBA Business Analytics & Fintech", label: "BBA Business Analytics & Fintech" },
    { value: "B.Sc Data Analytics", label: "B.Sc Data Analytics" },
    { value: "B.Des Digital Product Architecture", label: "B.Des Digital Product Architecture" },
  ];

  const boards = [
    { value: "CBSE", label: "CBSE (Central Board of Secondary Education)" },
    { value: "ICSE", label: "ICSE / ISC (Indian Certificate of Secondary Education)" },
    { value: "State Board", label: "State Board" },
    { value: "IB / Other International", label: "IB / Other International" },
  ];

  const stepsList = [
    { id: 1, title: "Personal Details", icon: User },
    { id: 2, title: "Academic Background", icon: BookOpen },
    { id: 3, title: "Course Selection", icon: Layers },
    { id: 4, title: "Review & Submit", icon: ClipboardCheck },
  ];

  return (
    <div className="relative h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style>{`
        @keyframes gridMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 40px 40px;
          }
        }
        .animate-grid-move {
          animation: gridMove 6s linear infinite;
        }
      `}</style>

      {/* Moving Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 animate-grid-move" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 160, 220, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 190, 155, 0.22) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Return to Website */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors group z-10">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Website
      </Link>

      {/* Sprayed Gradient Glows (Teal & Sky Blue) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00C9A7]/12 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00B4FF]/12 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#00C9A7]/8 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] rounded-full bg-[#00B4FF]/10 blur-[130px] pointer-events-none z-0" />

      {/* Header Branding */}
      <div className="mb-4 flex flex-col items-center">
        <div className="mb-2">
          <img
            src="/logo.jpg"
            alt="Rathinam Global University"
            className="h-10 w-auto object-contain mx-auto"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight text-center">
          Rathinam Global Admissions 2026
        </h2>
        <p className="text-xs text-teal-600 font-medium mt-0.5">
          Complete the 4-step admission application form
        </p>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Step Indicator Panel */}
        <div className="bg-white/90 backdrop-blur-md border border-white/70 shadow-lg shadow-teal-500/5 rounded-3xl px-4 py-2.5 mb-3 flex items-center w-full justify-between">
          {stepsList.map((s, idx) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <Fragment key={s.id}>
                {/* Step pill */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "btn-primary-gradient text-white scale-110 shadow-md"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold leading-tight transition-colors duration-300 whitespace-nowrap ${
                      isActive ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {/* Connector line — shown between steps, not after the last */}
                {idx < stepsList.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 rounded-full bg-slate-200 min-w-[8px]" />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Form Content Card */}
        <Card className="border border-white/60 shadow-2xl shadow-teal-500/5 bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle>{stepsList[step - 1].title}</CardTitle>
            <CardDescription>
              {step === 1 && "Provide your basic contact and demographic details."}
              {step === 2 && "Enter your high school academic credentials."}
              {step === 3 && "Select the undergraduate program you wish to pursue."}
              {step === 4 && "Review your entered parameters before saving your submission."}
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* STEP 1: PERSONAL INFORMATION */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          className={errors.name ? "border-rose-500" : ""}
                        />
                        {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="johndoe@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? "border-rose-500" : ""}
                        />
                        {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? "border-rose-500" : ""}
                        />
                        {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="dob">Date of Birth *</Label>
                        <Input
                          id="dob"
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleChange}
                          className={errors.dob ? "border-rose-500" : ""}
                        />
                        {errors.dob && <p className="text-xs text-rose-500 font-medium">{errors.dob}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        id="gender"
                        name="gender"
                        placeholder="Select Gender"
                        value={formData.gender}
                        onChange={handleChange}
                        options={[
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                          { value: "Other", label: "Other" },
                        ]}
                        className={errors.gender ? "border-rose-500" : ""}
                      />
                      {errors.gender && <p className="text-xs text-rose-500 font-medium">{errors.gender}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="state">State *</Label>
                        <Select
                          id="state"
                          name="state"
                          placeholder="Select State"
                          value={formData.state}
                          onChange={handleChange}
                          options={Object.keys(statesData).map((st) => ({
                            value: st,
                            label: st,
                          }))}
                          className={errors.state ? "border-rose-500" : ""}
                        />
                        {errors.state && <p className="text-xs text-rose-500 font-medium">{errors.state}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="city">City *</Label>
                        <Select
                          id="city"
                          name="city"
                          placeholder={formData.state ? "Select City" : "Choose a state first"}
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!formData.state}
                          options={
                            formData.state
                              ? Array.from(new Set(statesData[formData.state as keyof typeof statesData] || [])).map((ct) => ({
                                  value: ct,
                                  label: ct,
                                }))
                              : []
                          }
                          className={errors.city ? "border-rose-500" : ""}
                        />
                        {errors.city && <p className="text-xs text-rose-500 font-medium">{errors.city}</p>}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2: ACADEMIC INFORMATION */}
                {step === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="schoolName">High School / Junior College Name *</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        placeholder="Greenwood High School"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className={errors.schoolName ? "border-rose-500" : ""}
                      />
                      {errors.schoolName && (
                        <p className="text-xs text-rose-500 font-medium">{errors.schoolName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="board">Educational Board *</Label>
                        <Select
                          id="board"
                          name="board"
                          placeholder="Select Board"
                          value={formData.board}
                          onChange={handleChange}
                          options={boards}
                          className={errors.board ? "border-rose-500" : ""}
                        />
                        {errors.board && <p className="text-xs text-rose-500 font-medium">{errors.board}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="percentage">Class 12th Percentage (%) *</Label>
                        <Input
                          id="percentage"
                          name="percentage"
                          type="number"
                          step="0.01"
                          placeholder="89.5"
                          value={formData.percentage}
                          onChange={handleChange}
                          className={errors.percentage ? "border-rose-500" : ""}
                        />
                        {errors.percentage && (
                          <p className="text-xs text-rose-500 font-medium">{errors.percentage}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3: COURSE SELECTION */}
                {step === 3 && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="courseApplied">Select Degree Program *</Label>
                      <Select
                        id="courseApplied"
                        name="courseApplied"
                        placeholder="Choose Course"
                        value={formData.courseApplied}
                        onChange={handleChange}
                        options={courses}
                        className={errors.courseApplied ? "border-rose-500" : ""}
                      />
                      {errors.courseApplied && (
                        <p className="text-xs text-rose-500 font-medium">{errors.courseApplied}</p>
                      )}
                    </div>

                    {formData.courseApplied && (
                      <div className="p-4 bg-primary-teal/5 border border-primary-teal/10 rounded-2xl text-sm text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 block mb-1">Program Overview</span>
                        You have selected the <strong>{formData.courseApplied}</strong> pathway. The corresponding RGUSAT assessment will focus on basic Quantitative Aptitude, Logical Reasoning, and Verbal Comprehension.
                      </div>
                    )}
                  </>
                )}

                {/* STEP 4: REVIEW & SUBMIT */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <span className="text-slate-500">Name:</span>
                          <span className="text-slate-800 font-semibold">{formData.name}</span>
                          <span className="text-slate-500">Email:</span>
                          <span className="text-slate-800 font-semibold">{formData.email}</span>
                          <span className="text-slate-500">Phone:</span>
                          <span className="text-slate-800 font-semibold">{formData.phone}</span>
                          <span className="text-slate-500">D.O.B:</span>
                          <span className="text-slate-800 font-semibold">{formData.dob}</span>
                          <span className="text-slate-500">Gender:</span>
                          <span className="text-slate-800 font-semibold">{formData.gender}</span>
                          <span className="text-slate-500">State:</span>
                          <span className="text-slate-800 font-semibold">{formData.state}</span>
                          <span className="text-slate-500">City:</span>
                          <span className="text-slate-800 font-semibold">{formData.city}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Academic Information
                        </h4>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <span className="text-slate-500">School:</span>
                          <span className="text-slate-800 font-semibold">{formData.schoolName}</span>
                          <span className="text-slate-500">Board:</span>
                          <span className="text-slate-800 font-semibold">{formData.board}</span>
                          <span className="text-slate-500">Percentage:</span>
                          <span className="text-slate-800 font-semibold">{formData.percentage}%</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Selected Course
                        </h4>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <span className="text-slate-500">Course Applied:</span>
                          <span className="text-slate-800 font-semibold text-primary-teal">
                            {formData.courseApplied}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-700 leading-relaxed">
                      <strong>Important Notice:</strong> Submitting this form will register your admissions dossier. You will proceed to clear the entrance exam registration fee of <strong>₹999</strong> to activate your student portal credentials.
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={loading} className="rounded-xl font-semibold gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => router.push("/")} disabled={loading} className="rounded-xl font-semibold gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {step < 4 ? (
              <Button onClick={handleNext} className="rounded-xl font-semibold gap-1.5">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={loading} className="rounded-xl font-bold px-8 shadow-md">
                Submit & Pay ₹999
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
