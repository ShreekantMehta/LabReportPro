import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, Building2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [labName, setLabName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const profileRef = doc(db, 'labProfiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          labName: user.displayName || 'My Diagnostic Lab',
          email: user.email,
          createdAt: serverTimestamp(),
          isNewUser: true, // Flag to trigger setup prompt
        });
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          labName: user.displayName || 'My Diagnostic Lab',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user doc
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          labName: labName,
          createdAt: serverTimestamp(),
        });

        // Create initial lab profile
        await setDoc(doc(db, 'labProfiles', user.uid), {
          uid: user.uid,
          labName: labName,
          email: user.email,
          createdAt: serverTimestamp(),
          isNewUser: true, // Flag to trigger setup prompt
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-lg mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              LabReport Pro Access
            </h2>
            <p className="text-slate-500 mt-2">
              Sign in with your Google account to access the dashboard
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-2xl shadow-sm hover:border-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6 group-hover:scale-110 transition-transform" alt="Google" />
              Continue with Google
            </button>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">
                Exclusive Admin Access Enabled
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
