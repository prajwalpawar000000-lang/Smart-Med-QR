/**
 * MedQR Clinical Batch Verification Engine
 * Handles full validation, multi-batch search, shelf-life evaluation, and pharmacovigilance checks.
 */

import { parseFlexibleDate, getExpiryStatus } from './expiryCheck.js';

export function normalizeBatch(str) {
  return String(str || '').replace(/[\s\-_]/g, '').trim().toUpperCase();
}

export function verifyBatchRecord(targetBatchRaw, optionalMedicineName = '', medicinesList = []) {
  const timestamp = new Date().toISOString();
  const refCode = `VRF-${Date.now().toString(36).toUpperCase()}`;

  // 1. Input Validation (Status E: Invalid Information)
  if (!targetBatchRaw || typeof targetBatchRaw !== 'string') {
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

  const cleanBatch = normalizeBatch(targetBatchRaw);
  if (cleanBatch.length < 2) {
    return {
      status: 'INVALID',
      statusCode: 'E',
      verified: false,
      title: 'Invalid Batch Format',
      message: 'The entered batch number is too short or contains invalid characters. Please enter a valid batch code from the packaging strip or carton.',
      verificationTimestamp: timestamp,
      verificationRef: refCode
    };
  }

  if (!Array.isArray(medicinesList) || medicinesList.length === 0) {
    return {
      status: 'ERROR',
      statusCode: 'E',
      verified: false,
      title: 'Database Unavailable',
      message: 'Unable to access the verified medicine database. Please check your network connection and try again.',
      verificationTimestamp: timestamp,
      verificationRef: refCode
    };
  }

  // 2. Search Database for Matching Batch
  let matchedMedicine = null;
  let matchedBatch = null;

  for (const med of medicinesList) {
    // Check primary batchNo
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

    // Check multi-batch array if present
    if (Array.isArray(med.batches)) {
      const foundInBatches = med.batches.find(b => normalizeBatch(b.batchNo) === cleanBatch);
      if (foundInBatches) {
        matchedMedicine = med;
        matchedBatch = { ...foundInBatches };
        break;
      }
    }
  }

  // 3. Status B: Batch Not Found
  if (!matchedMedicine || !matchedBatch) {
    return {
      status: 'NOT_FOUND',
      statusCode: 'B',
      verified: false,
      title: 'Batch Not Found',
      message: 'Batch number not found in the registered MedQR database. Please verify the details with the manufacturer or pharmacist.',
      enteredBatch: targetBatchRaw.trim().toUpperCase(),
      verificationTimestamp: timestamp,
      verificationRef: refCode
    };
  }

  // 4. Optional Medicine Name / Selection Mismatch Check (Status E)
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

  // 5. Expiration Date Check (Status C or D or A)
  const expEvaluation = getExpiryStatus(matchedBatch.expDate);

  // Status C: Expired Medicine
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

  // Status D: Expiry Approaching (within 60 days)
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

  // Status A: Verified Batch
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
