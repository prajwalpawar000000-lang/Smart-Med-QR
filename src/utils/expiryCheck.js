/**
 * MedQR Date & Expiration Evaluation Utility
 * Robust parsing for ISO (YYYY-MM-DD), Month-Year (MM/YYYY, YYYY-MM), and standard formats.
 */

export function parseFlexibleDate(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  // 1. ISO format: YYYY-MM-DD or YYYY-MM
  if (/^\d{4}-\d{1,2}(-\d{1,2})?$/.test(str)) {
    const parts = str.split('-').map(Number);
    const year = parts[0];
    const month = parts[1] - 1;
    const day = parts[2] !== undefined ? parts[2] : new Date(year, month + 1, 0).getDate();
    return new Date(year, month, day, 23, 59, 59, 999);
  }

  // 2. Slash format: MM/YYYY or DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/').map(p => parseInt(p.trim(), 10));
    if (parts.length === 2) {
      // MM/YYYY
      const month = parts[0] - 1;
      const year = parts[1];
      const lastDay = new Date(year, month + 1, 0).getDate();
      return new Date(year, month, lastDay, 23, 59, 59, 999);
    } else if (parts.length === 3) {
      // DD/MM/YYYY or YYYY/MM/DD
      if (parts[0] > 1000) {
        // YYYY/MM/DD
        return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999);
      } else {
        // DD/MM/YYYY
        return new Date(parts[2], parts[1] - 1, parts[0], 23, 59, 59, 999);
      }
    }
  }

  // 3. Native parse fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

export function getExpiryStatus(expDate) {
  if (!expDate) {
    return { 
      status: 'unknown', 
      label: 'Unknown Date', 
      color: 'slate',
      daysRemaining: null,
      formattedExpDate: 'N/A'
    };
  }

  const expiryDate = parseFlexibleDate(expDate);
  if (!expiryDate || isNaN(expiryDate.getTime())) {
    return { 
      status: 'invalid', 
      label: 'Invalid Date', 
      color: 'slate',
      daysRemaining: null,
      formattedExpDate: String(expDate)
    };
  }

  const currentDate = new Date();
  const diffTime = expiryDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedExpDate = expiryDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Expired
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    return {
      status: 'expired',
      label: 'EXPIRED - Do Not Use',
      color: 'danger',
      daysRemaining,
      daysOverdue,
      formattedExpDate,
      warningMessage: `WARNING: This medicine passed its expiry date ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago. Do not administer or consume.`
    };
  }

  // Expiring Soon (within 60 days)
  if (daysRemaining <= 60) {
    return {
      status: 'expiring',
      label: `Expiring Soon (${daysRemaining}d)`,
      color: 'warning',
      daysRemaining,
      formattedExpDate,
      warningMessage: `Caution: This medicine batch expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Ensure completion before expiry.`
    };
  }

  // Valid
  return {
    status: 'valid',
    label: 'Valid & Safe',
    color: 'success',
    daysRemaining,
    formattedExpDate,
    warningMessage: null
  };
}

export function formatDate(dateStr) {
  const d = parseFlexibleDate(dateStr);
  if (!d) return dateStr || '';
  return d.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric'
  });
}
