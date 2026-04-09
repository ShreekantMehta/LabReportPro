import React from 'react';

type ReportPreviewMode = 'preview' | 'export';

export default function ReportPreview({
  labProfile,
  patientData,
  categoryGroups,
  resultsCache,
  mode = 'preview',
}: any) {
  const previewMode: ReportPreviewMode = mode === 'export' ? 'export' : 'preview';
  const today = new Date();
  const reportDate = patientData.reportDate || today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const reportTestNames = new Set(
    categoryGroups.flatMap((g: any) => g.tests.map((t: any) => t.name)),
  );

  const stashedItems = resultsCache
    ? Object.values(resultsCache).filter((t: any) => t.name && !reportTestNames.has(t.name))
    : [];

  const pageCount = categoryGroups.length + (stashedItems.length > 0 ? 1 : 0);

  const getAbnormalMarker = (result: string, range: string) => {
    if (!result || !range || range === '-') return null;
    const val = parseFloat(result);
    if (Number.isNaN(val)) return null;

    const lines = range.split('\n');
    for (const line of lines) {
      if (line.includes('<')) {
        const limit = parseFloat(line.split('<')[1].trim());
        if (!Number.isNaN(limit)) return val >= limit ? 'H' : null;
      }

      if (line.includes('>')) {
        const limit = parseFloat(line.split('>')[1].trim());
        if (!Number.isNaN(limit)) return val <= limit ? 'L' : null;
      }

      if (line.toLowerCase().includes('up to')) {
        const limit = parseFloat(line.toLowerCase().split('up to')[1].trim());
        if (!Number.isNaN(limit)) return val > limit ? 'H' : null;
      }

      if (line.includes('-')) {
        const parts = line
          .split('-')
          .map((p) => parseFloat(p.trim().replace(/[^\d.]/g, '')));
        if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
          if (val < parts[0]) return 'L';
          if (val > parts[1]) return 'H';
          return null;
        }
      }
    }

    return null;
  };

  const hasAbnormalResults = categoryGroups.some((g: any) =>
    g.tests.some((t: any) => {
      if (getAbnormalMarker(t.result, t.referenceRange)) return true;
      return t.subParameters?.some((sp: any) => getAbnormalMarker(sp.result, sp.referenceRange));
    }),
  );

  const wrapperClassName =
    previewMode === 'export'
      ? 'flex flex-col gap-0 bg-white p-0'
      : 'bg-slate-100 p-8 flex flex-col gap-8 print:p-0 print:bg-white print:gap-0';

  const pageClassName = (forceBreak = false) =>
    `report-page min-h-[297mm] w-[210mm] mx-auto relative flex flex-col ${
      previewMode === 'preview' ? 'shadow-sm ' : ''
    }${forceBreak ? 'page-break-before-always' : ''}`;

  const Header = ({ title, subtitle }: { title?: string; subtitle?: string }) => (
    <>
      {labProfile?.useLetterhead && labProfile?.letterheadUrl ? (
        <div
          style={{
            width: '100%',
            minHeight: '135px',
            maxHeight: '165px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <img
            src={labProfile.letterheadUrl}
            alt="Letterhead"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center top',
              display: 'block',
            }}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
            color: 'white',
            padding: '24px 40px 20px 40px',
            borderBottom: '4px solid #93c5fd',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {labProfile?.logoUrl ? (
                      <img
                        src={labProfile.logoUrl}
                        alt="Logo"
                        style={{ height: '60px', width: 'auto', filter: 'brightness(0) invert(1)' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        style={{
                          height: '50px',
                          width: '50px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '900',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        LAB
                      </div>
                    )}
                    <div>
                      <h1
                        style={{
                          fontSize: '24px',
                          fontWeight: '900',
                          margin: 0,
                          textTransform: 'uppercase',
                        }}
                      >
                        {title || labProfile?.labName || 'Labsmart Software'}
                      </h1>
                      <p style={{ fontSize: '12px', fontWeight: '700', margin: '2px 0 0 0', opacity: 0.84 }}>
                        {subtitle || labProfile?.tagline || 'Diagnostic Center'}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'middle', fontSize: '10px', fontWeight: '700' }}>
                  <p style={{ margin: '0 0 2px 0' }}>
                    Regd. No: {labProfile?.regNo || labProfile?.registrationNumber || 'XXXX54826XX'}
                  </p>
                  <p style={{ margin: '0 0 2px 0' }}>Phone: {labProfile?.phone || '+91 12345 67890'}</p>
                  <p style={{ margin: '0 0 2px 0' }}>Email: {labProfile?.email || 'lab@example.com'}</p>
                  <p style={{ margin: 0 }}>Web: {labProfile?.website || 'www.lab.com'}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const Footer = ({ pageNumber }: { pageNumber: number }) => (
    <>
      <div style={{ marginTop: 'auto', padding: '0 40px 40px 40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'center' }}>
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 100 40" style={{ height: '40px', opacity: 0.2 }}>
                    <path d="M10 30 Q 30 10, 50 30 T 90 30" fill="none" stroke="black" strokeWidth="1" />
                  </svg>
                </div>
                <p style={{ fontSize: '11px', fontWeight: '900', margin: 0 }}>
                  {labProfile?.technicianName || 'Mr. Sachin Sharma'}
                </p>
                <p
                  style={{
                    fontSize: '9px',
                    color: '#64748b',
                    margin: '2px 0 0 0',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                  }}
                >
                  {labProfile?.technicianDegree || 'DMLT, Lab Incharge'}
                </p>
              </td>
              <td style={{ width: '50%', textAlign: 'center' }}>
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {labProfile?.signatureUrl ? (
                    <img
                      src={labProfile.signatureUrl}
                      alt="Sign"
                      style={{ height: '50px', objectFit: 'contain' }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <svg viewBox="0 0 100 40" style={{ height: '40px', opacity: 0.2 }}>
                      <path d="M10 20 C 20 10, 40 10, 50 20 S 80 30, 90 20" fill="none" stroke="black" strokeWidth="1" />
                    </svg>
                  )}
                </div>
                <p style={{ fontSize: '11px', fontWeight: '900', margin: 0 }}>
                  {labProfile?.doctorName || 'Dr. A. K. Asthana'}
                </p>
                <p
                  style={{
                    fontSize: '9px',
                    color: '#64748b',
                    margin: '2px 0 0 0',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                  }}
                >
                  {labProfile?.doctorDegree || 'MBBS, MD Pathologist'}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            marginTop: '15px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: '#94a3b8',
            fontWeight: '700',
          }}
        >
          <span>Page {pageNumber} of {pageCount}</span>
          <span>{labProfile?.labName || 'LabReportPro'} Report</span>
        </div>
      </div>

      <div style={{ borderTop: '4px solid #1e3a8a', padding: '15px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: '900', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
          NOT VALID FOR MEDICO LEGAL PURPOSE
        </p>
        <p style={{ fontSize: '9px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '700' }}>
          Work timings: {labProfile?.workTimings || 'Monday to Sunday, 8 am to 8 pm'}
        </p>
        <p
          style={{
            fontSize: '8px',
            color: '#94a3b8',
            margin: 0,
            maxWidth: '650px',
            marginInline: 'auto',
            fontStyle: 'italic',
          }}
        >
          Please correlate clinically. Although the test results are checked thoroughly, in case of any unexpected
          result caused by instrument, clerical, or processing error, contact the lab immediately for review.
        </p>
      </div>
    </>
  );

  return (
    <div className={wrapperClassName}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');
        .report-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #000000;
          line-height: 1.2;
          background: white;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        table { table-layout: fixed; width: 100%; border-collapse: collapse; }
        th, td { overflow: hidden; word-wrap: break-word; }
      `,
        }}
      />

      {categoryGroups.map((group: any, index: number) => (
        <div
          key={group.id}
          className={pageClassName(index > 0)}
          style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}
        >
          <Header />

          <div style={{ padding: '20px 40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top', width: '55%' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0' }}>
                      {patientData.patientName || 'N/A'}
                    </h2>
                    <table style={{ width: '100%', fontSize: '10px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '80px', fontWeight: '700', color: '#666' }}>AGE / SEX</td>
                          <td style={{ fontWeight: '900' }}>: {patientData.age} YRS / {patientData.gender?.[0]}</td>
                          <td style={{ width: '80px', fontWeight: '700', color: '#666', paddingLeft: '10px' }}>
                            REFERRED BY
                          </td>
                          <td style={{ fontWeight: '900' }}>: {patientData.doctorName || 'Self'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: '700', color: '#666' }}>REG. NO.</td>
                          <td style={{ fontWeight: '900' }}>: {patientData.labNo || '1001'}</td>
                          <td style={{ fontWeight: '700', color: '#666', paddingLeft: '10px' }}>PATIENT ID</td>
                          <td style={{ fontWeight: '900' }}>: {patientData.patientId || 'Walk-in'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: '35%', paddingLeft: '20px' }}>
                    <div
                      style={{
                        border: '1px solid #dbeafe',
                        padding: '10px',
                        backgroundColor: '#f8fbff',
                        borderRadius: '8px',
                      }}
                    >
                      <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ fontWeight: '700', color: '#666' }}>REGISTERED ON</td>
                            <td style={{ textAlign: 'right', fontWeight: '900' }}>: {patientData.regDate || reportDate}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: '700', color: '#666' }}>COLLECTED ON</td>
                            <td style={{ textAlign: 'right', fontWeight: '900' }}>: {patientData.sampleDate || reportDate}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: '700', color: '#666' }}>RECEIVED ON</td>
                            <td style={{ textAlign: 'right', fontWeight: '900' }}>: {patientData.sampleDate || reportDate}</td>
                          </tr>
                          <tr>
                            <td style={{ fontWeight: '700', color: '#666' }}>REPORTED ON</td>
                            <td style={{ textAlign: 'right', fontWeight: '900' }}>: {reportDate}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                  <td style={{ width: '10%', textAlign: 'right', verticalAlign: 'middle' }}>
                    <div
                      style={{
                        width: '72px',
                        minHeight: '52px',
                        border: '1px solid #cbd5e1',
                        padding: '6px',
                        marginLeft: 'auto',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '7px',
                          fontWeight: '900',
                          color: '#1e3a8a',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Report ID
                      </p>
                      <p style={{ margin: '3px 0 0 0', fontSize: '11px', fontWeight: '900', color: '#0f172a' }}>
                        {patientData.labNo || '1001'}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '7px', color: '#64748b', fontWeight: '700' }}>
                        {patientData.sampleCollAt || 'Lab collection'}
                      </p>
                    </div>
                    <p style={{ fontSize: '6px', fontWeight: '700', color: '#999', marginTop: '4px', textAlign: 'center' }}>
                      Verified report
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '10px 0' }} />

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '900',
                  margin: 0,
                  textTransform: 'uppercase',
                  borderBottom: '2px solid #000',
                  display: 'inline-block',
                  padding: '0 30px 2px 30px',
                }}
              >
                {group.categoryName}
              </h2>
              {group.subCategoryName && (
                <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '5px 0 0 0', textTransform: 'uppercase' }}>
                  {group.subCategoryName}
                </h3>
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '45%' }}>
                    TEST
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '20%' }}>
                    VALUE
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '15%' }}>
                    UNIT
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '20%' }}>
                    REFERENCE
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.tests.map((test: any, i: number) => {
                  const renderRows = (t: any, depth = 0): React.ReactNode => {
                    const isHeader =
                      t.isHeader || (!t.result && !t.unit && t.referenceRange === '-' && (!t.subParameters || t.subParameters.length === 0));
                    const marker = getAbnormalMarker(t.result, t.referenceRange);

                    return (
                      <React.Fragment key={`${i}-${t.name}-${depth}`}>
                        <tr style={{ backgroundColor: isHeader && depth === 0 ? '#f8fafc' : 'transparent' }}>
                          <td
                            style={{
                              padding: '6px 5px',
                              paddingLeft: depth > 0 ? `${depth * 20 + 5}px` : '5px',
                              fontWeight: isHeader ? '900' : '700',
                              fontSize: isHeader ? '11px' : '10px',
                              textTransform: isHeader ? 'uppercase' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{t.name}</span>
                              {t.method && (
                                <span
                                  style={{
                                    fontSize: '8px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  Method: {t.method}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', padding: '6px 5px', fontSize: '10px', fontWeight: marker ? '900' : '500' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      width: '30%',
                                      textAlign: 'right',
                                      paddingRight: '5px',
                                      fontWeight: '900',
                                      color: '#ef4444',
                                    }}
                                  >
                                    {marker || ''}
                                  </td>
                                  <td style={{ width: '70%', textAlign: 'left', fontWeight: marker ? '900' : '500' }}>
                                    {t.result || ''}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td style={{ textAlign: 'center', padding: '6px 5px', fontSize: '10px', color: '#334155' }}>{t.unit || ''}</td>
                          <td style={{ textAlign: 'left', padding: '6px 5px', fontSize: '9px', color: '#64748b' }}>
                            {t.referenceRange !== '-' ? t.referenceRange : ''}
                          </td>
                        </tr>
                        {t.subParameters?.map((sp: any) => renderRows(sp, depth + 1))}
                        {t.significance && !isHeader && (
                          <tr>
                            <td
                              colSpan={4}
                              style={{
                                padding: '2px 5px 8px 5px',
                                fontSize: '8px',
                                color: '#475569',
                                fontStyle: 'italic',
                                borderBottom: '1px dashed #e2e8f0',
                              }}
                            >
                              <span style={{ fontWeight: '700' }}>Significance: </span>
                              {t.significance}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  };

                  return renderRows(test);
                })}
              </tbody>
            </table>

            {hasAbnormalResults && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ fontSize: '10px', fontWeight: '900', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                  POSSIBLE CAUSES OF ABNORMAL PARAMETERS:
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', border: '1px solid #cbd5e1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'left', width: '25%' }}>Parameter</th>
                      <th style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'left', width: '37.5%' }}>High</th>
                      <th style={{ padding: '6px', border: '1px solid #cbd5e1', textAlign: 'left', width: '37.5%' }}>Low</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: '700' }}>RBC, Hb, or HCT</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Dehydration, polycythemia, shock, chronic hypoxia</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Anemia, thalassemia, and other hemoglobinopathies</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: '700' }}>WBC</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Acute stress, infection, malignancies</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Sepsis, marrow hypoplasia</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: '700' }}>Platelets</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Risk of thrombosis</td>
                      <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Risk of bleeding</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {group.conclusion && (
              <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ fontSize: '10px', fontWeight: '900', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                  Clinical Notes:
                </h4>
                <p style={{ fontSize: '9px', color: '#475569', margin: 0 }}>{group.conclusion}</p>
              </div>
            )}
          </div>

          <Footer pageNumber={index + 1} />
        </div>
      ))}

      {stashedItems.length > 0 && (
        <div className={pageClassName(true)} style={{ pageBreakBefore: 'always' }}>
          <Header title={labProfile?.labName || 'Labsmart Software'} subtitle="Stashed / Reference Results" />

          <div style={{ padding: '40px' }}>
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', margin: 0, textTransform: 'uppercase' }}>
                Stashed Results (From Memory)
              </h2>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '45%' }}>TEST</th>
                  <th style={{ textAlign: 'center', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '20%' }}>VALUE</th>
                  <th style={{ textAlign: 'center', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '15%' }}>UNIT</th>
                  <th style={{ textAlign: 'left', padding: '8px 5px', fontSize: '10px', fontWeight: '900', width: '20%' }}>REFERENCE</th>
                </tr>
              </thead>
              <tbody>
                {stashedItems.map((test: any, i: number) => {
                  const marker = getAbnormalMarker(test.result, test.referenceRange);
                  return (
                    <tr key={`stashed-${i}`}>
                      <td style={{ padding: '6px 5px', fontWeight: '700', fontSize: '10px' }}>{test.name}</td>
                      <td style={{ textAlign: 'center', padding: '6px 5px', fontSize: '10px', fontWeight: marker ? '900' : '500' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  width: '30%',
                                  textAlign: 'right',
                                  paddingRight: '5px',
                                  fontWeight: '900',
                                  color: '#ef4444',
                                }}
                              >
                                {marker || ''}
                              </td>
                              <td style={{ width: '70%', textAlign: 'left', fontWeight: marker ? '900' : '500' }}>
                                {test.result || ''}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 5px', fontSize: '10px', color: '#334155' }}>{test.unit || ''}</td>
                      <td style={{ textAlign: 'left', padding: '6px 5px', fontSize: '9px', color: '#64748b' }}>
                        {test.referenceRange !== '-' ? test.referenceRange : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 'auto', padding: '40px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>End of Stashed Results Section</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '9px', color: '#94a3b8', fontWeight: '700' }}>
              Page {pageCount} of {pageCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
