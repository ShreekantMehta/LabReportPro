import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LabProfile from './components/LabProfile';
import ReportGenerator from './components/ReportGenerator';
import ReportHistory from './components/ReportHistory';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import SubscriptionGate from './components/SubscriptionGate';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  LayoutDashboard, 
  FilePlus, 
  History, 
  UserCircle, 
  Loader2, 
  Menu, 
  X, 
  Building2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from './lib/utils';

type View = 'landing' | 'dashboard' | 'profile' | 'generator' | 'history' | 'auth' | 'admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');
  const [labProfile, setLabProfile] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  const ADMIN_EMAIL = 'shree22598mehta@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch lab profile
        const profileRef = doc(db, 'labProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setLabProfile(data);
          // If new user, redirect to profile setup
          if (user.email === ADMIN_EMAIL) {
            setView('admin');
          } else if (data.isNewUser) {
            setView('profile');
          } else {
            setView('dashboard');
          }
        } else {
          // Create initial profile if it doesn't exist
          const initialProfile = {
            uid: user.uid,
            labName: 'My Diagnostic Lab',
            createdAt: serverTimestamp(),
            isNewUser: true,
          };
          await setDoc(profileRef, initialProfile);
          setLabProfile(initialProfile);
          setView('profile');
        }
      } else {
        setView('landing');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setView('landing');
  };

  const handleEditReport = (report: any) => {
    setEditingReport(report);
    setView('generator');
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setView('generator');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg"
        />
      </div>
    );
  }

  if (!user && view === 'landing') {
    return <LandingPage onGetStarted={() => setView('auth')} />;
  }

  if (!user && view === 'auth') {
    return (
      <div className="relative min-h-screen">
        <button 
          onClick={() => setView('landing')}
          className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
          Back to Home
        </button>
        <Auth />
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={() => {
        onClick();
        setIsSidebarOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-sm font-black rounded-xl transition-all",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-400")} />
      {label}
      {active && <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );

  return (
    <>
      <div className="flex min-h-screen bg-slate-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300 lg:translate-x-0 lg:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">LabReport<span className="text-blue-600">Pro</span></span>
            </div>
            
            <nav className="flex-1 space-y-2">
              {user?.email === ADMIN_EMAIL ? (
                <>
                  <NavItem 
                    icon={LayoutDashboard} 
                    label="Admin Dashboard" 
                    active={view === 'admin'} 
                    onClick={() => setView('admin')} 
                  />
                </>
              ) : (
                <>
                  <NavItem 
                    icon={LayoutDashboard} 
                    label="Dashboard" 
                    active={view === 'dashboard'} 
                    onClick={() => setView('dashboard')} 
                  />
                  <NavItem 
                    icon={FilePlus} 
                    label="New Report" 
                    active={view === 'generator' && !editingReport} 
                    onClick={handleNewReport} 
                  />
                  <NavItem 
                    icon={History} 
                    label="Report History" 
                    active={view === 'history'} 
                    onClick={() => setView('history')} 
                  />
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <NavItem 
                      icon={UserCircle} 
                      label="Lab Profile" 
                      active={view === 'profile'} 
                      onClick={() => setView('profile')} 
                    />
                  </div>
                </>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black">
                  {labProfile?.labName?.[0] || 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{labProfile?.labName || 'My Lab'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
              >
                <Menu className="h-6 w-6 text-slate-600" />
              </button>
              <h1 className="text-xl font-black text-slate-900 tracking-tight capitalize">
                {editingReport ? 'Edit Report' : view.replace('-', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Session
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <UserCircle className="h-6 w-6" />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={view + (editingReport?.id || '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {view === 'dashboard' && <Dashboard setView={setView} labProfile={labProfile} />}
                {view === 'profile' && <LabProfile labProfile={labProfile} setLabProfile={setLabProfile} />}
                {view === 'admin' && <AdminDashboard />}
                
                {(view === 'generator' || view === 'history') && (
                  <SubscriptionGate user={user} labProfile={labProfile} setLabProfile={setLabProfile}>
                    {view === 'generator' && <ReportGenerator labProfile={labProfile} initialData={editingReport} />}
                    {view === 'history' && <ReportHistory onEdit={handleEditReport} setEditingReport={setEditingReport} />}
                  </SubscriptionGate>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
