import fs from 'fs';
import path from 'path';

function normalizeBatch(str) {
  return String(str || '').replace(/[\s\-_]/g, '').trim().toUpperCase();
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

  // GET /api/batches - List all registered batches
  if (req.method === 'GET') {
    const allBatches = [];
    for (const med of medicines) {
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
    return res.status(200).json(allBatches);
  }

  // POST /api/batches - Register new batch
  if (req.method === 'POST') {
    const body = req.body || {};
    const { medicineId, batchNo, mfgDate, expDate, mfgLicenceNo, status } = body;

    if (!medicineId || !batchNo || !expDate) {
      return res.status(400).json({ error: 'Medicine ID, Batch Number, and Expiry Date are required' });
    }

    const cleanNewBatch = normalizeBatch(batchNo);
    if (cleanNewBatch.length < 2) {
      return res.status(400).json({ error: 'Batch number must be at least 2 characters long' });
    }

    const medIndex = medicines.findIndex(m => m.id === Number(medicineId));
    if (medIndex === -1) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    // Duplicate Check across ALL medicines and batches
    for (const m of medicines) {
      if (normalizeBatch(m.batchNo) === cleanNewBatch) {
        return res.status(409).json({
          error: `Duplicate batch rejected: Batch "${batchNo}" is already registered under "${m.brandName}" (ID: ${m.id}).`
        });
      }
      if (Array.isArray(m.batches)) {
        const dup = m.batches.find(b => normalizeBatch(b.batchNo) === cleanNewBatch);
        if (dup) {
          return res.status(409).json({
            error: `Duplicate batch rejected: Batch "${batchNo}" is already registered under "${m.brandName}" (ID: ${m.id}).`
          });
        }
      }
    }

    const targetMed = medicines[medIndex];
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
    const updatedMed = {
      ...targetMed,
      batches
    };

    medicines[medIndex] = updatedMed;

    try {
      const payload = {
        disclaimer: "MedQR Verified Medicine Database",
        medicines
      };
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (saveErr) {
      console.error('Error saving new batch to medicines.json:', saveErr);
      return res.status(500).json({ error: 'Failed to persist batch to database' });
    }

    return res.status(201).json({
      success: true,
      message: `Batch "${batchNo}" successfully registered to ${targetMed.brandName}`,
      batch: newBatchRecord,
      medicine: updatedMed
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
