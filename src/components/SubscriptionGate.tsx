import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Loader2, 
  QrCode,
  ShieldCheck,
  Calendar,
  IndianRupee
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { cn } from '../lib/utils';

interface SubscriptionGateProps {
  children: React.ReactNode;
  user: any;
  labProfile: any;
  setLabProfile: (profile: any) => void;
}

export default function SubscriptionGate({ children, user, labProfile, setLabProfile }: SubscriptionGateProps) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const ADMIN_EMAIL = 'shree22598mehta@gmail.com';
  const UPI_ID = 'shree22598mehta@ybl';
  const TRIAL_DAYS = 7;

  const plans = [
    { id: '1year', name: '1 Year Plan', price: 8000, duration: 365 },
    { id: '2year', name: '2 Year Plan', price: 15000, duration: 730, offer: 'Save ₹1,000' },
    { id: '3year', name: '3 Year Plan', price: 21000, duration: 1095, offer: 'Save ₹3,000' },
  ];

  const safeToDate = (timestamp: any) => {
    if (!timestamp) return new Date();
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  };

  useEffect(() => {
    if (labProfile) {
      setLoading(false);
    }
  }, [labProfile]);

  const isTrialActive = () => {
    if (!labProfile?.createdAt) return true;
    const createdAt = safeToDate(labProfile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= TRIAL_DAYS;
  };

  const hasActiveSubscription = () => {
    if (user?.email === ADMIN_EMAIL) return true;
    if (labProfile?.subscriptionStatus === 'active') {
      if (!labProfile.subscriptionEndDate) return true;
      const endDate = safeToDate(labProfile.subscriptionEndDate);
      return endDate > new Date();
    }
    return false;
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlan) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const screenshotBase64 = await base64Promise;
      
      const updateData = {
        subscriptionStatus: 'pending_verification',
        paymentScreenshotUrl: screenshotBase64,
        pendingPlanId: selectedPlan.id,
        paymentSubmittedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'labProfiles', user.uid), updateData);
      setLabProfile({ ...labProfile, ...updateData });
      alert('Payment screenshot submitted! Our team will verify it shortly.');
      setShowPayment(false);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Admin always gets access
  if (user?.email === ADMIN_EMAIL) {
    return <>{children}</>;
  }

  // Check trial or subscription
  const trialActive = isTrialActive();
  const subActive = hasActiveSubscription();
  const isPending = labProfile?.subscriptionStatus === 'pending_verification';

  if (subActive || trialActive) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900">Payment Verification Pending</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                We've received your payment screenshot. Our team is currently verifying the transaction. 
                This usually takes 2-4 hours. You'll gain full access once verified.
              </p>
              <div className="pt-6">
                <button 
                  onClick={() => auth.signOut()}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  Trial Expired
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Choose Your Plan</h2>
                <p className="text-slate-500">Your 7-day free trial has ended. Select a plan to continue generating professional lab reports.</p>
              </div>

              {!showPayment ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -5 }}
                      className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl flex flex-col group relative overflow-hidden"
                    >
                      {plan.offer && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest">
                          {plan.offer}
                        </div>
                      )}
                      <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black text-blue-600">₹{plan.price.toLocaleString()}</span>
                        <span className="text-slate-400 font-bold text-sm">/ total</span>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          Unlimited Reports
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          Custom Letterhead
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          Memory Cache Feature
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          24/7 Priority Support
                        </li>
                      </ul>
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowPayment(true);
                        }}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
                      >
                        Select Plan
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={() => setShowPayment(false)}
                      className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2"
                    >
                      ← Back to Plans
                    </button>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Plan</p>
                      <p className="text-lg font-black text-blue-600">{selectedPlan.name} - ₹{selectedPlan.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="font-black text-slate-900 flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-blue-600" />
                          Scan to Pay via UPI
                        </h4>
                        <div className="bg-white p-4 rounded-2xl shadow-inner flex justify-center">
                          <QRCode 
                            value={`upi://pay?pa=${UPI_ID}&pn=LabReportPro&am=${selectedPlan.price}&cu=INR`}
                            size={200}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">UPI ID</p>
                          <p className="text-lg font-black text-slate-900">{UPI_ID}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                        <h4 className="font-black text-blue-900 flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Upload Screenshot
                        </h4>
                        <p className="text-sm text-blue-700 font-medium leading-relaxed">
                          After making the payment of <strong>₹{selectedPlan.price.toLocaleString()}</strong> to <strong>{UPI_ID}</strong>, 
                          please upload the payment confirmation screenshot below.
                        </p>
                        
                        <label className="block">
                          <div className={cn(
                            "w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                            uploading ? "bg-white/50 border-blue-200" : "bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"
                          )}>
                            {uploading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            ) : (
                              <>
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                  <Upload className="h-6 w-6" />
                                </div>
                                <p className="text-sm font-black text-blue-900">Click to Upload Screenshot</p>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">JPG or PNG (Max 5MB)</p>
                              </>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleScreenshotUpload}
                              disabled={uploading}
                            />
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">
                          Secure payment verification. Your data is encrypted and protected.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="text-center">
                <button 
                  onClick={() => auth.signOut()}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Logout & Try Later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
