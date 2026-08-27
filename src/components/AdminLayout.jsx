import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Fuel, Wrench, LogOut, Truck } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { to: "/admin/dashboard", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
    { to: "/admin/users", icon: <Users size={24} />, label: "Users" },
    { to: "/admin/attendance", icon: <Clock size={24} />, label: "Attendance" },
    { to: "/admin/fuel", icon: <Fuel size={24} />, label: "Fuel" },
    { to: "/admin/maintenance", icon: <Wrench size={24} />, label: "Maintenance" },
    { to: "/admin/vehicles", icon: <Truck size={24} />, label: "Vehicles" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-jcb-yellow text-jcb-black p-4 pt-[max(env(safe-area-inset-top),1rem)] flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold font-sans tracking-wide">
          {user?.roleId === 1 ? 'ADMIN PORTAL' : 'SUPERVISOR PORTAL'}
        </h1>
        <button onClick={handleLogout} className="p-2">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] z-10 overflow-x-auto">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => `flex flex-col items-center flex-shrink-0 px-2 ${isActive ? 'text-jcb-yellow' : 'text-gray-500'}`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
