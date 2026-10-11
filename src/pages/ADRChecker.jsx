import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, Search, Activity, Stethoscope, HeartPulse, 
  CheckCircle2, ArrowRight, Info, AlertCircle, Sparkles, Filter, Send
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SideEffectsCard from '../components/SideEffectsCard';
import { useMedicines } from '../hooks/useMedicines';

const ADRChecker = () => {
  const { medicines } = useMedicines();
  const [selectedMedId, setSelectedMedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [reported, setReported] = useState(false);
  const [reportText, setReportText] = useState('');

  const selectedMedicine = medicines.find((m) => m.id === Number(selectedMedId)) || medicines[0];

  const commonSymptoms = [
    { name: 'Nausea / Vomiting', category: 'GI', drugs: ['Paracetamol', 'Amoxicillin'] },
    { name: 'Acidity / Heartburn', category: 'GI', drugs: ['Ibuprofen'] },
    { name: 'Drowsiness / Fatigue', category: 'CNS', drugs: ['Cetirizine', 'Paracetamol'] },
    { name: 'Skin Rash / Itching', category: 'Allergy', drugs: ['Amoxicillin', 'Paracetamol', 'Cetirizine'] },
    { name: 'Stomach Pain / Diarrhea', category: 'GI', drugs: ['Amoxicillin', 'Omeprazole', 'Ibuprofen'] },
    { name: 'Dizziness / Headache', category: 'CNS', drugs: ['Cetirizine', 'Ibuprofen', 'Omeprazole'] },
  ];

  const filteredMedicines = medicines.filter((m) =>
    m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReported(true);
    setTimeout(() => {
      setReported(false);
      setReportText('');
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-[#0B4F9C] to-[#1E9E8F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="max-w-3xl relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20 text-amber-300">
                <HeartPulse size={14} />
                <span>Pharmacovigilance & Patient Safety Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Adverse Drug Reactions & Side Effects Checker
              </h1>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Check known side effects, severe drug reaction warnings (ADRs), contraindications, and emergency safety instructions for your prescribed medicines.
              </p>
            </div>
          </div>

          {/* TWO COLUMN INTERACTIVE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Medicine Selector & Symptom Matcher (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Medicine Selector Card */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Stethoscope size={16} className="text-[#0B4F9C]" />
                    <span>Select Medicine to Check</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">{medicines.length} Available</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicine..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E9E8F]"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredMedicines.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => setSelectedMedId(med.id)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedMedId === med.id
                          ? 'bg-[#0B4F9C] text-white border-[#0B4F9C] shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm">{med.brandName}</div>
                        <div className={`text-[11px] ${selectedMedId === med.id ? 'text-blue-100' : 'text-slate-500'}`}>
                          {med.genericName} • {med.strength}
                        </div>
                      </div>
                      <ChevronRight size={16} className={selectedMedId === med.id ? 'text-white' : 'text-slate-400'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom to ADR Quick Finder */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <Filter size={15} className="text-[#1E9E8F]" />
                  <span>Symptom-to-Drug Matcher</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tap any symptom below to see which medications commonly list it:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {commonSymptoms.map((sym) => (
                    <button
                      key={sym.name}
                      type="button"
                      onClick={() => setSelectedSymptom(selectedSymptom === sym.name ? null : sym.name)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        selectedSymptom === sym.name
                          ? 'bg-rose-600 text-white border-rose-600 shadow'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {sym.name}
                    </button>
                  ))}
                </div>

                {selectedSymptom && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 animate-in fade-in">
                    <span className="font-bold text-rose-900 block">
                      Known to occur with:
                    </span>
                    <p className="text-rose-800">
                      {commonSymptoms.find((s) => s.name === selectedSymptom)?.drugs.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Pharmacovigilance PvPI Simulation Card */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-5 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-amber-400" />
                  <h4 className="font-extrabold text-sm">Pharmacovigilance (PvPI)</h4>
                </div>
                <p className="text-[11px] text-slate-300">
                  Experienced an unexpected reaction? Submit a suspected adverse reaction to promote public drug safety.
                </p>

                {reported ? (
                  <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} /> Suspected ADR logged successfully for safety analysis!
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} className="space-y-2">
                    <textarea
                      rows={2}
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Describe unexpected symptom or reaction..."
                      className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={!reportText.trim()}
                      className="w-full bg-[#1E9E8F] hover:bg-[#147a6e] disabled:opacity-40 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Send size={12} />
                      <span>Log Suspected Reaction</span>
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Selected Medicine Adverse Drug Reaction Profile (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {selectedMedicine ? (
                <>
                  <SideEffectsCard medicine={selectedMedicine} />

                  <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-blue-900 space-y-1">
                      <strong className="block text-sm font-extrabold text-[#0B4F9C]">
                        Need full digital instructions for {selectedMedicine.brandName}?
                      </strong>
                      <p className="text-blue-800">
                        View complete verified dosage, administration route, manufacturer batch specs, and listen to voice readout.
                      </p>
                    </div>
                    <Link
                      to={`/medicine/${selectedMedicine.id}`}
                      className="shrink-0 bg-[#0B4F9C] hover:bg-[#083366] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <span>Open Full Page</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
                  Select a medicine on the left to view its safety profile.
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const ChevronRight = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default ADRChecker;
