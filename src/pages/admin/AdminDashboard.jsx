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
        const [users, attendance, fuel, maintenance, vehicles] = await Promise.all([
          fetch('/api/users').then(res => res.json()),
          fetch('/api/attendance' + query).then(res => res.json()),
          fetch('/api/fuel' + query).then(res => res.json()),
          fetch('/api/maintenance' + query).then(res => res.json()),
          fetch('/api/vehicles').then(res => res.json()),
        ]);

        let filteredUsers = users;
        if (user.roleId === 2) {
          filteredUsers = users.filter(u => u.supervisorPhone === user.phone);
        }

        setStats({
          users: filteredUsers.length,
          attendance: attendance.length,
          fuel: fuel.length,
          maintenance: maintenance.length,
          vehicles: vehicles.length
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.roleId, user.phone]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-jcb-yellow" size={48} /></div>;
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
