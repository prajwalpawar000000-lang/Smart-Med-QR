import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getExpiryStatus } from '../utils/expiryCheck';

const ExpiryBadge = ({ expDate }) => {
  if (!expDate) return null;

  const { status, label, color } = getExpiryStatus(expDate);

  // Map status to specific Tailwind classes and icons
  let badgeClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ";
  let IconComponent = null;

  switch (status) {
    case 'valid':
      badgeClasses += "bg-[#16A34A]"; // Success Green
      IconComponent = CheckCircle;
      break;
    case 'expiring':
      badgeClasses += "bg-[#D97706]"; // Warning Amber
      IconComponent = AlertTriangle;
      break;
    case 'expired':
      badgeClasses += "bg-[#DC2626] animate-pulse"; // Danger Red + Pulse
      IconComponent = XCircle;
      break;
    default:
      badgeClasses += "bg-slate-500";
      IconComponent = AlertTriangle;
  }

  return (
    <div 
      className={badgeClasses}
      role="status"
      aria-label={`Expiry Status: ${label}`}
    >
      <IconComponent size={14} strokeWidth={2.5} />
      <span>{label}</span>
    </div>
  );
};

export default ExpiryBadge;
