import fs from 'fs';
import path from 'path';

function normalizeBatch(str) {
  return String(str || '').replace(/[\s\-_]/g, '').trim().toUpperCase();
}

function parseFlexibleDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();

  // YYYY-MM-DD or YYYY-MM
  if (/^\d{4}-\d{1,2}(-\d{1,2})?$/.test(clean)) {
    const parts = clean.split('-').map(Number);
    const year = parts[0];
    const month = parts[1] - 1;
    const day = parts[2] || 1;
    return new Date(year, month, day);
  }

  // MM/YYYY or M/YYYY
  if (/^\d{1,2}\/\d{4}$/.test(clean)) {
    const [month, year] = clean.split('/').map(Number);
    return new Date(year, month, 0, 23, 59, 59); // end of that month
  }

  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    const [day, month, year] = clean.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function evaluateExpiry(expDateStr) {
  const parsed = parseFlexibleDate(expDateStr);
  if (!parsed) return { status: 'safe', daysRemaining: 365, formattedExpDate: expDateStr };

  const now = new Date();
  const diffTime = parsed.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      daysOverdue: Math.abs(diffDays),
      formattedExpDate: expDateStr
    };
  }
  if (diffDays <= 60) {
    return {
      status: 'expiring',
      daysRemaining: diffDays,
      formattedExpDate: expDateStr
    };
  }
  return {
    status: 'safe',
    daysRemaining: diffDays,
    formattedExpDate: expDateStr
  };
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'data', 'medicines.json');
  let medicines = [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    medicines = Array.isArray(parsed) ? parsed : (parsed.medicines || []);
  } catch (err) {
    console.warn('Error reading data/medicines.json:', err);
  }

  let rawBatch = '';
  let optionalMedicineName = '';

  if (req.method === 'POST') {
    const body = req.body || {};
    rawBatch = body.batchNo || '';
    optionalMedicineName = body.medicineName || '';
  } else {
    const url = req.url || '';
    const match = url.match(/\/api\/verify\/([^\/\?]+)/);
    rawBatch = match ? match[1] : req.query?.batchNo;
    optionalMedicineName = req.query?.medicineName || '';
  }

  const timestamp = new Date().toISOString();
  const refCode = `VRF-${Date.now().toString(36).toUpperCase()}`;

  // Status E: Invalid input
  if (!rawBatch || typeof rawBatch !== 'string' || rawBatch.trim().length < 2) {
    return res.status(200).json({
      status: 'INVALID',
      statusCode: 'E',
      verified: false,
      title: 'Invalid Information',
      message: 'Please enter a valid medicine batch number to begin verification.',
      verificationTimestamp: timestamp,
      verificationRef: refCode
    });
  }

  const cleanBatch = normalizeBatch(rawBatch);

  // Search medicines and batches
  let matchedMedicine = null;
  let matchedBatch = null;

  for (const med of medicines) {
    if (normalizeBatch(med.batchNo) === cleanBatch) {
      matchedMedicine = med;
      matchedBatch = {
        batchNo: med.batchNo,
        mfgDate: med.mfgDate,
        expDate: med.expDate,
        mfgLicenceNo: med.mfgLicenceNo,
        status: 'Active'
      };
      break;
    }

    if (Array.isArray(med.batches)) {
      const foundInBatches = med.batches.find(b => normalizeBatch(b.batchNo) === cleanBatch);
      if (foundInBatches) {
        matchedMedicine = med;
        matchedBatch = { ...foundInBatches };
        break;
      }
    }
  }

  // Status B: Batch Not Found
  if (!matchedMedicine || !matchedBatch) {
    return res.status(200).json({
      status: 'NOT_FOUND',
      statusCode: 'B',
      verified: false,
      title: 'Batch Not Found',
      message: 'Batch number not found in the registered MedQR database. Please verify the details with the manufacturer or pharmacist.',
      enteredBatch: rawBatch.trim().toUpperCase(),
      verificationTimestamp: timestamp,
      verificationRef: refCode
    });
  }

  // Optional Medicine Mismatch Check (Status E)
  if (optionalMedicineName && optionalMedicineName.trim()) {
    const query = optionalMedicineName.trim().toLowerCase();
    const brand = String(matchedMedicine.brandName || '').toLowerCase();
    const generic = String(matchedMedicine.genericName || '').toLowerCase();
    const matches = brand.includes(query) || query.includes(brand) || generic.includes(query) || query.includes(generic);

    if (!matches) {
      return res.status(200).json({
        status: 'MISMATCH',
        statusCode: 'E',
        verified: false,
        title: 'Medicine Mismatch Detected',
        message: `Batch "${matchedBatch.batchNo}" is registered in MedQR, but it belongs to "${matchedMedicine.brandName} (${matchedMedicine.genericName})" instead of the specified medicine "${optionalMedicineName}". Please inspect the packaging carefully.`,
        enteredBatch: matchedBatch.batchNo,
        enteredMedicine: optionalMedicineName,
        actualMedicine: {
          id: matchedMedicine.id,
          brandName: matchedMedicine.brandName,
          genericName: matchedMedicine.genericName,
          manufacturer: matchedMedicine.manufacturer
        },
        verificationTimestamp: timestamp,
        verificationRef: refCode
      });
    }
  }

  // Expiry Check (Status C, D, A)
  const expEvaluation = evaluateExpiry(matchedBatch.expDate);

  if (expEvaluation.status === 'expired') {
    return res.status(200).json({
      status: 'EXPIRED',
      statusCode: 'C',
      verified: false,
      isExpired: true,
      title: 'Expired Medicine Warning',
      message: 'WARNING: This medicine batch has passed its expiry date. Do not use it.',
      medicine: matchedMedicine,
      batch: matchedBatch,
      daysOverdue: expEvaluation.daysOverdue || 1,
      formattedExpDate: expEvaluation.formattedExpDate,
      verificationTimestamp: timestamp,
      verificationRef: refCode
    });
  }

  if (expEvaluation.status === 'expiring') {
    return res.status(200).json({
      status: 'EXPIRING_SOON',
      statusCode: 'D',
      verified: true,
      isExpiringSoon: true,
      title: 'Expiry Approaching',
      message: `Notice: This medicine batch will expire soon in ${expEvaluation.daysRemaining} days (Expiry: ${expEvaluation.formattedExpDate}). Complete the prescribed course before expiration or consult your pharmacist.`,
      medicine: matchedMedicine,
      batch: matchedBatch,
      daysRemaining: expEvaluation.daysRemaining,
      formattedExpDate: expEvaluation.formattedExpDate,
      verificationTimestamp: timestamp,
      verificationRef: refCode
    });
  }

  return res.status(200).json({
    status: 'VERIFIED',
    statusCode: 'A',
    verified: true,
    isExpiringSoon: false,
    isExpired: false,
    title: 'Verified Batch',
    message: 'Authentic & Verified Batch Record. This batch is officially registered in the MedQR trusted database and is within its valid shelf life.',
    medicine: matchedMedicine,
    batch: matchedBatch,
    daysRemaining: expEvaluation.daysRemaining,
    formattedExpDate: expEvaluation.formattedExpDate,
    verificationTimestamp: timestamp,
    verificationRef: refCode
  });
}
