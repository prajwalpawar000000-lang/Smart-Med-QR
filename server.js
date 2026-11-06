import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'medicines.json');
const MOCK_FILE = path.join(__dirname, 'src', 'data', 'mockMedicines.json');
const PORT = process.env.PORT || 5173;
const HOST = '0.0.0.0';

// Ensure data directory exists and initialize medicines.json from mock data if needed
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(MOCK_FILE)) {
      const initial = fs.readFileSync(MOCK_FILE, 'utf-8');
      fs.writeFileSync(DATA_FILE, initial, 'utf-8');
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ disclaimer: "MedQR Database", medicines: [] }, null, 2), 'utf-8');
    }
  }
}

ensureDataFile();

function getMedicinesData() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed.medicines || []);
  } catch (err) {
    console.error('Error reading medicines data:', err);
    return [];
  }
}

function saveMedicinesData(medicinesList) {
  try {
    ensureDataFile();
    const payload = {
      disclaimer: "MedQR Live Database • Smart Medicine Assistant",
      medicines: medicinesList
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    
    // Also sync to src/data/mockMedicines.json for future Vite builds
    try {
      if (fs.existsSync(path.dirname(MOCK_FILE))) {
        fs.writeFileSync(MOCK_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      }
    } catch (syncErr) {
      console.warn('Could not sync to src/data/mockMedicines.json:', syncErr);
    }
    return true;
  } catch (err) {
    console.error('Error saving medicines data:', err);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function normalizeBatch(str) {
  return String(str || '').replace(/[\s\-_]/g, '').trim().toUpperCase();
}

function parseFlexibleDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  if (/^\d{4}-\d{1,2}(-\d{1,2})?$/.test(clean)) {
    const parts = clean.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2] || 1);
  }
  if (/^\d{1,2}\/\d{4}$/.test(clean)) {
    const [month, year] = clean.split('/').map(Number);
    return new Date(year, month, 0, 23, 59, 59);
  }
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
  const diffTime = parsed.getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: 'expired', daysOverdue: Math.abs(diffDays), formattedExpDate: expDateStr };
  if (diffDays <= 60) return { status: 'expiring', daysRemaining: diffDays, formattedExpDate: expDateStr };
  return { status: 'safe', daysRemaining: diffDays, formattedExpDate: expDateStr };
}

function runVerification(rawBatch, optionalMedicineName, medicinesList) {
  const timestamp = new Date().toISOString();
  const refCode = `VRF-${Date.now().toString(36).toUpperCase()}`;

  if (!rawBatch || typeof rawBatch !== 'string' || rawBatch.trim().length < 2) {
    return {
      status: 'INVALID',
      statusCode: 'E',
      verified: false,
      title: 'Invalid Information',
      message: 'Please enter a valid medicine batch number to begin verification.',
      verificationTimestamp: timestamp,
      verificationRef: refCode
    };
  }

  const cleanBatch = normalizeBatch(rawBatch);
  let matchedMedicine = null;
  let matchedBatch = null;

  for (const med of medicinesList) {
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

  if (!matchedMedicine || !matchedBatch) {
    return {
      status: 'NOT_FOUND',
      statusCode: 'B',
      verified: false,
      title: 'Batch Not Found',
      message: 'Batch number not found in the registered MedQR database. Please verify the details with the manufacturer or pharmacist.',
      enteredBatch: rawBatch.trim().toUpperCase(),
      verificationTimestamp: timestamp,
      verificationRef: refCode
    };
  }

  if (optionalMedicineName && optionalMedicineName.trim()) {
    const query = optionalMedicineName.trim().toLowerCase();
    const brand = String(matchedMedicine.brandName || '').toLowerCase();
    const generic = String(matchedMedicine.genericName || '').toLowerCase();
    const matches = brand.includes(query) || query.includes(brand) || generic.includes(query) || query.includes(generic);

    if (!matches) {
      return {
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
      };
    }
  }

  const expEvaluation = evaluateExpiry(matchedBatch.expDate);
  if (expEvaluation.status === 'expired') {
    return {
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
    };
  }

  if (expEvaluation.status === 'expiring') {
    return {
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
    };
  }

  return {
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
  };
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, *');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================
  
  // 1. GET /api/medicines
  if (req.method === 'GET' && (pathname === '/api/medicines' || pathname === '/api/medicines/')) {
    const list = getMedicinesData();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(list));
    return;
  }

  // 2. GET /api/medicines/:id
  if (req.method === 'GET' && pathname.startsWith('/api/medicines/')) {
    const idStr = pathname.replace('/api/medicines/', '').trim();
    const id = Number(idStr);
    const list = getMedicinesData();
    const found = list.find(m => m.id === id || String(m.id) === idStr || String(m.batchNo).toLowerCase() === idStr.toLowerCase());

    if (found) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(found));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Medicine not found' }));
    }
    return;
  }

  // 3. POST /api/medicines (Add new medicine)
  if (req.method === 'POST' && (pathname === '/api/medicines' || pathname === '/api/medicines/')) {
    try {
      const data = await readRequestBody(req);
      const list = getMedicinesData();
      
      const maxId = list.length > 0 ? Math.max(...list.map(m => Number(m.id) || 0)) : 0;
      const newId = maxId + 1;

      // Ensure full record fields
      const newMedicine = {
        id: newId,
        srNo: newId,
        genericName: data.genericName || 'Medicine',
        brandName: data.brandName || 'Medicine',
        strength: data.strength || '',
        dosageForm: data.dosageForm || 'Tablet',
        route: data.route || 'Oral',
        useIndication: data.useIndication || 'Medical indication',
        dose: data.dose || 'As directed by physician',
        directionForUse: data.directionForUse || 'With water after meals',
        manufacturer: data.manufacturer || 'Pharmaceutical Manufacturer',
        batchNo: data.batchNo || `MED${Math.floor(10000 + Math.random() * 90000)}`,
        mfgDate: data.mfgDate || '01/2025',
        expDate: data.expDate || '01/2027',
        mfgLicenceNo: data.mfgLicenceNo || 'LIC/2025/MED',
        pageLink: `/medicine/${newId}`,
        translations: data.translations || {
          mr: {
            genericName: data.translations?.mr?.genericName || data.genericName,
            useIndication: data.translations?.mr?.useIndication || `${data.genericName} चा वापर डॉक्टरांच्या सल्ल्याने करावा.`,
            dose: data.translations?.mr?.dose || data.dose,
            directionForUse: data.translations?.mr?.directionForUse || data.directionForUse,
            sideEffects: data.translations?.mr?.sideEffects || 'सौम्य मळमळ किंवा पोटदुखी जाणवू शकते.'
          },
          hi: {
            genericName: data.translations?.hi?.genericName || data.genericName,
            useIndication: data.translations?.hi?.useIndication || data.useIndication,
            dose: data.translations?.hi?.dose || data.dose,
            directionForUse: data.translations?.hi?.directionForUse || data.directionForUse,
            sideEffects: data.translations?.hi?.sideEffects || 'हल्की मिचली या पेट दर्द हो सकता है।'
          }
        },
        sideEffects: data.sideEffects || {
          common: data.sideEffects?.common || ['Mild nausea', 'Stomach discomfort', 'Dizziness'],
          rare: data.sideEffects?.rare || ['Mild allergic itching'],
          adverseReactions: data.sideEffects?.adverseReactions || ['Consult physician if severe symptoms or allergic reactions occur.'],
          warnings: data.sideEffects?.warnings || ['Keep out of reach of children.', 'Take only as prescribed.'],
          contraindications: data.sideEffects?.contraindications || 'Hypersensitivity to active ingredients.',
          emergencyWarning: data.sideEffects?.emergencyWarning || 'Contact nearest emergency medical centre immediately in case of severe allergic reaction or overdose.'
        }
      };

      list.push(newMedicine);
      saveMedicinesData(list);

      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(newMedicine));
    } catch (e) {
      console.error('Error adding medicine:', e);
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message || 'Invalid medicine data' }));
    }
    return;
  }

  // 4. PUT /api/medicines/:id (Update existing medicine)
  if (req.method === 'PUT' && pathname.startsWith('/api/medicines/')) {
    try {
      const idStr = pathname.replace('/api/medicines/', '').trim();
      const id = Number(idStr);
      const data = await readRequestBody(req);
      const list = getMedicinesData();
      const index = list.findIndex(m => m.id === id);

      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Medicine not found' }));
        return;
      }

      const updated = {
        ...list[index],
        ...data,
        id: id,
        srNo: id,
        pageLink: `/medicine/${id}`
      };

      list[index] = updated;
      saveMedicinesData(list);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(updated));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message || 'Invalid medicine update' }));
    }
    return;
  }

  // 5. DELETE /api/medicines/:id
  if (req.method === 'DELETE' && pathname.startsWith('/api/medicines/')) {
    const idStr = pathname.replace('/api/medicines/', '').trim();
    const id = Number(idStr);
    let list = getMedicinesData();
    const beforeCount = list.length;
    list = list.filter(m => m.id !== id);

    if (list.length === beforeCount) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Medicine not found' }));
      return;
    }

    saveMedicinesData(list);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // 6. GET & POST /api/verify
  if (pathname === '/api/verify' || pathname.startsWith('/api/verify/')) {
    const list = getMedicinesData();
    let targetBatch = '';
    let optionalMedicine = '';

    if (req.method === 'POST') {
      try {
        const body = await readRequestBody(req);
        targetBatch = body.batchNo || '';
        optionalMedicine = body.medicineName || '';
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        return;
      }
    } else if (req.method === 'GET') {
      if (pathname.startsWith('/api/verify/')) {
        targetBatch = decodeURIComponent(pathname.replace('/api/verify/', '')).trim();
      } else {
        targetBatch = parsedUrl.searchParams.get('batchNo') || '';
      }
      optionalMedicine = parsedUrl.searchParams.get('medicineName') || '';
    }

    const verificationResult = runVerification(targetBatch, optionalMedicine, list);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(verificationResult));
    return;
  }

  // 7. GET & POST /api/batches
  if (pathname === '/api/batches' || pathname === '/api/batches/') {
    const list = getMedicinesData();

    if (req.method === 'GET') {
      const allBatches = [];
      for (const med of list) {
        if (med.batchNo) {
          allBatches.push({
            batchNo: med.batchNo,
            medicineId: med.id,
            brandName: med.brandName,
            genericName: med.genericName,
            mfgDate: med.mfgDate,
            expDate: med.expDate,
            mfgLicenceNo: med.mfgLicenceNo,
            status: 'Active',
            isPrimary: true
          });
        }
        if (Array.isArray(med.batches)) {
          for (const b of med.batches) {
            if (normalizeBatch(b.batchNo) !== normalizeBatch(med.batchNo)) {
              allBatches.push({
                ...b,
                medicineId: med.id,
                brandName: med.brandName,
                genericName: med.genericName,
                isPrimary: false
              });
            }
          }
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(allBatches));
      return;
    }

    if (req.method === 'POST') {
      try {
        const body = await readRequestBody(req);
        const { medicineId, batchNo, mfgDate, expDate, mfgLicenceNo, status } = body;

        if (!medicineId || !batchNo || !expDate) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Medicine ID, Batch Number, and Expiry Date are required' }));
          return;
        }

        const cleanNewBatch = normalizeBatch(batchNo);
        if (cleanNewBatch.length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Batch number must be at least 2 characters long' }));
          return;
        }

        const medIndex = list.findIndex(m => m.id === Number(medicineId));
        if (medIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Medicine not found' }));
          return;
        }

        // Duplicate Check across ALL medicines and batches
        for (const m of list) {
          if (normalizeBatch(m.batchNo) === cleanNewBatch) {
            res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              error: `Duplicate batch rejected: Batch "${batchNo}" is already registered under "${m.brandName}" (ID: ${m.id}).`
            }));
            return;
          }
          if (Array.isArray(m.batches)) {
            const dup = m.batches.find(b => normalizeBatch(b.batchNo) === cleanNewBatch);
            if (dup) {
              res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({
                error: `Duplicate batch rejected: Batch "${batchNo}" is already registered under "${m.brandName}" (ID: ${m.id}).`
              }));
              return;
            }
          }
        }

        const targetMed = list[medIndex];
        const batches = Array.isArray(targetMed.batches) ? [...targetMed.batches] : [];

        const newBatchRecord = {
          batchNo: batchNo.trim().toUpperCase(),
          mfgDate: mfgDate || '01/2025',
          expDate: expDate.trim(),
          mfgLicenceNo: mfgLicenceNo || targetMed.mfgLicenceNo || 'LIC/2025/MED',
          status: status || 'Active',
          createdAt: new Date().toISOString()
        };

        batches.push(newBatchRecord);
        const updatedMed = { ...targetMed, batches };
        list[medIndex] = updatedMed;

        saveMedicinesData(list);

        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message: `Batch "${batchNo}" successfully registered to ${targetMed.brandName}`,
          batch: newBatchRecord,
          medicine: updatedMed
        }));
        return;
      } catch (err) {
        console.error('Error processing batch registration:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Internal server error while saving batch' }));
        return;
      }
    }
  }

  // ==========================================
  // STATIC FILE SERVING & SPA FALLBACK
  // ==========================================
  
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);

  // Security check to stay within dist directory
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Never fallback to index.html for missing /assets/ or /api/ requests
  if ((pathname.startsWith('/assets/') || pathname.startsWith('/api/')) && !fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' });
    res.end('Asset not found');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      const headers = { 'Content-Type': contentType };
      if (pathname === '/' || pathname === '/index.html' || pathname === '/sw.js' || pathname.endsWith('.webmanifest')) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      } else if (pathname.startsWith('/assets/')) {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback to index.html for React Router routes
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          res.end(content);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 MedQR Full-Stack Production & API Server running!`);
  console.log(`👉 Local:   http://localhost:${PORT}/`);
  console.log(`👉 Local IP: http://127.0.0.1:${PORT}/`);
  console.log(`👉 API:     http://127.0.0.1:${PORT}/api/medicines`);
  console.log(`👉 Network:  http://10.243.169.46:${PORT}/`);
  console.log(`====================================================`);
});
