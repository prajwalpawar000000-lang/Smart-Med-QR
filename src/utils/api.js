import mockData from '../data/mockMedicines.json';

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

export async function verifyBatch(batchNo) {
  const normalize = (str) => String(str || '').replace(/[\s\-_]/g, '').toUpperCase();
  const cleanBatch = normalize(batchNo);

  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/verify/${encodeURIComponent(cleanBatch)}`);
    if (response.ok) {
      const result = await response.json();
      if (result && result.verified) return result;
    }
  } catch (err) {
    console.warn('Batch verification API failed, checking local data:', err);
  }

  const cached = getLocalCache() || memoryMedicines;
  const med = cached.find((m) => normalize(m.batchNo) === cleanBatch);
  return med ? { verified: true, medicine: { ...med } } : { verified: false };
}
