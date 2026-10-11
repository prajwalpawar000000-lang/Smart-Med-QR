import React, { useState, useContext } from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, Info, PhoneCall, Sparkles, HeartPulse, Stethoscope } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

const SideEffectsCard = ({ medicine }) => {
  const context = useContext(LanguageContext);
  const language = context?.language || 'mr';

  if (!medicine) return null;

  const rawSideEffects = medicine.sideEffects || {};

  // Safely extract common side effects
  const common = (Array.isArray(rawSideEffects.common) && rawSideEffects.common.length > 0)
    ? rawSideEffects.common
    : ["Mild nausea", "Headache", "Stomach discomfort"];

  // Safely extract adverse reactions (using adverseReactions, serious, or safe defaults)
  const adverseReactions = (Array.isArray(rawSideEffects.adverseReactions) && rawSideEffects.adverseReactions.length > 0)
    ? rawSideEffects.adverseReactions
    : (Array.isArray(rawSideEffects.serious) && rawSideEffects.serious.length > 0)
    ? rawSideEffects.serious
    : [
        "Severe allergic reaction (Rash, Swelling of face/lips)",
        "Shortness of breath or difficulty breathing",
        "Seek immediate medical attention if severe symptoms occur"
      ];

  // Safely extract warnings
  const warnings = (Array.isArray(rawSideEffects.warnings) && rawSideEffects.warnings.length > 0)
    ? rawSideEffects.warnings
    : [
        "Follow doctor's prescribed dose strictly.",
        "Keep away from children in a cool and dry place.",
        "Consult physician or pharmacist if pregnant, nursing, or on other medications."
      ];

  // Safely extract contraindications
  const contraindications = rawSideEffects.contraindications ||
    "Hypersensitivity to the active substance or excipients. Severe liver or kidney impairment unless advised by a specialist.";

  // Safely extract emergency warning
  const emergencyWarning = rawSideEffects.emergencyWarning ||
    "Seek urgent medical attention if you experience severe allergic swelling, breathing difficulty, or persistent vomiting.";

  const labels = {
    en: {
      title: "Adverse Drug Reactions & Side Effects",
      subtitle: "Pharmacovigilance & Patient Safety Guide",
      commonTitle: "Common / Mild Side Effects",
      commonDesc: "Usually mild and often resolve as your body adjusts.",
      adverseTitle: "Severe Adverse Reactions (ADRs)",
      adverseDesc: "Rare but critical reactions. Stop medication and consult a doctor immediately.",
      warningsTitle: "Important Safety Precautions",
      contraTitle: "Contraindications",
      emergencyTitle: "Emergency Action Notice",
      reportBtn: "Report Side Effect (PvPI)"
    },
    hi: {
      title: "साइड इफेक्ट्स और प्रतिकूल दवा प्रतिक्रियाएं (ADR)",
      subtitle: "मरीज सुरक्षा और फार्माकोविजिलेंस गाइड",
      commonTitle: "सामान्य / हल्के साइड इफेक्ट्स",
      commonDesc: "ये आमतौर पर हल्के होते हैं और समय के साथ ठीक हो जाते हैं।",
      adverseTitle: "गंभीर प्रतिकूल प्रतिक्रियाएं (ADRs)",
      adverseDesc: "दुर्लभ परंतु गंभीर। ऐसे लक्षण दिखने पर तुरंत डॉक्टर से संपर्क करें।",
      warningsTitle: "महत्वपूर्ण सुरक्षा सावधानियां",
      contraTitle: "दवाई कब न लें (Contraindications)",
      emergencyTitle: "आपातकालीन चेतावनी",
      reportBtn: "साइड इफेक्ट की सूचना दें"
    },
    mr: {
      title: "औषधाचे दुष्परिणाम आणि प्रतिकूल परिणाम (ADR)",
      subtitle: "रुग्ण सुरक्षितता आणि औषध सुरक्षा मार्गदर्शक",
      commonTitle: "सामान्य / सौम्य दुष्परिणाम",
      commonDesc: "हे सहसा सौम्य असतात आणि आपोआप कमी होतात.",
      adverseTitle: "गंभीर प्रतिकूल परिणाम (ADRs)",
      adverseDesc: "दुर्मिळ परंतु गंभीर परिणाम. अशी लक्षणे दिसल्यास ताबडतोब डॉक्टरांशी संपर्क साधा.",
      warningsTitle: "महत्त्वाच्या सुरक्षेच्या सूचना",
      contraTitle: "केव्हा घेऊ नये (Contraindications)",
      emergencyTitle: "तातडीचा इशारा",
      reportBtn: "दुष्परिणामाची नोंद करा"
    }
  };

  const l = labels[language] || labels.en;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
          <HeartPulse size={120} />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-300 shrink-0 border border-white/20">
              <ShieldAlert size={28} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Sparkles size={12} />
                {l.subtitle}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {l.title}
              </h3>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-500/30 text-xs font-semibold text-rose-200 self-start sm:self-auto">
            <Stethoscope size={14} className="text-rose-400" />
            <span>{medicine.brandName} ({medicine.genericName})</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">

        {/* 1. Severe Adverse Drug Reactions (ADRs) - Red High Priority Card */}
        <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <AlertTriangle className="text-rose-600 shrink-0" size={20} />
            <h4 className="font-extrabold text-rose-950 text-base">
              {l.adverseTitle}
            </h4>
          </div>
          <p className="text-xs text-rose-800 mb-3.5">
            {l.adverseDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {adverseReactions.map((adr, index) => (
              <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-rose-100 text-xs text-rose-900 shadow-2xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                <span>{adr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Common / Mild Side Effects - Amber Card */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <h4 className="font-extrabold text-amber-950 text-base">
              {l.commonTitle}
            </h4>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            {l.commonDesc}
          </p>
          <div className="flex flex-wrap gap-2">
            {common.map((effect, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {effect}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Safety Warnings & Contraindications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Warnings & Precautions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
              <Info size={16} className="text-[#0B4F9C]" />
              <span>{l.warningsTitle}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {warnings.map((warn, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#1E9E8F] font-bold">✓</span>
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contraindications */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold text-sm">
              <ShieldAlert size={16} className="text-rose-600" />
              <span>{l.contraTitle}</span>
            </div>
            <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
              {contraindications}
            </p>
          </div>

        </div>

        {/* 4. Emergency Action Notice */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-md">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <PhoneCall size={18} />
          </div>
          <div className="space-y-1">
            <h5 className="font-black text-sm tracking-wide uppercase">
              {l.emergencyTitle}
            </h5>
            <p className="text-xs text-red-50 leading-relaxed">
              {emergencyWarning}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SideEffectsCard;
