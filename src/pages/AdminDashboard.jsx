import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, Plus, Edit2, Trash2, Search, FileDown, Upload, Printer, CheckCircle2, 
  ShieldCheck, AlertTriangle, Clock, History, Download, Layers, X, Info, Sparkles, Building
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ExpiryBadge from '../components/ExpiryBadge';
import QRCodeCard from '../components/QRCodeCard';
import { useMedicines } from '../hooks/useMedicines';
import { useAuth } from '../hooks/useAuth';
import { exportToCSV, parseCSV } from '../utils/csvUtils';
import { validateMedicineData } from '../utils/sanitize';
import { getVerificationHistory } from '../utils/api';
import { downloadQR, generateQRDataURL } from '../utils/qrGenerator';

const InputField = ({ label, name, value, onChange, error, placeholder, type = 'text', required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-[#1E9E8F] text-sm text-slate-800 transition-all`}
    />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, error, options = [], required = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-[#1E9E8F] text-sm text-slate-800 transition-all bg-white cursor-pointer`}
    >
      <option value="">-- Select {label} --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const TextAreaField = ({ label, name, value, onChange, error, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    <textarea
      name={name}
      rows={rows}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-[#1E9E8F] text-sm text-slate-800 transition-all`}
    />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const { medicines, addMedicine, updateMedicine, deleteMedicine, registerBatch } = useMedicines();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleStartEdit = (med) => {
    setEditingMedicine(med);
    setActiveTab('add');
  };

  const handleSaveMedicine = async (formData) => {
    if (editingMedicine) {
      await updateMedicine(editingMedicine.id, formData);
      setEditingMedicine(null);
    } else {
      await addMedicine(formData);
    }
    setActiveTab('list');
  };

  const handleConfirmDelete = async () => {
    if (deletingMedicine) {
      await deleteMedicine(deletingMedicine.id);
      setDeletingMedicine(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-[#0B4F9C]">Admin & Pharmacist Dashboard</h1>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
                Active Session
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage medicine monographs, register batches, print packaging QR labels, view audit logs, and import data.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors font-medium text-sm cursor-pointer"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* DASHBOARD TABS */}
        <div className="flex overflow-x-auto space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          {[
            { id: 'list', label: '📋 Medicine List' },
            { id: 'add', label: editingMedicine ? '✏️ Edit Medicine' : '➕ Add Medicine' },
            { id: 'batches', label: '🏷️ Register & View Batches' },
            { id: 'labels', label: '🖨️ QR Label Sheet' },
            { id: 'history', label: '📜 Verification History' },
            { id: 'import', label: '💾 Import / Export CSV' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id !== 'add') setEditingMedicine(null);
                setActiveTab(tab.id);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-colors text-xs sm:text-sm cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0B4F9C] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
          {activeTab === 'list' && (
            <MedicineListTab 
              medicines={medicines} 
              onDelete={(med) => setDeletingMedicine(med)} 
              onEdit={handleStartEdit}
              onAddNew={() => {
                setEditingMedicine(null);
                setActiveTab('add');
              }}
            />
          )}

          {activeTab === 'add' && (
            <AddEditMedicineTab 
              onSave={handleSaveMedicine} 
              initialData={editingMedicine}
              onCancel={() => {
                setEditingMedicine(null);
                setActiveTab('list');
              }}
            />
          )}

          {activeTab === 'batches' && (
            <BatchManagementTab 
              medicines={medicines}
              onRegisterBatch={registerBatch}
            />
          )}

          {activeTab === 'labels' && <QRLabelsTab medicines={medicines} />}
          {activeTab === 'history' && <VerificationHistoryTab />}
          {activeTab === 'import' && <ImportExportTab medicines={medicines} onImportMedicine={addMedicine} />}
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMedicine && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Medicine Record?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong>{deletingMedicine.brandName}</strong> ({deletingMedicine.genericName})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMedicine(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// =========================================================================
// SUB-TAB 1: MEDICINE LIST
// =========================================================================

const MedicineListTab = ({ medicines, onDelete, onEdit, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = medicines.filter(m => 
    (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (m.brandName && m.brandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.batchNo && m.batchNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-96">
          <SearchBar onSearch={setSearchTerm} placeholder="Search medicines, generic or batches..." />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-500 font-semibold">
            Total: {filtered.length} Medicines Registered
          </span>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-[#1E9E8F] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#147a6e] transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Add New Medicine
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse min-w-max text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <th className="p-3.5 font-bold">Sr.</th>
              <th className="p-3.5 font-bold">Brand & Generic</th>
              <th className="p-3.5 font-bold">Dosage Form</th>
              <th className="p-3.5 font-bold">Batch No.</th>
              <th className="p-3.5 font-bold">Expiry Date</th>
              <th className="p-3.5 font-bold">Status</th>
              <th className="p-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((med, index) => (
              <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-3.5 text-slate-500 font-mono">{(page - 1) * itemsPerPage + index + 1}</td>
                <td className="p-3.5">
                  <Link to={`/medicine/${med.id}`} className="font-bold text-slate-900 hover:text-[#0B4F9C]">
                    {med.brandName}
                  </Link>
                  <div className="text-[11px] text-slate-500">{med.genericName} • {med.strength}</div>
                </td>
                <td className="p-3.5">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {med.dosageForm}
                  </span>
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-700">
                  {med.batchNo}
                  {Array.isArray(med.batches) && med.batches.length > 0 && (
                    <span className="ml-1.5 bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full">
                      +{med.batches.length} lots
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-slate-700 font-medium">{med.expDate}</td>
                <td className="p-3.5"><ExpiryBadge expDate={med.expDate} /></td>
                <td className="p-3.5 text-right space-x-1.5">
                  <button 
                    onClick={() => onEdit(med)} 
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer" 
                    title="Edit Record"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => onDelete(med)} 
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer" 
                    title="Delete"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No medicines found matching "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-xl font-bold text-xs cursor-pointer ${
                page === i + 1 ? 'bg-[#0B4F9C] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SUB-TAB 2: ADD / EDIT MEDICINE MASTER RECORD
// =========================================================================

const AddEditMedicineTab = ({ onSave, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    genericName: initialData?.genericName || '',
    brandName: initialData?.brandName || '',
    strength: initialData?.strength || '',
    dosageForm: initialData?.dosageForm || 'Tablet',
    route: initialData?.route || 'Oral',
    useIndication: initialData?.useIndication || '',
    dose: initialData?.dose || '',
    directionForUse: initialData?.directionForUse || '',
    manufacturer: initialData?.manufacturer || '',
    batchNo: initialData?.batchNo || '',
    mfgDate: initialData?.mfgDate || '',
    expDate: initialData?.expDate || '',
    mfgLicenceNo: initialData?.mfgLicenceNo || '',
    storageConditions: initialData?.storageConditions || 'Store below 25°C in a dry place protected from direct sunlight.',
    precautions: initialData?.precautions || 'Take as prescribed. Do not exceed recommended dosage.',
    drugInteractions: initialData?.drugInteractions || 'Consult physician before taking with other prescription medicines.'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        storageConditions: initialData.storageConditions || 'Store below 25°C in a dry place protected from direct sunlight.',
        precautions: initialData.precautions || 'Take as prescribed. Do not exceed recommended dosage.',
        drugInteractions: initialData.drugInteractions || 'Consult physician before taking with other prescription medicines.'
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateMedicineData(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onSave(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {initialData ? `Edit Record: ${initialData.brandName}` : 'Add New Medicine Monograph'}
          </h2>
          <p className="text-xs text-slate-500">
            All fields are formatted for patient mobile scanning, audio accessibility, and batch verification.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            Cancel
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-center font-bold text-xs flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Medicine monograph successfully saved and updated!
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Brand Name" name="brandName" value={formData.brandName} onChange={handleChange} error={errors.brandName} placeholder="e.g. Crocin, Losec, Zyrtec" required />
        <InputField label="Generic Name" name="genericName" value={formData.genericName} onChange={handleChange} error={errors.genericName} placeholder="e.g. Paracetamol, Omeprazole" required />
        <InputField label="Strength" name="strength" value={formData.strength} onChange={handleChange} error={errors.strength} placeholder="e.g. 500 mg, 20 mg, 1% w/w" required />
        <SelectField 
          label="Dosage Form" 
          name="dosageForm" 
          value={formData.dosageForm} 
          onChange={handleChange} 
          error={errors.dosageForm}
          options={[
            'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection',
            'Eye Drops', 'Ear Drops', 'Ointment', 'Cream', 'Gel',
            'Powder', 'Sachet', 'Suppository', 'Transdermal Patch', 'Inhaler'
          ]}
          required
        />
        <SelectField 
          label="Route of Administration" 
          name="route" 
          value={formData.route} 
          onChange={handleChange} 
          error={errors.route}
          options={[
            'Oral', 'Topical', 'Ophthalmic', 'Otic', 'Inhalation',
            'Intravenous / Intramuscular', 'Subcutaneous', 'Rectal', 'Transdermal'
          ]}
          required
        />
        <InputField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} error={errors.manufacturer} placeholder="e.g. GlaxoSmithKline Ltd." required />
        <InputField label="Initial Batch Number" name="batchNo" value={formData.batchNo} onChange={handleChange} error={errors.batchNo} placeholder="e.g. PA24567" required />
        <InputField label="Mfg. Licence No" name="mfgLicenceNo" value={formData.mfgLicenceNo} onChange={handleChange} error={errors.mfgLicenceNo} placeholder="e.g. 25/MD/2014" />
        <InputField label="Mfg. Date (MM/YYYY)" name="mfgDate" value={formData.mfgDate} onChange={handleChange} error={errors.mfgDate} placeholder="04/2025" />
        <InputField label="Expiry Date (MM/YYYY)" name="expDate" value={formData.expDate} onChange={handleChange} error={errors.expDate} placeholder="04/2027" required />
      </div>

      <div className="space-y-4">
        <TextAreaField label="Indications / Clinical Uses" name="useIndication" value={formData.useIndication} onChange={handleChange} error={errors.useIndication} placeholder="e.g. Fever relief, Mild to moderate pain management." />
        <TextAreaField label="Dosage" name="dose" value={formData.dose} onChange={handleChange} error={errors.dose} placeholder="e.g. 1 tablet every 6 hours as needed." />
        <TextAreaField label="Directions for Use" name="directionForUse" value={formData.directionForUse} onChange={handleChange} error={errors.directionForUse} placeholder="e.g. Take with a full glass of water after food." />
        <TextAreaField label="Storage Conditions" name="storageConditions" value={formData.storageConditions} onChange={handleChange} placeholder="e.g. Store below 25°C in a dry place protected from light." />
        <TextAreaField label="Important Precautions & Warnings" name="precautions" value={formData.precautions} onChange={handleChange} placeholder="e.g. Do not exceed 4000 mg in 24 hours. Avoid alcohol." />
        <TextAreaField label="Known Drug Interactions" name="drugInteractions" value={formData.drugInteractions} onChange={handleChange} placeholder="e.g. Warfarin, other paracetamol-containing products." />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="bg-[#1E9E8F] text-white px-8 py-2.5 rounded-xl font-bold text-xs hover:bg-[#147a6e] transition-colors shadow-md cursor-pointer"
        >
          {initialData ? 'Update Medicine' : 'Save Medicine Monograph'}
        </button>
      </div>
    </form>
  );
};

// =========================================================================
// SUB-TAB 3: BATCH MANAGEMENT & REGISTRATION (REQUIREMENT 5)
// =========================================================================

const BatchManagementTab = ({ medicines, onRegisterBatch }) => {
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('01/2025');
  const [expDate, setExpDate] = useState('12/2027');
  const [mfgLicenceNo, setMfgLicenceNo] = useState('25/MD/2024');
  const [status, setStatus] = useState('Active');
  const [filterSearch, setFilterSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Compile all registered batches across all medicines
  const allBatches = [];
  for (const med of medicines) {
    if (med.batchNo) {
      allBatches.push({
        batchNo: med.batchNo,
        medicineId: med.id,
        brandName: med.brandName,
        genericName: med.genericName,
        mfgDate: med.mfgDate,
        expDate: med.expDate,
        mfgLicenceNo: med.mfgLicenceNo,
        status: 'Active',
        isPrimary: true
      });
    }
    if (Array.isArray(med.batches)) {
      for (const b of med.batches) {
        if (String(b.batchNo).toUpperCase() !== String(med.batchNo).toUpperCase()) {
          allBatches.push({
            ...b,
            medicineId: med.id,
            brandName: med.brandName,
            genericName: med.genericName,
            isPrimary: false
          });
        }
      }
    }
  }

  const filteredBatches = allBatches.filter(b => 
    b.batchNo.toLowerCase().includes(filterSearch.toLowerCase()) ||
    b.brandName.toLowerCase().includes(filterSearch.toLowerCase()) ||
    b.genericName.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const handleSubmitBatch = async (e) => {
    e.preventDefault();
    if (!selectedMedId || !batchNo.trim() || !expDate.trim()) {
      setFeedback({ type: 'error', message: 'Please select a medicine, enter batch number and expiry date.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      await onRegisterBatch(selectedMedId, {
        batchNo: batchNo.trim().toUpperCase(),
        mfgDate,
        expDate,
        mfgLicenceNo,
        status
      });

      setFeedback({
        type: 'success',
        message: `Batch "${batchNo.toUpperCase()}" registered successfully! It is now instantly verifiable on the Verify Batch page.`
      });
      setBatchNo('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to register batch' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Registration Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Layers size={22} className="text-[#0B4F9C]" />
          <h2 className="text-xl font-extrabold text-slate-900">Register New Medicine Batch</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Add newly manufactured batches to existing medicines. Adding a batch immediately makes it searchable and verifiable by patients.
        </p>

        {feedback && (
          <div className={`p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBatch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Medicine Monograph <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E9E8F] cursor-pointer"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} ({m.genericName} • {m.strength})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Batch Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
              placeholder="e.g. BATCH-2025-01"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E9E8F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mfg. Date (MM/YYYY)
            </label>
            <input
              type="text"
              value={mfgDate}
              onChange={(e) => setMfgDate(e.target.value)}
              placeholder="01/2025"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E9E8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expiry Date (MM/YYYY) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              placeholder="12/2027"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E9E8F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Manufacturing Licence No.
            </label>
            <input
              type="text"
              value={mfgLicenceNo}
              onChange={(e) => setMfgLicenceNo(e.target.value)}
              placeholder="e.g. 25/MD/2024"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E9E8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Batch Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E9E8F] cursor-pointer"
            >
              <option value="Active">Active (Safe)</option>
              <option value="Quarantined">Quarantined (Hold)</option>
              <option value="Recalled">Recalled (Hazard)</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0B4F9C] hover:bg-blue-800 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Batch to Database'}
            </button>
          </div>
        </form>
      </div>

      {/* Batches Table */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Registered Batches Inventory ({filteredBatches.length})
            </h3>
            <p className="text-xs text-slate-500">All registered manufacturing lot numbers</p>
          </div>
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Filter batch or medicine..."
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1E9E8F] focus:outline-none w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-max text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-bold">Batch No</th>
                <th className="p-3 font-bold">Medicine</th>
                <th className="p-3 font-bold">Mfg Date</th>
                <th className="p-3 font-bold">Expiry Date</th>
                <th className="p-3 font-bold">Licence No</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">Verification Test</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {item.batchNo}
                    {item.isPrimary && (
                      <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-800">{item.brandName}</strong>
                    <div className="text-[11px] text-slate-500">{item.genericName}</div>
                  </td>
                  <td className="p-3 text-slate-600">{item.mfgDate || 'N/A'}</td>
                  <td className="p-3 font-medium text-slate-700">{item.expDate}</td>
                  <td className="p-3 font-mono text-slate-500">{item.mfgLicenceNo || 'N/A'}</td>
                  <td className="p-3"><ExpiryBadge expDate={item.expDate} /></td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/verify?batch=${encodeURIComponent(item.batchNo)}`}
                      className="text-xs font-bold text-[#1E9E8F] hover:underline"
                    >
                      Verify →
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">
                    No batches match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-TAB 4: PRINTABLE QR LABELS
// =========================================================================

const QRLabelsTab = ({ medicines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [useNetworkIp, setUseNetworkIp] = useState(false);
  
  const baseUrl = useNetworkIp 
    ? 'http://10.144.165.91:5173' 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://shipment-fairy-minolta-stuart.trycloudflare.com'
        : window.location.origin);

  const filtered = medicines.filter(med => 
    (med.brandName && med.brandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (med.genericName && med.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (med.batchNo && med.batchNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadSingleQR = async (med) => {
    try {
      const url = `${baseUrl}/medicine/${med.id}`;
      const dataUrl = await generateQRDataURL(url, { width: 600 });
      downloadQR(dataUrl, `${med.brandName}_Batch_${med.batchNo}_QR`);
    } catch (e) {
      console.error('Error downloading QR:', e);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Printable QR Labels Sheet ({filtered.length})</h2>
          <p className="text-xs text-slate-500 mt-0.5">High-contrast QR codes encoded for packaging strip labels & camera scanning</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <input
            type="text"
            placeholder="Filter QR labels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#1E9E8F] focus:outline-none"
          />
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-[#0B4F9C] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#093d7a] cursor-pointer shadow-sm"
          >
            <Printer size={16} /> Print Sheet (A4)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {filtered.map(med => (
          <div key={med.id} className="relative group">
            <QRCodeCard 
              url={`${baseUrl}/medicine/${med.id}`}
              medicineName={med.brandName}
              strength={med.strength}
              batchNo={med.batchNo}
            />
            <div className="mt-2 flex justify-center print:hidden">
              <button
                type="button"
                onClick={() => handleDownloadSingleQR(med)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B4F9C] hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          No QR labels found matching your filter.
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:grid-cols-2 { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:grid-cols-2 * { visibility: visible; }
        }
      `}</style>
    </div>
  );
};

// =========================================================================
// SUB-TAB 5: VERIFICATION AUDIT HISTORY (REQUIREMENT 5)
// =========================================================================

const VerificationHistoryTab = () => {
  const [history, setHistory] = useState(() => getVerificationHistory());
  const [filter, setFilter] = useState('');

  const refreshHistory = () => {
    setHistory(getVerificationHistory());
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all verification audit history logs?")) {
      localStorage.removeItem('medqr_verification_history');
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => 
    String(item.batchNo).toLowerCase().includes(filter.toLowerCase()) ||
    String(item.medicineName).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History size={22} className="text-[#0B4F9C]" />
            <h2 className="text-xl font-bold text-slate-800">Verification Audit History</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of medicine batch verification checks performed across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter audit log..."
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1E9E8F] focus:outline-none"
          />
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            Clear Log
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse min-w-max text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <th className="p-3 font-bold">Reference ID</th>
              <th className="p-3 font-bold">Timestamp</th>
              <th className="p-3 font-bold">Batch Queried</th>
              <th className="p-3 font-bold">Matched Medicine</th>
              <th className="p-3 font-bold">Status Code</th>
              <th className="p-3 font-bold">Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-slate-500">{item.id}</td>
                <td className="p-3 text-slate-600">
                  {new Date(item.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="p-3 font-mono font-bold text-slate-900">{item.batchNo}</td>
                <td className="p-3 font-semibold text-slate-800">{item.medicineName}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    item.statusCode === 'A' ? 'bg-emerald-100 text-emerald-800' :
                    item.statusCode === 'B' ? 'bg-red-100 text-red-800' :
                    item.statusCode === 'C' ? 'bg-rose-600 text-white' :
                    item.statusCode === 'D' ? 'bg-amber-100 text-amber-900' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    Status {item.statusCode}
                  </span>
                </td>
                <td className="p-3 font-medium text-slate-700">
                  {item.title || item.status}
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">
                  No verification audit records found. Test a batch on the Verify page to see logs appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-TAB 6: IMPORT / EXPORT CSV
// =========================================================================

const ImportExportTab = ({ medicines, onImportMedicine }) => {
  const [importStatus, setImportStatus] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const parsed = parseCSV(text);

        if (!Array.isArray(parsed) || parsed.length === 0) {
          setImportStatus({ type: 'error', message: 'No valid rows found in CSV file.' });
          setImporting(false);
          return;
        }

        let importedCount = 0;
        for (const row of parsed) {
          if (row.brandName && row.genericName) {
            await onImportMedicine(row);
            importedCount++;
          }
        }

        setImportStatus({
          type: 'success',
          message: `Successfully imported and registered ${importedCount} medicine records into database!`
        });
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus({ type: 'error', message: err.message || 'Failed to parse CSV file' });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {importStatus && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {importStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-blue-100 text-[#0B4F9C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <FileDown size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Export Medicine Database</h3>
        <p className="text-slate-600 text-xs mb-6 max-w-md mx-auto">
          Download your complete medicine monograph catalog, batch numbers, and expiry records as a standard CSV file for local backups or reporting.
        </p>
        <button 
          onClick={() => exportToCSV(medicines, 'MedQR_Medicines_Catalog.csv')} 
          className="bg-white border-2 border-[#0B4F9C] text-[#0B4F9C] hover:bg-blue-50 px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs"
        >
          Download CSV Catalog ({medicines.length} Medicines)
        </button>
      </div>

      {/* Real Import Section */}
      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 border-dashed text-center">
        <div className="w-16 h-16 bg-teal-100 text-[#1E9E8F] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Import Medicines from CSV</h3>
        <p className="text-slate-600 text-xs mb-6 max-w-md mx-auto">
          Upload a structured CSV file with medicine headers (brandName, genericName, strength, dosageForm, batchNo, expDate) to register multiple records automatically.
        </p>
        
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />
        
        <button 
          type="button"
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#1E9E8F] hover:bg-[#147a6e] text-white px-8 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          {importing ? 'Processing & Importing CSV...' : 'Select CSV File to Import'}
        </button>
        <p className="text-[11px] text-slate-400 mt-4">
          All imported records are automatically validated and assigned digital QR endpoints.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
