"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { logActivity } from "@/services/activityLogger";
import { sendNotification } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldCheck, CheckCircle2, User, Key, Mail, Phone, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ApplicationDetails {
  applicationId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
  };
  courseApplied: string;
  paymentStatus: string;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");

  const [loadingApp, setLoadingApp] = useState(true);
  const [appDetails, setAppDetails] = useState<ApplicationDetails | null>(null);
  
  // Checkout flow state
  // 1 = Enter Card Details, 2 = Create Account Password, 3 = Completed
  const [flowStep, setFlowStep] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Form values
  const [cardData, setCardData] = useState({
    cardholder: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  
  const [accountData, setAccountData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!appId) {
      setLoadingApp(false);
      return;
    }

    const fetchApp = async () => {
      try {
        const appRef = doc(db, "applications", appId);
        const appSnap = await getDoc(appRef);
        if (appSnap.exists()) {
          const data = appSnap.data() as ApplicationDetails;
          if (data.paymentStatus === "paid") {
            toast.info("This application has already been paid. Redirecting to login.");
            router.push("/login");
            return;
          }
          setAppDetails(data);
        } else {
          toast.error("Application not found.");
        }
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error("Error loading application details.");
      } finally {
        setLoadingApp(false);
      }
    };

    fetchApp();
  }, [appId, router]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === "number") {
      value = value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim().substring(0, 19);
    }
    if (name === "expiry") {
      value = value.replace(/\//g, "").replace(/(\d{2})/g, "$1/").trim().substring(0, 5);
      if (value.endsWith("/")) value = value.slice(0, -1);
    }
    if (name === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 3);
    }
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    if (!cardData.cardholder.trim()) newErrors.cardholder = "Name on card is required";
    if (cardData.number.replace(/\s/g, "").length !== 16) {
      newErrors.number = "Card number must be 16 digits";
    }
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = "Use MM/YY format";
    }
    if (cardData.cvv.length !== 3) {
      newErrors.cvv = "CVV must be 3 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAccount = () => {
    const newErrors: Record<string, string> = {};
    if (accountData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (accountData.password !== accountData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProcessPayment = () => {
    if (!validateCard()) return;
    setProcessingPayment(true);

    // Simulate payment transaction
    setTimeout(() => {
      setProcessingPayment(false);
      setFlowStep(2);
      toast.success("Payment of ₹999 Authorized successfully!");
    }, 2000);
  };

  const handleCreateAccount = async () => {
    if (!validateAccount() || !appDetails) return;
    setProcessingPayment(true);

    try {
      const email = appDetails.personalInfo.email;
      const password = accountData.password;

      // 1. Create Firebase Auth account
      const authUserCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = authUserCred.user.uid;

      // 2. Create document in payments collection
      const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      const paymentDoc = {
        paymentId,
        applicationId: appDetails.applicationId,
        amount: 999,
        currency: "INR",
        status: "success",
        email,
        transactionRef: `tx_${Math.random().toString(36).substring(2, 12)}`,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "payments", paymentId), paymentDoc);

      // 3. Update application paymentStatus = paid
      await updateDoc(doc(db, "applications", appDetails.applicationId), {
        paymentStatus: "paid",
      });

      // 4. Create user profile document in users collection
      const userDoc = {
        uid,
        email,
        name: appDetails.personalInfo.name,
        role: "student",
        phone: appDetails.personalInfo.phone,
        dob: appDetails.personalInfo.dob,
        gender: appDetails.personalInfo.gender,
        applicationId: appDetails.applicationId,
        slotBooked: false,
        examCompleted: false,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", uid), userDoc);

      // 5. Log activity
      await logActivity(
        uid,
        email,
        "Payment Completed",
        `Cleared registration fee of ₹999 for application ${appDetails.applicationId}. Account created.`
      );

      // 6. Send notifications
      await sendNotification(
        uid,
        "Payment Processed & Registration Completed",
        "Your payment of ₹999 was processed successfully. Please navigate to Slot Booking to select an exam window."
      );
      await sendNotification(
        "admin",
        "Student Registration Complete",
        `Student ${appDetails.personalInfo.name} registered. App ID: ${appDetails.applicationId}`
      );

      toast.success("Account created successfully. Logging you in...");
      setFlowStep(3);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Error creating student credentials:", error);
      toast.error(error.message || "Failed to finalize account. Please check inputs.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loadingApp) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary-teal" />
        <p className="text-sm text-slate-500 font-semibold mt-4">Verifying application details...</p>
      </div>
    );
  }

  if (!appId || !appDetails) {
    return (
      <Card className="max-w-md w-full border border-slate-100 shadow-xl">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full w-fit mx-auto">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Invalid Payment Request</CardTitle>
          <CardDescription>
            We could not locate a matching application ID. Please ensure the link is correct or apply again.
          </CardDescription>
          <Button onClick={() => router.push("/apply")} className="w-full rounded-xl">
            Start New Application
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left Column: Application Summary */}
      <div className="md:col-span-5 space-y-6">
        <Card className="border border-slate-100 shadow-xl shadow-slate-100/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Application Summary
              </span>
              <Badge variant="warning">Payment Pending</Badge>
            </div>
            <CardTitle className="text-xl mt-2">{appDetails.personalInfo.name}</CardTitle>
            <CardDescription>{appDetails.applicationId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="h-4 w-4 text-primary-teal shrink-0" />
              <span className="truncate">{appDetails.personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="h-4 w-4 text-primary-teal shrink-0" />
              <span>{appDetails.personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="h-4 w-4 text-primary-teal shrink-0" />
              <span>D.O.B: {appDetails.personalInfo.dob}</span>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Course Applied
              </span>
              <p className="font-bold text-slate-800">{appDetails.courseApplied}</p>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2 bg-slate-50/50 p-4 rounded-2xl">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Admission Fee</span>
                <span>₹999.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Checkout Interactive Steps */}
      <div className="md:col-span-7">
        <AnimatePresence mode="wait">
          {/* STEP 1: CARD CHECKOUT */}
          {flowStep === 1 && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Card className="border border-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary-teal" />
                    Enter Card Details
                  </CardTitle>
                  <CardDescription>
                    Fill in your credit/debit card information to clear the application fee.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardholder">Cardholder Name</Label>
                    <Input
                      id="cardholder"
                      name="cardholder"
                      placeholder="JOHN DOE"
                      value={cardData.cardholder}
                      onChange={handleCardChange}
                      className={errors.cardholder ? "border-rose-500" : ""}
                    />
                    {errors.cardholder && <p className="text-xs text-rose-500 font-medium">{errors.cardholder}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="number">Card Number</Label>
                    <Input
                      id="number"
                      name="number"
                      placeholder="4111 2222 3333 4444"
                      value={cardData.number}
                      onChange={handleCardChange}
                      className={errors.number ? "border-rose-500" : ""}
                    />
                    {errors.number && <p className="text-xs text-rose-500 font-medium">{errors.number}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="expiry">Expiration Date</Label>
                      <Input
                        id="expiry"
                        name="expiry"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={handleCardChange}
                        className={errors.expiry ? "border-rose-500" : ""}
                      />
                      {errors.expiry && <p className="text-xs text-rose-500 font-medium">{errors.expiry}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="password"
                        placeholder="•••"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        className={errors.cvv ? "border-rose-500" : ""}
                      />
                      {errors.cvv && <p className="text-xs text-rose-500 font-medium">{errors.cvv}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleProcessPayment}
                    isLoading={processingPayment}
                    className="w-full rounded-xl font-bold py-3 shadow-md"
                  >
                    Pay ₹999.00 Securely
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: CREATE PORTAL PASSWORD */}
          {flowStep === 2 && (
            <motion.div
              key="auth-creation"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Card className="border border-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary-teal" />
                    Configure Student Account
                  </CardTitle>
                  <CardDescription>
                    Payment validated! Configure a password to access your RGUSAT Student Dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-xs text-emerald-700 font-medium leading-relaxed">
                    Account Email: <strong>{appDetails.personalInfo.email}</strong>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Account Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={accountData.password}
                      onChange={handleAccountChange}
                      className={errors.password ? "border-rose-500" : ""}
                    />
                    {errors.password && <p className="text-xs text-rose-500 font-medium">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={accountData.confirmPassword}
                      onChange={handleAccountChange}
                      className={errors.confirmPassword ? "border-rose-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleCreateAccount}
                    isLoading={processingPayment}
                    className="w-full rounded-xl font-bold py-3 shadow-md"
                  >
                    Activate Credentials & Login
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: REGISTRATION COMPLETED */}
          {flowStep === 3 && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="border border-slate-100 shadow-xl">
                <CardContent className="pt-12 pb-8 space-y-4">
                  <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full w-fit mx-auto scale-110">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <CardTitle className="text-2xl">Registration Confirmed!</CardTitle>
                  <CardDescription className="max-w-md mx-auto">
                    Your payment was successfully received and your Student Credentials have been activated. Logging you in to your dashboard...
                  </CardDescription>
                  <div className="pt-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-teal mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="relative min-h-screen bg-slate-50/50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="glow-bg w-[300px] h-[300px] bg-primary-teal/10 top-10 left-10" />
      <div className="glow-bg w-[300px] h-[300px] bg-primary-sky/10 bottom-10 right-10" />

      {/* Header Branding */}
      <div className="mb-8 flex flex-col items-center">
        <div className="p-3 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-2xl text-white shadow-md mb-3">
          <CreditCard className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
          Payment & Account Activation
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Complete payment of ₹999 to configure your student profile credentials
        </p>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary-teal" />
            <p className="text-sm text-slate-500 font-semibold mt-4">Loading checkout system...</p>
          </div>
        }>
          <PaymentContent />
        </Suspense>
      </div>
    </div>
  );
}
