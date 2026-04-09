import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Search, FileText, Download, Trash2, Calendar, User, Eye, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export default function ReportHistory({ onEdit, setEditingReport }: { onEdit: (report: any) => void, setEditingReport: (report: any) => void }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'reports'),
        where('uid', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
      setReports(reports.filter(r => r.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
    }
  };

  const handleDownload = async (report: any) => {
    // We need to temporarily set the report data to the generator's state to use the PDF logic
    // or we can just pass the report data to a hidden ReportPreview
    setEditingReport(report);
    // Wait for the state to update and the component to render
    setTimeout(() => {
      const downloadBtn = document.getElementById('hidden-pdf-trigger');
      if (downloadBtn) downloadBtn.click();
    }, 500);
  };

  const filteredReports = reports.filter(r => 
    r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Report History</h2>
          <p className="text-slate-500">Access and manage all previously generated reports.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No reports found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={report.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{report.patientName}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {report.createdAt?.toDate?.() ? report.createdAt.toDate().toLocaleDateString() : 'Recent'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        ID: {report.patientId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {confirmDeleteId === report.id ? (
                    <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg border border-red-100">
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-md uppercase tracking-widest hover:bg-red-600 transition-all"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleDownload(report)}
                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => onEdit(report)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Report"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(report.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Report"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
