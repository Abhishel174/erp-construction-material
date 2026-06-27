import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    driverName: '',
    phoneNumber: '',
    address: '',
    citizenshipNumber: '',
    licenseNumber: '',
    joiningDate: '',
    status: 'active',
    notes: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

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
        await api.put(`/drivers/${editingId}`, formData);
        addToast('Driver updated successfully', 'success');
      } else {
        await api.post('/drivers', formData);
        addToast('Driver created successfully', 'success');
      }
      fetchDrivers();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        driverName: '',
        phoneNumber: '',
        address: '',
        citizenshipNumber: '',
        licenseNumber: '',
        joiningDate: '',
        status: 'active',
        notes: ''
      });
    } catch (error) {
      addToast(error.response?.data?.message || 'Error saving driver', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/drivers/${id}`);
        addToast('Driver deleted successfully', 'success');
        fetchDrivers();
      } catch (error) {
        addToast('Failed to delete driver', 'error');
      }
    }
  };

  const handleEdit = (driver) => {
    setFormData(driver);
    setEditingId(driver.id);
    setShowForm(true);
  };

  const filteredDrivers = drivers.filter(d =>
    d.driverName.toLowerCase().includes(search.toLowerCase()) ||
    d.phoneNumber.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Drivers</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              driverName: '',
              phoneNumber: '',
              address: '',
              citizenshipNumber: '',
              licenseNumber: '',
              joiningDate: '',
              status: 'active',
              notes: ''
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Add Driver</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Driver Name"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Citizenship Number"
              value={formData.citizenshipNumber}
              onChange={(e) => setFormData({ ...formData, citizenshipNumber: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="License Number"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="Joining Date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
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

      <div className="grid gap-4">
        {filteredDrivers.map(driver => (
          <div key={driver.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{driver.driverName}</h3>
              <p className="text-gray-600">{driver.phoneNumber}</p>
              <p className="text-sm text-gray-500">{driver.address}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {driver.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(driver)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(driver.id)}
                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Drivers;
