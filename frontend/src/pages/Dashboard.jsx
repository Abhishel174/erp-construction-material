import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../context/ToastContext';
import { TrendingUp, Truck, Users, MapPin, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    totalTrips: 0,
    totalWages: 0
  });
  const [chartData, setChartData] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [vehicles, drivers, trips] = await Promise.all([
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/trips')
      ]);

      const totalWages = trips.data.data.reduce((sum, trip) => sum + parseFloat(trip.wage), 0);

      setStats({
        totalVehicles: vehicles.data.data.length,
        totalDrivers: drivers.data.data.length,
        totalTrips: trips.data.data.length,
        totalWages
      });

      // Group trips by material
      const materialMap = {};
      trips.data.data.forEach(trip => {
        if (!materialMap[trip.material]) {
          materialMap[trip.material] = { name: trip.material, value: 0 };
        }
        materialMap[trip.material].value += 1;
      });

      setChartData(Object.values(materialMap));
    } catch (error) {
      addToast('Failed to fetch dashboard data', 'error');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-${color}-50 border-l-4 border-${color}-600 p-6 rounded-lg shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`bg-${color}-600 p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Truck} label="Total Vehicles" value={stats.totalVehicles} color="blue" />
        <StatCard icon={Users} label="Total Drivers" value={stats.totalDrivers} color="green" />
        <StatCard icon={MapPin} label="Total Trips" value={stats.totalTrips} color="purple" />
        <StatCard icon={DollarSign} label="Total Wages" value={`Rs. ${stats.totalWages.toFixed(2)}`} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Trips by Material</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <p className="text-gray-600">Dashboard initialized with {stats.totalTrips} trips</p>
            <p className="text-gray-600">System is running smoothly</p>
            <p className="text-gray-600">Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
