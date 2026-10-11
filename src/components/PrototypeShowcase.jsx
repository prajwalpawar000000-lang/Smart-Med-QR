import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, QrCode, Volume2, ShieldCheck, HeartPulse, Printer, 
  Download, ExternalLink, CheckCircle2, AlertTriangle, Play, Pause, 
  RotateCcw, VolumeX, Smartphone, Eye, Check, Layers, Cpu, Award, 
  Zap, ArrowRight, ShieldAlert, Pill, Radio, Activity
} from 'lucide-react';
import { generateQRDataURL, downloadQR } from '../utils/qrGenerator';
import { getExpiryStatus } from '../utils/expiryCheck';

const PrototypeShowcase = ({ medicines = [] }) => {
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [activeLang, setActiveLang] = useState('mr'); // Default to Marathi for rural demo
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredMedicines = medicines.filter(m => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Capsule') return m.dosageForm === 'Capsule';
    if (selectedCategory === 'Syrup') return m.dosageForm === 'Syrup';
    if (selectedCategory === 'Suspension') return m.dosageForm === 'Suspension';
    if (selectedCategory === 'Injection') return m.dosageForm === 'Injection';
    if (selectedCategory === 'Drops') return m.dosageForm === 'Eye Drops' || m.dosageForm === 'Ear Drops';
    if (selectedCategory === 'Tablet') return m.dosageForm === 'Tablet';
    if (selectedCategory === 'Topical') return m.dosageForm === 'Ointment' || m.dosageForm === 'Cream' || m.dosageForm === 'Gel';
    if (selectedCategory === 'Powder') return m.dosageForm === 'Powder' || m.dosageForm === 'Sachet';
    if (selectedCategory === 'Inhaler/Device') return m.dosageForm === 'Inhaler' || m.dosageForm === 'Transdermal Patch' || m.dosageForm === 'Suppository';
    return true;
  });

  const currentMed = medicines[selectedMedIndex] || medicines[0];

  // Stop speech when component unmounts or selected medicine changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [selectedMedIndex]);

  // Generate QR Code for Selected Medicine
  useEffect(() => {
    let isMounted = true;
    if (!currentMed) return;

    setQrLoading(true);
    const origin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'https://shipment-fairy-minolta-stuart.trycloudflare.com'
      : window.location.origin;
    const targetUrl = `${origin}/medicine/${currentMed.id}`;
    generateQRDataURL(targetUrl, {
      width: 500,
      margin: 2, // Standard quiet zone for fast phone camera detection
      errorCorrectionLevel: 'Q', // 25% redundancy for high-contrast scanning
      color: { dark: '#0A2540', light: '#FFFFFF' }
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setQrLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error generating prototype QR', err);
        if (isMounted) setQrLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentMed]);

  if (!currentMed) return null;

  const expiryInfo = getExpiryStatus(currentMed.expDate);
  const mrTrans = currentMed.translations?.mr || {};
  const hiTrans = currentMed.translations?.hi || {};

  const genericNameMr = mrTrans.genericName || currentMed.genericName;
  const useIndicationMr = mrTrans.useIndication || currentMed.useIndication;
  const doseMr = mrTrans.dose || currentMed.dose;
  const directionMr = mrTrans.directionForUse || currentMed.directionForUse;
  const sideEffectsMr = mrTrans.sideEffects || (currentMed.sideEffects?.common?.join(', ') || 'सौम्य मळमळ किंवा डोकेदुखी');

  const genericNameHi = hiTrans.genericName || currentMed.genericName;
  const useIndicationHi = hiTrans.useIndication || currentMed.useIndication;
  const doseHi = hiTrans.dose || currentMed.dose;
  const directionHi = hiTrans.directionForUse || currentMed.directionForUse;
  const sideEffectsHi = hiTrans.sideEffects || (currentMed.sideEffects?.common?.join(', ') || 'हल्की मिचली या सिरदर्द');

  const sideEffectsEn = currentMed.sideEffects?.common?.join(', ') || 'Mild nausea or dizziness';

  // Voice speech synthesis handler
  const handlePlayVoice = (lang = activeLang) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let script = '';
    if (lang === 'mr') {
      script = `नमस्कार! स्मार्ट मेड क्यूआर प्रोटोटाइप व्हॉईस डेमो. 
औषधाचे नाव ${currentMed.brandName}, मूळ औषध ${genericNameMr}, मात्रा ${currentMed.strength} आहे. 
हे औषध कशासाठी घ्यायचे: ${useIndicationMr} यासाठी घ्यायचे आहे. 
डोस आणि प्रमाण: ${doseMr}. 
घेण्याची सोपी पद्धत: ${directionMr}. 
अंतिम मुदत: ${currentMed.expDate} पर्यंत सुरक्षित आहे. 
संभाव्य दुष्परिणाम: ${sideEffectsMr}. 
धन्यवाद!`;
    } else if (lang === 'hi') {
      script = `नमस्ते। स्मार्ट मेड क्यूआर प्रोटोटाइप वॉइस डेमो में आपका स्वागत है। 
दवाई का नाम ${currentMed.brandName}, मूल घटक ${genericNameHi}, शक्ति ${currentMed.strength} है। 
उपयोग: ${useIndicationHi}। 
खुराक: ${doseHi}। 
लेने का तरीका: ${directionHi}। 
एक्सपायरी तारीख: ${currentMed.expDate}। 
साइड इफेक्ट्स: ${sideEffectsHi}। धन्यवाद!`;
    } else {
      script = `Welcome to Smart Med QR Prototype Voice Assistant. 
Medicine name: ${currentMed.brandName}, strength ${currentMed.strength}. Generic name: ${currentMed.genericName}. 
Indication: ${currentMed.useIndication}. 
Recommended dose: ${currentMed.dose}. 
Directions: ${currentMed.directionForUse}. 
Expiry date: ${currentMed.expDate}. 
Common side effects: ${sideEffectsEn}. Thank you!`;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'mr') {
      utterance.lang = 'mr-IN';
      const mrVoice = voices.find(v => 
        v.lang === 'mr-IN' || v.lang === 'mr_IN' || v.lang.startsWith('mr') || 
        v.name.toLowerCase().includes('marathi') || v.lang.startsWith('hi') || v.name.includes('Hindi')
      );
      if (mrVoice) utterance.voice = mrVoice;
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.includes('Hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en-GB') || v.name.includes('India'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePrintSpecimen = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MedQR Prototype Specimen - ${currentMed.brandName}</title>
          <style>
            @page { size: auto; margin: 8mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 95vh; margin: 0; background: #f8fafc; }
            .specimen-card { background: #fff; border: 2.5px solid #0B4F9C; border-radius: 16px; padding: 24px; text-align: center; max-width: 380px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header-tag { display: inline-block; background: #0B4F9C; color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
            .qr-img { width: 220px; height: 220px; margin: 0 auto 12px; display: block; border-radius: 12px; border: 1.5px solid #e2e8f0; }
            h1 { margin: 4px 0; font-size: 24px; color: #0B4F9C; font-weight: 900; }
            .strength { font-size: 16px; color: #1E9E8F; font-weight: 800; margin-bottom: 8px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; text-align: left; background: #f1f5f9; padding: 10px; border-radius: 8px; margin-top: 10px; }
            .meta-item { color: #475569; }
            .meta-item strong { color: #0f172a; }
            .footer-note { font-size: 10px; color: #64748b; margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="specimen-card">
            <div class="header-tag">Avishkar Research Prototype Specimen</div>
            <img src="${qrDataUrl}" class="qr-img" />
            <h1>${currentMed.brandName}</h1>
            <div class="strength">${currentMed.genericName} • ${currentMed.strength}</div>
            <div class="meta-grid">
              <div class="meta-item">Batch: <strong>${currentMed.batchNo}</strong></div>
              <div class="meta-item">Dosage Form: <strong>${currentMed.dosageForm}</strong></div>
              <div class="meta-item">Mfg Date: <strong>${currentMed.mfgDate}</strong></div>
              <div class="meta-item">Exp Date: <strong>${currentMed.expDate}</strong></div>
            </div>
            <div class="footer-note">Scan with any smartphone camera to open MedQR Patient Voice & Safety Portal</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section id="prototype-showcase" className="max-w-6xl mx-auto px-4 my-16">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-[#0B4F9C]/10 to-[#1E9E8F]/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-amber-900 mb-3 shadow-xs">
          <Award size={16} className="text-amber-600 animate-bounce" />
          <span>Avishkar State Level Research Competition 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span className="text-[#0B4F9C] uppercase tracking-wider">Working Prototype</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Final Working Prototype Showcase
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Test the complete MedQR technology stack live: scan packaging specimens, test the rural Marathi voice engine, inspect real-time ADRs, and verify batch authenticity.
        </p>
      </div>

      {/* INTERACTIVE PROTOTYPE WORKBENCH CONTAINER */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/90 overflow-hidden">
        
        {/* TOP BAR: SPECIMEN PICKER TABS */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0B4F9C] to-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                <span>Interactive Specimen Workbench</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                  Live Sim
                </span>
              </h3>
              <p className="text-xs text-blue-200">Select any medicine strip specimen to test the prototype</p>
            </div>
          </div>

          {/* Category Filter & Medicine Selector Pills */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-xl text-[11px] font-semibold border border-white/10">
              {[
                'All', 'Capsule', 'Syrup', 'Suspension', 'Injection', 
                'Drops', 'Tablet', 'Topical', 'Powder', 'Inhaler/Device'
              ].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-white text-[#0B4F9C] font-extrabold shadow-sm' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Medicine Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/15 max-h-32 overflow-y-auto">
              {filteredMedicines.map((med) => {
                const globalIndex = medicines.findIndex(m => m.id === med.id);
                const isSelected = selectedMedIndex === globalIndex;
                return (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => setSelectedMedIndex(globalIndex)}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-slate-950 shadow-md transform scale-102 font-extrabold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Pill size={12} className={isSelected ? 'text-slate-950' : 'text-amber-300'} />
                    <span>{med.brandName}</span>
                    <span className="text-[10px] opacity-75 font-normal font-mono">({med.dosageForm})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* WORKBENCH BODY: 2-COLUMN DISPLAY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 bg-slate-50/50">
          
          {/* LEFT COLUMN: SIMULATED PACKAGING & QR SCANNER (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Realistic Medicine Strip / Box Mockup */}
            <div className="w-full bg-white rounded-2xl border-2 border-slate-300/80 p-5 shadow-lg relative overflow-hidden group hover:border-[#1E9E8F] transition-all">
              
              {/* Header Strip Line */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-blue-50 text-[#0B4F9C] px-2.5 py-1 rounded-lg border border-blue-200">
                  <QrCode size={13} /> {currentMed.dosageForm.toUpperCase()} SPECIMEN
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  expiryInfo.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {expiryInfo.status === 'valid' ? '✓ Safe & Valid' : '⚠ Warning'}
                </span>
              </div>

              {/* Medicine QR Code */}
              <div className="relative aspect-square max-w-[240px] mx-auto bg-white p-3 rounded-2xl border-2 border-slate-800 shadow-inner flex items-center justify-center mb-4">
                {qrLoading ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 py-8">
                    <Activity size={28} className="animate-spin text-[#1E9E8F]" />
                    <span className="text-xs font-semibold">Generating HD QR...</span>
                  </div>
                ) : qrDataUrl ? (
                  <>
                    <img 
                      src={qrDataUrl} 
                      alt={`MedQR code for ${currentMed.brandName}`} 
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none rounded-2xl"></div>
                  </>
                ) : (
                  <div className="text-xs text-rose-500">QR Generation Error</div>
                )}
              </div>

              {/* Strip Meta Specs */}
              <div className="text-center space-y-1 mb-4">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentMed.brandName} <span className="text-sm font-semibold text-slate-500">({currentMed.strength})</span>
                </h4>
                <p className="text-xs font-semibold text-[#1E9E8F]">{currentMed.genericName}</p>
                <div className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg mt-1">
                  <span>Batch: <strong>{currentMed.batchNo}</strong></span>
                  <span>•</span>
                  <span>Exp: <strong>{currentMed.expDate}</strong></span>
                </div>
              </div>

              {/* Action Buttons for Specimen Strip */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => downloadQR(qrDataUrl, `${currentMed.brandName}_Prototype_QR`, 'png')}
                  className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl transition-colors cursor-pointer"
                  title="Download specimen QR image to test with phone camera"
                >
                  <Download size={14} />
                  <span>Download QR</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSpecimen}
                  className="flex items-center justify-center gap-1.5 bg-[#0B4F9C] hover:bg-blue-800 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm transition-colors cursor-pointer"
                  title="Print paper specimen strip for judges"
                >
                  <Printer size={14} />
                  <span>Print Specimen</span>
                </button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-[11px] text-slate-400">
                  📱 Tip: Point your smartphone camera at the QR code above to test live mobile scanning.
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: MULTILINGUAL VOICE & ADR ENGINE (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            
            {/* 1. EMBEDDED GOOGLE VOICE ASSISTANT DEMO */}
            <div className="bg-gradient-to-r from-[#0B4F9C] via-[#0E5DA8] to-[#1E9E8F] text-white p-5 rounded-2xl shadow-md border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-white/20 rounded-lg text-amber-300">
                    <Volume2 size={18} />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-2">
                      <span>Prototype Voice Synthesizer</span>
                      <span className="text-[10px] bg-amber-300 text-slate-900 font-black px-2 py-0.5 rounded-md">
                        Rural Audio
                      </span>
                    </h4>
                    <p className="text-[11px] text-blue-100">
                      Spoken indications, dosage, and side effects for illiterate & rural patients
                    </p>
                  </div>
                </div>

                {/* Language Switcher */}
                <div className="inline-flex bg-black/30 p-0.5 rounded-xl border border-white/20 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => { setActiveLang('mr'); if (isPlaying) handlePlayVoice('mr'); }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeLang === 'mr' ? 'bg-amber-300 text-slate-950 font-black shadow' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveLang('hi'); if (isPlaying) handlePlayVoice('hi'); }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeLang === 'hi' ? 'bg-white text-[#0B4F9C] shadow' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveLang('en'); if (isPlaying) handlePlayVoice('en'); }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeLang === 'en' ? 'bg-white text-[#0B4F9C] shadow' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Marathi / Multilingual Voice Preview Transcript */}
              <div className="bg-black/25 backdrop-blur-sm rounded-xl p-3 text-xs text-blue-50 font-medium leading-relaxed mb-3 border border-white/10">
                <span className="text-amber-300 font-bold block mb-1">
                  🎙️ {activeLang === 'mr' ? 'मराठी ऑडिओ स्क्रिप्ट (गावाकडच्या सोप्या भाषेत):' : activeLang === 'hi' ? 'हिंदी ऑडियो स्क्रिप्ट:' : 'English Speech Transcript:'}
                </span>
                <p className="italic">
                  {activeLang === 'mr' ? (
                    `"औषधाचे नाव ${currentMed.brandName} (${genericNameMr}), मात्रा ${currentMed.strength}. उपयोग: ${useIndicationMr}. डोस: ${doseMr}. घेण्याची पद्धत: ${directionMr}. सुरक्षितता: ${currentMed.expDate} पर्यंत वैध."`
                  ) : activeLang === 'hi' ? (
                    `"दवाई का नाम ${currentMed.brandName} (${genericNameHi}), मात्रा ${currentMed.strength}। उपयोग: ${useIndicationHi}। खुराक: ${doseHi}। निर्देश: ${directionHi}।"`
                  ) : (
                    `"Medicine ${currentMed.brandName} (${currentMed.genericName}), strength ${currentMed.strength}. Used for ${currentMed.useIndication}. Dose: ${currentMed.dose}."`
                  )}
                </p>
              </div>

              {/* Audio Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Speed toggle button */}
                <button
                  type="button"
                  onClick={() => setSpeechRate(speechRate === 0.8 ? 1.0 : 0.8)}
                  className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg border border-white/20 text-blue-100 transition-colors cursor-pointer"
                >
                  गती: {speechRate === 0.8 ? '0.8x (हळूवार)' : '1.0x (सामान्य)'}
                </button>

                {/* Play / Pause / Stop Buttons */}
                <div className="flex items-center gap-2">
                  {!isPlaying ? (
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(activeLang)}
                      className="flex items-center gap-2 bg-amber-300 text-slate-950 hover:bg-amber-400 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Volume2 size={16} className="text-[#0B4F9C]" />
                      <span>{activeLang === 'mr' ? 'मराठीत ऐका (Play Voice)' : activeLang === 'hi' ? 'हिंदी में सुनें' : 'Listen Audio'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePauseResume}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs border border-white/30 cursor-pointer"
                      >
                        {isPaused ? <Play size={13} /> : <Pause size={13} />}
                        <span>{isPaused ? 'सुरू करा' : 'थांबवा'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStop}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-xs shadow cursor-pointer"
                      >
                        <VolumeX size={13} />
                        <span>बंद</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayVoice(activeLang)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 cursor-pointer"
                        title="पुन्हा ऐका"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 2. ADVERSE DRUG REACTIONS (ADR) & PHARMACOVIGILANCE HIGHLIGHT */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <HeartPulse size={18} className="text-rose-600" />
                  <span>Pharmacovigilance & Side Effect Profile</span>
                </div>
                <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md font-bold">
                  FDA / WHO Standards
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                  <strong className="text-slate-800 block mb-1">Common Side Effects:</strong>
                  <p className="text-slate-600">
                    {currentMed.sideEffects?.common?.join(', ') || 'Mild nausea, stomach discomfort'}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                  <strong className="text-rose-900 block mb-1">Severe ADR Warning:</strong>
                  <p className="text-rose-700 font-medium">
                    {currentMed.sideEffects?.adverseReactions?.[0] || 'Overdose hepatotoxicity / hypersensitivity'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. QUICK NAVIGATION TO DEEP MODULES */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to={`/medicine/${currentMed.id}`}
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-[#0B4F9C] hover:bg-blue-800 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition-all group"
              >
                <span>Open Full Medicine Monograph</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/side-effects"
                className="inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-sm transition-all"
              >
                <ShieldAlert size={15} />
                <span>ADR Explorer</span>
              </Link>

              <Link
                to="/verify"
                className="inline-flex items-center justify-center gap-1.5 bg-[#1E9E8F] hover:bg-teal-700 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-sm transition-all"
              >
                <ShieldCheck size={15} />
                <span>Verify Batch ({currentMed.batchNo})</span>
              </Link>
            </div>

          </div>

        </div>

        {/* BOTTOM METRICS & ARCHITECTURE STRIP */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scan Speed</div>
              <div className="text-lg font-black text-[#0B4F9C]">&lt; 150 ms</div>
              <div className="text-[10px] text-slate-400">Instant offline PWA</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Voice Dialects</div>
              <div className="text-lg font-black text-[#1E9E8F]">3 Languages</div>
              <div className="text-[10px] text-slate-400">Marathi, Hindi & English</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ADR Detection</div>
              <div className="text-lg font-black text-rose-600">Real-Time</div>
              <div className="text-[10px] text-slate-400">FDA Black-Box alerts</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authentication</div>
              <div className="text-lg font-black text-emerald-600">Batch Verified</div>
              <div className="text-[10px] text-slate-400">Anti-counterfeit check</div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};

export default PrototypeShowcase;
