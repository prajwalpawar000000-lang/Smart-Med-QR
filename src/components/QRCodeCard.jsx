import React, { useState, useEffect } from 'react';
import { Download, Loader2, Printer, CheckCircle, Sparkles } from 'lucide-react';
import { generateQRDataURL, generateQRSVG, downloadQR } from '../utils/qrGenerator';

const QRCodeCard = ({ url, medicineName, strength, batchNo, onDownload }) => {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [sizeMode, setSizeMode] = useState('large'); // 'compact', 'large', 'xl'

  useEffect(() => {
    let isMounted = true;
    
    const generate = async () => {
      if (!url) return;
      
      setIsGenerating(true);
      try {
        const dataUrl = await generateQRDataURL(url, {
          width: sizeMode === 'xl' ? 800 : sizeMode === 'large' ? 600 : 400,
          margin: 2,
          errorCorrectionLevel: 'Q',
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error("Failed to generate QR code", error);
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [url, sizeMode]);

  const handleDownloadPNG = () => {
    if (onDownload) {
      onDownload('png');
    } else {
      downloadQR(qrDataUrl, `${medicineName || 'medicine'}_QR_HD`, 'png');
    }
  };

  const handleDownloadSVG = async () => {
    if (onDownload) {
      onDownload('svg');
    } else {
      try {
        const svgString = await generateQRSVG(url, {
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${medicineName || 'medicine'}_QR_Vector.svg`;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (e) {
        console.error("Failed to download SVG:", e);
      }
    }
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Smart MED QR - ${medicineName} Label</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
            .label-box { border: 2px solid #000; border-radius: 12px; padding: 20px; text-align: center; max-width: 320px; }
            .qr-img { width: 220px; height: 220px; margin: 0 auto 10px; display: block; }
            h2 { margin: 6px 0 2px; font-size: 20px; color: #0B4F9C; }
            p { margin: 3px 0; font-size: 13px; color: #333; }
            .badge { display: inline-block; background: #1E9E8F; color: #fff; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <img src="${qrDataUrl}" class="qr-img" />
            <h2>${medicineName || 'Medicine'}</h2>
            <p><strong>${strength || ''}</strong></p>
            ${batchNo ? `<p>Batch: ${batchNo}</p>` : ''}
            <div class="badge">SCAN FOR AUTHENTIC INFO</div>
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
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center max-w-md mx-auto border-2 border-slate-200 hover:border-[#1E9E8F] transition-all">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-slate-100">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle size={13} /> HD Laser Clarity
        </span>
        
        {/* Size selector buttons */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs print:hidden">
          <button
            type="button"
            onClick={() => setSizeMode('compact')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${sizeMode === 'compact' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Compact
          </button>
          <button
            type="button"
            onClick={() => setSizeMode('large')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${sizeMode === 'large' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Large
          </button>
          <button
            type="button"
            onClick={() => setSizeMode('xl')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${sizeMode === 'xl' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            Extra HD
          </button>
        </div>
      </div>

      {/* High-Resolution QR Display Container */}
      <div className="w-full flex justify-center items-center aspect-square mb-5 bg-white rounded-2xl border-2 border-slate-800 p-4 shadow-inner">
        {isGenerating ? (
          <div className="flex flex-col items-center text-[#1E9E8F] py-12">
            <Loader2 className="animate-spin mb-2" size={36} />
            <span className="text-sm font-medium">Rendering High-DPI Matrix...</span>
          </div>
        ) : qrDataUrl ? (
          <img 
            src={qrDataUrl} 
            alt={`High Resolution QR Code for ${medicineName}`} 
            className="w-full h-full object-contain image-rendering-crisp"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="text-slate-400 text-sm py-12">Failed to render QR code</div>
        )}
      </div>

      {/* Medicine Info Caption */}
      <div className="text-center w-full mb-5">
        <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">
          Scan with Google Camera / Lens
        </p>
        <h3 className="text-2xl font-black text-[#0B4F9C] truncate px-2" title={medicineName}>
          {medicineName || 'Medicine'}
        </h3>
        {strength && (
          <p className="text-[#1E9E8F] font-bold text-base mt-0.5">
            {strength}
          </p>
        )}
        {batchNo && (
          <p className="text-xs text-slate-600 font-mono mt-1.5 bg-slate-100 inline-block px-3 py-1 rounded-md">
            Batch: <strong>{batchNo}</strong>
          </p>
        )}
      </div>

      {/* Download & Print Action Buttons */}
      <div className="grid grid-cols-3 gap-2 w-full mt-auto print:hidden">
        <button
          onClick={handleDownloadPNG}
          disabled={!qrDataUrl || isGenerating}
          className="flex items-center justify-center gap-1.5 bg-[#0B4F9C] hover:bg-blue-800 text-white py-2.5 px-3 rounded-xl font-semibold transition-all disabled:opacity-50 text-xs shadow-sm"
          title="Download high-resolution PNG image"
        >
          <Download size={15} />
          <span>HD PNG</span>
        </button>
        <button
          onClick={handleDownloadSVG}
          disabled={!qrDataUrl || isGenerating}
          className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0B4F9C] border-2 border-[#0B4F9C] py-2.5 px-3 rounded-xl font-semibold transition-all disabled:opacity-50 text-xs"
          title="Download scalable SVG vector (Infinitely sharp for laser printers)"
        >
          <Download size={15} />
          <span>SVG Vector</span>
        </button>
        <button
          onClick={handlePrintLabel}
          disabled={!qrDataUrl || isGenerating}
          className="flex items-center justify-center gap-1.5 bg-[#1E9E8F] hover:bg-teal-700 text-white py-2.5 px-3 rounded-xl font-semibold transition-all disabled:opacity-50 text-xs shadow-sm"
          title="Print instant sticker label"
        >
          <Printer size={15} />
          <span>Print Label</span>
        </button>
      </div>
    </div>
  );
};

export default QRCodeCard;
