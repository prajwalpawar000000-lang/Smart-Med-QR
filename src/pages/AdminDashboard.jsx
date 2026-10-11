import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Edit2, Trash2, Search, FileDown, Upload, Printer, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import ExpiryBadge from '../components/ExpiryBadge';
import QRCodeCard from '../components/QRCodeCard';
import { useMedicines } from '../hooks/useMedicines';
import { useAuth } from '../hooks/useAuth';
import { exportToCSV, parseCSV } from '../utils/csvUtils';
import { validateMedicineData } from '../utils/sanitize';

const InputField = ({ label, name, value, onChange, error, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
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

const SelectField = ({ label, name, value, onChange, error, options = [] }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
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
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useMedicines();
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B4F9C]">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage medicine records, print batch QR labels, and verify inventory</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {[
            { id: 'list', label: '📋 Medicine List' },
            { id: 'add', label: editingMedicine ? '✏️ Edit Medicine' : '➕ Add Medicine' },
            { id: 'labels', label: '🏷️ QR Label Sheet' },
            { id: 'import', label: '💾 Import / Export' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id !== 'add') setEditingMedicine(null);
                setActiveTab(tab.id);
              }}
              className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors text-sm ${
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
          {activeTab === 'list' && (
            <MedicineListTab 
              medicines={medicines} 
              onDelete={deleteMedicine} 
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
          {activeTab === 'labels' && <QRLabelsTab medicines={medicines} />}
          {activeTab === 'import' && <ImportExportTab medicines={medicines} />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// --- SUB-COMPONENTS FOR TABS ---

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
          <SearchBar onSearch={setSearchTerm} placeholder="Search medicines or batches..." />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm text-slate-500 font-medium">
            Total: {filtered.length} medicines
          </span>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-[#1E9E8F] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#147a6e] transition-colors shadow-sm"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-sm">
              <th className="p-4 font-semibold">Sr.No</th>
              <th className="p-4 font-semibold">Brand / Generic</th>
              <th className="p-4 font-semibold">Batch</th>
              <th className="p-4 font-semibold">Expiry</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((med, index) => (
              <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                <td className="p-4 text-slate-500">{(page - 1) * itemsPerPage + index + 1}</td>
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{med.brandName}</div>
                  <div className="text-xs text-slate-500">{med.genericName} • {med.strength}</div>
                </td>
                <td className="p-4 text-slate-600 font-mono text-xs">{med.batchNo}</td>
                <td className="p-4 text-slate-600">{med.expDate}</td>
                <td className="p-4"><ExpiryBadge expDate={med.expDate} /></td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => onEdit(med)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold" 
                    title="Edit Medicine"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${med.brandName}?`)) {
                        onDelete(med.id);
                      }
                    }} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold" 
                    title="Delete"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">No medicines found matching search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({length: totalPages}).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg font-medium text-sm ${page === i + 1 ? 'bg-[#0B4F9C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddEditMedicineTab = ({ onSave, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    genericName: initialData?.genericName || '',
    brandName: initialData?.brandName || '',
    strength: initialData?.strength || '',
    dosageForm: initialData?.dosageForm || '',
    route: initialData?.route || '',
    useIndication: initialData?.useIndication || '',
    dose: initialData?.dose || '',
    directionForUse: initialData?.directionForUse || '',
    manufacturer: initialData?.manufacturer || '',
    batchNo: initialData?.batchNo || '',
    mfgDate: initialData?.mfgDate || '',
    expDate: initialData?.expDate || '',
    mfgLicenceNo: initialData?.mfgLicenceNo || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
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
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? `Edit Record: ${initialData.brandName}` : 'Add New Medicine Record'}
          </h2>
          <p className="text-xs text-slate-500">All fields are verified and formatted for digital QR labeling</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center font-medium text-sm flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Medicine saved and updated successfully!
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Brand Name" name="brandName" value={formData.brandName} onChange={handleChange} error={errors.brandName} placeholder="e.g. Crocin" />
        <InputField label="Generic Name" name="genericName" value={formData.genericName} onChange={handleChange} error={errors.genericName} placeholder="e.g. Paracetamol" />
        <InputField label="Strength (e.g., 500 mg, 1% w/w)" name="strength" value={formData.strength} onChange={handleChange} error={errors.strength} placeholder="e.g. 500 mg, 20 mg, 1% w/w" />
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
        />
        <InputField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} error={errors.manufacturer} placeholder="e.g. GlaxoSmithKline Ltd." />
        <InputField label="Batch Number" name="batchNo" value={formData.batchNo} onChange={handleChange} error={errors.batchNo} placeholder="e.g. PA24567" />
        <InputField label="Mfg. Licence No" name="mfgLicenceNo" value={formData.mfgLicenceNo} onChange={handleChange} error={errors.mfgLicenceNo} placeholder="e.g. 25/MD/2014" />
        <InputField label="Mfg. Date (MM/YYYY)" name="mfgDate" value={formData.mfgDate} onChange={handleChange} error={errors.mfgDate} placeholder="04/2025" />
        <InputField label="Expiry Date (MM/YYYY)" name="expDate" value={formData.expDate} onChange={handleChange} error={errors.expDate} placeholder="04/2027" />
      </div>

      <div className="space-y-4">
        <TextAreaField label="Indications / Uses" name="useIndication" value={formData.useIndication} onChange={handleChange} error={errors.useIndication} placeholder="e.g. Fever, Pain relief" />
        <TextAreaField label="Dose" name="dose" value={formData.dose} onChange={handleChange} error={errors.dose} placeholder="e.g. 1 tablet, 3-4 times a day" />
        <TextAreaField label="Directions for Use" name="directionForUse" value={formData.directionForUse} onChange={handleChange} error={errors.directionForUse} placeholder="e.g. After food / with water" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="bg-[#1E9E8F] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-[#147a6e] transition-colors shadow-md"
        >
          {initialData ? 'Update Medicine' : 'Save Medicine'}
        </button>
      </div>
    </form>
  );
};

const QRLabelsTab = ({ medicines }) => {
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Printable QR Labels ({filtered.length})</h2>
          <p className="text-xs text-slate-500 mt-0.5">High-resolution QR codes encoded for packaging labels & camera scanning</p>
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
            className="flex items-center gap-2 bg-[#0B4F9C] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#093d7a] cursor-pointer"
          >
            <Printer size={16} /> Print Sheet (A4)
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
        {filtered.map(med => (
          <QRCodeCard 
            key={med.id} 
            url={`${baseUrl}/medicine/${med.id}`}
            medicineName={med.brandName}
            strength={med.strength}
            batchNo={med.batchNo}
          />
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

const ImportExportTab = ({ medicines }) => {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-12">
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileDown size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Export Data</h3>
        <p className="text-slate-600 mb-6">Download your medicine database as a CSV file for backup or analysis.</p>
        <button onClick={() => exportToCSV(medicines, 'medicines_export.csv')} className="bg-white border-2 border-[#0B4F9C] text-[#0B4F9C] px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
          Download CSV
        </button>
      </div>

      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 border-dashed text-center">
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Import Data</h3>
        <p className="text-slate-600 mb-6">Upload a CSV file to add multiple medicines at once.</p>
        <div className="relative">
          <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <button className="bg-[#1E9E8F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#147a6e] transition-colors pointer-events-none">
            Select CSV File
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4">For demo purposes, import functionality is visually simulated.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
