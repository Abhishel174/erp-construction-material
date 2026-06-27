import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/helpers';

const Advances = () => {
  const [advances, setAdvances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    driverId: '',
    advanceAmount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    remarks: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchAdvances();
    fetchDrivers();
  }, []);

  const fetchAdvances = async () => {
    try {
      const response = await api.get('/advances');
      setAdvances(response.data.data);
    } catch (error) {
      addToast('Failed to fetch advances', 'error');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.data);
    } catch (error) {
      addToast('Failed to fetch drivers', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/advances/${editingId}`, formData);
        addToast('Advance updated successfully', 'success');
      } else {
        await api.post('/advances', formData);
        addToast('Advance created successfully', 'success');
      }
      fetchAdvances();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        driverId: '',
        advanceAmount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        remarks: ''
      });
    } catch (error) {
      addToast(error.response?.data?.message || 'Error saving advance', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/advances/${id}`);
        addToast('Advance deleted successfully', 'success');
        fetchAdvances();
      } catch (error) {
        addToast('Failed to delete advance', 'error');
      }
    }
  };

  const handleEdit = (advance) => {
    setFormData(advance);
    setEditingId(advance.id);
    setShowForm(true);
  };

  const filteredAdvances = advances.filter(a =>
    a.Driver?.driverName.toLowerCase().includes(search.toLowerCase()) ||
    a.Driver?.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Driver Advances</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              driverId: '',
              advanceAmount: '',
              date: new Date().toISOString().split('T')[0],
              status: 'pending',
              remarks: ''
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Add Advance</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search advances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.driverName}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Advance Amount"
              value={formData.advanceAmount}
              onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="settled">Settled</option>
            </select>
          </div>
          <textarea
            placeholder="Remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Driver Name</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvances.map(advance => (
              <tr key={advance.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{advance.Driver?.driverName}</td>
                <td className="px-6 py-3">{advance.Driver?.phoneNumber}</td>
                <td className="px-6 py-3 text-right font-bold">{formatCurrency(advance.advanceAmount)}</td>
                <td className="px-6 py-3">{formatDate(advance.date)}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`px-3 py-1 rounded text-sm ${
                    advance.status === 'settled' ? 'bg-green-100 text-green-800' :
                    advance.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {advance.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-center flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(advance)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(advance.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Advances;
