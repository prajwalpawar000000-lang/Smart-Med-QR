import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, ArrowRight, 
  Sparkles, Building, Calendar, Pill, ShieldAlert, Clock, AlertCircle, Info, FileText
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ExpiryBadge from '../components/ExpiryBadge';
import { useMedicines } from '../hooks/useMedicines';

const BatchVerify = () => {
  const [batchNo, setBatchNo] = useState('');
  const [selectedMedicineName, setSelectedMedicineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { verifyBatch, medicines } = useMedicines();
  const navigate = useNavigate();

  const handleVerify = async (e, customBatch, customMedName) => {
    if (e) e.preventDefault();
    const targetBatch = (customBatch !== undefined ? customBatch : batchNo).trim();
    const targetMedName = (customMedName !== undefined ? customMedName : selectedMedicineName).trim();

    if (!targetBatch) {
      setVerificationResult({
        statusCode: 'E',
        status: 'INVALID',
        verified: false,
        title: 'Invalid Information',
        message: 'Please enter a medicine batch number to verify.',
        verificationTimestamp: new Date().toISOString(),
        verificationRef: `VRF-${Date.now().toString(36).toUpperCase()}`
      });
      return;
    }

    if (customBatch !== undefined) setBatchNo(customBatch);
    if (customMedName !== undefined) setSelectedMedicineName(customMedName);

    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await verifyBatch(targetBatch, targetMedName);
      setVerificationResult(res);
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationResult({
        statusCode: 'E',
        status: 'ERROR',
        verified: false,
        title: 'Verification Engine Error',
        message: err.message || 'Unable to complete verification. Please try again.',
        verificationTimestamp: new Date().toISOString(),
        verificationRef: `VRF-${Date.now().toString(36).toUpperCase()}`
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleBatches = [
    { batch: 'PA24567', label: 'PA24567 (Crocin - Valid)', medName: 'Crocin', statusType: 'Verified' },
    { batch: 'PA-NEAR01', label: 'PA-NEAR01 (Expiring Soon)', medName: 'Crocin', statusType: 'Near Expiry' },
    { batch: 'PA-EXP99', label: 'PA-EXP99 (Expired)', medName: 'Crocin', statusType: 'Expired' },
    { batch: 'IB38291', label: 'IB38291 (Ibuprofen - Valid)', medName: 'Ibugesic', statusType: 'Verified' },
    { batch: 'XYZ99999', label: 'XYZ99999 (Unregistered)', medName: '', statusType: 'Not Found' },
    { batch: 'PA24567', label: 'PA24567 (Mismatch Test)', medName: 'Ibugesic', statusType: 'Mismatch' }
  ];

  const formatDateTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch (e) {
      return isoString || 'N/A';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-3xl mb-8">
          
          {/* Main Verification Input Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 text-center">
            <div className="w-16 h-16 bg-[#1E9E8F]/10 text-[#1E9E8F] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={36} />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B4F9C] mb-2 tracking-tight">
              Medicine Batch Verification
            </h1>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
              Verify medicine batch numbers against the trusted MedQR digital database to validate manufacturing details, shelf life, and registered authenticity.
            </p>

            {/* Search Input Form */}
            <form onSubmit={(e) => handleVerify(e)} className="space-y-3.5 max-w-xl mx-auto text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medicine Batch Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
                  placeholder="Enter Batch No (e.g. PA24567, IB38291)"
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-[#1E9E8F] focus:ring-2 focus:ring-[#1E9E8F]/20 focus:outline-none font-mono text-lg text-center tracking-wider uppercase transition-all shadow-inner"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Medicine Name (Optional Mismatch Verification)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedMedicineName}
                    onChange={(e) => setSelectedMedicineName(e.target.value)}
                    placeholder="e.g. Crocin, Paracetamol, Losec (Optional)"
                    className="flex-grow p-3 rounded-xl border border-slate-200 focus:border-[#1E9E8F] focus:outline-none text-sm text-slate-800"
                  />
                  <select
                    value={selectedMedicineName}
                    onChange={(e) => setSelectedMedicineName(e.target.value)}
                    className="w-40 p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1E9E8F] cursor-pointer"
                  >
                    <option value="">Or Pick Medicine...</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.brandName}>{m.brandName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !batchNo.trim()}
                className="w-full bg-[#1E9E8F] hover:bg-[#147a6e] disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Verify Batch Authenticity</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Test Scenarios */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Quick Test Scenarios (1-Click Evaluation):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleBatches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleVerify(null, item.batch, item.medName)}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-[#0B4F9C] hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 transition-all border border-slate-200 shadow-xs cursor-pointer"
                    title={`Test ${item.label}`}
                  >
                    <span className="font-mono font-bold">{item.batch}</span>
                    <span className="text-[10px] opacity-75 hidden sm:inline">({item.statusType})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* VERIFICATION STATUS RESULTS                              */}
          {/* ======================================================== */}
          {verificationResult && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* STATUS A: VERIFIED BATCH */}
              {verificationResult.statusCode === 'A' && (
                <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-0.5 rounded-full">
                            ✓ Status A: Verified Batch
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {verificationResult.verificationRef}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">
                          {verificationResult.medicine.brandName}
                          <span className="text-slate-500 font-medium text-lg ml-2">({verificationResult.medicine.strength})</span>
                        </h2>
                      </div>
                    </div>
                    <div>
                      <ExpiryBadge expDate={verificationResult.batch.expDate} />
                    </div>
                  </div>

                  {/* Verification Result Summary Message */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 my-5 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-emerald-950 mb-0.5">Verification Result: Genuine Registered Record</strong>
                      {verificationResult.message}
                    </div>
                  </div>

                  {/* Comprehensive Verification Record Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 bg-slate-50 rounded-2xl p-5 text-xs border border-slate-100">
                    <div>
                      <span className="text-slate-400 block font-medium">Generic Drug Name</span>
                      <span className="font-bold text-slate-800 text-sm">{verificationResult.medicine.genericName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Brand Name</span>
                      <span className="font-bold text-slate-800 text-sm">{verificationResult.medicine.brandName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Manufacturer</span>
                      <span className="font-bold text-slate-800 text-sm">{verificationResult.medicine.manufacturer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Batch Number</span>
                      <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                        {verificationResult.batch.batchNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Manufacturing Date</span>
                      <span className="font-bold text-slate-800">{verificationResult.batch.mfgDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Expiry Date</span>
                      <span className="font-bold text-slate-800">
                        {verificationResult.batch.expDate} ({verificationResult.daysRemaining} days remaining)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Manufacturing Licence No</span>
                      <span className="font-mono font-bold text-slate-800">
                        {verificationResult.batch.mfgLicenceNo || verificationResult.medicine.mfgLicenceNo || 'LIC/2025/MED'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Verification Timestamp</span>
                      <span className="font-medium text-slate-700">
                        {formatDateTime(verificationResult.verificationTimestamp)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Registration Status</span>
                      <span className="inline-block bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        Active In MedQR
                      </span>
                    </div>
                  </div>

                  {/* Regulatory Distinction Notice */}
                  <div className="mt-5 p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Info size={14} className="text-[#0B4F9C]" />
                      <span>MedQR Database Verification Notice</span>
                    </p>
                    <p className="leading-relaxed">
                      This verified result certifies matching against registered pharmaceutical lot submissions stored within the MedQR platform. Database registration confirms cryptographic inventory consistency but does not substitute for state regulatory inspections or licensed retail pharmacy dispensing controls.
                    </p>
                  </div>

                  {/* Full Details & Audio Link */}
                  <Link
                    to={`/medicine/${verificationResult.medicine.id}`}
                    className="w-full mt-6 bg-gradient-to-r from-[#0B4F9C] to-[#1E9E8F] hover:opacity-95 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View Full Medicine Monograph & Voice Audio Guide</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}

              {/* STATUS B: BATCH NOT FOUND */}
              {verificationResult.statusCode === 'B' && (
                <div className="bg-red-50/70 border-2 border-red-400 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                      <XCircle size={32} />
                    </div>
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-0.5 rounded-full">
                          Status B: Batch Not Found
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {verificationResult.verificationRef}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-red-950">
                        Batch "{verificationResult.enteredBatch || batchNo}" Not Found
                      </h3>
                      <p className="text-red-800 text-sm leading-relaxed">
                        Batch number not found in the registered MedQR database. Please verify the details with the manufacturer or pharmacist.
                      </p>

                      <div className="bg-white/80 border border-red-200 rounded-2xl p-4 mt-4 text-xs text-slate-700 space-y-2">
                        <span className="font-bold text-red-900 block">Recommended Verification Actions:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                          <li>Check the embossed or ink-printed characters on your medicine foil strip or bottle carton.</li>
                          <li>Verify that numerals (like 0 vs O or 1 vs I) were entered correctly.</li>
                          <li>Ensure the product was purchased from an authorized retail pharmacy or healthcare provider.</li>
                          <li>If packaging appears tampered with or suspect, report it immediately to your pharmacist.</li>
                        </ul>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleVerify(null, 'PA24567', 'Crocin')}
                          className="text-xs font-bold text-red-900 underline hover:text-red-950"
                        >
                          Test with genuine sample batch (PA24567) →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS C: EXPIRED MEDICINE */}
              {verificationResult.statusCode === 'C' && (
                <div className="bg-red-50 border-3 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl animate-shake">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-red-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                        <ShieldAlert size={34} />
                      </div>
                      <div>
                        <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                          ⛔ Status C: Expired Medicine Warning
                        </span>
                        <h2 className="text-2xl font-black text-red-950 mt-1">
                          {verificationResult.medicine?.brandName} ({verificationResult.batch?.batchNo})
                        </h2>
                      </div>
                    </div>
                    <div>
                      <span className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl block text-center">
                        EXPIRED
                      </span>
                    </div>
                  </div>

                  {/* CRITICAL WARNING MESSAGE */}
                  <div className="bg-red-600 text-white rounded-2xl p-5 my-5 text-sm font-bold shadow-md space-y-1">
                    <div className="text-lg">WARNING: This medicine batch has passed its expiry date. Do not use it.</div>
                    <p className="text-xs font-normal text-red-100">
                      Expired {verificationResult.daysOverdue} days ago (Expiry: {verificationResult.formattedExpDate}). Using expired pharmaceuticals risks therapeutic failure and toxicity.
                    </p>
                  </div>

                  {/* Medicine Information Summary */}
                  {verificationResult.medicine && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl text-xs border border-red-200 mb-5">
                      <div><strong>Generic Drug:</strong> {verificationResult.medicine.genericName}</div>
                      <div><strong>Manufacturer:</strong> {verificationResult.medicine.manufacturer}</div>
                      <div><strong>Batch Number:</strong> <span className="font-mono font-bold">{verificationResult.batch.batchNo}</span></div>
                      <div><strong>Expired On:</strong> <span className="text-red-700 font-bold">{verificationResult.formattedExpDate}</span></div>
                      <div><strong>Mfg Licence:</strong> {verificationResult.batch.mfgLicenceNo || 'N/A'}</div>
                      <div><strong>Verification Timestamp:</strong> {formatDateTime(verificationResult.verificationTimestamp)}</div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/medicine/${verificationResult.medicine.id}`}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs text-center transition-all"
                    >
                      Inspect Medicine Profile & Disposal Instructions
                    </Link>
                    <Link
                      to="/side-effects"
                      className="bg-red-100 hover:bg-red-200 text-red-900 px-6 py-3 rounded-xl font-bold text-xs text-center transition-all"
                    >
                      View Adverse Reactions & Emergency Guidelines
                    </Link>
                  </div>
                </div>
              )}

              {/* STATUS D: EXPIRY APPROACHING */}
              {verificationResult.statusCode === 'D' && (
                <div className="bg-amber-50/80 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-amber-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <Clock size={32} />
                      </div>
                      <div>
                        <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
                          ⚠️ Status D: Expiry Approaching
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 mt-1">
                          {verificationResult.medicine.brandName}
                          <span className="text-slate-500 font-medium text-lg ml-2">({verificationResult.medicine.strength})</span>
                        </h2>
                      </div>
                    </div>
                    <div>
                      <ExpiryBadge expDate={verificationResult.batch.expDate} />
                    </div>
                  </div>

                  <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-4 my-5 text-xs text-amber-950 leading-relaxed space-y-1">
                    <strong className="block text-sm font-extrabold text-amber-950">Expiry Warning Notice:</strong>
                    <p>{verificationResult.message}</p>
                    <p className="text-[11px] text-amber-800 pt-1">
                      Check your remaining prescribed duration. If your treatment extends past {verificationResult.formattedExpDate}, obtain a new supply from your pharmacist.
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl text-xs border border-amber-200 mb-5">
                    <div><strong>Generic:</strong> {verificationResult.medicine.genericName}</div>
                    <div><strong>Batch:</strong> <span className="font-mono font-bold">{verificationResult.batch.batchNo}</span></div>
                    <div><strong>Remaining:</strong> <span className="text-amber-800 font-bold">{verificationResult.daysRemaining} days remaining</span></div>
                    <div><strong>Manufacturer:</strong> {verificationResult.medicine.manufacturer}</div>
                    <div><strong>Licence No:</strong> {verificationResult.batch.mfgLicenceNo || 'N/A'}</div>
                    <div><strong>Timestamp:</strong> {formatDateTime(verificationResult.verificationTimestamp)}</div>
                  </div>

                  <Link
                    to={`/medicine/${verificationResult.medicine.id}`}
                    className="w-full bg-[#0B4F9C] hover:bg-blue-800 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View Medicine Monograph & Directions</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}

              {/* STATUS E: INVALID INFORMATION OR MISMATCH */}
              {verificationResult.statusCode === 'E' && (
                <div className="bg-slate-100 border-2 border-slate-300 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertCircle size={32} />
                    </div>
                    <div className="space-y-2 flex-grow">
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-0.5 rounded-full">
                        Status E: {verificationResult.title || 'Invalid Information'}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">
                        {verificationResult.title}
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {verificationResult.message}
                      </p>

                      {verificationResult.actualMedicine && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 mt-3 text-xs space-y-1">
                          <strong className="text-slate-800 block font-bold">Registered Record on File:</strong>
                          <div>Brand: <strong className="text-[#0B4F9C]">{verificationResult.actualMedicine.brandName}</strong></div>
                          <div>Generic: {verificationResult.actualMedicine.genericName}</div>
                          <div>Manufacturer: {verificationResult.actualMedicine.manufacturer}</div>
                          <Link
                            to={`/medicine/${verificationResult.actualMedicine.id}`}
                            className="inline-block mt-2 text-xs font-bold text-[#1E9E8F] underline"
                          >
                            Open registered record for {verificationResult.actualMedicine.brandName} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Global Safety Disclaimer */}
        <div className="w-full max-w-3xl bg-slate-200/60 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
          <AlertTriangle className="text-slate-500 shrink-0 mt-0.5" size={18} />
          <p className="leading-relaxed">
            <strong>Important Safety Notice:</strong> MedQR digital batch verification checks records against official manufacturer database entries. Always purchase medications from licensed pharmacies and verify tamper-evident security packaging before use.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BatchVerify;
