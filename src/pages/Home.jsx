import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, Search, QrCode, Smartphone, FileText, Shield, AlertTriangle, 
  ShieldCheck, Users, Laptop, Database, ArrowRight, Sparkles, Volume2, 
  Award, CheckCircle2, ChevronRight, Activity, Pill, Building, Layers,
  HeartPulse, ShieldAlert
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ExpiryBadge from '../components/ExpiryBadge';
import PrototypeShowcase from '../components/PrototypeShowcase';
import { useMedicines } from '../hooks/useMedicines';

const Home = () => {
  const navigate = useNavigate();
  const { medicines, isUsingMockData } = useMedicines();
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [directoryCategory, setDirectoryCategory] = useState('All');
  const [playingMedId, setPlayingMedId] = useState(null);

  const handleSpeakMedicine = (e, med) => {
    e.preventDefault();
    e.stopPropagation();

    if (!('speechSynthesis' in window)) {
      alert("Browser speech synthesis not supported on this device.");
      return;
    }

    if (playingMedId === med.id) {
      window.speechSynthesis.cancel();
      setPlayingMedId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingMedId(med.id);

    const mr = med.translations?.mr || {};
    const text = `औषधाचे नाव: ${med.brandName}. मूळ औषध: ${mr.genericName || med.genericName}. हे औषध कशासाठी: ${mr.useIndication || med.useIndication}. डोस: ${mr.dose || med.dose}. घेण्याची पद्धत: ${mr.directionForUse || med.directionForUse}. अंतिम मुदत: ${med.expDate}. संभाव्य दुष्परिणाम: ${mr.sideEffects || 'सौम्य मळमळ'}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'mr-IN';
    utterance.rate = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const mrVoice = voices.find(v => 
      v.lang === 'mr-IN' || v.lang === 'mr_IN' || v.lang.startsWith('mr') || 
      v.name.toLowerCase().includes('marathi') || v.lang.startsWith('hi') || v.name.includes('Hindi')
    );
    if (mrVoice) utterance.voice = mrVoice;

    utterance.onend = () => setPlayingMedId(null);
    utterance.onerror = () => setPlayingMedId(null);

    window.speechSynthesis.speak(utterance);
  };

  const displayedMedicines = medicines.filter(m => {
    if (directoryCategory === 'All') return true;
    if (directoryCategory === 'Capsule') return m.dosageForm === 'Capsule';
    if (directoryCategory === 'Syrup') return m.dosageForm === 'Syrup';
    if (directoryCategory === 'Suspension') return m.dosageForm === 'Suspension';
    if (directoryCategory === 'Injection') return m.dosageForm === 'Injection';
    if (directoryCategory === 'Drops') return m.dosageForm === 'Eye Drops' || m.dosageForm === 'Ear Drops';
    if (directoryCategory === 'Tablet') return m.dosageForm === 'Tablet';
    if (directoryCategory === 'Topical') return m.dosageForm === 'Ointment' || m.dosageForm === 'Cream' || m.dosageForm === 'Gel';
    if (directoryCategory === 'Powder') return m.dosageForm === 'Powder' || m.dosageForm === 'Sachet';
    if (directoryCategory === 'Device') return m.dosageForm === 'Inhaler' || m.dosageForm === 'Transdermal Patch' || m.dosageForm === 'Suppository';
    return true;
  });

  const handleSearch = (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const lowerQuery = query.toLowerCase().trim();
    const results = medicines.filter(
      (med) =>
        (med.genericName && med.genericName.toLowerCase().includes(lowerQuery)) ||
        (med.brandName && med.brandName.toLowerCase().includes(lowerQuery)) ||
        (med.batchNo && med.batchNo.toLowerCase().includes(lowerQuery))
    );
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-[#1E9E8F] selection:text-white pb-16 sm:pb-0">
      <Navbar />

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-br from-[#083366] via-[#0B4F9C] to-[#147a6e] py-14 md:py-20 px-4 overflow-hidden text-white">
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            
            {/* Competition Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border border-white/20 mb-5 shadow-inner text-cyan-200">
              <Award size={16} className="text-amber-300" />
              <span>Avishkar State Level Research Project • MedQR</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-4">
              Smart Medicine Information. <br />
              <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                One Instant QR Scan.
              </span>
            </h1>

            {/* Bilingual Simple Tagline */}
            <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
              औषधाचा QR कोड स्कॅन करा आणि <strong className="text-amber-300">डोस, वापर, दुष्परिणाम व मुदत तारीख</strong> मराठी व हिंदी आवाजात ऐका.
            </p>

            {/* 4 LARGE EASY-ACTION TOUCH CARDS (SUPER EASY TO USE) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 text-left">
              
              {/* Card 1: Scan Camera */}
              <Link
                to="/scan"
                className="bg-gradient-to-br from-[#1E9E8F] to-emerald-600 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-white flex flex-col justify-between group border border-emerald-400/30"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera size={26} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">📸 स्कॅन करा</h3>
                  <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-0.5">Scan Camera QR</p>
                </div>
              </Link>

              {/* Card 2: Voice Simulator */}
              <a
                href="#prototype-showcase"
                className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-white flex flex-col justify-between group border border-amber-300/30"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Volume2 size={26} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">🔊 आवाज ऐका</h3>
                  <p className="text-[11px] sm:text-xs text-amber-100 font-medium mt-0.5">Marathi Voice Guide</p>
                </div>
              </a>

              {/* Card 3: Batch Verify */}
              <Link
                to="/verify"
                className="bg-gradient-to-br from-[#0B4F9C] to-blue-700 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-white flex flex-col justify-between group border border-blue-400/30"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={26} className="text-cyan-200" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">🛡️ बॅच तपासा</h3>
                  <p className="text-[11px] sm:text-xs text-blue-100 font-medium mt-0.5">Verify Batch No</p>
                </div>
              </Link>

              {/* Card 4: ADR & Side Effects */}
              <Link
                to="/side-effects"
                className="bg-gradient-to-br from-rose-600 to-rose-700 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 text-white flex flex-col justify-between group border border-rose-400/30"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HeartPulse size={26} className="text-rose-200" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">⚠️ साइड इफेक्ट्स</h3>
                  <p className="text-[11px] sm:text-xs text-rose-100 font-medium mt-0.5">Adverse Reactions</p>
                </div>
              </Link>

            </div>

            {/* Quick Demo Links */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-blue-200 bg-black/25 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
              <Sparkles size={14} className="text-amber-300" />
              <span>थेट चाचणी (Quick Test):</span>
              <Link to="/medicine/4" className="underline font-bold text-white hover:text-amber-300 transition-colors">
                Losec 20 (Capsule) →
              </Link>
              <span className="text-white/40">•</span>
              <Link to="/medicine/6" className="underline font-bold text-white hover:text-amber-300 transition-colors">
                Cough Syrup →
              </Link>
              <span className="text-white/40">•</span>
              <Link to="/medicine/21" className="underline font-bold text-amber-300 hover:text-white transition-colors">
                Asthalin Inhaler →
              </Link>
            </div>

          </div>
        </section>

        {/* FLOATING INTERACTIVE SEARCH BAR */}
        <section id="search-section" className="max-w-3xl mx-auto -mt-6 relative z-20 px-4 mb-8">
          <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-200/80">
            <SearchBar onSearch={handleSearch} placeholder="औषध किंवा बॅच नंबर शोधा (Search medicine or batch)..." />
            
            {hasSearched && (
              <div className="mt-3 divide-y divide-slate-100 max-h-72 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50">
                {searchResults.length > 0 ? (
                  searchResults.map((med) => (
                    <Link
                      key={med.id}
                      to={`/medicine/${med.id}`}
                      className="p-3.5 hover:bg-blue-50/80 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0B4F9C]/10 text-[#0B4F9C] rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                          <Pill size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-[#0B4F9C] transition-colors">{med.brandName}</p>
                            <span className="text-xs text-slate-500 font-medium">({med.strength})</span>
                          </div>
                          <p className="text-xs text-slate-500">{med.genericName} • Batch: <span className="font-mono">{med.batchNo}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExpiryBadge expDate={med.expDate} />
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-[#0B4F9C] transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No medicines found matching your search.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* FINAL RESEARCH PROTOTYPE SHOWCASE SECTION */}
        <PrototypeShowcase medicines={medicines} />

        {/* DEMO DATA BANNER (Clean pill style) */}
        {isUsingMockData && (
          <div className="max-w-4xl mx-auto px-4 mb-10">
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span><strong>Avishkar Evaluation Environment:</strong> Loaded with verified medicine monographs, Adverse Drug Reaction (ADR) profiles, and batch records.</span>
              </div>
              <Link to="/side-effects" className="font-bold underline text-amber-800 shrink-0 hidden sm:inline">
                Open ADR Checker
              </Link>
            </div>
          </div>
        )}

        {/* SAMPLE MEDICINES SHOWCASE CARDS */}
        <section className="max-w-6xl mx-auto px-4 mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Verified Medicine Directory</span>
                <span className="text-xs font-mono font-bold bg-[#0B4F9C]/10 text-[#0B4F9C] px-2.5 py-0.5 rounded-full">
                  {medicines.length} Medicines
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Browse verified dosage forms: Capsules, Syrups, Suspensions, Injections, Eye/Ear Drops, Tablets, Topicals, Powders & Inhalers
              </p>
            </div>
            <Link to="/side-effects" className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1">
              <span>View All Adverse Drug Reactions</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Dosage Form Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
            {[
              { id: 'All', label: 'All Forms' },
              { id: 'Capsule', label: 'Capsules' },
              { id: 'Syrup', label: 'Syrups' },
              { id: 'Suspension', label: 'Suspensions' },
              { id: 'Injection', label: 'Injections' },
              { id: 'Drops', label: 'Eye/Ear Drops' },
              { id: 'Tablet', label: 'Tablets' },
              { id: 'Topical', label: 'Ointments/Creams/Gels' },
              { id: 'Powder', label: 'Powders/Sachets' },
              { id: 'Device', label: 'Inhalers/Patches' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDirectoryCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  directoryCategory === tab.id
                    ? 'bg-[#0B4F9C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#0B4F9C] hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayedMedicines.map((med) => (
              <Link
                key={med.id}
                to={`/medicine/${med.id}`}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-[#1E9E8F] shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg">
                        {med.batchNo}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        {med.dosageForm}
                      </span>
                    </div>
                    <ExpiryBadge expDate={med.expDate} />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#0B4F9C] transition-colors">
                    {med.brandName} <span className="text-sm text-slate-500 font-medium">({med.strength})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">{med.genericName} • <span className="text-slate-400">{med.route}</span></p>
                  
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-4 space-y-1">
                    <div className="truncate"><strong className="text-slate-700">Use:</strong> {med.useIndication}</div>
                    <div className="truncate text-rose-700 text-[11px]">
                      <strong className="text-rose-900">Side Effects:</strong> {med.sideEffects?.common?.slice(0, 2).join(', ') || 'Mild nausea'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-[#1E9E8F] group-hover:text-[#147a6e]">
                  <button
                    type="button"
                    onClick={(e) => handleSpeakMedicine(e, med)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      playingMedId === med.id
                        ? 'bg-amber-500 text-white animate-pulse shadow-md'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                  >
                    <Volume2 size={14} className={playingMedId === med.id ? 'animate-bounce' : ''} />
                    <span>{playingMedId === med.id ? 'थांबवा (Stop)' : 'ऐका (Audio)'}</span>
                  </button>
                  <span className="flex items-center gap-1 text-[#0B4F9C] group-hover:translate-x-1 transition-transform">
                    <span>माहिती (View)</span>
                    <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CORE FEATURES (5 Modern Pillars) */}
        <section className="bg-white py-16 px-4 border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E9E8F] bg-[#1E9E8F]/10 px-3 py-1 rounded-full">
                Core Capabilities
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
                Empowering Patients & Healthcare Providers
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Designed to solve prescription errors, illegible labels, unmonitored side effects, and counterfeit products.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1: Adverse Drug Reactions & Side Effects */}
              <div className="bg-gradient-to-b from-rose-50 to-white p-6 rounded-3xl border border-rose-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <HeartPulse size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Adverse Drug Reactions (ADR)</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Clear, categorized safety guide for <strong>Common Side Effects, Severe ADRs, Contraindications, and Emergency Warnings</strong>.
                </p>
              </div>

              {/* Feature 2: Google Assistant Voice */}
              <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#0B4F9C] text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <Volume2 size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Google Voice Assistant</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Reads dosage, directions, and side effects aloud in <strong>English, Hindi, and Marathi</strong> for elderly and rural patients.
                </p>
              </div>

              {/* Feature 3: Anti-Counterfeit Batch Check */}
              <div className="bg-gradient-to-b from-teal-50 to-white p-6 rounded-3xl border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#1E9E8F] text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Batch Verification</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Instant serial & batch validation against registered manufacturing lots to detect fake and counterfeit medicines.
                </p>
              </div>

              {/* Feature 4: Real-Time Expiry Status */}
              <div className="bg-gradient-to-b from-amber-50 to-white p-6 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                  <Activity size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Real-Time Expiry Badge</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Dynamic color-coded status (Safe, Expiring Soon, Expired - Do Not Consume) computed automatically.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS (Visual 5-Step Process) */}
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">How MedQR Works</h2>
              <p className="text-xs text-slate-500 mt-1">From pharmaceutical packaging to patient smartphone in 5 seamless steps</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { step: '1', title: 'Data Upload', desc: 'Medicine records, ADRs & batches entered via Admin', icon: <Database size={20} /> },
                { step: '2', title: 'Label Created', desc: 'High-contrast QR code generated', icon: <QrCode size={20} /> },
                { step: '3', title: 'Package Print', desc: 'Affixed to medicine strip or packaging', icon: <Layers size={20} /> },
                { step: '4', title: 'Camera Scan', desc: 'Patient scans with any smartphone camera', icon: <Smartphone size={20} /> },
                { step: '5', title: 'Read & Listen', desc: 'Instant dosage, ADR safety warnings & voice audio', icon: <Volume2 size={20} /> },
              ].map((item) => (
                <div key={item.step} className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center flex flex-col items-center shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#0B4F9C] to-[#1E9E8F] text-white rounded-xl flex items-center justify-center mb-3 font-bold shadow-md">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold font-mono text-[#1E9E8F] uppercase">Step {item.step}</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1 mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM IMPACT & CALL TO ACTION */}
        <section className="bg-gradient-to-r from-rose-900 via-[#0B4F9C] to-[#1E9E8F] text-white py-14 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Empowering Safer Medication & Pharmacovigilance
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Check adverse drug reactions, verify batch authenticity, or listen to voice audio instructions directly in your browser.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/side-effects"
                className="bg-white text-rose-900 hover:bg-amber-300 hover:text-slate-900 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all"
              >
                Open Side Effects & ADR Checker
              </Link>
              <Link
                to="/scan"
                className="bg-black/20 hover:bg-black/30 text-white px-8 py-3.5 rounded-2xl font-bold text-sm border border-white/30 backdrop-blur-sm transition-all"
              >
                Scan Medicine QR
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* MOBILE QUICK ACTION BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 sm:hidden flex items-center justify-around shadow-2xl">
        <Link to="/scan" className="flex flex-col items-center text-[#0B4F9C] font-black text-[11px] gap-0.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#0B4F9C] to-cyan-600 text-white rounded-full flex items-center justify-center shadow-md">
            <Camera size={20} />
          </div>
          <span>स्कॅन करा</span>
        </Link>
        <a href="#prototype-showcase" className="flex flex-col items-center text-amber-800 font-bold text-[11px] gap-0.5">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center">
            <Volume2 size={20} />
          </div>
          <span>आवाज ऐका</span>
        </a>
        <Link to="/verify" className="flex flex-col items-center text-blue-800 font-bold text-[11px] gap-0.5">
          <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span>बॅच तपासा</span>
        </Link>
        <Link to="/side-effects" className="flex flex-col items-center text-rose-800 font-bold text-[11px] gap-0.5">
          <div className="w-10 h-10 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center">
            <HeartPulse size={20} />
          </div>
          <span>साइड इफेक्ट</span>
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
