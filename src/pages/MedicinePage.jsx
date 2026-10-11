import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MedicineTable from '../components/MedicineTable';
import ExpiryBadge from '../components/ExpiryBadge';
import QRCodeCard from '../components/QRCodeCard';
import VoiceAssistant from '../components/VoiceAssistant';
import SideEffectsCard from '../components/SideEffectsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { LanguageContext } from '../context/LanguageContext';
import { useMedicines } from '../hooks/useMedicines';
import { fetchMedicineById, getInitialMedicines } from '../utils/api';
import { generateQRDataURL, downloadQR } from '../utils/qrGenerator';
import { AlertTriangle, ShieldAlert, ArrowLeft, Pill, Activity } from 'lucide-react';

const MedicinePageContent = () => {
  const { id } = useParams();
  const langContext = useContext(LanguageContext);
  const language = langContext?.language || 'mr';
  const { medicines, isUsingMockData } = useMedicines();

  const findExisting = (sourceList) => {
    if (!id || !sourceList || !Array.isArray(sourceList) || sourceList.length === 0) return null;

    let cleanId = decodeURIComponent(String(id)).trim();
    cleanId = cleanId.split('?')[0].split('#')[0].replace(/\/+$/, '');

    const numericId = Number(cleanId);
    const lowerClean = cleanId.toLowerCase();
    const alphaNumericOnly = cleanId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // 1. Exact numeric ID
    if (!isNaN(numericId) && numericId > 0) {
      const match = sourceList.find(m => m.id === numericId || Number(m.id) === numericId);
      if (match) return match;
    }

    // 2. Batch Number match (exact, clean, or partial in barcode)
    const batchMatch = sourceList.find(m => {
      const mBatch = String(m.batchNo || '').trim().toLowerCase();
      const mBatchClean = mBatch.replace(/[^a-zA-Z0-9]/g, '');
      return (
        mBatch === lowerClean ||
        mBatchClean === alphaNumericOnly ||
        lowerClean.includes(mBatch) ||
        (mBatchClean.length >= 4 && alphaNumericOnly.includes(mBatchClean))
      );
    });
    if (batchMatch) return batchMatch;

    // 3. Brand or Generic name search
    const nameMatch = sourceList.find(m => {
      const brand = String(m.brandName || '').toLowerCase();
      const generic = String(m.genericName || '').toLowerCase();
      return (
        lowerClean.includes(brand) ||
        brand.includes(lowerClean) ||
        lowerClean.includes(generic) ||
        generic.includes(lowerClean)
      );
    });
    if (nameMatch) return nameMatch;

    return null;
  };

  const initialMed = findExisting(medicines) || findExisting(getInitialMedicines()) || null;
  const [medicine, setMedicine] = useState(initialMed);
  const [isResolving, setIsResolving] = useState(!initialMed);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const getReachableOrigin = () => {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'https://shipment-fairy-minolta-stuart.trycloudflare.com'
      : window.location.origin;
  };

  useEffect(() => {
    let isMounted = true;

    // If already found, generate QR code and update state
    if (medicine) {
      const url = `${getReachableOrigin()}/medicine/${medicine.id}`;
      generateQRDataURL(url).then((qr) => { if (isMounted) setQrCodeUrl(qr); });
    }

    const resolveMedicine = async () => {
      // 1. Check local/memory lists first
      const foundInMemory = findExisting(medicines) || findExisting(getInitialMedicines());
      if (foundInMemory) {
        if (isMounted) {
          setMedicine(foundInMemory);
          setIsResolving(false);
          const url = `${getReachableOrigin()}/medicine/${foundInMemory.id}`;
          generateQRDataURL(url).then((qr) => { if (isMounted) setQrCodeUrl(qr); });
        }
        return;
      }

      // 2. Fetch directly from server / cache API
      try {
        let cleanId = decodeURIComponent(String(id)).trim().split('?')[0].replace(/\/+$/, '');
        const fetched = await fetchMedicineById(cleanId);
        if (isMounted && fetched) {
          setMedicine(fetched);
          setIsResolving(false);
          const url = `${getReachableOrigin()}/medicine/${fetched.id}`;
          generateQRDataURL(url).then((qr) => { if (isMounted) setQrCodeUrl(qr); });
          return;
        }
      } catch (err) {
        console.warn(`Could not resolve medicine for id ${id}:`, err);
      }

      if (isMounted) {
        setMedicine(null);
        setIsResolving(false);
      }
    };

    resolveMedicine();

    return () => {
      isMounted = false;
    };
  }, [id, medicines]);

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      downloadQR(qrCodeUrl, `${medicine?.brandName || 'medicine'}_QR`);
    }
  };

  if (isResolving) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-slate-50 py-20">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center bg-slate-50 py-20 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Medicine Not Found</h2>
            <p className="text-sm text-slate-600 mb-6">
              The medicine record (ID / Batch: <strong className="text-slate-800 font-mono">{id}</strong>) was not found in the verified database.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="bg-[#0B4F9C] hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </Link>
              <Link
                to="/scan"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-6 rounded-xl text-sm transition-all"
              >
                Scan Another QR
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pb-12">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0B4F9C] via-[#0E5DA8] to-[#1E9E8F] py-8 px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{medicine.brandName}</h1>
            <p className="text-lg opacity-90">{medicine.genericName} • {medicine.strength}</p>
            {isUsingMockData && (
              <span className="inline-block mt-3 bg-white/20 px-3 py-0.5 rounded-full text-xs font-semibold border border-white/30">
                Verified Research Sample
              </span>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
          
          {/* QUICK ACCESSIBLE PATIENT SUMMARY CARD (सुलभ व सोपी माहिती) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                  ✓
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {language === 'mr' ? 'सुलभ रुग्ण माहिती (सोप्या भाषेत)' : language === 'hi' ? 'आसान भाषा में दवाई की जानकारी' : 'Easy Patient Information'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'mr' ? 'वापर, डोस व घेण्याची योग्य पद्धत' : 'Clear indications, dosage, and usage directions'}
                  </p>
                </div>
              </div>
              <ExpiryBadge expDate={medicine.expDate} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Uses */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
                <div className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Activity size={15} />
                  <span>{language === 'mr' ? 'कशासाठी घ्यायचे? (वापर)' : language === 'hi' ? 'दवाई का उपयोग' : 'Main Indications'}</span>
                </div>
                <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                  {medicine.translations?.[language]?.useIndication || medicine.translations?.mr?.useIndication || medicine.useIndication || 'उपलब्ध नाही'}
                </p>
              </div>

              {/* Dose */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80">
                <div className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Pill size={15} />
                  <span>{language === 'mr' ? 'डोस आणि प्रमाण' : language === 'hi' ? 'खुराक / डोज़' : 'Recommended Dose'}</span>
                </div>
                <p className="text-sm font-bold text-blue-950 leading-relaxed">
                  {medicine.translations?.[language]?.dose || medicine.translations?.mr?.dose || medicine.dose || 'डॉक्टरांच्या सल्ल्यानुसार'}
                </p>
              </div>

              {/* Directions */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 sm:col-span-2">
                <div className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <span>👉</span>
                  <span>{language === 'mr' ? 'घेण्याची योग्य पद्धत' : language === 'hi' ? 'लेने का सही तरीका' : 'Directions for Use'}</span>
                </div>
                <p className="text-sm font-bold text-amber-950 leading-relaxed">
                  {medicine.translations?.[language]?.directionForUse || medicine.translations?.mr?.directionForUse || medicine.directionForUse || 'स्वच्छ पाण्यासोबत डॉक्टरांच्या सल्ल्यानुसार घ्यावे'}
                </p>
              </div>
            </div>
          </div>

          {/* VOICE ASSISTANT FOR ILLITERATE / ELDERLY PATIENTS */}
          <VoiceAssistant medicine={medicine} />

          {/* MEDICINE DETAILS TABLE */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#0B4F9C] mb-4 border-b pb-3">Medicine Specifications</h2>
              <MedicineTable medicine={medicine} />
              
              <div className="mt-6 pt-4 border-t flex flex-col items-center">
                <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Real-Time Expiry Status</h3>
                <ExpiryBadge expDate={medicine.expDate} />
              </div>
            </div>
          </div>

          {/* ADVERSE DRUG REACTIONS (ADR) & SIDE EFFECTS SECTION */}
          <SideEffectsCard medicine={medicine} />

          {/* QR CODE SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Printable Smart QR Label</h2>
              <p className="text-xs text-slate-500 mt-1">Scan this code with any smartphone camera (Google Camera, Lens, iOS) to open this page</p>
            </div>

            <div className="max-w-xs mx-auto">
              <QRCodeCard
                url={`${getReachableOrigin()}/medicine/${medicine.id}`}
                medicineName={medicine.brandName}
                strength={medicine.strength}
                batchNo={medicine.batchNo}
              />
            </div>
          </div>

          {/* DISCLAIMER FOOTER */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <p className="text-amber-900 text-xs leading-relaxed">
              <strong>Medical Safety Disclaimer:</strong> This digital monograph and ADR information is provided for patient education and verification. Always use prescription medicines under the guidance of a registered medical practitioner or pharmacist.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const MedicinePage = () => {
  return (
    <ErrorBoundary>
      <MedicinePageContent />
    </ErrorBoundary>
  );
};

export default MedicinePage;
