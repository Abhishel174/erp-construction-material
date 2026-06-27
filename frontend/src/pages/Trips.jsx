import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { formatDate, formatCurrency } from '../utils/helpers';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: '',
    from: '',
    to: '',
    material: '',
    wage: '',
    remarks: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data.data);
    } catch (error) {
      addToast('Failed to fetch trips', 'error');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data);
    } catch (error) {
      addToast('Failed to fetch vehicles', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/trips/${editingId}`, formData);
        addToast('Trip updated successfully', 'success');
      } else {
        await api.post('/trips', formData);
        addToast('Trip created successfully', 'success');
      }
      fetchTrips();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        vehicleId: '',
        date: '',
        from: '',
        to: '',
        material: '',
        wage: '',
        remarks: ''
      });
    } catch (error) {
      addToast(error.response?.data?.message || 'Error saving trip', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/trips/${id}`);
        addToast('Trip deleted successfully', 'success');
        fetchTrips();
      } catch (error) {
        addToast('Failed to delete trip', 'error');
      }
    }
  };

  const handleEdit = (trip) => {
    setFormData(trip);
    setEditingId(trip.id);
    setShowForm(true);
  };

  const filteredTrips = trips.filter(t => {
    const matchesVehicle = !vehicleFilter || t.vehicleId === parseInt(vehicleFilter);
    const matchesSearch = t.material.toLowerCase().includes(search.toLowerCase()) ||
                         t.from.toLowerCase().includes(search.toLowerCase()) ||
                         t.to.toLowerCase().includes(search.toLowerCase());
    return matchesVehicle && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Trips</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              vehicleId: '',
              date: '',
              from: '',
              to: '',
              material: '',
              wage: '',
              remarks: ''
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Add Trip</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Vehicles</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.vehicleNumber}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicleNumber}</option>
              ))}
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="From"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="To"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Material"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Wage"
              value={formData.wage}
              onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
              required
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <th className="px-6 py-3 text-left">Vehicle</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">From</th>
              <th className="px-6 py-3 text-left">To</th>
              <th className="px-6 py-3 text-left">Material</th>
              <th className="px-6 py-3 text-right">Wage</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => (
              <tr key={trip.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{trip.Vehicle?.vehicleNumber}</td>
                <td className="px-6 py-3">{formatDate(trip.date)}</td>
                <td className="px-6 py-3">{trip.from}</td>
                <td className="px-6 py-3">{trip.to}</td>
                <td className="px-6 py-3">{trip.material}</td>
                <td className="px-6 py-3 text-right font-bold">{formatCurrency(trip.wage)}</td>
                <td className="px-6 py-3 text-center flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
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

export default Trips;
