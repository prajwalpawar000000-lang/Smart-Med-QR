import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'data', 'medicines.json');
const MOCK_FILE = path.join(__dirname, '..', 'src', 'data', 'mockMedicines.json');

// Read existing medicines
const raw = fs.readFileSync(DATA_FILE, 'utf8');
const data = JSON.parse(raw);
const existingList = Array.isArray(data) ? data : (data.medicines || []);

// Helper to calculate relative date strings
const now = new Date();
const nearExpiryDate = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 25 days ahead
const nearExpiryDate2 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 45 days ahead

const storageByForm = {
  'Tablet': 'Store below 30°C in a dry place. Protect from moisture and direct sunlight.',
  'Capsule': 'Store below 25°C in a tightly closed moisture-proof container.',
  'Syrup': 'Store below 25°C. Shake well before use. Keep tightly closed.',
  'Suspension': 'Store below 25°C. Reconstituted suspension must be refrigerated (2°C-8°C) and used within 7 days.',
  'Injection': 'Store between 2°C to 8°C (Refrigerate). Do not freeze. Protect from light.',
  'Eye Drops': 'Store below 25°C. Discard container 30 days after first opening. Keep dropper tip sterile.',
  'Ear Drops': 'Store below 25°C away from heat. Do not touch dropper tip to ear.',
  'Ointment': 'Store below 30°C. Keep tube tightly capped after use.',
  'Cream': 'Store below 25°C. Do not freeze.',
  'Gel': 'Store below 30°C in a cool, dry place. Flammable: keep away from flame.',
  'Powder': 'Store below 30°C in dry conditions. Reconstituted solution to be used within 24 hours.',
  'Sachet': 'Store below 25°C in dry place. Consume immediately upon opening.',
  'Suppository': 'Store below 20°C in refrigerator or cool place to maintain solid structure.',
  'Transdermal Patch': 'Store in original pouch below 25°C. Apply immediately after opening pouch.',
  'Inhaler': 'Store below 30°C. Protect from frost and direct sunlight. Pressurized canister: do not puncture.'
};

const precautionsByForm = {
  'Tablet': 'Swallow whole with water. Do not crush unless directed by physician.',
  'Capsule': 'Take with full glass of water. Do not open capsule shell.',
  'Syrup': 'Use accurate measuring cup/spoon provided. Do not use household spoons.',
  'Suspension': 'Shake vigorously before each dose. Discard unused portion after recommended period.',
  'Injection': 'For clinical/hospital administration by trained healthcare provider only.',
  'Eye Drops': 'Wash hands before instillation. Avoid contact of dropper tip with eye or skin surface.',
  'Ear Drops': 'Warm bottle slightly in hand before instillation. Lie with ear facing upward for 2 minutes.',
  'Ointment': 'Clean and dry affected area before application. Avoid open deep wounds.',
  'Cream': 'Apply thin layer and rub in gently. Wash hands before and after use.',
  'Gel': 'Wash hands after use. Avoid application to broken skin, eyes, or mucous membranes.',
  'Powder': 'Dissolve completely in specified volume of safe drinking water.',
  'Sachet': 'Mix with room temperature liquid or food. Do not mix with very hot liquids.',
  'Suppository': 'For rectal use only. Wash hands before and after insertion.',
  'Transdermal Patch': 'Apply to clean, dry, hairless intact skin. Rotate application sites.',
  'Inhaler': 'Rinse mouth with water after inhalation. Prime device before initial use.'
};

const drugInteractionsByDrug = {
  'Paracetamol': 'Avoid concomitant alcohol consumption and other paracetamol-containing products. Monitor if using blood thinners (warfarin).',
  'Ibuprofen': 'Avoid concurrent NSAIDs, aspirin, oral steroids, or blood pressure medications (ACE inhibitors) without doctor review.',
  'Cetirizine Hydrochloride': 'Avoid alcohol and sedatives/tranquilizers as drowsiness may be magnified.',
  'Omeprazole': 'May decrease absorption of iron, ketoconazole, and vitamin B12. Consult doctor if taking clopidogrel or methotrexate.',
  'Amoxicillin': 'May reduce effectiveness of oral contraceptives. Incompatible with concurrent bacteriostatic antibiotics (tetracyclines).',
  'Cough Syrup': 'Avoid alcohol and other CNS depressants. Consult doctor if taking MAO inhibitors or antidepressant medications.',
  'Ceftriaxone Sodium': 'Avoid mixing with calcium-containing intravenous solutions due to precipitation risk.',
  'Ciprofloxacin Ophthalmic': 'Do not use other ophthalmic preparations concurrently without a 15-minute interval.',
  'Clotrimazole': 'May weaken latex condoms and diaphragms if applied topically nearby.',
  'Diclofenac Diethylamine': 'Avoid combining with oral NSAIDs to minimize systemic adverse reactions.',
  'Salbutamol': 'Use with caution if taking beta-blockers (propranolol) or potassium-depleting diuretics.'
};

const upgradedList = existingList.map((med, index) => {
  const dosageForm = med.dosageForm || 'Tablet';
  const genericName = med.genericName || 'Medicine';

  // Base batch from existing data
  const mainBatch = {
    batchNo: String(med.batchNo || `MED${10000 + med.id}`).trim().toUpperCase(),
    mfgDate: med.mfgDate || '2024-03-01',
    expDate: med.expDate || '2026-04-30',
    mfgLicenceNo: med.mfgLicenceNo || 'LIC/2024/IND',
    status: 'Active',
    createdAt: med.mfgDate || '2024-03-01'
  };

  const batches = [mainBatch];

  // Add additional verified batches for multi-batch testing scenarios
  if (med.id === 1) {
    batches.push({
      batchNo: 'PA24568',
      mfgDate: '2024-06-01',
      expDate: '2026-05-31',
      mfgLicenceNo: med.mfgLicenceNo,
      status: 'Active',
      createdAt: '2024-06-01'
    });
    // Near expiry batch (Scenario 4)
    batches.push({
      batchNo: 'PA-NEAR01',
      mfgDate: '2024-01-01',
      expDate: nearExpiryDate,
      mfgLicenceNo: med.mfgLicenceNo,
      status: 'Active',
      createdAt: '2024-01-01'
    });
    // Expired batch (Scenario 3)
    batches.push({
      batchNo: 'PA-EXP99',
      mfgDate: '2022-01-15',
      expDate: '2023-12-31',
      mfgLicenceNo: med.mfgLicenceNo,
      status: 'Expired',
      createdAt: '2022-01-15'
    });
  } else if (med.id === 2) {
    batches.push({
      batchNo: 'IB-EXP01',
      mfgDate: '2022-05-01',
      expDate: '2024-04-30',
      mfgLicenceNo: med.mfgLicenceNo,
      status: 'Expired',
      createdAt: '2022-05-01'
    });
  } else if (med.id === 4) {
    batches.push({
      batchNo: 'OM-NEAR02',
      mfgDate: '2024-02-01',
      expDate: nearExpiryDate2,
      mfgLicenceNo: med.mfgLicenceNo,
      status: 'Active',
      createdAt: '2024-02-01'
    });
  }

  // Ensure standard structured side effects
  const rawSide = med.sideEffects || {};
  const common = Array.isArray(rawSide.common) && rawSide.common.length > 0 
    ? rawSide.common 
    : ['Mild nausea', 'Stomach discomfort', 'Dizziness'];
  const serious = Array.isArray(rawSide.serious) && rawSide.serious.length > 0
    ? rawSide.serious
    : ['Severe allergic reaction (Rash, Swelling of lips/face)', 'Difficulty breathing or wheezing'];

  const storageConditions = med.storageConditions || storageByForm[dosageForm] || 'Store in a cool and dry place away from direct sunlight.';
  const precautions = med.precautions || precautionsByForm[dosageForm] || 'Follow doctor prescription strictly. Keep out of reach of children.';
  const drugInteractions = med.drugInteractions || drugInteractionsByDrug[genericName] || 'Inform your doctor about any concurrent prescription or OTC medicines.';

  return {
    ...med,
    id: Number(med.id),
    srNo: Number(med.srNo || med.id),
    qrCodeIdentifier: `MEDQR-${String(med.id).padStart(4, '0')}`,
    registrationStatus: 'Registered & Active',
    storageConditions,
    precautions,
    drugInteractions,
    batchNo: mainBatch.batchNo,
    mfgDate: mainBatch.mfgDate,
    expDate: mainBatch.expDate,
    batches,
    sideEffects: {
      common,
      serious,
      adverseReactions: serious,
      warnings: [
        'Follow prescribed dose and schedule strictly.',
        'Keep out of reach and sight of children.',
        'Consult physician or pharmacist before use during pregnancy or lactation.'
      ],
      contraindications: rawSide.contraindications || 'Known hypersensitivity to active substance or excipients.',
      emergencyWarning: rawSide.emergencyWarning || 'In case of severe allergic reaction, breathing difficulty, or suspected overdose, seek urgent emergency medical attention immediately.'
    }
  };
});

const payload = {
  disclaimer: "MedQR Verified Medicine & Batch Database • Production Healthcare Repository",
  lastUpdated: new Date().toISOString(),
  medicines: upgradedList
};

fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
fs.writeFileSync(MOCK_FILE, JSON.stringify(payload, null, 2), 'utf8');

console.log(`Successfully upgraded ${upgradedList.length} medicines with multi-batch support and production schema.`);
