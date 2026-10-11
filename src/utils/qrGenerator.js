import QRCode from 'qrcode';

const DEFAULT_OPTIONS = {
  width: 600,
  margin: 2, // Standard quiet zone needed for instant phone camera & lens detection
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'Q' // 25% fault tolerance for fast phone camera detection
};

export async function generateQRDataURL(url, options = {}) {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const dataUrl = await QRCode.toDataURL(url, opts);
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Data URL', err);
    throw err;
  }
}

export async function generateQRSVG(url, options = {}) {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const svg = await QRCode.toString(url, { ...opts, type: 'svg' });
    return svg;
  } catch (err) {
    console.error('Error generating QR SVG', err);
    throw err;
  }
}

export function downloadQR(dataUrl, filename, format = 'png') {
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
