import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const MaintenanceList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalImage, setModalImage] = useState(null);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      let query = `?dateString=${selectedDate}`;
      if (user.roleId === 2) {
        query += `&supervisorPhone=${user.phone}`;
      }
      const res = await fetch('/api/maintenance' + query);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [user.roleId, user.phone, selectedDate]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status: newStatus })
      });
      setRecords(records.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'onprocess') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const format12Hr = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Maintenance Logs</h2>
      
      <div className="mb-6 bg-white p-3 rounded-lg shadow inline-flex flex-col">
        <label className="text-xs font-bold text-gray-500 mb-1">Select Date</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-jcb-yellow"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="flex justify-between border-b pb-2 mb-2">
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
              <div className="h-10 w-full bg-gray-100 rounded mt-2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r, i) => (
            <div key={r._id || i} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <div>
                  <span className="font-bold text-lg block">{r.driverName}</span>
                  <span className="text-sm text-gray-500">{r.phone}</span>
                </div>
                <select 
                  value={r.status || 'pending'} 
                  onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded font-bold border-none cursor-pointer focus:ring-0 ${getStatusColor(r.status || 'pending')}`}
                >
                  <option value="pending" className="bg-white text-black">PENDING</option>
                  <option value="onprocess" className="bg-white text-black">ON PROCESS</option>
                  <option value="completed" className="bg-white text-black">COMPLETED</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString()} at {format12Hr(r.createdAt)}
                </div>
                {r.sitename && <span className="text-xs text-blue-600 font-bold block">📍 {r.sitename}</span>}
              </div>
              
              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded border border-gray-100">{r.details || 'No details provided.'}</p>
              
              {r.photos && r.photos.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Photos</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {r.photos.map((photo, pIdx) => (
                      <button 
                        key={pIdx} 
                        onClick={() => setModalImage(photo)}
                        className="text-xs bg-blue-100 text-blue-800 py-1.5 px-3 rounded font-bold flex-shrink-0"
                      >
                        View Photo {pIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {r.location && (
                <div className="mt-2 text-[10px] text-gray-400">
                  GPS: {r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}
                </div>
              )}
            </div>
          ))}
          {records.length === 0 && <p className="text-center text-gray-500 mt-10">No maintenance records found for this date.</p>}
        </div>
      )}

      {modalImage && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center p-4">
          <button onClick={() => setModalImage(null)} className="absolute top-4 right-4 bg-white text-black rounded-full p-2">
            <X size={24} />
          </button>
          <img src={modalImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded" />
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
