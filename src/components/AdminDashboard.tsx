import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Phone, 
  MessageCircle,
  Building2,
  User,
  CreditCard,
  AlertCircle,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Pending
      const pendingQuery = query(
        collection(db, 'labProfiles'),
        where('subscriptionStatus', '==', 'pending_verification')
      );
      const pendingSnap = await getDocs(pendingQuery);
      setPendingProfiles(pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch All
      const allQuery = query(
        collection(db, 'labProfiles'),
        orderBy('createdAt', 'desc')
      );
      const allSnap = await getDocs(allQuery);
      setAllProfiles(allSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profile: any) => {
    if (!window.confirm(`Approve subscription for ${profile.labName}?`)) return;

    try {
      const duration = profile.pendingPlanId === '3year' ? 1095 : profile.pendingPlanId === '2year' ? 730 : 365;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      await updateDoc(doc(db, 'labProfiles', profile.id), {
        subscriptionStatus: 'active',
        subscriptionEndDate: Timestamp.fromDate(endDate),
        isNewUser: false,
        lastPaymentApprovedAt: Timestamp.now()
      });

      alert('Subscription approved successfully!');
      fetchAllData();
    } catch (err) {
      console.error('Error approving subscription:', err);
      alert('Failed to approve subscription.');
    }
  };

  const handleReject = async (profileId: string) => {
    if (!window.confirm('Reject this payment? The user will need to re-upload.')) return;

    try {
      await updateDoc(doc(db, 'labProfiles', profileId), {
        subscriptionStatus: 'expired',
        paymentScreenshotUrl: null,
        pendingPlanId: null
      });

      alert('Payment rejected.');
      fetchAllData();
    } catch (err) {
      console.error('Error rejecting payment:', err);
    }
  };

  const safeToDate = (timestamp: any) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  };

  const filteredData = (activeTab === 'pending' ? pendingProfiles : allProfiles).filter(p => 
    p.labName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 font-medium">Manage lab registrations and subscriptions.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lab name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
            activeTab === 'pending' 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Clock className="h-4 w-4" />
          Pending Approvals
          {pendingProfiles.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingProfiles.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2",
            activeTab === 'all' 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Building2 className="h-4 w-4" />
          All Registered Labs
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredData.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-slate-500 font-bold">No pending verifications found.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredData.map((profile) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={profile.id}
                  className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8"
                >
                  <div className="w-full md:w-56 h-56 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
                    {profile.paymentScreenshotUrl ? (
                      <>
                        <img 
                          src={profile.paymentScreenshotUrl} 
                          alt="Payment Screenshot" 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedImage(profile.paymentScreenshotUrl)}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="text-white h-6 w-6" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{profile.labName}</h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-sm text-slate-500 font-bold">
                            <Mail className="h-4 w-4 text-blue-500" />
                            {profile.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-slate-500 font-bold">
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                            Plan: {profile.pendingPlanId?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full lg:w-auto">
                        <button
                          onClick={() => handleApprove(profile)}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(profile.id)}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-black rounded-xl hover:bg-red-100 transition-all"
                        >
                          <XCircle className="h-5 w-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <DetailBox label="Contact Person" value={profile.technicianName || profile.doctorName || 'N/A'} icon={User} />
                      <DetailBox label="Mobile Number" value={profile.phone || 'N/A'} icon={Phone} />
                      <DetailBox label="Submitted On" value={safeToDate(profile.paymentSubmittedAt)?.toLocaleString() || 'N/A'} icon={Calendar} />
                    </div>

                    {profile.phone && (
                      <a 
                        href={`https://wa.me/91${profile.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-600 font-black text-sm hover:underline"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contact on WhatsApp
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lab Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((profile) => {
                  const expiryDate = safeToDate(profile.subscriptionEndDate);
                  const isExpired = expiryDate && expiryDate < new Date();
                  const isNearExpiry = expiryDate && !isExpired && (expiryDate.getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black">
                            {profile.labName?.[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{profile.labName}</p>
                            <p className="text-xs text-slate-500 font-medium">{profile.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm">{profile.technicianName || profile.doctorName || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{profile.phone || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          profile.subscriptionStatus === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          profile.subscriptionStatus === 'pending_verification' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          {profile.subscriptionStatus || 'Trial'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {expiryDate ? (
                          <div className="space-y-1">
                            <p className={cn(
                              "text-sm font-black",
                              isExpired ? "text-red-500" : isNearExpiry ? "text-amber-500" : "text-slate-900"
                            )}>
                              {expiryDate.toLocaleDateString()}
                            </p>
                            {isNearExpiry && (
                              <p className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Expiring Soon
                              </p>
                            )}
                            {isExpired && (
                              <p className="text-[9px] font-black text-red-600 uppercase flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Expired
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {profile.phone && (
                            <a 
                              href={`https://wa.me/91${profile.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                              title="Contact on WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => alert(`Lab ID: ${profile.id}\nRegistered On: ${safeToDate(profile.createdAt)?.toLocaleString()}`)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] w-full h-full relative"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Full Screenshot" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
              >
                <XCircle className="h-8 w-8" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBox({ label, value, icon: Icon }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
    </div>
  );
}
