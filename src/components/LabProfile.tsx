import React, { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Building2, MapPin, Phone, Mail, Hash, Upload, CheckCircle, Loader2, CreditCard, Clock, AlertCircle, QrCode, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function LabProfile({ labProfile, setLabProfile }: any) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [formData, setFormData] = useState(labProfile || {});
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const UPI_ID = 'shree22598mehta@ybl';
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    try {
      // 1. Resize and Compress Image to keep it small for Firestore
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // For letterhead, we might need more width
            const isLetterhead = field === 'letterheadUrl';
            const MAX_WIDTH = isLetterhead ? 1200 : 400; 
            const MAX_HEIGHT = isLetterhead ? 300 : 400;
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
            
            // Compress to JPEG with 0.7 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedBase64 = await base64Promise;
      
      const updatedData = { ...formData, [field]: compressedBase64 };
      setFormData(updatedData);
      
      // Update Firestore immediately
      try {
        await updateDoc(doc(db, 'labProfiles', labProfile.uid), { [field]: compressedBase64 });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `labProfiles/${labProfile.uid}`);
      }
      setLabProfile((prev: any) => ({ ...prev, [field]: compressedBase64 }));
    } catch (err: any) {
      console.error('Upload Error:', err);
      alert(`Failed to process image: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedData = { ...formData, isNewUser: false };
      try {
        await updateDoc(doc(db, 'labProfiles', labProfile.uid), updatedData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `labProfiles/${labProfile.uid}`);
      }
      setLabProfile(updatedData);
      setFormData(updatedData);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPlan) return;

    setUploading('paymentScreenshot');
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
                width = MAX_HEIGHT;
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

      await updateDoc(doc(db, 'labProfiles', labProfile.uid), updateData);
      setLabProfile({ ...labProfile, ...updateData });
      setFormData({ ...formData, ...updateData });
      alert('Payment screenshot submitted! Our team will verify it shortly.');
      setShowPayment(false);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Lab Profile Setup</h2>
        <p className="text-slate-500">Configure your lab's branding and contact information for reports.</p>
      </div>

      {labProfile?.isNewUser && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between"
        >
          <div>
            <h3 className="text-lg font-bold">Welcome to LabReport Pro! 🚀</h3>
            <p className="text-blue-100 mt-1">Please complete your lab profile to start generating professional reports with your own branding.</p>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <Building2 className="h-8 w-8" />
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Branding & Identity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Lab Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative group">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Upload className="h-6 w-6 text-slate-400" />
                  )}
                  {uploading === 'logoUrl' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                  Change Logo
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Doctor's Signature</label>
              <div className="flex items-center gap-4">
                <div className="w-48 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">
                  {formData.signatureUrl ? (
                    <img src={formData.signatureUrl} alt="Signature" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Upload className="h-6 w-6 text-slate-400" />
                  )}
                  {uploading === 'signatureUrl' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                  Upload Signature
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'signatureUrl')} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Full Letterhead Image (Optional)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Use Letterhead instead of auto-header</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, useLetterhead: !formData.useLetterhead })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${formData.useLetterhead ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${formData.useLetterhead ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">If uploaded and enabled, this image will replace the top header of your reports. Recommended size: 1200x300px.</p>
            <div className="flex items-center gap-4">
              <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative">
                {formData.letterheadUrl ? (
                  <img src={formData.letterheadUrl} alt="Letterhead" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-center space-y-1">
                    <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Upload Letterhead</p>
                  </div>
                )}
                {uploading === 'letterheadUrl' && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors shrink-0">
                {formData.letterheadUrl ? 'Change Letterhead' : 'Upload Image'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'letterheadUrl')} />
              </label>
            </div>
          </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Lab Name</label>
              <input
                type="text"
                required
                value={formData.labName || ''}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Tagline / Services (Optional)</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. CONSULTING, DEVELOPMENT, SUPPORT"
              />
            </div>
          </div>

        {/* Contact Details */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Contact & Registration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" /> Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Website URL
              </label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. www.crystaldatasoftware.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Additional Phone/Mobile
              </label>
              <input
                type="text"
                value={formData.additionalPhone || ''}
                onChange={(e) => setFormData({ ...formData, additionalPhone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Mobile: 9820373936 / 9920548033"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" /> Full Address
              </label>
              <textarea
                rows={3}
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" /> Registration Number
              </label>
              <input
                type="text"
                value={formData.regNo || ''}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. XXXX54826XX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Technician Name
              </label>
              <input
                type="text"
                value={formData.technicianName || ''}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Mr. Sachin Sharma"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Technician Degree/Title
              </label>
              <input
                type="text"
                value={formData.technicianDegree || ''}
                onChange={(e) => setFormData({ ...formData, technicianDegree: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. DMLT, Lab Incharge"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Doctor Name (for Signature)
              </label>
              <input
                type="text"
                value={formData.doctorName || ''}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Dr. A. K. Asthana"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Doctor Degree/Title
              </label>
              <input
                type="text"
                value={formData.doctorDegree || ''}
                onChange={(e) => setFormData({ ...formData, doctorDegree: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. MBBS, MD Pathologist"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                Work Timings
              </label>
              <input
                type="text"
                value={formData.workTimings || ''}
                onChange={(e) => setFormData({ ...formData, workTimings: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g. Monday to Sunday, 8 am to 8 pm"
              />
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Subscription & Billing
            </h3>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
              labProfile?.subscriptionStatus === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              labProfile?.subscriptionStatus === 'pending_verification' ? "bg-amber-50 text-amber-600 border-amber-100" :
              "bg-slate-50 text-slate-500 border-slate-100"
            )}>
              {labProfile?.subscriptionStatus || 'Trial Mode'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                {labProfile?.subscriptionStatus === 'active' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-slate-900">Active Subscription</span>
                  </>
                ) : labProfile?.subscriptionStatus === 'pending_verification' ? (
                  <>
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-slate-900">Verification Pending</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="font-bold text-slate-900">Free Trial</span>
                  </>
                )}
              </div>
              {labProfile?.subscriptionEndDate && (
                <p className="text-xs text-slate-500 mt-2">
                  Expires on: {safeToDate(labProfile.subscriptionEndDate).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex items-center">
              {!showPayment && labProfile?.subscriptionStatus !== 'pending_verification' && (
                <button
                  type="button"
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-lg"
                >
                  {labProfile?.subscriptionStatus === 'active' ? 'Renew Subscription' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showPayment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-slate-100 space-y-8">
                  {!selectedPlan ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan)}
                          className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all text-left relative overflow-hidden group"
                        >
                          {plan.offer && (
                            <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-0.5 rounded-bl-lg text-[8px] font-black uppercase tracking-widest">
                              {plan.offer}
                            </div>
                          )}
                          <p className="font-black text-slate-900">{plan.name}</p>
                          <p className="text-2xl font-black text-blue-600 mt-1">₹{plan.price.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <button 
                          type="button"
                          onClick={() => setSelectedPlan(null)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-900"
                        >
                          ← Change Plan
                        </button>
                        <p className="text-sm font-black text-blue-600">{selectedPlan.name} - ₹{selectedPlan.price.toLocaleString()}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center gap-4">
                          <QRCode 
                            value={`upi://pay?pa=${UPI_ID}&pn=LabReportPro&am=${selectedPlan.price}&cu=INR`}
                            size={150}
                          />
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UPI ID</p>
                            <p className="text-sm font-black text-slate-900">{UPI_ID}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs text-blue-700 font-bold leading-relaxed">
                              Pay ₹{selectedPlan.price.toLocaleString()} and upload the screenshot below for verification.
                            </p>
                          </div>
                          
                          <label className="block">
                            <div className={cn(
                              "w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                              uploading === 'paymentScreenshot' ? "bg-white/50 border-blue-200" : "bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"
                            )}>
                              {uploading === 'paymentScreenshot' ? (
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 text-blue-400" />
                                  <p className="text-xs font-black text-blue-900">Upload Screenshot</p>
                                </>
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleScreenshotUpload}
                                disabled={uploading === 'paymentScreenshot'}
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
            Save Lab Profile
          </button>
        </div>
      </form>
    </div>
  );
}
