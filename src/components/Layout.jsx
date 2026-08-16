import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Clock, Fuel, Wrench, LogOut } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-jcb-yellow text-jcb-black p-4 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold font-sans tracking-wide">JCB DRIVER</h1>
        <button onClick={handleLogout} className="p-2">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-10">
        <NavLink 
          to="/home" 
          className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-jcb-yellow' : 'text-gray-500'}`}
        >
          <Clock size={24} />
          <span className="text-xs mt-1">Attendance</span>
        </NavLink>
        <NavLink 
          to="/fuel" 
          className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-jcb-yellow' : 'text-gray-500'}`}
        >
          <Fuel size={24} />
          <span className="text-xs mt-1">Fuel</span>
        </NavLink>
        <NavLink 
          to="/maintenance" 
          className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-jcb-yellow' : 'text-gray-500'}`}
        >
          <Wrench size={24} />
          <span className="text-xs mt-1">Maintenance</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
