import mockData from '../data/mockMedicines.json';
import { verifyBatchRecord, normalizeBatch } from './verificationEngine.js';

const API_BASE = '';
const TIMEOUT_MS = 2500;
const STORAGE_KEY = 'medqr_medicines_v2';

export let isUsingMockData = false;

// Helper: LocalStorage Cache
function getLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read medicines from localStorage:', e);
  }
  return null;
}

export function getInitialMedicines() {
  const cached = getLocalCache();
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  return [...mockData.medicines];
}

function setLocalCache(medicinesList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicinesList));
  } catch (e) {
    console.warn('Could not save medicines to localStorage:', e);
  }
}

// In-memory working copy initialized from cache or mock data
let memoryMedicines = getInitialMedicines();

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, credentials: 'omit', signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchMedicines() {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/medicines`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        memoryMedicines = data;
        setLocalCache(data);
        isUsingMockData = false;
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch from API failed, using cached / memory data:', err);
  }

  // Fallback to localStorage / in-memory / mockData
  const cached = getLocalCache();
  if (cached && cached.length > 0) {
    memoryMedicines = cached;
    return cached;
  }

  isUsingMockData = true;
  return [...memoryMedicines];
}

export async function fetchMedicineById(id) {
  const numericId = Number(id);
  const strId = String(id).trim();

  // 1. Try API first
  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/medicines/${encodeURIComponent(strId)}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.id) {
        // Update local memory
        const idx = memoryMedicines.findIndex(m => m.id === data.id);
        if (idx !== -1) {
          memoryMedicines[idx] = data;
        } else {
          memoryMedicines.push(data);
        }
        setLocalCache(memoryMedicines);
        return data;
      }
    }
  } catch (err) {
    console.warn(`Fetch medicine ${id} from API failed:`, err);
  }

  // 2. Check local memory & cache
  const cached = getLocalCache() || memoryMedicines;
  const found = cached.find((m) => 
    m.id === numericId || 
    String(m.id) === strId || 
    (m.batchNo && m.batchNo.toLowerCase() === strId.toLowerCase())
  );

  if (found) return { ...found };

  // 3. Check base mockData
  const mockFound = mockData.medicines.find((m) => 
    m.id === numericId || 
    String(m.id) === strId || 
    (m.batchNo && m.batchNo.toLowerCase() === strId.toLowerCase())
  );

  if (mockFound) return { ...mockFound };

  throw new Error(`Medicine not found for ID or Batch: ${id}`);
}

export async function addMedicine(data) {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const added = await response.json();
      memoryMedicines = memoryMedicines.filter(m => m.id !== added.id);
      memoryMedicines.push(added);
      setLocalCache(memoryMedicines);
      return added;
    }
  } catch (err) {
    console.warn('API POST failed, adding to local fallback:', err);
  }

  // Local fallback addition
  const maxId = memoryMedicines.length > 0 ? Math.max(...memoryMedicines.map(m => Number(m.id) || 0)) : 0;
  const newId = maxId + 1;
  const newMedicine = {
    ...data,
    id: newId,
    srNo: newId,
    pageLink: `/medicine/${newId}`,
    translations: data.translations || {
      mr: {
        genericName: data.genericName,
        useIndication: `${data.genericName} चा वापर डॉक्टरांच्या सल्ल्याने करावा.`,
        dose: data.dose,
        directionForUse: data.directionForUse,
        sideEffects: 'कधीकधी हलकी मळमळ किंवा पोटदुखी जाणवू शकते.'
      },
      hi: {
        genericName: data.genericName,
        useIndication: data.useIndication,
        dose: data.dose,
        directionForUse: data.directionForUse,
        sideEffects: 'हल्की मिचली या पेट दर्द हो सकता है।'
      }
    },
    sideEffects: data.sideEffects || {
      common: ['Mild nausea', 'Stomach discomfort', 'Dizziness'],
      rare: ['Mild allergic skin itching'],
      adverseReactions: ['Consult doctor if persistent or severe adverse reactions occur.'],
      warnings: ['Keep out of reach of children.', 'Take only as directed.'],
      contraindications: 'Hypersensitivity to active ingredients.',
      emergencyWarning: 'Contact nearest hospital emergency room immediately in case of severe allergic reaction or overdose.'
    }
  };

  memoryMedicines.push(newMedicine);
  setLocalCache(memoryMedicines);
  return newMedicine;
}

export async function updateMedicine(id, data) {
  const numericId = Number(id);

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/medicines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const updated = await response.json();
      const idx = memoryMedicines.findIndex(m => m.id === numericId);
      if (idx !== -1) memoryMedicines[idx] = updated;
      setLocalCache(memoryMedicines);
      return updated;
    }
  } catch (err) {
    console.warn('API PUT failed, updating local fallback:', err);
  }

  const index = memoryMedicines.findIndex((m) => m.id === numericId);
  if (index === -1) throw new Error('Medicine not found');

  const updated = { ...memoryMedicines[index], ...data, id: numericId, srNo: numericId, pageLink: `/medicine/${numericId}` };
  memoryMedicines[index] = updated;
  setLocalCache(memoryMedicines);
  return updated;
}

export async function deleteMedicine(id) {
  const numericId = Number(id);

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/medicines/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      memoryMedicines = memoryMedicines.filter(m => m.id !== numericId);
      setLocalCache(memoryMedicines);
      return true;
    }
  } catch (err) {
    console.warn('API DELETE failed, removing from local fallback:', err);
  }

  memoryMedicines = memoryMedicines.filter((m) => m.id !== numericId);
  setLocalCache(memoryMedicines);
  return true;
}

export async function verifyBatch(batchNo, optionalMedicineName = '') {
  const cleanBatch = normalizeBatch(batchNo);

  // 1. Try server endpoint first
  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchNo: cleanBatch, medicineName: optionalMedicineName })
    });
    if (response.ok) {
      const serverResult = await response.json();
      if (serverResult && serverResult.statusCode) {
        logVerificationAudit(serverResult);
        return serverResult;
      }
    }
  } catch (err) {
    console.warn('Batch verification API failed, running local clinical verification engine:', err);
  }

  // 2. Client-side fallback engine using local cached/memory database
  const cached = getLocalCache() || memoryMedicines;
  const result = verifyBatchRecord(batchNo, optionalMedicineName, cached);
  logVerificationAudit(result);
  return result;
}

export async function registerBatch(medicineId, batchData) {
  const numId = Number(medicineId);

  // Try API POST /api/batches
  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineId: numId, ...batchData })
    });

    if (response.ok) {
      const resData = await response.json();
      const updatedMed = resData.medicine || resData;
      const idx = memoryMedicines.findIndex(m => m.id === numId);
      if (idx !== -1) memoryMedicines[idx] = updatedMed;
      setLocalCache(memoryMedicines);
      return updatedMed;
    } else {
      const errJson = await response.json().catch(() => ({}));
      if (errJson.error) {
        throw new Error(errJson.error);
      }
    }
  } catch (err) {
    if (err.message && err.message.includes('Duplicate batch')) {
      throw err;
    }
    console.warn('API POST /api/batches failed, falling back to local storage:', err);
  }

  // Local fallback addition
  const idx = memoryMedicines.findIndex(m => m.id === numId);
  if (idx === -1) throw new Error('Medicine not found in database');

  const med = memoryMedicines[idx];
  const cleanNew = normalizeBatch(batchData.batchNo);

  // Check duplicate across memoryMedicines
  for (const m of memoryMedicines) {
    if (normalizeBatch(m.batchNo) === cleanNew) {
      throw new Error(`Duplicate batch rejected: Batch "${batchData.batchNo}" is already registered under "${m.brandName}".`);
    }
    if (Array.isArray(m.batches)) {
      const dup = m.batches.find(b => normalizeBatch(b.batchNo) === cleanNew);
      if (dup) {
        throw new Error(`Duplicate batch rejected: Batch "${batchData.batchNo}" is already registered under "${m.brandName}".`);
      }
    }
  }

  const batches = Array.isArray(med.batches) ? [...med.batches] : [];
  const newBatch = {
    batchNo: batchData.batchNo.trim().toUpperCase(),
    mfgDate: batchData.mfgDate || '01/2025',
    expDate: batchData.expDate.trim(),
    mfgLicenceNo: batchData.mfgLicenceNo || med.mfgLicenceNo || 'LIC/2025/MED',
    status: batchData.status || 'Active',
    createdAt: new Date().toISOString()
  };

  batches.push(newBatch);
  const updatedMed = { ...med, batches };
  memoryMedicines[idx] = updatedMed;
  setLocalCache(memoryMedicines);
  return updatedMed;
}

export function logVerificationAudit(result) {
  try {
    const key = 'medqr_verification_history';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    const entry = {
      id: result.verificationRef || `VRF-${Date.now().toString(36).toUpperCase()}`,
      timestamp: result.verificationTimestamp || new Date().toISOString(),
      batchNo: result.batch?.batchNo || result.enteredBatch || 'UNKNOWN',
      medicineName: result.medicine?.brandName || result.enteredMedicine || 'N/A',
      genericName: result.medicine?.genericName || '',
      statusCode: result.statusCode,
      status: result.status,
      verified: !!result.verified,
      title: result.title
    };
    const updated = [entry, ...list.filter(e => e.id !== entry.id)].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not record verification audit log:', e);
  }
}

export function getVerificationHistory() {
  try {
    const raw = localStorage.getItem('medqr_verification_history');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

