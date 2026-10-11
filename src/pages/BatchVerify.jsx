import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, ShieldCheck, AlertTriangle, ArrowRight, Sparkles, Building, Calendar, Pill } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ExpiryBadge from '../components/ExpiryBadge';
import { useMedicines } from '../hooks/useMedicines';

const BatchVerify = () => {
  const [batchNo, setBatchNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // 'success', 'error', null
  const [foundMedicine, setFoundMedicine] = useState(null);
  const { verifyBatch, medicines } = useMedicines();
  const navigate = useNavigate();

  const handleVerify = async (e, customBatch) => {
    if (e) e.preventDefault();
    const targetBatch = (customBatch !== undefined ? customBatch : batchNo).trim();
    if (!targetBatch) return;

    if (customBatch !== undefined) {
      setBatchNo(customBatch);
    }

    setLoading(true);
    setResult(null);
    setFoundMedicine(null);

    try {
      const res = await verifyBatch(targetBatch);
      if (res && res.verified && res.medicine) {
        setFoundMedicine(res.medicine);
        setResult('success');
      } else if (res && res.id) {
        // Direct medicine object returned
        setFoundMedicine(res);
        setResult('success');
      } else {
        setFoundMedicine(null);
        setResult('error');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setFoundMedicine(null);
      setResult('error');
    } finally {
      setLoading(false);
    }
  };

  const sampleBatches = [
    { batch: 'PA24567', name: 'Crocin (Paracetamol)' },
    { batch: 'IB38291', name: 'Ibugesic (Ibuprofen)' },
    { batch: 'CZ15483', name: 'Zyrtec (Cetirizine)' },
    { batch: 'OM67245', name: 'Losec (Omeprazole)' },
    { batch: 'AX98103', name: 'Amoxil (Amoxicillin)' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl mb-8">
          
          {/* Main Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 text-center">
            <div className="w-16 h-16 bg-[#1E9E8F]/10 text-[#1E9E8F] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={36} />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B4F9C] mb-2">
              Batch Verification & Anti-Counterfeit
            </h1>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              Enter the batch number printed on your medicine packaging or strip to verify authenticity and expiry records.
            </p>

            {/* Search Input Form */}
            <form onSubmit={(e) => handleVerify(e)} className="space-y-3 max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
                  placeholder="Enter Batch No (e.g. PA24567)"
                  className="w-full p-4 pl-5 rounded-2xl border-2 border-slate-200 focus:border-[#1E9E8F] focus:ring-2 focus:ring-[#1E9E8F]/20 focus:outline-none font-mono text-lg text-center tracking-wider uppercase transition-all shadow-inner"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !batchNo.trim()}
                className="w-full bg-[#1E9E8F] hover:bg-[#147a6e] disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
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

            {/* Quick 1-Click Sample Batches */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Quick Test Sample Batches:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleBatches.map((item) => (
                  <button
                    key={item.batch}
                    type="button"
                    onClick={() => handleVerify(null, item.batch)}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-[#0B4F9C] hover:text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 transition-all border border-slate-200 shadow-sm"
                    title={`Test batch ${item.batch} (${item.name})`}
                  >
                    <span>{item.batch}</span>
                    <span className="text-[10px] font-sans opacity-70 font-normal hidden sm:inline">({item.name})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Results: SUCCESS */}
          {result === 'success' && foundMedicine && (
            <div className="mt-6 bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
                      ✓ Authentic & Verified Record
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {foundMedicine.brandName} <span className="text-slate-500 font-medium text-base">({foundMedicine.strength})</span>
                    </h3>
                  </div>
                </div>
                <div>
                  <ExpiryBadge expDate={foundMedicine.expDate} />
                </div>
              </div>

              {/* Medicine details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 bg-slate-50 rounded-2xl p-4 text-xs">
                <div className="flex items-center gap-2">
                  <Pill size={16} className="text-[#1E9E8F] shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">Generic Drug</span>
                    <span className="font-bold text-slate-800">{foundMedicine.genericName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-[#0B4F9C] shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">Manufacturer</span>
                    <span className="font-bold text-slate-800 truncate block max-w-[200px]" title={foundMedicine.manufacturer}>
                      {foundMedicine.manufacturer}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500 shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">Batch Number</span>
                    <span className="font-mono font-bold text-slate-800">{foundMedicine.batchNo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500 shrink-0" />
                  <div>
                    <span className="text-slate-400 block font-medium">Expiry Date</span>
                    <span className="font-bold text-slate-800">{foundMedicine.expDate} (Mfg: {foundMedicine.mfgDate || 'N/A'})</span>
                  </div>
                </div>
              </div>

              {/* Direct Link to full page with Voice Assistant */}
              <Link
                to={`/medicine/${foundMedicine.id}`}
                className="w-full bg-gradient-to-r from-[#0B4F9C] to-[#1E9E8F] hover:opacity-95 text-white py-3 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>View Full Details & Listen to Audio Guide</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Verification Results: NOT FOUND */}
          {result === 'error' && (
            <div className="mt-6 bg-red-50 border-2 border-red-400 rounded-3xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-red-900">
                    Batch Number Not Found
                  </h3>
                  <p className="text-red-700 text-xs leading-relaxed">
                    Batch <strong>"{batchNo}"</strong> does not match any registered product in the digital database. 
                    Please double-check the spelling or consult with your registered pharmacist to verify authenticity.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleVerify(null, 'PA24567')}
                      className="text-xs font-bold text-red-800 underline hover:text-red-950"
                    >
                      Try testing with valid sample batch (PA24567) →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer Note */}
        <div className="w-full max-w-2xl bg-slate-200/60 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
          <AlertTriangle className="text-slate-500 shrink-0 mt-0.5" size={18} />
          <p className="leading-relaxed">
            <strong>Important Safety Notice:</strong> Digital batch validation helps identify verified manufactured lots. Always purchase medicines from licensed drug retailers and verify tamper-evident seals before consumption.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BatchVerify;
