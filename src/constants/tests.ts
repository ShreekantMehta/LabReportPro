export interface LabTest {
  name: string;
  unit: string;
  referenceRange: string;
  method?: string;
  significance?: string;
  isHeader?: boolean;
  subParameters?: LabTest[];
}

export interface SubCategory {
  id: string;
  name: string;
  tests: LabTest[];
}

export interface TestCategory {
  id: string;
  name: string;
  subCategories?: SubCategory[];
  tests?: LabTest[]; // Fallback for simple categories
}

export const TEST_CATALOG: TestCategory[] = [
  {
    id: 'hematology',
    name: 'HEMATOLOGY',
    subCategories: [
      {
        id: 'cbc',
        name: 'Complete Blood Count (CBC)',
        tests: [
          {
            name: 'COMPLETE BLOOD COUNT (CBC)',
            unit: '',
            referenceRange: '',
            subParameters: [
              { name: 'Haemoglobin', unit: 'g%', referenceRange: 'male : 14 - 16 g%\nFemale : 12 - 14 g%' },
              { name: 'RBC Count', unit: 'million/cu.mm.', referenceRange: '4.0 - 6.0 million / cu.mm' },
              { name: 'PCV', unit: '%', referenceRange: '35 - 60 %' },
              { name: 'RBC INDICES', unit: '', referenceRange: '', isHeader: true },
              { name: 'MCV', unit: 'fl', referenceRange: '80 - 99 fl' },
              { name: 'MCH', unit: 'pg', referenceRange: '27 - 31 pg' },
              { name: 'MCHC', unit: '%', referenceRange: '32 - 37 %' },
              { name: 'RDW', unit: 'fl', referenceRange: '9 - 17 fl' },
              { name: 'TOTAL WBC COUNT', unit: '', referenceRange: '', isHeader: true },
              { name: 'Total WBC Count', unit: '/ cumm', referenceRange: '4000 - 10.000 / cu.mm' },
              { name: 'Neutrophils', unit: '%', referenceRange: '40 - 70 %' },
              { name: 'Lymphocytes', unit: '%', referenceRange: '20 - 45 %' },
              { name: 'Eosinophils', unit: '%', referenceRange: '00 - 06 %' },
              { name: 'Monocytes', unit: '%', referenceRange: '00 - 08 %' },
              { name: 'Basophils', unit: '%', referenceRange: '00 - 01 %' },
              { name: 'PLATELETS', unit: '', referenceRange: '', isHeader: true },
              { name: 'Platelet Count', unit: 'lak/ cumm', referenceRange: '150000 - 450000 /lak cu.mm' },
              { name: 'Platelets on Smear', unit: '', referenceRange: 'Adequate On Smear' },
              { name: 'PERIPHERAL BLOOD SMEAR', unit: '', referenceRange: '', isHeader: true },
              { name: 'RBC Morphology', unit: '', referenceRange: 'Normocytic, Normochromic' },
              { name: 'WBCs on PS', unit: '', referenceRange: 'Normal' },
              { name: 'RDWSD', unit: 'fl', referenceRange: '37 - 54 fl' },
              { name: 'RDWCV', unit: '%', referenceRange: '11 - 16 %' },
              { name: 'MPV', unit: 'fl', referenceRange: '9 - 13 fl' },
              { name: 'P-LCR', unit: '%', referenceRange: '13 - 43 %' },
            ]
          },
          { name: 'Absolute Neutrophil Count', unit: '/cumm', referenceRange: '2000 - 7000' },
          { name: 'Absolute Lymphocyte Count', unit: '/cumm', referenceRange: '1000 - 3000' },
          { name: 'Absolute Eosinophil Count', unit: '/cumm', referenceRange: '40 - 440' },
          { name: 'Reticulocyte Count', unit: '%', referenceRange: '0.5 - 2.5 %' },
        ]
      },
      {
        id: 'coagulation',
        name: 'Coagulation Profile',
        tests: [
          { name: 'Prothrombin Time (PT)', unit: 'sec', referenceRange: '11 - 15 sec' },
          { name: 'INR', unit: '', referenceRange: '0.8 - 1.2' },
          { name: 'APTT', unit: 'sec', referenceRange: '25 - 35 sec' },
          { name: 'Fibrinogen', unit: 'mg/dL', referenceRange: '200 - 400 mg/dL' },
          { name: 'D-Dimer', unit: 'ng/mL', referenceRange: '< 500 ng/mL' },
          { name: 'Bleeding Time (BT)', unit: 'min', referenceRange: '2 - 7 min' },
          { name: 'Clotting Time (CT)', unit: 'min', referenceRange: '5 - 11 min' },
          { name: 'Thrombin Time', unit: 'sec', referenceRange: '14 - 19' },
          { name: 'Factor VIII Assay', unit: '%', referenceRange: '50 - 150' },
          { name: 'Factor IX Assay', unit: '%', referenceRange: '50 - 150' },
          { name: 'Protein C', unit: '%', referenceRange: '70 - 140' },
          { name: 'Protein S', unit: '%', referenceRange: '70 - 140' },
          { name: 'Antithrombin III', unit: '%', referenceRange: '80 - 120' },
        ]
      },
      {
        id: 'special_hem',
        name: 'Special Hematology',
        tests: [
          { name: 'ESR (Westergren)', unit: 'mm/hr', referenceRange: 'Male: 0-15, Female: 0-20' },
          { name: 'Blood Group & Rh Type', unit: '', referenceRange: '-' },
          { name: 'Direct Coombs Test', unit: '', referenceRange: 'Negative' },
          { name: 'Indirect Coombs Test', unit: '', referenceRange: 'Negative' },
          { name: 'G6PD Screen', unit: '', referenceRange: 'Normal' },
          { name: 'Hb Electrophoresis', unit: '', referenceRange: '-' },
          { name: 'Sickling Test', unit: '', referenceRange: 'Negative' },
          { name: 'Osmotic Fragility', unit: '', referenceRange: '-' },
          { name: 'LE Cell Phenomenon', unit: '', referenceRange: 'Negative' },
        ]
      }
    ]
  },
  {
    id: 'biochemistry',
    name: 'BIOCHEMISTRY',
    subCategories: [
      {
        id: 'lft',
        name: 'Liver Function Tests (LFT)',
        tests: [
          { 
            name: 'Bilirubin', 
            unit: '', 
            referenceRange: '-', 
            subParameters: [
              { name: 'Bilirubin Total', unit: 'mg/dL', referenceRange: '0.1 - 1.2' },
              { name: 'Bilirubin Direct', unit: 'mg/dL', referenceRange: '0.1 - 0.4' },
              { name: 'Bilirubin Indirect', unit: 'mg/dL', referenceRange: '0.1 - 0.7' },
            ]
          },
          { name: 'SGOT (AST)', unit: 'U/L', referenceRange: 'Up to 40' },
          { name: 'SGPT (ALT)', unit: 'U/L', referenceRange: 'Up to 40' },
          { name: 'Alkaline Phosphatase', unit: 'U/L', referenceRange: '40 - 130' },
          { name: 'Total Proteins', unit: 'g/dL', referenceRange: '6.0 - 8.3' },
          { name: 'Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.0' },
          { name: 'Globulin', unit: 'g/dL', referenceRange: '2.0 - 3.5' },
          { name: 'A/G Ratio', unit: '', referenceRange: '1.1 - 2.2' },
          { name: 'GGTP', unit: 'U/L', referenceRange: 'Up to 50' },
          { name: 'Serum Ammonia', unit: 'µmol/L', referenceRange: '15 - 45' },
        ]
      },
      {
        id: 'kft',
        name: 'Renal / Kidney Function (KFT)',
        tests: [
          { name: 'Urea', unit: 'mg/dL', referenceRange: '15 - 45' },
          { name: 'Creatinine', unit: 'mg/dL', referenceRange: '0.6 - 1.2' },
          { name: 'Uric Acid', unit: 'mg/dL', referenceRange: '3.5 - 7.2' },
          { name: 'BUN', unit: 'mg/dL', referenceRange: '7 - 20' },
          { name: 'eGFR', unit: 'mL/min/1.73m2', referenceRange: '> 90' },
          { name: 'Cystatin C', unit: 'mg/L', referenceRange: '0.6 - 1.0' },
        ]
      },
      {
        id: 'lipid',
        name: 'Lipid Profile',
        tests: [
          { 
            name: 'Lipid Profile', 
            unit: '', 
            referenceRange: '-', 
            subParameters: [
              { name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200' },
              { name: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150' },
              { name: 'HDL Cholesterol', unit: 'mg/dL', referenceRange: '> 40' },
              { name: 'LDL Cholesterol', unit: 'mg/dL', referenceRange: '< 100' },
              { name: 'VLDL Cholesterol', unit: 'mg/dL', referenceRange: '10 - 30' },
              { name: 'Apo A1', unit: 'mg/dL', referenceRange: '110 - 180' },
              { name: 'Apo B', unit: 'mg/dL', referenceRange: '60 - 110' },
              { name: 'Lipoprotein (a)', unit: 'mg/dL', referenceRange: '< 30' },
            ]
          },
        ]
      },
      {
        id: 'diabetes',
        name: 'Diabetic Profile',
        tests: [
          { name: 'Blood Sugar (Fasting)', unit: 'mg/dL', referenceRange: '70 - 100' },
          { name: 'Blood Sugar (PP)', unit: 'mg/dL', referenceRange: '< 140' },
          { 
            name: 'Blood Sugar (Random)', 
            unit: 'mg/dL', 
            referenceRange: '70 - 140',
            method: 'GOD-POD',
            significance: 'Random blood glucose is a check of the glucose level in the blood at any time of the day. It is used to screen for diabetes and monitor blood sugar levels.'
          },
          { name: 'Blood Sugar Report (FBS / PP)', unit: 'mg/dL', referenceRange: '-' },
          { name: 'HbA1c', unit: '%', referenceRange: '4.0 - 5.6' },
          { name: 'Glycosylated Haemoglobin (GLY - C)', unit: '%', referenceRange: '4.0 - 5.6' },
          { name: 'Fructosamine', unit: 'µmol/L', referenceRange: '200 - 285' },
          { name: 'Insulin (Fasting)', unit: 'µIU/mL', referenceRange: '2.6 - 24.9' },
          { name: 'C-Peptide', unit: 'ng/mL', referenceRange: '1.1 - 4.4' },
          { name: 'HOMA-IR', unit: '', referenceRange: '< 2.5' },
        ]
      },
      {
        id: 'general_chem',
        name: 'General Chemistry',
        tests: [
          { name: 'Serum Chemistry', unit: '', referenceRange: '-' },
          { name: 'GGT', unit: 'U/L', referenceRange: 'Up to 50' },
          { name: 'Amylase', unit: 'U/L', referenceRange: '28 - 100' },
          { name: 'Lipase', unit: 'U/L', referenceRange: '13 - 60' },
        ]
      },
      {
        id: 'cardiac',
        name: 'Cardiac Markers',
        tests: [
          { name: 'Cardiac Profile', unit: '', referenceRange: '-' },
          { name: 'Troponin I (hs)', unit: 'ng/L', referenceRange: '< 14' },
          { name: 'Troponin T', unit: 'ng/mL', referenceRange: '< 0.01' },
          { name: 'CK-MB', unit: 'U/L', referenceRange: '0 - 25' },
          { name: 'CPK - MB', unit: 'U/L', referenceRange: '0 - 25' },
          { name: 'CPK (Total)', unit: 'U/L', referenceRange: '25 - 190' },
          { name: 'NT-proBNP', unit: 'pg/mL', referenceRange: '< 125' },
          { name: 'Myoglobin', unit: 'ng/mL', referenceRange: '< 70' },
          { name: 'Homocysteine', unit: 'µmol/L', referenceRange: '< 15' },
        ]
      }
    ]
  },
  {
    id: 'hormones',
    name: 'HORMONES & ENDOCRINOLOGY',
    subCategories: [
      {
        id: 'thyroid',
        name: 'Thyroid Profile',
        tests: [
          { name: 'T3 T4 TSH', unit: '', referenceRange: '-' },
          { name: 'Total T3', unit: 'ng/dL', referenceRange: '80 - 200' },
          { name: 'Total T4', unit: 'µg/dL', referenceRange: '5.0 - 12.0' },
          { name: 'TSH', unit: 'µIU/mL', referenceRange: '0.4 - 4.2' },
          { name: 'Free T3', unit: 'pg/mL', referenceRange: '2.3 - 4.2' },
          { name: 'Free T4', unit: 'ng/dL', referenceRange: '0.8 - 1.8' },
          { name: 'Anti-TPO', unit: 'IU/mL', referenceRange: '< 34' },
          { name: 'Anti-TG', unit: 'IU/mL', referenceRange: '< 115' },
          { name: 'Anti Microsomal Antibody (AMA)', unit: 'IU/mL', referenceRange: '< 34' },
          { name: 'Anti Thyroglobulin Antibody', unit: 'IU/mL', referenceRange: '< 115' },
          { name: 'Reverse T3', unit: 'ng/dL', referenceRange: '9 - 25' },
        ]
      },
      {
        id: 'fertility',
        name: 'Fertility & Reproductive',
        tests: [
          { name: 'FSH', unit: 'mIU/mL', referenceRange: '-' },
          { name: 'LH', unit: 'mIU/mL', referenceRange: '-' },
          { name: 'Prolactin', unit: 'ng/mL', referenceRange: '-' },
          { name: 'Estradiol (E2)', unit: 'pg/mL', referenceRange: '-' },
          { name: 'Progesterone', unit: 'ng/mL', referenceRange: '-' },
          { name: 'Testosterone (Total)', unit: 'ng/dL', referenceRange: '-' },
          { name: 'Free Testosterone', unit: 'pg/mL', referenceRange: '-' },
          { name: 'AMH', unit: 'ng/mL', referenceRange: '1.0 - 4.0' },
          { name: 'DHEAS', unit: 'µg/dL', referenceRange: '-' },
          { name: 'SHBG', unit: 'nmol/L', referenceRange: '-' },
          { name: 'Post Coital Test Report', unit: '', referenceRange: '-' },
        ]
      },
      {
        id: 'adrenal',
        name: 'Adrenal & Others',
        tests: [
          { name: 'Cortisol (AM)', unit: 'µg/dL', referenceRange: '5 - 23' },
          { name: 'Cortisol (PM)', unit: 'µg/dL', referenceRange: '3 - 13' },
          { name: 'ACTH', unit: 'pg/mL', referenceRange: '7 - 63' },
          { name: 'Aldosterone', unit: 'ng/dL', referenceRange: '3 - 16' },
          { name: 'Renin', unit: 'µU/mL', referenceRange: '4 - 46' },
          { name: 'Growth Hormone', unit: 'ng/mL', referenceRange: '< 5' },
          { name: 'IGF-1', unit: 'ng/mL', referenceRange: '-' },
          { name: 'PTH', unit: 'pg/mL', referenceRange: '15 - 65' },
        ]
      }
    ]
  },
  {
    id: 'serology',
    name: 'SEROLOGY & IMMUNOLOGY',
    subCategories: [
      {
        id: 'viral',
        name: 'Viral Markers',
        tests: [
          { name: 'HIV I & II (Ab/Ag)', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'HBsAg', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'HCV Ab', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'HAV IgM', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'HEV IgM', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'HBeAg', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'Anti-HBs', unit: 'mIU/mL', referenceRange: '> 10 (Protected)' },
        ]
      },
      {
        id: 'infectious',
        name: 'Infectious Diseases',
        tests: [
          { name: 'Widal Test', unit: '', referenceRange: 'Negative' },
          { name: 'Widal Test (Tube Method)', unit: '', referenceRange: 'Negative' },
          { name: 'Dengue NS1', unit: '', referenceRange: 'Negative' },
          { name: 'Dengue -IgG/ IgM', unit: '', referenceRange: 'Negative' },
          { name: 'Dengue IgM/IgG', unit: '', referenceRange: 'Negative' },
          { name: 'Malaria Antigen', unit: '', referenceRange: 'Negative' },
          { name: 'VDRL Test', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'VDRL / RPR', unit: '', referenceRange: 'Non-Reactive' },
          { name: 'TPHA', unit: '', referenceRange: 'Negative' },
          { name: 'A.S.O. Titre Report', unit: 'IU/mL', referenceRange: '< 200' },
          { name: 'ASO Titre', unit: 'IU/mL', referenceRange: '< 200' },
          { name: 'Slide Test for Anti - Streptolysin O', unit: 'IU/mL', referenceRange: '< 200' },
          { name: 'C - Reactive Protein (CRP)', unit: 'mg/L', referenceRange: '< 5.0' },
          { name: 'Slide Test for C - Reactive Protein', unit: 'mg/L', referenceRange: '< 5.0' },
          { name: 'CRP', unit: 'mg/L', referenceRange: '< 5.0' },
          { name: 'RA Factor', unit: 'IU/mL', referenceRange: '< 14' },
          { name: 'R.A. Test', unit: 'IU/mL', referenceRange: '< 14' },
          { name: 'Rheumatoid Factor [ RF ] in Human', unit: 'IU/mL', referenceRange: '< 14' },
          { name: 'Leptospira - IgG / IgM', unit: '', referenceRange: 'Negative' },
          { name: 'Mantoux Test', unit: 'mm', referenceRange: '< 5 mm' },
          { name: 'ELISA Test for Tuberculosis', unit: '', referenceRange: 'Negative' },
        ]
      },
      {
        id: 'torch',
        name: 'TORCH Profile',
        tests: [
          { name: 'Toxoplasma IgM/IgG', unit: '', referenceRange: 'Negative' },
          { name: 'Rubella IgM/IgG', unit: '', referenceRange: 'Negative' },
          { name: 'CMV IgM/IgG', unit: '', referenceRange: 'Negative' },
          { name: 'HSV 1 & 2 IgM/IgG', unit: '', referenceRange: 'Negative' },
        ]
      },
      {
        id: 'autoimmune',
        name: 'Autoimmune Profile',
        tests: [
          { name: 'ANA (IF)', unit: '', referenceRange: 'Negative' },
          { name: 'ANA Profile (Blot)', unit: '', referenceRange: '-' },
          { name: 'Anti-dsDNA', unit: 'IU/mL', referenceRange: '< 25' },
          { name: 'Anti-CCP', unit: 'U/mL', referenceRange: '< 20' },
          { name: 'ANCA (p/c)', unit: '', referenceRange: 'Negative' },
          { name: 'Anti-Cardiolipin Ab', unit: '', referenceRange: 'Negative' },
        ]
      }
    ]
  },
  {
    id: 'clinical_path',
    name: 'CLINICAL PATHOLOGY',
    subCategories: [
      {
        id: 'urine',
        name: 'Urine Analysis',
        tests: [
          { 
            name: 'Physical Examination', 
            unit: '', 
            referenceRange: '-', 
            subParameters: [
              { name: 'Quantity', unit: 'ml', referenceRange: '-' },
              { name: 'Colour', unit: '', referenceRange: 'Yellowish' },
              { name: 'Appearance', unit: '', referenceRange: 'Clear' },
              { name: 'Deposit', unit: '', referenceRange: 'Absent' },
              { name: 'pH', unit: '', referenceRange: 'Acidic' },
              { name: 'Specific Gravity', unit: '', referenceRange: '1.005 - 1.030' },
            ]
          },
          { 
            name: 'Chemical Examination', 
            unit: '', 
            referenceRange: '-', 
            subParameters: [
              { name: 'Proteins', unit: '', referenceRange: 'Absent' },
              { name: 'Sugar', unit: '', referenceRange: 'Absent' },
              { name: 'Ketone', unit: '', referenceRange: 'Absent' },
              { name: 'Bile Pigment', unit: '', referenceRange: 'Absent' },
              { name: 'Bile Salts', unit: '', referenceRange: 'Absent' },
              { name: 'Occult Blood', unit: '', referenceRange: 'Absent' },
              { name: 'Urobilinogen', unit: '', referenceRange: 'Normal' },
            ]
          },
          { 
            name: 'Microscopic Examination', 
            unit: '', 
            referenceRange: '-', 
            subParameters: [
              { name: 'Pus Cells', unit: '/hpf', referenceRange: 'Absent' },
              { name: 'Epithelial Cells', unit: '/hpf', referenceRange: 'Few Seen' },
              { name: 'Red Blood Cells', unit: '/hpf', referenceRange: 'Absent' },
              { name: 'Casts', unit: '', referenceRange: 'Absent' },
              { name: 'Crystals', unit: '', referenceRange: 'Absent' },
              { name: 'Other Findings', unit: '', referenceRange: 'Nil' },
              { name: 'Comments', unit: '', referenceRange: '-' },
            ]
          },
          { name: 'Urine for Pregnancy Test', unit: '', referenceRange: 'Negative' },
          { name: '24 Hours Urinary Proteins', unit: 'mg/24hr', referenceRange: '< 150' },
          { name: '24 Hr Urine Protein', unit: 'mg/24hr', referenceRange: '< 150' },
          { name: '24 Hrs. Urine Albumin', unit: 'mg/24hr', referenceRange: '< 30' },
          { name: 'Urine Microalbumin', unit: 'mg/L', referenceRange: '< 20' },
          { name: 'Urine Creatinine', unit: 'mg/dL', referenceRange: '-' },
          { name: 'Albumin/Creatinine Ratio', unit: 'mg/g', referenceRange: '< 30' },
          { name: 'Bence Jones Protein', unit: '', referenceRange: 'Negative' },
        ]
      },
      {
        id: 'stool',
        name: 'Stool Analysis',
        tests: [
          { name: 'Stool Routine', unit: '', referenceRange: '-' },
          { name: 'Stool Occult Blood', unit: '', referenceRange: 'Negative' },
          { name: 'Stool Reducing Sugar', unit: '', referenceRange: 'Negative' },
          { name: 'Stool Hanging Drop', unit: '', referenceRange: 'Negative' },
          { name: 'Stool Calprotectin', unit: 'µg/g', referenceRange: '< 50' },
        ]
      },
      {
        id: 'fluids',
        name: 'Body Fluids Analysis',
        tests: [
          { name: 'Semen Analysis', unit: '', referenceRange: '-' },
          { name: 'C.S.F. Examination', unit: '', referenceRange: '-' },
          { name: 'CSF Analysis', unit: '', referenceRange: '-' },
          { name: 'Pleural Fluid', unit: '', referenceRange: '-' },
          { name: 'Pleural Fluid Analysis', unit: '', referenceRange: '-' },
          { name: 'Ascitic Fluid Analysis', unit: '', referenceRange: '-' },
          { name: 'Examination of Pleural Fluid / Ascitic Fluid', unit: '', referenceRange: '-' },
          { name: 'Synovial Fluid Analysis', unit: '', referenceRange: '-' },
        ]
      }
    ]
  },
  {
    id: 'microbiology',
    name: 'MICROBIOLOGY',
    subCategories: [
      {
        id: 'stains',
        name: 'Stains & Smears',
        tests: [
          { name: 'Gram Stain', unit: '', referenceRange: '-' },
          { name: 'AFB Stain', unit: '', referenceRange: 'Negative' },
          { name: 'KOH Mount', unit: '', referenceRange: 'Negative' },
          { name: 'Albert Stain', unit: '', referenceRange: 'Negative' },
          { name: 'Giemsa Stain', unit: '', referenceRange: '-' },
          { name: 'India Ink Prep', unit: '', referenceRange: 'Negative' },
          { name: 'Sputum for AFB', unit: '', referenceRange: 'Negative' },
          { name: 'Examination of Sputum', unit: '', referenceRange: '-' },
          { name: 'Sputum Examination', unit: '', referenceRange: '-' },
          { name: 'Smear Examination for Cryptosoridium', unit: '', referenceRange: 'Negative' },
        ]
      },
      {
        id: 'cultures',
        name: 'Cultures',
        tests: [
          { name: 'Culture Test', unit: '', referenceRange: 'No Growth' },
          { name: 'Sensitivity Test', unit: '', referenceRange: '-' },
          { name: 'Susceptibility Test', unit: '', referenceRange: '-' },
          { 
            name: 'Urine Culture', 
            unit: '', 
            referenceRange: '-', 
            subParameters: [
              { name: 'Protein', unit: '', referenceRange: '-' },
              { name: 'Red Blood Cell', unit: '', referenceRange: '-' },
              { name: 'Pus Cell', unit: '', referenceRange: '-' },
              { name: 'Epithelial Cell', unit: '', referenceRange: '-' },
              { name: 'Occult Blood', unit: '', referenceRange: '-' },
              { name: "Gram's Stain", unit: '', referenceRange: '-' },
              { name: 'Z.N. Stain', unit: '', referenceRange: '-' },
              { name: 'Urine Culture', unit: '', referenceRange: 'No Growth' },
              { name: 'Colony Count', unit: '', referenceRange: '-' },
            ]
          },
          { name: 'Blood Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Cultural Examination of Blood', unit: '', referenceRange: 'No Growth' },
          { name: 'Pus Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Sputum Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Sputum Culture and Sensitivity Test', unit: '', referenceRange: 'No Growth' },
          { name: 'Stool Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Cultural Examination of Stool', unit: '', referenceRange: 'No Growth' },
          { name: 'Stool Culture and Sensitivity Test', unit: '', referenceRange: 'No Growth' },
          { name: 'Throat Swab Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Vaginal Swab Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Fungal Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Anaerobic Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Drain Fluid Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Pleural Fluid Culture', unit: '', referenceRange: 'No Growth' },
          { name: 'Semen Culture and Sensitivity Test', unit: '', referenceRange: 'No Growth' },
        ]
      }
    ]
  },
  {
    id: 'molecular',
    name: 'MOLECULAR DIAGNOSTICS (PCR)',
    subCategories: [
      {
        id: 'pcr_viral',
        name: 'Viral PCR',
        tests: [
          { name: 'HIV-1 Viral Load', unit: 'copies/mL', referenceRange: 'Not Detected' },
          { name: 'HCV Viral Load', unit: 'IU/mL', referenceRange: 'Not Detected' },
          { name: 'HBV Viral Load', unit: 'IU/mL', referenceRange: 'Not Detected' },
          { name: 'COVID-19 RT-PCR', unit: '', referenceRange: 'Negative' },
          { name: 'HPV DNA High Risk', unit: '', referenceRange: 'Negative' },
          { name: 'CMV PCR Quantitative', unit: 'copies/mL', referenceRange: 'Not Detected' },
        ]
      },
      {
        id: 'pcr_others',
        name: 'Other PCR Tests',
        tests: [
          { name: 'MTB PCR (GeneXpert)', unit: '', referenceRange: 'Not Detected' },
          { name: 'HLA-B27 PCR', unit: '', referenceRange: 'Negative' },
          { name: 'JAK2 V617F Mutation', unit: '', referenceRange: 'Negative' },
          { name: 'BCR-ABL Quantitative', unit: '', referenceRange: 'Not Detected' },
        ]
      }
    ]
  },
  {
    id: 'specialized',
    name: 'SPECIALIZED TESTS',
    subCategories: [
      {
        id: 'vitamins',
        name: 'Vitamins & Iron Study',
        tests: [
          { name: 'Iron Study', unit: '', referenceRange: '-' },
          { name: 'Vitamin B12', unit: 'pg/mL', referenceRange: '200 - 900' },
          { name: 'Vitamin D (25-OH)', unit: 'ng/mL', referenceRange: '30 - 100' },
          { name: 'Folic Acid', unit: 'ng/mL', referenceRange: '3.1 - 17.5' },
          { name: 'Serum Iron', unit: 'µg/dL', referenceRange: '60 - 170' },
          { name: 'Ferritin', unit: 'ng/mL', referenceRange: '-' },
          { name: 'TIBC', unit: 'µg/dL', referenceRange: '250 - 450' },
          { name: 'Zinc', unit: 'µg/dL', referenceRange: '60 - 120' },
          { name: 'Copper', unit: 'µg/dL', referenceRange: '70 - 150' },
        ]
      },
      {
        id: 'tumor',
        name: 'Tumor Markers',
        tests: [
          { name: 'PSA (Total)', unit: 'ng/mL', referenceRange: '< 4.0' },
          { name: 'AFP', unit: 'ng/mL', referenceRange: '< 10' },
          { name: 'CEA', unit: 'ng/mL', referenceRange: '< 5.0' },
          { name: 'CA-125', unit: 'U/mL', referenceRange: '< 35' },
          { name: 'CA 19-9', unit: 'U/mL', referenceRange: '< 37' },
          { name: 'CA 15-3', unit: 'U/mL', referenceRange: '< 31' },
          { name: 'Beta-2 Microglobulin', unit: 'mg/L', referenceRange: '1.1 - 2.4' },
        ]
      },
      {
        id: 'toxicology',
        name: 'Toxicology & Drugs',
        tests: [
          { name: 'Digoxin', unit: 'ng/mL', referenceRange: '0.8 - 2.0' },
          { name: 'Lithium', unit: 'mmol/L', referenceRange: '0.6 - 1.2' },
          { name: 'Phenytoin', unit: 'µg/mL', referenceRange: '10 - 20' },
          { name: 'Valproic Acid', unit: 'µg/mL', referenceRange: '50 - 100' },
          { name: 'Urine Drug Screen (10 Panel)', unit: '', referenceRange: 'Negative' },
        ]
      },
      {
        id: 'others_special',
        name: 'Other Specialized Tests',
        tests: [
          { name: 'Stone Analysis', unit: '', referenceRange: '-' },
        ]
      }
    ]
  },
  {
    id: 'histopathology',
    name: 'HISTOPATHOLOGY & CYTOLOGY',
    subCategories: [
      {
        id: 'cytology',
        name: 'Cytology',
        tests: [
          { name: 'FNAC', unit: '', referenceRange: '-' },
          { name: 'Pap Smear', unit: '', referenceRange: '-' },
          { name: 'Fluid Cytology', unit: '', referenceRange: '-' },
          { name: 'Cell Block', unit: '', referenceRange: '-' },
        ]
      },
      {
        id: 'biopsy',
        name: 'Biopsy / Histology',
        tests: [
          { name: 'Small Tissue Biopsy', unit: '', referenceRange: '-' },
          { name: 'Medium Tissue Biopsy', unit: '', referenceRange: '-' },
          { name: 'Large Specimen Biopsy', unit: '', referenceRange: '-' },
          { name: 'Radical Resection', unit: '', referenceRange: '-' },
        ]
      }
    ]
  },
  {
    id: 'genetics',
    name: 'GENETICS & CYTOGENETICS',
    tests: [
      { name: 'Karyotyping (Blood)', unit: '', referenceRange: 'Normal' },
      { name: 'FISH for BCR-ABL', unit: '', referenceRange: 'Negative' },
      { name: 'FISH for Trisomy 21', unit: '', referenceRange: 'Negative' },
      { name: 'Quadruple Marker Screen', unit: '', referenceRange: 'Low Risk' },
      { name: 'NIPT (Non-Invasive Prenatal)', unit: '', referenceRange: 'Low Risk' },
    ]
  }
];


