import React, { useState, useEffect } from 'react';
import { Loader2, Users, Clock, Fuel, Wrench, Truck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, attendance: 0, fuel: 0, maintenance: 0, vehicles: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const query = user.roleId === 2 ? `?supervisorPhone=${user.phone}` : '';
        const res = await fetch('/api/summary' + query);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.roleId, user.phone]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full mb-3"></div>
              <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Drivers', count: stats.users, icon: <Users size={32} className="text-blue-500" />, color: 'border-blue-500' },
    { title: 'Total Vehicles', count: stats.vehicles, icon: <Truck size={32} className="text-purple-500" />, color: 'border-purple-500' },
    { title: 'Total Attendance Logs', count: stats.attendance, icon: <Clock size={32} className="text-green-500" />, color: 'border-green-500' },
    { title: 'Total Fuel Logs', count: stats.fuel, icon: <Fuel size={32} className="text-orange-500" />, color: 'border-orange-500' },
    { title: 'Maintenance Logs', count: stats.maintenance, icon: <Wrench size={32} className="text-red-500" />, color: 'border-red-500' },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${card.color} flex flex-col items-center text-center`}>
            <div className="mb-2">{card.icon}</div>
            <p className="text-sm text-gray-500 font-semibold">{card.title}</p>
            <p className="text-3xl font-black text-gray-800 mt-2">{card.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
