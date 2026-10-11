import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import ExpiryBadge from './ExpiryBadge';

const MedicineTable = ({ medicine }) => {
  const { t, language } = useContext(LanguageContext);

  if (!medicine) return null;

  const trans = medicine.translations?.[language] || {};

  const getTranslatedValue = (key, fallback) => {
    if (language === 'en') return fallback;
    return trans[key] || fallback;
  };

  // Define the ordered fields to display based on the requirements
  const fields = [
    { key: 'genericName', tKey: 'medicine.genericName', value: getTranslatedValue('genericName', medicine.genericName) },
    { key: 'brandName', tKey: 'medicine.brandName', value: medicine.brandName },
    { key: 'strength', tKey: 'medicine.strength', value: medicine.strength },
    { key: 'dosageForm', tKey: 'medicine.dosageForm', value: medicine.dosageForm },
    { key: 'route', tKey: 'medicine.route', value: medicine.route },
    { key: 'useIndication', tKey: 'medicine.useIndication', value: getTranslatedValue('useIndication', medicine.useIndication) },
    { key: 'dose', tKey: 'medicine.dose', value: getTranslatedValue('dose', medicine.dose) },
    { key: 'directionForUse', tKey: 'medicine.directionForUse', value: getTranslatedValue('directionForUse', medicine.directionForUse) },
    { key: 'manufacturer', tKey: 'medicine.manufacturer', value: medicine.manufacturer },
    { key: 'batchNo', tKey: 'medicine.batchNo', value: medicine.batchNo },
    { key: 'mfgDate', tKey: 'medicine.mfgDate', value: medicine.mfgDate },
    { key: 'expDate', tKey: 'medicine.expDate', value: medicine.expDate },
    { key: 'mfgLicenceNo', tKey: 'medicine.mfgLicenceNo', value: medicine.mfgLicenceNo },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
      {/* Title bar with teal accent */}
      <div className="bg-gradient-to-r from-[#0B4F9C] to-[#1E9E8F] px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white m-0">
          {language === 'mr' ? 'औषध तपशील (Medicine Specifications)' : language === 'hi' ? 'दवाई का विवरण (Medicine Details)' : 'Medicine Information'}
        </h2>
        {language === 'mr' && (
          <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/30">
            मराठी भाषा
          </span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-100">
            {fields.map((field, index) => (
              <tr 
                key={field.key} 
                className={`
                  flex flex-col md:table-row
                  ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                  hover:bg-blue-50/40 transition-colors duration-150
                `}
              >
                <th 
                  scope="row" 
                  className="px-6 py-3.5 md:py-4 text-xs font-bold text-slate-600 uppercase tracking-wide md:w-1/3 align-top border-b md:border-b-0 border-slate-100 md:border-r"
                >
                  {t(field.tKey)}
                </th>
                <td className="px-6 py-3.5 md:py-4 text-sm md:text-base text-slate-900 break-words flex items-center flex-wrap gap-3">
                  <span className="font-semibold text-slate-800">{field.value || '-'}</span>
                  
                  {/* Append ExpiryBadge if this is the expDate row */}
                  {field.key === 'expDate' && field.value && (
                    <span className="ml-2 inline-block">
                      <ExpiryBadge expDate={field.value} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineTable;
