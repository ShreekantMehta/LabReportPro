import { useState, useRef, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  Eye, 
  Loader2, 
  User, 
  Calendar, 
  Stethoscope, 
  ClipboardList,
  Search,
  ChevronDown,
  Check,
  Filter,
  X,
  Save,
  Database,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';
import ReportPreview from './ReportPreview';
import { TEST_CATALOG, LabTest, TestCategory } from '../constants/tests';
import { cn } from '../lib/utils';

interface TestResult {
  id: string;
  name: string;
  unit: string;
  referenceRange: string;
  method?: string;
  significance?: string;
  isHeader?: boolean;
  result: string;
  subParameters?: TestResult[];
}

interface CategoryGroup {
  id: string;
  categoryId: string;
  categoryName: string;
  subCategoryId?: string;
  subCategoryName?: string;
  tests: TestResult[];
  conclusion: string;
}

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

const ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function createId() {
  return Array.from({ length: 9 }, () => ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]).join('');
}

function inferMethod(testName: string, subCategoryName?: string) {
  const name = testName.toLowerCase();
  const subCategory = (subCategoryName || '').toLowerCase();

  if (name.includes('hba1c')) return 'HPLC';
  if (name.includes('glucose') || name.includes('sugar')) return 'GOD-POD';
  if (name.includes('bilirubin')) return 'Diazo Method';
  if (name.includes('urea')) return 'Urease UV';
  if (name.includes('creatinine')) return 'Jaffe Kinetic';
  if (name.includes('cholesterol')) return 'CHOD-PAP';
  if (name.includes('triglyceride')) return 'GPO-PAP';
  if (name.includes('hdl') || name.includes('ldl') || name.includes('vldl')) return 'Direct Enzymatic';
  if (name.includes('sgot') || name.includes('ast') || name.includes('sgpt') || name.includes('alt')) return 'IFCC Kinetic';
  if (name.includes('alkaline phosphatase')) return 'PNPP Kinetic';
  if (name.includes('crp')) return 'Immunoturbidimetry';
  if (name.includes('troponin')) return 'CLIA';
  if (name.includes('vitamin d') || name.includes('vitamin b12') || name.includes('ferritin')) return 'CLIA';
  if (name.includes('tsh') || name.includes('t3') || name.includes('t4') || name.includes('prolactin') || name.includes('amh')) return 'Chemiluminescence Immunoassay';
  if (name.includes('hiv') || name.includes('hbsag') || name.includes('hcv') || name.includes('dengue') || name.includes('torch')) return 'ELISA / CLIA';
  if (name.includes('widal')) return 'Slide Agglutination';
  if (name.includes('culture')) return 'Culture and Sensitivity';
  if (name.includes('stain') || name.includes('smear')) return 'Microscopy';
  if (name.includes('pcr') || subCategory.includes('pcr')) return 'Real-Time PCR';
  if (name.includes('cbc') || name.includes('haemoglobin') || name.includes('platelet') || name.includes('wbc') || name.includes('rbc')) return 'Automated Hematology Analyzer';
  if (name.includes('urine') || name.includes('stool') || name.includes('semen') || name.includes('fluid analysis')) return 'Microscopy and Chemical Analysis';

  return 'Standard Laboratory Method';
}

function inferSignificance(testName: string, subCategoryName?: string) {
  const subject = subCategoryName ? `${testName} in ${subCategoryName}` : testName;
  const name = testName.toLowerCase();

  if (name.includes('glucose') || name.includes('sugar')) {
    return `${testName} helps assess glycemic status, screen for diabetes, and monitor short-term glucose control.`;
  }
  if (name.includes('hba1c')) {
    return `${testName} reflects average blood glucose over the past 8 to 12 weeks and supports diabetes diagnosis and monitoring.`;
  }
  if (name.includes('cbc') || name.includes('haemoglobin') || name.includes('platelet') || name.includes('wbc') || name.includes('rbc')) {
    return `${subject} helps evaluate anemia, infection, inflammation, platelet disorders, and overall hematologic status.`;
  }
  if (name.includes('bilirubin') || name.includes('sgot') || name.includes('sgpt') || name.includes('alkaline phosphatase') || name.includes('ggt')) {
    return `${subject} is useful for assessing liver cell injury, cholestasis, and overall hepatobiliary function.`;
  }
  if (name.includes('urea') || name.includes('creatinine') || name.includes('egfr') || name.includes('uric acid')) {
    return `${subject} is used to evaluate renal function, filtration status, and kidney-related metabolic imbalance.`;
  }
  if (name.includes('cholesterol') || name.includes('triglyceride') || name.includes('lipid')) {
    return `${subject} helps estimate cardiovascular risk and monitor lipid-lowering therapy.`;
  }
  if (name.includes('tsh') || name.includes('t3') || name.includes('t4') || name.includes('thyroid')) {
    return `${subject} helps assess thyroid hormone balance and supports diagnosis and follow-up of thyroid disorders.`;
  }
  if (name.includes('hiv') || name.includes('hbsag') || name.includes('hcv') || name.includes('dengue') || name.includes('widal') || name.includes('vdrl')) {
    return `${subject} supports detection or screening of infectious disease and helps correlate with clinical findings.`;
  }
  if (name.includes('culture') || name.includes('sensitivity')) {
    return `${subject} helps identify the causative organism and guides targeted antimicrobial therapy.`;
  }
  if (name.includes('pcr')) {
    return `${subject} detects genetic material with high sensitivity and is useful for early and specific diagnosis.`;
  }
  if (name.includes('urine') || name.includes('stool') || name.includes('semen') || name.includes('fluid')) {
    return `${subject} provides diagnostic clues about infection, inflammation, metabolic disorders, and organ-specific pathology.`;
  }

  return `${subject} is clinically useful for diagnosis, disease screening, and treatment monitoring when correlated with patient symptoms and history.`;
}

function applyMetadataDefaults(item: any, subCategoryName?: string): any {
  return {
    ...item,
    method: item.method || inferMethod(item.name, subCategoryName),
    significance: item.significance || inferSignificance(item.name, subCategoryName),
    subParameters: item.subParameters?.map((subItem) => applyMetadataDefaults(subItem, subCategoryName)),
  };
}

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => removeUndefinedDeep(entry)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, entry]) => {
      if (entry === undefined) return acc;
      acc[key] = removeUndefinedDeep(entry);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value;
}

export default function ReportGenerator({ labProfile, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [patientData, setPatientData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    patientId: '',
    doctorName: '',
    labNo: '2',
    regDate: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    sampleDate: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
    sampleCollAt: 'CRYSTAL LAB'
  });

  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [resultsCache, setResultsCache] = useState<{ [key: string]: TestResult }>(() => {
    try {
      const saved = localStorage.getItem('lab_results_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const saveTestToCache = (test: TestResult) => {
    if (!test.name) return;
    const cachedValue = applyMetadataDefaults(test);
    const newCache = {
      ...resultsCache,
      [test.name]: JSON.parse(JSON.stringify(cachedValue))
    };
    setResultsCache(newCache);
    localStorage.setItem('lab_results_cache', JSON.stringify(newCache));
    setSaveFeedback(test.id);
    setTimeout(() => setSaveFeedback(null), 2000);
  };

  const clearCache = () => {
    setResultsCache({});
    localStorage.removeItem('lab_results_cache');
    setConfirmClear(false);
  };

  useEffect(() => {
    if (initialData) {
      setPatientData({
        patientName: initialData.patientName || '',
        age: initialData.age || '',
        gender: initialData.gender || 'Male',
        patientId: initialData.patientId || '',
        doctorName: initialData.doctorName || '',
        labNo: initialData.labNo || '2',
        regDate: initialData.regDate || '',
        sampleDate: initialData.sampleDate || '',
        sampleCollAt: initialData.sampleCollAt || 'CRYSTAL LAB',
      });

      if (initialData.resultsCache) {
        setResultsCache(prev => ({ ...prev, ...initialData.resultsCache }));
      }

      if (initialData.categoryGroups) {
        setCategoryGroups(initialData.categoryGroups.map((g: any) => ({
          ...g,
          tests: g.tests.map((t: any) => ({
            ...applyMetadataDefaults(t, g.subCategoryName),
            id: t.id || createId(),
            subParameters: t.subParameters?.map((sp: any) => ({
              ...applyMetadataDefaults(sp, g.subCategoryName),
              id: sp.id || createId()
            }))
          }))
        })));
      } else if (initialData.testResults) {
        // Migration: group flat results by their category
        const groups: { [key: string]: CategoryGroup } = {};
        initialData.testResults.forEach((test: any) => {
          const catId = test.category || 'all';
          if (!groups[catId]) {
            const catInfo = TEST_CATALOG.find(c => c.id === catId);
            groups[catId] = {
              id: createId(),
              categoryId: catId,
              categoryName: catInfo?.name || 'General',
              tests: [],
              conclusion: initialData.conclusion || '',
            };
          }
          groups[catId].tests.push({
            ...applyMetadataDefaults({
              id: createId(),
              name: test.name,
              unit: test.unit,
              referenceRange: test.referenceRange,
              result: test.result,
            }),
          });
        });
        setCategoryGroups(Object.values(groups));
      }
    } else {
      // Reset to defaults for a new report
      setPatientData({
        patientName: '',
        age: '',
        gender: 'Male',
        patientId: '',
        doctorName: '',
        labNo: '2',
        regDate: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
        sampleDate: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
        sampleCollAt: 'CRYSTAL LAB'
      });
      
      const newGroup: CategoryGroup = {
        id: createId(),
        categoryId: 'all',
        categoryName: 'General',
        tests: [{ id: createId(), name: '', result: '', unit: '', referenceRange: '' }],
        conclusion: '',
      };
      setCategoryGroups([newGroup]);
    }
  }, [initialData]);

  const addCategoryGroup = () => {
    const newGroup: CategoryGroup = {
      id: createId(),
      categoryId: 'all',
      categoryName: 'General',
      tests: [{ id: createId(), name: '', result: '', unit: '', referenceRange: '' }],
      conclusion: '',
    };
    setCategoryGroups(prev => [...prev, newGroup]);
  };

  const removeCategoryGroup = (groupId: string) => {
    setCategoryGroups(prev => {
      if (prev.length > 1) {
        return prev.filter(g => g.id !== groupId);
      }
      return prev;
    });
  };

  const updateGroup = (groupId: string, updates: Partial<CategoryGroup>) => {
    setCategoryGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        let newGroup = { ...g, ...updates };
        if (updates.categoryId) {
          const catInfo = TEST_CATALOG.find(c => c.id === updates.categoryId);
          newGroup.categoryName = catInfo?.name || 'General';
        }
        return newGroup;
      }
      return g;
    }));
  };

  const addTestToGroup = (groupId: string) => {
    setCategoryGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { 
          ...g, 
          tests: [...g.tests, { id: createId(), name: '', result: '', unit: '', referenceRange: '' }] 
        };
      }
      return g;
    }));
  };

  const removeTestFromGroup = (groupId: string, testIndex: number) => {
    setCategoryGroups(prev => prev.map(g => {
      if (g.id === groupId && g.tests.length > 1) {
        return { ...g, tests: g.tests.filter((_, i) => i !== testIndex) };
      }
      return g;
    }));
  };

  const updateTestInGroup = (groupId: string, testIndex: number, field: keyof TestResult, value: string) => {
    setCategoryGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const newTests = [...g.tests];
        (newTests[testIndex] as any)[field] = value;
        return { ...g, tests: newTests };
      }
      return g;
    }));
  };

  const updateSubParamInGroup = (groupId: string, testIndex: number, subParamIndex: number, value: string) => {
    setCategoryGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const newTests = [...g.tests];
        if (newTests[testIndex].subParameters) {
          const newSubParams = [...newTests[testIndex].subParameters!];
          newSubParams[subParamIndex] = { ...newSubParams[subParamIndex], result: value };
          newTests[testIndex] = { ...newTests[testIndex], subParameters: newSubParams };
        }
        return { ...g, tests: newTests };
      }
      return g;
    }));
  };

  const selectTestForGroup = (groupId: string, testIndex: number, test: LabTest) => {
    setCategoryGroups(prev => {
      // Helper to find any existing result for a test name in the entire report or cache
      const findExistingResult = (name: string): string => {
        // Check cache first
        if (resultsCache[name]?.result) return resultsCache[name].result;

        for (const g of prev) {
          for (const t of g.tests) {
            if (t.name === name && t.result) return t.result;
            if (t.subParameters) {
              for (const sp of t.subParameters) {
                if (sp.name === name && sp.result) return sp.result;
              }
            }
          }
        }
        return '';
      };

      return prev.map(g => {
        if (g.id === groupId) {
          const newTests = [...g.tests];
          const oldTest = newTests[testIndex];
          const selectedGroup = prev.find((group) => group.id === groupId);
          const subCategoryName = selectedGroup?.subCategoryName;
          
          // Check if the new test exists in cache for sub-parameters
          const cachedTest = resultsCache[test.name];

          newTests[testIndex] = applyMetadataDefaults({
            ...test,
            id: oldTest.id,
            // Check global state/cache first, then immediately previous test
            result: findExistingResult(test.name) || (oldTest.name === test.name ? oldTest.result : ''),
            // Map sub-parameters and check global state/cache for each
            subParameters: test.subParameters?.map(sp => {
              const cachedSubParam = cachedTest?.subParameters?.find(csp => csp.name === sp.name);
              const globalResult = findExistingResult(sp.name) || cachedSubParam?.result;
              const oldSubParam = oldTest.subParameters?.find(osp => osp.name === sp.name);
              return { 
                ...sp, 
                id: oldSubParam?.id || createId(),
                result: globalResult || (oldSubParam ? oldSubParam.result : '') 
              };
            }),
          }, subCategoryName);
          return { ...g, tests: newTests };
        }
        return g;
      });
    });
  };

  const filteredTests = (category: string, subCategory: string | undefined, query: string) => {
    let allTests: LabTest[] = [];
    const cat = TEST_CATALOG.find(c => c.id === category);
    
    if (!cat) {
      TEST_CATALOG.forEach(c => {
        if (c.subCategories) {
          c.subCategories.forEach(sc => allTests.push(...sc.tests));
        } else if (c.tests) {
          allTests.push(...c.tests);
        }
      });
    } else {
      if (cat.subCategories) {
        if (subCategory) {
          const sc = cat.subCategories.find(s => s.id === subCategory);
          if (sc) allTests = sc.tests;
        } else {
          // Strict: If subcategories exist but none selected, show no tests
          allTests = [];
        }
      } else if (cat.tests) {
        allTests = cat.tests;
      }
    }

    if (!query) return allTests.slice(0, 50);
    return allTests.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const buildPdfOptions = () => ({
    margin: 0,
    filename: `Report_${patientData.patientName || 'Patient'}_${Date.now()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      onclone: (clonedDoc: Document) => {
        const exportRoot = clonedDoc.getElementById('report-export-root');
        if (exportRoot) {
          (exportRoot as HTMLElement).style.position = 'static';
          (exportRoot as HTMLElement).style.left = '0';
          (exportRoot as HTMLElement).style.top = '0';
          (exportRoot as HTMLElement).style.opacity = '1';
          (exportRoot as HTMLElement).style.width = '210mm';
        }

        const elements = clonedDoc.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i] as HTMLElement;
          const style = window.getComputedStyle(el);
          const colorProps = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];

          colorProps.forEach((prop) => {
            const value = (style as any)[prop];
            if (value && (value.includes('oklch') || value.includes('oklab'))) {
              if (prop === 'color') el.style.setProperty(prop, '#000000', 'important');
              else if (prop === 'backgroundColor') el.style.setProperty(prop, '#ffffff', 'important');
              else el.style.setProperty(prop, 'transparent', 'important');
            }
          });

          el.style.boxShadow = 'none';
          el.style.textShadow = 'none';
          el.style.filter = 'none';
          el.style.backdropFilter = 'none';
        }

        const styleTags = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          let content = styleTags[i].innerHTML;
          if (content.includes('oklch') || content.includes('oklab')) {
            content = content.replace(/oklch\([^)]+\)/g, 'rgb(0,0,0)');
            content = content.replace(/oklab\([^)]+\)/g, 'rgb(0,0,0)');
            styleTags[i].innerHTML = content;
          }
        }

        const linkTags = clonedDoc.getElementsByTagName('link');
        for (let i = linkTags.length - 1; i >= 0; i--) {
          if (linkTags[i].rel === 'stylesheet') {
            linkTags[i].parentNode?.removeChild(linkTags[i]);
          }
        }
      },
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['css', 'legacy'] },
  });

  const generatePDF = async () => {
    const element = reportRef.current;

    if (!element) {
      console.error('Report element not found');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await html2pdf().from(element).set(buildPdfOptions()).save();
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert(`Failed to generate PDF. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    const element = reportRef.current;

    if (!element) {
      alert('Preview is not ready for printing yet.');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      alert('Unable to open print preview.');
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('style')).map((style) => style.outerHTML).join('\n');

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Print Report</title>
          ${styleTags}
          <style>
            body { margin: 0; background: white; }
            @page { size: A4; margin: 0; }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };

  const handleSave = async () => {
    if (!patientData.patientName) {
      alert('Please enter at least the patient name.');
      return;
    }

    setLoading(true);
    try {
      const cleanedGroups = categoryGroups
        .map((g) => ({
          ...g,
          tests: g.tests
            .filter((t) => t.name || t.result)
            .map((t) => applyMetadataDefaults(t, g.subCategoryName)),
        }))
        .filter((g) => g.tests.length > 0);

      const reportData = removeUndefinedDeep({
        ...patientData,
        categoryGroups: cleanedGroups,
        resultsCache,
        uid: auth.currentUser?.uid || labProfile.uid,
        updatedAt: serverTimestamp(),
        createdAt: initialData?.createdAt || serverTimestamp(),
      });

      if (initialData?.id) {
        try {
          await setDoc(doc(db, 'reports', initialData.id), reportData);
          alert('Report updated successfully!');
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `reports/${initialData.id}`);
        }
      } else {
        try {
          await addDoc(collection(db, 'reports'), reportData);
          alert('Report saved successfully to history!');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'reports');
        }
      }
    } catch (err: any) {
      console.error('Save Error:', err);
      alert(`Failed to save report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {initialData ? 'Edit Report' : 'Generate Report'}
          </h2>
          <p className="text-slate-500 font-medium">Create a professional multi-page diagnostic report.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-black rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
          >
            {showPreview ? <ClipboardList className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button
            onClick={generatePDF}
            className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="h-5 w-5" />
            PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-black rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="h-5 w-5" />
            Print
          </button>
          <button
            id="hidden-pdf-trigger"
            onClick={generatePDF}
            className="hidden"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
            {initialData ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      {/* Hidden container for PDF generation - Always present to avoid "Report element not found" */}
      <div 
        id="report-export-root"
        className="fixed pointer-events-none opacity-0" 
        style={{ left: '-9999px', top: 0, width: '210mm' }}
      >
        <div ref={reportRef}>
          <ReportPreview 
            labProfile={labProfile} 
            patientData={patientData} 
            categoryGroups={categoryGroups} 
            resultsCache={resultsCache}
            mode="export"
          />
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="overflow-x-auto">
                <ReportPreview 
                  labProfile={labProfile} 
                  patientData={patientData} 
                  categoryGroups={categoryGroups} 
                  resultsCache={resultsCache}
                  mode="preview"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Patient Information */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Patient Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InputGroup label="Patient Name" value={patientData.patientName} onChange={(v: string) => setPatientData(prev => ({...prev, patientName: v}))} placeholder="Full Name" />
                  <InputGroup label="Age" value={patientData.age} onChange={(v: string) => setPatientData(prev => ({...prev, age: v}))} placeholder="Years" />
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Gender</label>
                    <div className="relative">
                      <select 
                        value={patientData.gender} 
                        onChange={(e) => setPatientData(prev => ({...prev, gender: e.target.value}))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-slate-700"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <InputGroup label="Lab No" value={patientData.labNo} onChange={(v: string) => setPatientData(prev => ({...prev, labNo: v}))} placeholder="e.g. 2" />
                  <InputGroup label="Patient ID" value={patientData.patientId} onChange={(v: string) => setPatientData(prev => ({...prev, patientId: v}))} placeholder="e.g. P-101" />
                  <InputGroup label="Referred By" value={patientData.doctorName} onChange={(v: string) => setPatientData(prev => ({...prev, doctorName: v}))} placeholder="Doctor Name" />
                  <InputGroup label="Sample Coll. At" value={patientData.sampleCollAt} onChange={(v: string) => setPatientData(prev => ({...prev, sampleCollAt: v}))} placeholder="Lab Name" />
                  <InputGroup label="Reg Date" value={patientData.regDate} onChange={(v: string) => setPatientData(prev => ({...prev, regDate: v}))} placeholder="Date & Time" />
                  <InputGroup label="Sample Date" value={patientData.sampleDate} onChange={(v: string) => setPatientData(prev => ({...prev, sampleDate: v}))} placeholder="Date & Time" />
                </div>
              </div>

              {/* Memory & Stashed Results */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-xl">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Memory & Stashed Results</h3>
                  </div>
                  {Object.keys(resultsCache).length > 0 && (
                    <div className="flex items-center gap-2">
                      {confirmClear ? (
                        <>
                          <button
                            onClick={clearCache}
                            className="text-[10px] font-black text-white bg-red-500 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                          >
                            Confirm Clear
                          </button>
                          <button
                            onClick={() => setConfirmClear(false)}
                            className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmClear(true)}
                          className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest px-3 py-1.5 bg-red-50 rounded-lg transition-all"
                        >
                          Clear Memory
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {Object.keys(resultsCache).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(resultsCache).map((cachedTest: any) => (
                      <div key={cachedTest.name} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cachedTest.name}</p>
                          <p className="text-sm font-bold text-blue-600">{cachedTest.result || 'No Result'} <span className="text-[10px] text-slate-400">{cachedTest.unit}</span></p>
                        </div>
                        <button
                          onClick={() => {
                            const newCache = { ...resultsCache };
                            delete newCache[cachedTest.name];
                            setResultsCache(newCache);
                            localStorage.setItem('lab_results_cache', JSON.stringify(newCache));
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <p className="text-slate-400 font-medium">No results stashed in memory yet.</p>
                    <p className="text-[10px] text-slate-300 uppercase font-black tracking-widest mt-1">Use "Save to Memory" on any test parameter</p>
                  </div>
                )}
              </div>

              {/* Category Groups */}
              <div className="space-y-8">
                {categoryGroups.map((group) => (
                  <div key={group.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8 relative group/card">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="bg-blue-50 p-2 rounded-xl">
                          <Filter className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="space-y-1 flex-grow">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Test Category</h3>
                          <SearchableDropdown
                            label="Category"
                            value={group.categoryId}
                            options={TEST_CATALOG.map(cat => ({ id: cat.id, name: cat.name }))}
                            onSelect={(id) => {
                              updateGroup(group.id, { 
                                categoryId: id,
                                subCategoryId: '',
                                subCategoryName: ''
                              });
                            }}
                            placeholder="Search Category..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => addTestToGroup(group.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="h-4 w-4" /> Add Parameter
                        </button>
                        {categoryGroups.length > 1 && (
                          <button
                            onClick={() => removeCategoryGroup(group.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {group.tests.map((test, testIndex) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={test.id} 
                          className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6 relative group/row"
                        >
                          <button
                            onClick={() => removeTestFromGroup(group.id, testIndex)}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/row:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {TEST_CATALOG.find(c => c.id === group.categoryId)?.subCategories && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sub Category</label>
                                <SearchableDropdown
                                  label="Sub Category"
                                  value={group.subCategoryId || ''}
                                  options={TEST_CATALOG.find(c => c.id === group.categoryId)?.subCategories?.map(sc => ({ id: sc.id, name: sc.name })) || []}
                                  onSelect={(id, name) => {
                                    updateGroup(group.id, { subCategoryId: id, subCategoryName: name });
                                  }}
                                  placeholder="Search Sub Category..."
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Parameter</label>
                                {test.name && (
                                  <button
                                    onClick={() => saveTestToCache(test)}
                                    className={cn(
                                      "flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter transition-all",
                                      saveFeedback === test.id ? "text-green-500" : "text-blue-400 hover:text-blue-600"
                                    )}
                                  >
                                    {saveFeedback === test.id ? (
                                      <>
                                        <Check className="h-3 w-3" /> Saved to Memory
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-3 w-3" /> Save to Memory
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <SearchableDropdown
                                label="Test Parameter"
                                value={test.name}
                                options={filteredTests(group.categoryId, group.subCategoryId, '').map(t => ({ id: t.name, name: t.name }))}
                                onSelect={(id, name) => {
                                  const selectedTest = filteredTests(group.categoryId, group.subCategoryId, '').find(t => t.name === name);
                                  if (selectedTest) {
                                    selectTestForGroup(group.id, testIndex, selectedTest);
                                  } else {
                                    updateTestInGroup(group.id, testIndex, 'name', name);
                                  }
                                }}
                                placeholder={
                                  TEST_CATALOG.find(c => c.id === group.categoryId)?.subCategories && !group.subCategoryId
                                    ? "Select Sub Category first..."
                                    : "Search Test Parameter..."
                                }
                                disabled={TEST_CATALOG.find(c => c.id === group.categoryId)?.subCategories && !group.subCategoryId}
                                allowCustom
                              />
                            </div>

                            {test.name === 'custom' ? (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Custom Name</label>
                                <input
                                  type="text"
                                  onChange={(e) => updateTestInGroup(group.id, testIndex, 'name', e.target.value)}
                                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 shadow-sm"
                                  placeholder="Type test name..."
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Result Value</label>
                                <input
                                  type="text"
                                  value={test.result}
                                  onChange={(e) => updateTestInGroup(group.id, testIndex, 'result', e.target.value)}
                                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600 shadow-sm text-lg"
                                  placeholder="0.0"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit</label>
                              <input
                                type="text"
                                value={test.unit}
                                onChange={(e) => updateTestInGroup(group.id, testIndex, 'unit', e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-500 shadow-sm italic"
                                placeholder="e.g. g/dL"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reference Range</label>
                              <input
                                type="text"
                                value={test.referenceRange}
                                onChange={(e) => updateTestInGroup(group.id, testIndex, 'referenceRange', e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-500 shadow-sm"
                                placeholder="e.g. 12 - 16"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Test Method</label>
                              <input
                                type="text"
                                value={test.method || ''}
                                onChange={(e) => updateTestInGroup(group.id, testIndex, 'method', e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-500 shadow-sm"
                                placeholder="e.g. GOD-POD"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Significance</label>
                              <input
                                type="text"
                                value={test.significance || ''}
                                onChange={(e) => updateTestInGroup(group.id, testIndex, 'significance', e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-500 shadow-sm"
                                placeholder="Clinical significance..."
                              />
                            </div>
                          </div>

                          {test.subParameters && test.subParameters.length > 0 && (
                            <div className="mt-6 space-y-4 pl-6 border-l-2 border-blue-100">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Sub Parameters</label>
                                {TEST_CATALOG.find(c => c.id === group.categoryId)?.subCategories?.find(sc => sc.id === group.subCategoryId)?.tests.find(t => t.name === test.name)?.subParameters && (
                                  <div className="relative group/sub">
                                    <button className="text-[9px] font-black text-blue-400 hover:text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                                      <Plus className="h-3 w-3" /> Add Sub Parameter
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 hidden group-hover/sub:block max-h-60 overflow-y-auto p-2">
                                      {TEST_CATALOG.find(c => c.id === group.categoryId)?.subCategories?.find(sc => sc.id === group.subCategoryId)?.tests.find(t => t.name === test.name)?.subParameters?.map((sp, i) => (
                                        <button
                                          key={i}
                                          onClick={() => {
                                            const newSubParam = applyMetadataDefaults({ ...sp, id: createId(), result: '' }, group.subCategoryName);
                                            setCategoryGroups(prev => prev.map(pg => {
                                              if (pg.id === group.id) {
                                                const newTests = [...pg.tests];
                                                newTests[testIndex] = {
                                                  ...newTests[testIndex],
                                                  subParameters: [...(newTests[testIndex].subParameters || []), newSubParam]
                                                };
                                                return { ...pg, tests: newTests };
                                              }
                                              return pg;
                                            }));
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                        >
                                          {sp.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {test.subParameters.map((subParam, spIndex) => (
                                  <div key={subParam.id || spIndex} className={cn(
                                    "grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border shadow-sm transition-all",
                                    subParam.isHeader 
                                      ? "bg-blue-50 border-blue-100 md:grid-cols-1" 
                                      : "bg-white border-slate-100"
                                  )}>
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">
                                          {subParam.isHeader ? 'Section Header' : 'Name'}
                                        </label>
                                        <div className={cn(
                                          "font-bold text-sm",
                                          subParam.isHeader ? "text-blue-900 uppercase tracking-tight" : "text-slate-700"
                                        )}>
                                          {subParam.name}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setCategoryGroups(prev => prev.map(pg => {
                                            if (pg.id === group.id) {
                                              const newTests = [...pg.tests];
                                              newTests[testIndex] = {
                                                ...newTests[testIndex],
                                                subParameters: newTests[testIndex].subParameters?.filter((_, i) => i !== spIndex)
                                              };
                                              return { ...pg, tests: newTests };
                                            }
                                            return pg;
                                          }));
                                        }}
                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                    {!subParam.isHeader && (
                                      <>
                                        <div className="space-y-1">
                                          <label className="text-[9px] font-black text-slate-400 uppercase">Result</label>
                                          <input
                                            type="text"
                                            value={subParam.result}
                                            onChange={(e) => updateSubParamInGroup(group.id, testIndex, spIndex, e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600 text-sm"
                                            placeholder="0.0"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Unit</label>
                                            <div className="text-xs text-slate-500 italic">{subParam.unit}</div>
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Range</label>
                                            <div className="text-xs text-slate-500">{subParam.referenceRange}</div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Method</label>
                                            <input
                                              type="text"
                                              value={subParam.method || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setCategoryGroups(prev => prev.map(pg => {
                                                  if (pg.id === group.id) {
                                                    const newTests = [...pg.tests];
                                                    const newSubParams = [...newTests[testIndex].subParameters!];
                                                    newSubParams[spIndex] = { ...newSubParams[spIndex], method: val };
                                                    newTests[testIndex] = { ...newTests[testIndex], subParameters: newSubParams };
                                                    return { ...pg, tests: newTests };
                                                  }
                                                  return pg;
                                                }));
                                              }}
                                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-[10px]"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase">Significance</label>
                                            <input
                                              type="text"
                                              value={subParam.significance || ''}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setCategoryGroups(prev => prev.map(pg => {
                                                  if (pg.id === group.id) {
                                                    const newTests = [...pg.tests];
                                                    const newSubParams = [...newTests[testIndex].subParameters!];
                                                    newSubParams[spIndex] = { ...newSubParams[spIndex], significance: val };
                                                    newTests[testIndex] = { ...newTests[testIndex], subParameters: newSubParams };
                                                    return { ...pg, tests: newTests };
                                                  }
                                                  return pg;
                                                }));
                                              }}
                                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-[10px]"
                                            />
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <ClipboardList className="h-5 w-5 text-slate-400" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Category Conclusion</h4>
                      </div>
                      <textarea
                        rows={3}
                        value={group.conclusion}
                        onChange={(e) => updateGroup(group.id, { conclusion: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-700"
                        placeholder="Enter conclusion for this category..."
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addCategoryGroup}
                  className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3"
                >
                  <Plus className="h-6 w-6" /> Add Another Test Category
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-black text-slate-700 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
        placeholder={placeholder}
      />
    </div>
  );
}

function SearchableDropdown({ label, value, options, onSelect, placeholder, allowCustom = false, disabled = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = query.length >= 2 
    ? options.filter((opt: any) => opt.name.toLowerCase().includes(query.toLowerCase()))
    : (query.length === 0 ? options.slice(0, 10) : []);

  const selectedOption = options.find((opt: any) => opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 outline-none font-bold text-slate-700 shadow-sm cursor-pointer flex justify-between items-center transition-all",
          disabled && "bg-slate-50 cursor-not-allowed opacity-60"
        )}
      >
        <span className={cn(selectedOption ? 'text-slate-900' : 'text-slate-400', disabled && "text-slate-300")}>
          {selectedOption ? selectedOption.name : (value && allowCustom ? value : placeholder)}
        </span>
        <ChevronDown className={cn("h-5 w-5 text-slate-300 transition-transform", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-transparent outline-none text-sm font-bold text-slate-700"
                placeholder="Type 2+ letters to search..."
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt: any) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onSelect(opt.id, opt.name);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer text-sm font-bold text-slate-700 flex items-center justify-between group"
                  >
                    {opt.name}
                    {value === opt.id && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-sm text-slate-400 italic">No results found</div>
              )}
              {allowCustom && query.length >= 2 && !options.some((o: any) => o.name.toLowerCase() === query.toLowerCase()) && (
                <div
                  onClick={() => {
                    onSelect('custom', query);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="px-5 py-3 bg-slate-50 hover:bg-blue-50 cursor-pointer text-sm font-black text-blue-600 border-t border-slate-100"
                >
                  + Add Custom: "{query}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
