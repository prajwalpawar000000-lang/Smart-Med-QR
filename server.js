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
      disclaimer: "⚠️ MedQR Live Database • Avishkar State Research Project",
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

  // 6. GET /api/verify/:batchNo
  if (req.method === 'GET' && pathname.startsWith('/api/verify/')) {
    const rawBatch = decodeURIComponent(pathname.replace('/api/verify/', '')).trim();
    const cleanBatch = rawBatch.replace(/[\s\-_]/g, '').toUpperCase();
    const list = getMedicinesData();

    const normalize = (str) => String(str || '').replace(/[\s\-_]/g, '').toUpperCase();
    const found = list.find(m => normalize(m.batchNo) === cleanBatch);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    if (found) {
      res.end(JSON.stringify({ verified: true, medicine: found }));
    } else {
      res.end(JSON.stringify({ verified: false }));
    }
    return;
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
