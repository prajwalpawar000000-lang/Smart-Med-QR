// Apps Script for Smart MED QR - REST API Backend

const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const SHEET_NAME = 'Medicines';
// Adjust BASE_URL to the frontend URL where the medicine page will be hosted.
const BASE_URL = 'https://smartmedqr.vercel.app'; 

const COLUMNS = [
  'Sr. No', 
  'Generic Name', 
  'Brand Name', 
  'Strength', 
  'Dosage Form', 
  'Route', 
  'Use/Indication', 
  'Dose', 
  'Direction for Use', 
  'Manufacturer', 
  'Batch No.', 
  'Mfg. Date', 
  'Exp. Date', 
  'Manufacturing Licence No.', 
  'Medicine Page Link'
];

/**
 * Handle GET Requests
 * Routes:
 * - ?action=getAll (default)
 * - ?action=getById&id=X
 * - ?action=search&q=term
 * - ?action=verifyBatch&batch=XX
 */
function doGet(e) {
  if (!checkRateLimit()) {
    return createResponse({ error: 'Rate limit exceeded. Try again later.' }, 429);
  }

  const action = e.parameter.action || 'getAll';
  const sheet = getSheet();
  
  if (!sheet) {
    return createResponse({ error: 'Sheet "Medicines" not found' }, 500);
  }

  try {
    switch (action) {
      case 'getAll':
        return createResponse(getAllMedicines(sheet));
      case 'getById':
        return createResponse(getMedicineById(sheet, e.parameter.id));
      case 'search':
        return createResponse(searchMedicines(sheet, e.parameter.q));
      case 'verifyBatch':
        return createResponse(verifyBatch(sheet, e.parameter.batch));
      default:
        return createResponse({ error: 'Invalid action parameter' }, 400);
    }
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle POST Requests
 * Routes:
 * - ?action=add
 * - ?action=update&id=X
 * - ?action=delete&id=X
 * - ?action=bulkImport
 */
function doPost(e) {
  if (!checkRateLimit()) {
    return createResponse({ error: 'Rate limit exceeded. Try again later.' }, 429);
  }

  const action = e.parameter.action;
  const sheet = getSheet();
  
  if (!sheet) {
    return createResponse({ error: 'Sheet "Medicines" not found' }, 500);
  }

  try {
    // Parse incoming JSON body
    const postData = JSON.parse(e.postData.contents);
    
    switch (action) {
      case 'add':
        return createResponse(addMedicine(sheet, postData));
      case 'update':
        return createResponse(updateMedicine(sheet, e.parameter.id, postData));
      case 'delete':
        return createResponse(deleteMedicine(sheet, e.parameter.id));
      case 'bulkImport':
        return createResponse(bulkImportMedicines(sheet, postData));
      default:
        return createResponse({ error: 'Invalid action parameter' }, 400);
    }
  } catch (error) {
    return createResponse({ error: 'Failed to process POST request: ' + error.toString() }, 500);
  }
}

// -------------------------------------------------------------
// Core Operations
// -------------------------------------------------------------

function getAllMedicines(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { data: [] };
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => rowToObject(headers, row));
  return { data: result, count: result.length };
}

function getMedicineById(sheet, id) {
  if (!id) throw new Error('Missing parameter: id');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Sr. No is column index 0
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return { data: rowToObject(headers, data[i]) };
    }
  }
  
  return { error: 'Medicine not found', status: 404 };
}

function searchMedicines(sheet, query) {
  if (!query) throw new Error('Missing parameter: q (query)');
  
  const lowerQuery = String(query).toLowerCase();
  const { data } = getAllMedicines(sheet);
  
  const results = data.filter(med => {
    return (med['Generic Name'] && String(med['Generic Name']).toLowerCase().includes(lowerQuery)) ||
           (med['Brand Name'] && String(med['Brand Name']).toLowerCase().includes(lowerQuery));
  });
  
  return { data: results, count: results.length };
}

function verifyBatch(sheet, batchNo) {
  if (!batchNo) throw new Error('Missing parameter: batch');
  
  const { data } = getAllMedicines(sheet);
  const match = data.find(med => String(med['Batch No.']) === String(batchNo));
  
  if (match) {
    return { valid: true, data: match };
  }
  return { valid: false, error: 'Invalid or unknown batch number' };
}

function addMedicine(sheet, medData) {
  // Generate a unique sequential ID
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const currentId = parseInt(data[i][0], 10);
    if (!isNaN(currentId) && currentId > maxId) {
      maxId = currentId;
    }
  }
  const newId = maxId + 1;
  
  // Prepare row
  const row = buildRowFromObject(newId, medData);
  sheet.appendRow(row);
  
  return { success: true, message: 'Medicine added successfully', id: newId };
}

function updateMedicine(sheet, id, medData) {
  if (!id) throw new Error('Missing parameter: id');
  
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i + 1; // 1-indexed for SpreadsheetApp
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Medicine not found', status: 404 };
  }
  
  const row = buildRowFromObject(id, medData);
  const range = sheet.getRange(rowIndex, 1, 1, COLUMNS.length);
  range.setValues([row]);
  
  return { success: true, message: 'Medicine updated successfully', id };
}

function deleteMedicine(sheet, id) {
  if (!id) throw new Error('Missing parameter: id');
  
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      rowIndex = i + 1; // 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Medicine not found', status: 404 };
  }
  
  sheet.deleteRow(rowIndex);
  return { success: true, message: 'Medicine deleted successfully' };
}

function bulkImportMedicines(sheet, medsArray) {
  if (!Array.isArray(medsArray)) {
    throw new Error('Expected JSON array for bulk import');
  }
  
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const currentId = parseInt(data[i][0], 10);
    if (!isNaN(currentId) && currentId > maxId) {
      maxId = currentId;
    }
  }
  
  const rowsToAppend = medsArray.map((med, index) => {
    return buildRowFromObject(maxId + index + 1, med);
  });
  
  if (rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, COLUMNS.length)
         .setValues(rowsToAppend);
  }
  
  return { success: true, message: \`Imported \${rowsToAppend.length} medicines\` };
}

// -------------------------------------------------------------
// Helper Functions
// -------------------------------------------------------------

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME);
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    if (header) {
      // Handle Date formatting properly to avoid GS specific object serialization issues
      if (row[index] instanceof Date) {
        obj[header] = Utilities.formatDate(row[index], Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        obj[header] = String(row[index]);
      }
    }
  });
  return obj;
}

function buildRowFromObject(id, medData) {
  const row = [];
  
  // Set auto-generated link
  const pageLink = \`\${BASE_URL}/m/\${id}\`;
  
  COLUMNS.forEach(col => {
    if (col === 'Sr. No') {
      row.push(id);
    } else if (col === 'Medicine Page Link') {
      row.push(pageLink);
    } else {
      // Sanitize input: basic string conversion and trimming
      const val = medData[col] !== undefined ? String(medData[col]).trim() : '';
      row.push(val);
    }
  });
  
  return row;
}

/**
 * Basic Rate Limiter using Script Properties
 * Allows max 30 requests per minute
 */
function checkRateLimit() {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxReqs = 30;
  
  let reqData = SCRIPT_PROPERTIES.getProperty('RATE_LIMIT_DATA');
  if (!reqData) {
    reqData = { count: 1, resetTime: now + windowMs };
  } else {
    reqData = JSON.parse(reqData);
    if (now > reqData.resetTime) {
      // Reset window
      reqData = { count: 1, resetTime: now + windowMs };
    } else {
      reqData.count++;
      if (reqData.count > maxReqs) {
        return false;
      }
    }
  }
  
  SCRIPT_PROPERTIES.setProperty('RATE_LIMIT_DATA', JSON.stringify(reqData));
  return true;
}

/**
 * Creates standard JSON response with proper CORS headers
 */
function createResponse(data, statusCode = 200) {
  const output = JSON.stringify({
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...data
  });
  
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
