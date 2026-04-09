import { motion } from 'motion/react';
import { FilePlus, History, UserCircle, TrendingUp, Users, FileText, Clock, ShieldCheck } from 'lucide-react';

export default function Dashboard({ setView, labProfile }: { setView: (v: any) => void, labProfile: any }) {
  const getTrialDaysLeft = () => {
    if (!labProfile?.createdAt) return 7;
    const createdAt = labProfile.createdAt.toDate ? labProfile.createdAt.toDate() : new Date(labProfile.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  };

  const trialDaysLeft = getTrialDaysLeft();
  const isSubscribed = labProfile?.subscriptionStatus === 'active';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lab Dashboard</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        
        {!isSubscribed && (
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Free Trial Status</p>
              <p className="text-sm font-bold text-blue-900">
                {trialDaysLeft > 0 ? `${trialDaysLeft} Days Remaining` : 'Trial Expired'}
              </p>
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Subscription Status</p>
              <p className="text-sm font-bold text-emerald-900">Active Plan</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Patients" value="128" color="bg-blue-500" />
        <StatCard icon={FileText} label="Reports Generated" value="452" color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label="Monthly Growth" value="+12%" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <QuickAction 
          title="Generate New Report" 
          description="Create a professional pathology report for a patient."
          icon={FilePlus}
          onClick={() => setView('generator')}
          color="blue"
        />
        <QuickAction 
          title="View History" 
          description="Access and download previously generated reports."
          icon={History}
          onClick={() => setView('history')}
          color="emerald"
        />
        <QuickAction 
          title="Update Lab Profile" 
          description="Manage your lab's branding, logo, and contact details."
          icon={UserCircle}
          onClick={() => setView('profile')}
          color="purple"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl text-white`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, onClick, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  };

  return (
    <button
      onClick={onClick}
      className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group"
    >
      <div className={`${colors[color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-500 mt-1">{description}</p>
    </button>
  );
}
