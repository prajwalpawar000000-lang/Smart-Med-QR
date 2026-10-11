import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

  const url = req.url || '';
  const match = url.match(/\/api\/verify\/([^\/\?]+)/);
  const rawBatch = match ? match[1] : req.query?.batchNo;
  const cleanBatch = String(rawBatch || '').replace(/[\s\-_]/g, '').toUpperCase();

  const found = medicines.find(m => 
    String(m.batchNo || '').replace(/[\s\-_]/g, '').toUpperCase() === cleanBatch
  );

  return res.status(200).json({
    verified: !!found,
    medicine: found || null
  });
}
