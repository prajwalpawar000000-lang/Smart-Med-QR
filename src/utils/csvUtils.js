export function exportToCSV(medicines, filename = 'medicines_export.csv') {
  if (!medicines || !medicines.length) return;

  const headers = [
    'id', 'srNo', 'genericName', 'brandName', 'strength', 'dosageForm', 
    'route', 'useIndication', 'dose', 'directionForUse', 'manufacturer', 
    'batchNo', 'mfgDate', 'expDate', 'mfgLicenceNo', 'pageLink'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '';
    const stringified = String(str);
    if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
  };

  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const med of medicines) {
    const values = headers.map(header => escapeCSV(med[header]));
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const safeFilename = filename || 'medicines_export.csv';
  link.setAttribute('download', safeFilename.endsWith('.csv') ? safeFilename : `${safeFilename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvString) {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const values = [];
    let currentVal = '';
    let inQuotes = false;

    for (let j = 0; j < row.length; j++) {
      const char = row[j];
      if (char === '"') {
        if (inQuotes && row[j + 1] === '"') {
          currentVal += '"';
          j++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal);
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal);

    const obj = {};
    headers.forEach((header, index) => {
      let val = values[index];
      if (val !== undefined) {
        val = val.trim();
        // Auto convert id and srNo to numbers if possible
        if (header === 'id' || header === 'srNo') {
          const num = Number(val);
          obj[header] = isNaN(num) ? val : num;
        } else {
          obj[header] = val;
        }
      }
    });
    results.push(obj);
  }
  return results;
}
