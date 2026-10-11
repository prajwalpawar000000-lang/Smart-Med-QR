import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Search, AlertCircle, Upload, CheckCircle2, QrCode, Sparkles, 
  RefreshCw, Camera, Flashlight, Volume2, Pill, ShieldCheck, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useMedicines } from '../hooks/useMedicines';
import { getInitialMedicines } from '../utils/api';

// Synthetic sound for instant audible scan confirmation
function playScanBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // AudioContext might be blocked before first user gesture
  }
}

const Scanner = () => {
  const navigate = useNavigate();
  const { medicines } = useMedicines();
  const [manualId, setManualId] = useState('');
  const [scanError, setScanError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fileScanning, setFileScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const fileInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const processDecodedText = async (decodedText) => {
    if (isNavigatingRef.current) return;
    if (!decodedText) return;

    const rawText = decodedText.trim();
    isNavigatingRef.current = true;
    setScanSuccess(rawText);
    playScanBeep();

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    // Determine target destination
    let targetPath = '/medicine/1'; // fallback

    // 1. JSON payload
    try {
      if (rawText.startsWith('{') && rawText.endsWith('}')) {
        const parsed = JSON.parse(rawText);
        if (parsed.id) {
          targetPath = `/medicine/${parsed.id}`;
        } else if (parsed.batchNo) {
          targetPath = `/medicine/${encodeURIComponent(parsed.batchNo)}`;
        }
      }
    } catch (e) {}

    // 2. Full URL containing /medicine/
    if (rawText.includes('/medicine/')) {
      const extracted = rawText.substring(rawText.indexOf('/medicine/'));
      const cleanPath = extracted.split('?')[0].split('#')[0].replace(/\/+$/, '');
      targetPath = cleanPath || '/medicine/1';
    } 
    // 3. Pure Numeric ID (e.g. 4)
    else if (/^\d+$/.test(rawText)) {
      targetPath = `/medicine/${rawText}`;
    } 
    // 4. Batch Number or Brand Name search
    else {
      const allMeds = (medicines && medicines.length > 0) ? medicines : getInitialMedicines();
      const cleanRaw = rawText.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      const matched = allMeds.find(m => {
        const mBatch = String(m.batchNo || '').trim().toLowerCase();
        const mBatchClean = mBatch.replace(/[^a-zA-Z0-9]/g, '');
        const mBrand = String(m.brandName || '').toLowerCase();
        const mGen = String(m.genericName || '').toLowerCase();

        return (
          mBatch === rawText.toLowerCase() ||
          mBatchClean === cleanRaw ||
          cleanRaw.includes(mBatchClean) ||
          mBrand.includes(rawText.toLowerCase()) ||
          rawText.toLowerCase().includes(mBrand) ||
          mGen.includes(rawText.toLowerCase())
        );
      });

      if (matched) {
        targetPath = `/medicine/${matched.id}`;
      } else {
        targetPath = `/medicine/${encodeURIComponent(rawText)}`;
      }
    }

    // Safely stop and clear camera BEFORE navigating to prevent React DOM detached errors
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      }
    } catch (cleanupErr) {
      console.warn("Camera cleanup warning:", cleanupErr);
    }

    // Smooth navigation to destination
    navigate(targetPath);
  };

  // Start Camera
  const startCamera = async (cameraIdToUse = null) => {
    setPermissionError(null);
    setScanError(null);

    const readerElement = document.getElementById('qr-reader-canvas');
    if (!readerElement) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-canvas');
      }

      const qrCode = html5QrCodeRef.current;
      if (qrCode.isScanning) {
        await qrCode.stop();
      }

      // Discover cameras
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices || []);

      let cameraConfig = { facingMode: "environment" };
      if (cameraIdToUse) {
        cameraConfig = cameraIdToUse;
        setActiveCameraId(cameraIdToUse);
      } else if (devices && devices.length > 0) {
        // Prefer back camera if found
        const backCam = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') || 
          d.label.toLowerCase().includes('environment')
        );
        const selectedId = backCam ? backCam.id : devices[0].id;
        cameraConfig = selectedId;
        setActiveCameraId(selectedId);
      }

      await qrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.floor(minEdge * 0.75);
            return { width: Math.max(220, qrEdge), height: Math.max(220, qrEdge) };
          },
          aspectRatio: 1.0,
          formatsToSupport: [0] // QR_CODE
        },
        (decodedText) => {
          processDecodedText(decodedText);
        },
        () => {
          // Continuous frame error, ignore
        }
      );

      setIsScanning(true);

      // Check torch capability
      try {
        const capabilities = qrCode.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch (e) {}

    } catch (err) {
      console.warn("Camera start error:", err);
      setIsScanning(false);
      if (err.name === 'NotAllowedError' || String(err).includes('Permission denied')) {
        setPermissionError("Camera permission was denied. Please allow camera permissions in your browser address bar.");
      } else {
        setPermissionError("Could not access camera. Please make sure no other app is using your camera, or use the Image Upload button below.");
      }
    }
  };

  // Toggle Camera (front/back)
  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    if (nextCamera) {
      startCamera(nextCamera.id);
    }
  };

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }]
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.warn("Could not toggle torch", e);
    }
  };

  // Handle Image File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileScanning(true);
    setScanError(null);

    let fileScanner = null;
    try {
      fileScanner = new Html5Qrcode('qr-file-processor');
      const decodedText = await fileScanner.scanFile(file, true);
      processDecodedText(decodedText);
    } catch (err) {
      setScanError("Could not detect a QR code in this image. Please upload a clear, well-lit photo of the medicine QR label, or enter the Batch No/ID manually.");
    } finally {
      setFileScanning(false);
      if (fileScanner) {
        fileScanner.clear().catch(() => {});
      }
    }
  };

  // Handle Paste (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileUpload(fakeEvent);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [medicines]);

  // Initial Camera Start
  useEffect(() => {
    isNavigatingRef.current = false;
    startCamera();

    return () => {
      isNavigatingRef.current = true;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      processDecodedText(manualId.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200">
          
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-gradient-to-tr from-[#0B4F9C] to-[#1E9E8F] text-white rounded-2xl shadow-md mb-3">
              <QrCode size={30} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Smart Medicine QR Scanner
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Point your camera at any packaging QR code or upload an image to view instant dosage, side effects & audio
            </p>
          </div>

          {/* CAMERA VIEWFINDER CONTAINER */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-2 border-slate-800 aspect-square max-w-sm mx-auto mb-6 flex items-center justify-center">
            
            {/* The Live Video Element */}
            <div id="qr-reader-canvas" className="w-full h-full object-cover"></div>

            {/* Glowing Viewfinder Target Box Overlay */}
            {isScanning && !scanSuccess && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-64 h-64 relative border-2 border-dashed border-emerald-400/60 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  {/* Four Corner Brackets */}
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl"></span>
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl"></span>
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl"></span>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl"></span>

                  {/* Animated Laser Scanning Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse"></div>

                  <span className="absolute -bottom-7 text-[10px] text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs font-semibold">
                    Center QR Code Inside Box
                  </span>
                </div>
              </div>
            )}

            {/* Success Scan Flash */}
            {scanSuccess && (
              <div className="absolute inset-0 bg-emerald-500/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-xs animate-in fade-in duration-200">
                <CheckCircle2 size={54} className="mb-2 animate-bounce" />
                <span className="font-extrabold text-base">QR Code Detected!</span>
                <span className="text-xs text-emerald-100 font-mono mt-1 px-4 truncate max-w-xs">{scanSuccess}</span>
              </div>
            )}

            {/* Camera Controls Overlay Bar (Switch Camera / Flash) */}
            {isScanning && (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {hasTorch && (
                  <button
                    type="button"
                    onClick={handleToggleTorch}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                      torchOn ? 'bg-amber-400 text-slate-950' : 'bg-black/50 text-white hover:bg-black/70'
                    }`}
                    title="Toggle Flashlight"
                  >
                    <Flashlight size={16} />
                  </button>
                )}
                {cameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                    title="Switch Camera (Front / Back)"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Permission / Hardware Error Notice Inside Viewfinder */}
            {permissionError && (
              <div className="absolute inset-0 p-6 bg-slate-900/95 flex flex-col items-center justify-center text-center text-white z-10">
                <AlertCircle size={40} className="text-amber-400 mb-3" />
                <h3 className="font-bold text-sm mb-1">Camera Inactive</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4 max-w-xs">
                  {permissionError}
                </p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="bg-[#1E9E8F] hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden element for file processing */}
          <div id="qr-file-processor" style={{ display: 'none' }}></div>

          {/* Upload QR Image / Screenshot Button */}
          <div className="mb-6 flex flex-col gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={fileScanning}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-[#1E9E8F] text-[#1E9E8F] hover:bg-[#1E9E8F]/5 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              <Upload size={18} />
              <span>{fileScanning ? "Analyzing High-DPI Matrix..." : "Upload QR Image / Photo (or Paste Ctrl+V)"}</span>
            </button>
          </div>

          {scanError && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-800 rounded-2xl flex items-start gap-3 text-xs border border-rose-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Scan Notice</p>
                <p>{scanError}</p>
              </div>
            </div>
          )}

          {/* Manual Batch No / ID Fallback Entry */}
          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              Manual ID or Batch Search
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Enter Medicine ID (e.g. 1) or Batch No (e.g. OM67245)"
                className="flex-grow p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B4F9C] text-xs sm:text-sm font-medium"
              />
              <button
                type="submit"
                className="bg-[#0B4F9C] hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer"
              >
                <Search size={16} />
                <span>Open</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Specimens (Across All Dosage Forms) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Sparkles size={14} className="text-[#1E9E8F]" />
                <span>Demo Specimens (Instant Test Simulator)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{medicines.length} Available</span>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-3">
              Click any specimen below to simulate a successful scan:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {medicines.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => navigate(`/medicine/${med.id}`)}
                  className="p-2.5 bg-white hover:bg-[#1E9E8F]/10 hover:border-[#1E9E8F] border border-slate-200 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                      {med.dosageForm}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{med.id}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#0B4F9C] truncate">
                    {med.brandName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {med.strength} • <span className="font-mono">{med.batchNo}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scanner;
