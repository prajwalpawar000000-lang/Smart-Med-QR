import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'medicines.json');
const MOCK_FILE = path.join(process.cwd(), 'src', 'data', 'mockMedicines.json');

const raw = fs.readFileSync(DATA_FILE, 'utf8');
const data = JSON.parse(raw);
const medicines = data.medicines;

for (const med of medicines) {
  // If primary expDate is in 2026 or earlier, make it future valid (2027 or 2028)
  if (med.expDate.includes('2026') || med.expDate.includes('2025') || med.expDate.includes('2024')) {
    med.mfgDate = '01/2025';
    med.expDate = '12/2027';
  }

  // Ensure batches array exists
  if (!Array.isArray(med.batches)) {
    med.batches = [];
  }

  // Update primary batch in batches array
  const primaryIdx = med.batches.findIndex(b => b.batchNo === med.batchNo);
  if (primaryIdx !== -1) {
    med.batches[primaryIdx].mfgDate = med.mfgDate;
    med.batches[primaryIdx].expDate = med.expDate;
    med.batches[primaryIdx].status = 'Active';
  } else {
    med.batches.unshift({
      batchNo: med.batchNo,
      mfgDate: med.mfgDate,
      expDate: med.expDate,
      mfgLicenceNo: med.mfgLicenceNo || 'LIC/2025/MED',
      status: 'Active',
      createdAt: '2025-01-01'
    });
  }

  // Ensure dedicated Near-Expiry batch exists for test scenario 4
  const prefix = med.batchNo.slice(0, 2).toUpperCase();
  const nearBatchNo = `${prefix}-NEAR01`;
  const nearIdx = med.batches.findIndex(b => b.batchNo === nearBatchNo);
  if (nearIdx !== -1) {
    med.batches[nearIdx].expDate = '2026-12-15'; // ~39 days from Nov 6, 2026
    med.batches[nearIdx].status = 'Active';
  } else {
    med.batches.push({
      batchNo: nearBatchNo,
      mfgDate: '2024-01-01',
      expDate: '2026-12-15',
      mfgLicenceNo: med.mfgLicenceNo || 'LIC/2025/MED',
      status: 'Active',
      createdAt: '2024-01-01'
    });
  }

  // Ensure dedicated Expired batch exists for test scenario 3
  const expBatchNo = `${prefix}-EXP99`;
  const expIdx = med.batches.findIndex(b => b.batchNo === expBatchNo);
  if (expIdx !== -1) {
    med.batches[expIdx].expDate = '2023-12-31';
    med.batches[expIdx].status = 'Expired';
  } else {
    med.batches.push({
      batchNo: expBatchNo,
      mfgDate: '2022-01-15',
      expDate: '2023-12-31',
      mfgLicenceNo: med.mfgLicenceNo || 'LIC/2025/MED',
      status: 'Expired',
      createdAt: '2022-01-15'
    });
  }
}

const payload = {
  disclaimer: "MedQR Verified Medicine Database",
  lastUpdated: new Date().toISOString(),
  medicines
};

fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
fs.writeFileSync(MOCK_FILE, JSON.stringify(payload, null, 2), 'utf8');

console.log('Successfully updated medicine shelf life dates and synced mockMedicines.json!');
