import React, { useState, useEffect, useContext } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Activity } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { getExpiryStatus } from '../utils/expiryCheck';

const VoiceAssistant = ({ medicine }) => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8); // 0.8x slow & crystal clear for rural / elderly patients
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!speechSupported || !medicine) return null;

  const expiryInfo = getExpiryStatus(medicine.expDate);
  const expirySpeechEn = expiryInfo.status === 'expired' 
    ? 'Warning! This medicine is expired. Do not use it.' 
    : expiryInfo.status === 'expiring' 
    ? `Warning! This medicine is expiring soon in ${medicine.expDate}.` 
    : `This medicine is valid and safe to use until ${medicine.expDate}.`;

  const expirySpeechHi = expiryInfo.status === 'expired'
    ? 'सावधान! यह दवाई एक्सपायर हो चुकी है, इसका सेवन बिल्कुल न करें।'
    : expiryInfo.status === 'expiring'
    ? `चेतावनी! यह दवाई जल्द ही ${medicine.expDate} में एक्सपायर होने वाली है।`
    : `यह दवाई बिल्कुल सुरक्षित और वैध है। इसकी एक्सपायरी तारीख ${medicine.expDate} है।`;

  const expirySpeechMr = expiryInfo.status === 'expired'
    ? 'धोका! हे औषध एक्सपायर झाले आहे, कृपया वापरू नका.'
    : expiryInfo.status === 'expiring'
    ? `काळजी घ्या! हे औषध लवकरच ${medicine.expDate} मध्ये संपणार आहे.`
    : `हे औषध सुरक्षित असून याची अंतिम मुदत ${medicine.expDate} पर्यंत आहे.`;

  // Multi-language native fields (from translations or fallback)
  const mrTrans = medicine.translations?.mr || {};
  const hiTrans = medicine.translations?.hi || {};

  const genericNameMr = mrTrans.genericName || medicine.genericName;
  const genericNameHi = hiTrans.genericName || medicine.genericName;

  const useIndicationMr = mrTrans.useIndication || medicine.useIndication;
  const useIndicationHi = hiTrans.useIndication || medicine.useIndication;

  const doseMr = mrTrans.dose || medicine.dose;
  const doseHi = hiTrans.dose || medicine.dose;

  const directionMr = mrTrans.directionForUse || medicine.directionForUse;
  const directionHi = hiTrans.directionForUse || medicine.directionForUse;

  const sideEffectsMr = mrTrans.sideEffects || (medicine.sideEffects?.common?.join(', ') || 'सौम्य मळमळ किंवा पोटदुखी');
  const sideEffectsHi = hiTrans.sideEffects || (medicine.sideEffects?.common?.join(', ') || 'हल्की मिचली या पेट दर्द');
  const sideEffectsEn = medicine.sideEffects?.common?.join(', ') || 'Mild nausea or dizziness';

  const getFullScript = (lang) => {
    if (lang === 'mr') {
      return `नमस्कार! स्मार्ट मेड क्यूआर ऑडिओ सेवेमध्ये आपले स्वागत आहे. 
औषधाचे नाव ${medicine.brandName} आहे, मूळ औषध ${genericNameMr}, मात्रा ${medicine.strength} आहे. 
हे औषध कशासाठी घ्यायचे: ${useIndicationMr} यासाठी घ्यायचे आहे. 
डोस आणि प्रमाण: ${doseMr}. 
घेण्याची सोपी पद्धत: ${directionMr}. 
${expirySpeechMr} 
संभाव्य दुष्परिणाम: ${sideEffectsMr}. 
उत्पादक कंपनी: ${medicine.manufacturer}. 
महत्त्वाची सूचना: औषध नेहमी डॉक्टरांच्या किंवा आरोग्य सेविकेच्या सल्ल्यानेच घ्यावे. धन्यवाद!`;
    } else if (lang === 'hi') {
      return `नमस्ते। स्मार्ट मेड क्यूआर वॉइस गाइड में आपका स्वागत है। 
दवाई का नाम ${medicine.brandName} है। इसका मूल घटक ${genericNameHi}, शक्ति ${medicine.strength} है। 
इस दवाई का मुख्य उपयोग: ${useIndicationHi} के इलाज के लिए है। 
खुराक: ${doseHi}। 
लेने का सही तरीका: ${directionHi}। 
${expirySpeechHi} 
सामान्य साइड इफेक्ट्स: ${sideEffectsHi}। 
निर्माता कंपनी: ${medicine.manufacturer}। 
कृपया दवाई हमेशा डॉक्टर की सलाह के अनुसार ही लें। धन्यवाद!`;
    } else {
      return `Hello. Welcome to Smart Med QR Voice Assistant. 
Medicine name is ${medicine.brandName}, strength ${medicine.strength}. Generic name: ${medicine.genericName}. 
Indication and uses: This medicine is used for ${medicine.useIndication}. 
Recommended dose: ${medicine.dose}. 
Directions for use: ${medicine.directionForUse}. 
${expirySpeechEn} 
Common side effects: ${sideEffectsEn}. 
Manufactured by: ${medicine.manufacturer}. 
Please use only under medical advice. Thank you!`;
    }
  };

  const handleSpeak = (targetLang = language) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const script = getFullScript(targetLang);
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (targetLang === 'mr') {
      utterance.lang = 'mr-IN';
      const mrVoice = voices.find(v => 
        v.lang === 'mr-IN' || 
        v.lang === 'mr_IN' || 
        v.lang.startsWith('mr') || 
        v.name.toLowerCase().includes('marathi') ||
        v.name.toLowerCase().includes('mr-in') ||
        v.lang.startsWith('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.toLowerCase().includes('india')
      );
      if (mrVoice) utterance.voice = mrVoice;
    } else if (targetLang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.includes('Hindi') || v.name.includes('India'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en-GB') || v.name.includes('India'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

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

  return (
    <div className="bg-gradient-to-r from-[#0B4F9C] via-[#0E5DA8] to-[#1E9E8F] rounded-2xl p-3.5 sm:p-4 text-white shadow-lg border border-white/20 relative overflow-hidden transition-all">
      
      {/* Google Assistant 4-color dots in top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-90">
        <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-pulse"></span>
        <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-[#FBBC05] animate-pulse" style={{ animationDelay: '300ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" style={{ animationDelay: '450ms' }}></span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left Side: Compact Title & Language Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="p-1.5 bg-white/20 rounded-lg text-amber-300">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {language === 'mr' ? 'गावाकडच्या सोप्या मराठीत ऐका (मराठी आवाज)' : language === 'hi' ? 'दवाई का उपयोग व जानकारी सुनें' : 'Google Voice Assistant (Audio Guide)'}
              </h3>
              <p className="text-[11px] text-blue-100 hidden sm:block">
                {language === 'mr' ? 'ग्रामीण भागातील व वृद्ध रुग्णांसाठी सोप्या मराठीत उपयोग व डोस सांगेल' : language === 'hi' ? 'उपयोग, खुराक, और एक्सपायरी बोलकर समझाएगा' : 'Speaks uses, dosage, expiry, and side effects aloud'}
              </p>
            </div>
          </div>

          {/* Inline Compact Language Pills */}
          <div className="inline-flex bg-black/20 p-0.5 rounded-xl border border-white/20 text-xs">
            <button
              type="button"
              onClick={() => { setLanguage('mr'); if (isPlaying) handleSpeak('mr'); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${language === 'mr' ? 'bg-amber-300 text-slate-900 shadow font-extrabold' : 'text-white/90 hover:text-white'}`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => { setLanguage('hi'); if (isPlaying) handleSpeak('hi'); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${language === 'hi' ? 'bg-white text-[#0B4F9C] shadow' : 'text-white/80 hover:text-white'}`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => { setLanguage('en'); if (isPlaying) handleSpeak('en'); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${language === 'en' ? 'bg-white text-[#0B4F9C] shadow' : 'text-white/80 hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Right Side: Action Controls & Speed */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          
          {/* Speed Toggle: 0.8x (Slow for rural clarity) / 1.0x */}
          <button
            type="button"
            onClick={() => setSpeechRate(speechRate === 0.8 ? 1.0 : 0.8)}
            className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-2 py-1.5 rounded-lg border border-white/20 text-blue-100 transition-colors"
            title="Toggle speech speed"
          >
            आवाज: {speechRate === 0.8 ? '0.8x (हळूवार)' : '1.0x (सामान्य)'}
          </button>

          {!isPlaying ? (
            <button
              type="button"
              onClick={() => handleSpeak(language)}
              className="flex items-center gap-2 bg-amber-300 text-slate-950 hover:bg-amber-400 px-4 py-2 rounded-xl font-extrabold text-sm shadow-md transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Volume2 size={18} className="text-[#0B4F9C]" />
              <span>{language === 'mr' ? 'मराठीत ऐका (Play)' : language === 'hi' ? 'उपयोग सुनें (Play)' : 'Listen Uses'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePauseResume}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-bold text-xs border border-white/30 transition-all cursor-pointer"
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{isPaused ? 'पुढे सुरू करा' : 'थांबवा'}</span>
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow transition-all cursor-pointer"
              >
                <VolumeX size={14} />
                <span>बंद करा</span>
              </button>

              <button
                type="button"
                onClick={() => handleSpeak(language)}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-all cursor-pointer"
                title="सुरुवातीपासून ऐका"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Active Speech Waveform Banner */}
      {isPlaying && !isPaused && (
        <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2 text-xs text-emerald-200">
          <Activity size={14} className="animate-spin text-emerald-300" />
          <span className="font-medium text-[11px]">
            {language === 'mr' 
              ? `गावाकडच्या सोप्या मराठीत औषधाची माहिती सांगत आहे (${medicine.brandName})...` 
              : language === 'hi' 
              ? `दवाई का उपयोग व निर्देश बोल रहे हैं (${medicine.brandName})...` 
              : `Speaking indications, dosage & directions for ${medicine.brandName}...`
            }
          </span>
        </div>
      )}

    </div>
  );
};

export default VoiceAssistant;
