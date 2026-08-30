import React, { useState, useEffect } from 'react';
import { Loader2, Plus, X } from 'lucide-react';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleName: '',
    vehicleNumber: '',
    siteid: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehRes, siteRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/sites')
      ]);
      const vehData = await vehRes.json();
      const siteData = await siteRes.json();
      setVehicles(vehData);
      setSites(siteData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find sitename for the selected siteid
      const selectedSite = sites.find(s => s.siteid === formData.siteid);
      
      const payload = {
        ...formData,
        sitename: selectedSite ? selectedSite.sitename : ''
      };

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to create vehicle');
      
      const newVehicle = await res.json();
      setVehicles([newVehicle, ...vehicles]);
      setShowModal(false);
      setFormData({ vehicleName: '', vehicleNumber: '', siteid: '' });
      alert("Vehicle added successfully!");
    } catch (err) {
      alert("Error adding vehicle. Please check if vehicle number is unique and try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-24">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse flex flex-col space-y-3">
              <div className="flex justify-between">
                <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-1/3 bg-gray-200 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vehicles</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-jcb-yellow text-jcb-black font-bold py-2 px-4 rounded shadow flex items-center space-x-1"
        >
          <Plus size={20} />
          <span>Add</span>
        </button>
      </div>

      <div className="space-y-4">
        {vehicles.map((v) => (
          <div key={v._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-bold text-lg">{v.vehicleName}</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-bold border border-gray-300">{v.vehicleNumber}</span>
            </div>
            {v.sitename ? (
              <p className="text-sm text-gray-600 mt-2 font-semibold">📍 {v.sitename} <span className="text-xs text-gray-400">({v.siteid})</span></p>
            ) : (
              <p className="text-sm text-gray-400 mt-2 italic">Unassigned</p>
            )}
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-center text-gray-500 mt-10">No vehicles found.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Add New Vehicle</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Name</label>
                <input 
                  type="text"
                  required
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-jcb-yellow"
                  placeholder="e.g. JCB Backhoe 3DX"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Number</label>
                <input 
                  type="text"
                  required
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-jcb-yellow font-mono uppercase"
                  placeholder="e.g. TS09 XY 1234"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assign to Site</label>
                <select
                  required
                  value={formData.siteid}
                  onChange={(e) => setFormData({...formData, siteid: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-jcb-yellow bg-white"
                >
                  <option value="" disabled>Select a site</option>
                  {sites.map(s => (
                    <option key={s.siteid} value={s.siteid}>{s.sitename} ({s.siteid})</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded mt-2 shadow active:scale-95 transition"
              >
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
