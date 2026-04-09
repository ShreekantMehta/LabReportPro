import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Zap, 
  Smartphone, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Clock
} from 'lucide-react';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">LabReport<span className="text-blue-600">Pro</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            </div>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-full mb-6">
              Modern Lab Management
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Professional Lab Reports <br />
              <span className="text-blue-600">In Seconds.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate platform for diagnostic labs to generate, manage, and share professional medical reports with ease. Beautifully designed, mobile-friendly, and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 flex items-center justify-center gap-2 group"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Hero Image / Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-2xl opacity-10"></div>
            <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden p-2">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Dashboard Preview" 
                className="rounded-[1.5rem] w-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Everything you need to run your lab</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Powerful features designed to streamline your diagnostic workflow and impress your patients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-blue-600" />}
              title="Instant PDF Generation"
              description="Generate professional, branded PDF reports in a single click. No more manual formatting."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6 text-blue-600" />}
              title="Secure Data Storage"
              description="Your patient data is encrypted and stored securely with daily backups and high availability."
            />
            <FeatureCard 
              icon={<Smartphone className="h-6 w-6 text-blue-600" />}
              title="Mobile Friendly"
              description="Access your lab dashboard and generate reports from any device - phone, tablet, or desktop."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
              title="Analytics Dashboard"
              description="Track your lab's performance with real-time analytics on report volume and patient trends."
            />
            <FeatureCard 
              icon={<FileText className="h-6 w-6 text-blue-600" />}
              title="Custom Branding"
              description="Upload your lab logo, signature, and contact details to create fully personalized reports."
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              title="Report History"
              description="Never lose a report again. Search and access your entire history of generated reports instantly."
            />
          </div>
        </div>
      </section>

      {/* Test Selection Feature Highlight */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Smart Workflow</span>
            <h2 className="text-4xl font-black text-slate-900 mt-4 mb-6 tracking-tight">Smart Test Selection & Categories</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Stop typing test names manually. Our smart catalog includes thousands of tests categorized for quick access. Search by name or select by category like CBC, Lipid Profile, or Thyroid.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Categorized test selection (CBC, LFT, KFT, etc.)
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Auto-fill units and reference ranges
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Searchable dropdown for 1000+ tests
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100 shadow-inner">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="space-y-4">
                <div className="h-4 w-1/3 bg-slate-100 rounded-full"></div>
                <div className="h-10 w-full bg-slate-50 border border-slate-200 rounded-lg flex items-center px-4 text-slate-400 text-sm">
                  Search for a test...
                </div>
                <div className="p-2 space-y-2">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm font-bold flex justify-between">
                    <span>Hemoglobin</span>
                    <span className="text-blue-400">g/dL</span>
                  </div>
                  <div className="p-3 hover:bg-slate-50 rounded-lg text-slate-600 text-sm flex justify-between">
                    <span>RBC Count</span>
                    <span className="text-slate-400">million/cmm</span>
                  </div>
                  <div className="p-3 hover:bg-slate-50 rounded-lg text-slate-600 text-sm flex justify-between">
                    <span>WBC Count</span>
                    <span className="text-slate-400">/cmm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">LabReport<span className="text-blue-600">Pro</span></span>
          </div>
          <p className="text-slate-400 max-w-md mx-auto mb-10">
            Empowering diagnostic labs with modern digital tools for a better patient experience.
          </p>
          <div className="flex justify-center gap-6 mb-12">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Support</a>
          </div>
          <div className="pt-8 border-t border-slate-800 text-slate-500 text-sm">
            © 2026 LabReport Pro. All rights reserved. Built for modern medicine.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
