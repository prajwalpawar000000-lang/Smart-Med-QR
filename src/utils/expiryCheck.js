export function getExpiryStatus(expDate) {
  if (!expDate) return { status: 'unknown', label: 'Unknown', color: 'slate' };
  
  const [monthStr, yearStr] = expDate.split('/');
  if (!monthStr || !yearStr) return { status: 'unknown', label: 'Invalid Date', color: 'slate' };

  const expMonth = parseInt(monthStr, 10) - 1; // 0-indexed month
  const expYear = parseInt(yearStr, 10);
  
  // Set expiry to the last day of the given month
  const expiryDate = new Date(expYear, expMonth + 1, 0, 23, 59, 59);
  const currentDate = new Date();

  if (currentDate > expiryDate) {
    return { status: 'expired', label: 'EXPIRED - Do Not Use', color: 'danger' };
  }

  // Check if expiring within 3 months
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  if (expiryDate <= threeMonthsFromNow) {
    return { status: 'expiring', label: 'Expiring Soon', color: 'warning' };
  }

  return { status: 'valid', label: 'Valid', color: 'success' };
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [month, year] = dateStr.split('/');
  if (!month || !year) return dateStr;
  
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
