import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Shield, Heart, FileText, Phone, Mail, HelpCircle, X, CheckCircle2, ShieldAlert } from 'lucide-react';

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact' | null

  return (
    <footer className="bg-gradient-to-b from-[#083366] via-[#052244] to-[#03152b] text-white py-12 mt-auto border-t border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MAIN FOOTER COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-blue-900/60 text-sm">
          
          {/* Column 1: About MedQR */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#1E9E8F] to-teal-400 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                <QrCode size={20} />
              </div>
              <span className="font-black text-2xl tracking-tight text-white">MedQR</span>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              <strong>Smart Medicine Identification. Secure Batch Verification. Better Patient Awareness.</strong>
            </p>
            <p className="text-xs text-blue-300/80 leading-relaxed">
              A specialized healthcare technology platform serving patients, pharmacists, hospitals, and pharmaceutical manufacturers with real-time digital drug monographs and anti-counterfeit lot validation.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-teal-300">Platform Features</h4>
            <ul className="space-y-1.5 text-xs text-blue-200">
              <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link to="/scan" className="hover:text-white transition-colors">Scan Medicine QR</Link></li>
              <li><Link to="/verify" className="hover:text-white transition-colors">Verify Medicine Batch</Link></li>
              <li><a href="/#search-section" className="hover:text-white transition-colors">Medicine Directory Search</a></li>
              <li><Link to="/side-effects" className="hover:text-white transition-colors">Side Effects & ADR Checker</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin & Pharmacist Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-teal-300">Contact & Support</h4>
            <ul className="space-y-2 text-xs text-blue-200">
              <li className="flex items-start gap-2">
                <Mail size={15} className="text-teal-400 shrink-0 mt-0.5" />
                <span>contact@medqr-health.org</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={15} className="text-teal-400 shrink-0 mt-0.5" />
                <span>+91 (0) 20 2569 0000 (Healthcare Helpline)</span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className="mt-1 text-teal-300 underline hover:text-teal-100 font-semibold cursor-pointer"
                >
                  Send Inquiry / Report Batch Issue →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Regulatory Policies */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider text-teal-300">Trust & Legal</h4>
            <ul className="space-y-1.5 text-xs text-blue-200">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About MedQR Platform
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('disclaimer')}
                  className="hover:text-white transition-colors cursor-pointer text-left font-bold text-amber-300"
                >
                  Medical Disclaimer
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* MEDICAL DISCLAIMER BANNER */}
        <div className="py-4 my-6 px-5 rounded-2xl bg-white/5 border border-white/10 text-xs text-blue-200/90 leading-relaxed flex items-start gap-3">
          <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Medical Disclaimer:</strong> The information provided on MedQR is intended solely for patient educational, safety awareness, and lot identification purposes. It does not replace professional medical evaluation, diagnosis, or treatment. Always follow prescription guidelines provided by your licensed doctor and pharmacist.
          </p>
        </div>

        {/* COPYRIGHT BOTTOM BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/80 gap-3 pt-2">
          <p>&copy; {new Date().getFullYear()} MedQR – Smart Digital Medicine Assistant. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Engineered for accessible patient safety</span>
            <span className="text-slate-400">•</span>
            <span>Independent Healthcare Technology</span>
          </p>
        </div>

      </div>

      {/* POLICY & LEGAL MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            {activeModal === 'about' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0B4F9C]">
                  <QrCode size={24} />
                  <h3 className="text-xl font-bold">About MedQR</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  MedQR is a specialized digital health platform created to address critical challenges in medication safety: illegible packaging prints, language barriers for non-English speakers, unmonitored adverse drug reactions (ADRs), and counterfeit supply chains.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  By providing instant QR-based access to multilingual audio guides, color-coded shelf-life expiry alerts, and official batch record verification, MedQR empowers patients, caregivers, pharmacists, and medical providers with transparent healthcare intelligence.
                </p>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0B4F9C]">
                  <Shield size={24} />
                  <h3 className="text-xl font-bold">Privacy Policy</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  MedQR respects user privacy and confidentiality. The platform operates on a privacy-by-design model:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-1">
                  <li><strong>Camera Feed:</strong> QR camera video processing occurs strictly on your device. Video frames are never recorded, streamed, or stored on external servers.</li>
                  <li><strong>Personal Data:</strong> Searching medicines or verifying batch codes does not require personal identification or contact disclosure.</li>
                  <li><strong>Analytics:</strong> Only aggregated, anonymous telemetry may be gathered to improve scanner performance and platform availability.</li>
                </ul>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0B4F9C]">
                  <FileText size={24} />
                  <h3 className="text-xl font-bold">Terms and Conditions</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  By accessing or utilizing the MedQR platform, you acknowledge and agree to the following conditions:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-1">
                  <li>MedQR provides digital informational references based on verified master submissions and public pharmacovigilance documentation.</li>
                  <li>Verification confirms registration consistency within the MedQR database; users must verify physical tamper-evident packaging before ingestion.</li>
                  <li>MedQR does not endorse unauthorized distributors or counterfeit channels.</li>
                </ul>
              </div>
            )}

            {activeModal === 'disclaimer' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <ShieldAlert size={24} />
                  <h3 className="text-xl font-bold">Medical Disclaimer</h3>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-950 leading-relaxed space-y-2">
                  <p className="font-bold">
                    THIS SERVICE DOES NOT PROVIDE MEDICAL ADVICE.
                  </p>
                  <p>
                    The contents of MedQR, including text, dosage guidelines, adverse drug reaction summaries, audio guides, and batch verification outcomes, are presented for informational and educational purposes only.
                  </p>
                  <p>
                    Never disregard professional medical advice or delay seeking it because of information accessed on MedQR. In cases of acute allergic shock, accidental overdose, or medical emergency, immediately contact your local emergency services (112 or local hospital).
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0B4F9C]">
                  <Mail size={24} />
                  <h3 className="text-xl font-bold">Contact MedQR Support</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Have inquiries regarding batch registration, hospital integrations, or suspect medicine reporting?
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200">
                  <div><strong>General Support:</strong> support@medqr-health.org</div>
                  <div><strong>Pharmacovigilance Desk:</strong> safety@medqr-health.org</div>
                  <div><strong>Manufacturer Registration:</strong> enterprise@medqr-health.org</div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="bg-[#0B4F9C] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
