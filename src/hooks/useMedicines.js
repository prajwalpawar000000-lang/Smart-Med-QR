import { useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

export function useMedicines() {
  const [medicines, setMedicines] = useState(() => api.getInitialMedicines());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(api.isUsingMockData);

  const fetchAll = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await api.fetchMedicines();
      if (Array.isArray(data) && data.length > 0) {
        setMedicines(data);
      }
      setIsUsingMockData(api.isUsingMockData);
    } catch (err) {
      setError(err.message || 'Failed to fetch medicines');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  const addMedicine = async (data) => {
    setLoading(true);
    try {
      const added = await api.addMedicine(data);
      setMedicines(prev => [...prev, added]);
      setIsUsingMockData(api.isUsingMockData);
      return added;
    } catch (err) {
      setError(err.message || 'Failed to add medicine');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMedicine = async (id, data) => {
    setLoading(true);
    try {
      const updated = await api.updateMedicine(id, data);
      setMedicines(prev => prev.map(m => m.id === Number(id) ? updated : m));
      setIsUsingMockData(api.isUsingMockData);
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update medicine');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (id) => {
    setLoading(true);
    try {
      await api.deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m.id !== Number(id)));
      setIsUsingMockData(api.isUsingMockData);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete medicine');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchMedicines = (query) => {
    if (!query) return medicines;
    const lowerQuery = query.toLowerCase();
    return medicines.filter(m => 
      m.genericName.toLowerCase().includes(lowerQuery) || 
      m.brandName.toLowerCase().includes(lowerQuery)
    );
  };

  const verifyBatch = async (batchNo) => {
    return await api.verifyBatch(batchNo);
  };

  return {
    medicines,
    loading,
    error,
    isUsingMockData,
    refetch: fetchAll,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    verifyBatch
  };
}
