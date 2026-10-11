export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  let sanitized = input.replace(/<[^>]*>?/gm, ''); // Remove HTML tags
  return sanitized.trim();
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function validateMedicineData(data) {
  const errors = {};
  
  const requiredFields = [
    'genericName', 'brandName', 'strength', 'dosageForm', 
    'route', 'manufacturer', 'batchNo', 'mfgDate', 'expDate'
  ];

  requiredFields.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      errors[field] = `This field is required.`;
    }
  });

  const dateRegex = /^(\d{4}-\d{2}|(0[1-9]|1[0-2])\/\d{4})$/;
  if (data.mfgDate && !dateRegex.test(data.mfgDate)) {
    errors.mfgDate = 'Must be in MM/YYYY or YYYY-MM format.';
  }
  if (data.expDate && !dateRegex.test(data.expDate)) {
    errors.expDate = 'Must be in MM/YYYY or YYYY-MM format.';
  }

  const alphanumericRegex = /^[a-zA-Z0-9_-]+$/;
  if (data.batchNo && !alphanumericRegex.test(data.batchNo)) {
    errors.batchNo = 'Must be alphanumeric.';
  }

  const strengthRegex = /\d+.*[a-zA-Z%]/;
  if (data.strength && !strengthRegex.test(data.strength)) {
    errors.strength = 'Must contain a valid unit (e.g., 500 mg, 1% w/w).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
