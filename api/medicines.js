import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
  const match = url.match(/\/api\/medicines\/([^\/\?]+)/);
  const idStr = match ? match[1] : req.query?.id;

  if (idStr) {
    const cleanId = decodeURIComponent(String(idStr)).trim().toLowerCase();
    const found = medicines.find(m => 
      String(m.id) === cleanId || 
      String(m.batchNo || '').trim().toLowerCase() === cleanId ||
      String(m.brandName || '').toLowerCase() === cleanId
    );

    if (found) {
      return res.status(200).json(found);
    }
    return res.status(404).json({ error: 'Medicine not found' });
  }

  return res.status(200).json(medicines);
}
