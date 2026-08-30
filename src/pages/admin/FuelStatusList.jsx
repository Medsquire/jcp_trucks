import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const FuelStatusList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchFuel = async () => {
      setLoading(true);
      try {
        let query = `?dateString=${selectedDate}`;
        if (user.roleId === 2) {
          query += `&supervisorPhone=${user.phone}`;
        }
        const res = await fetch('/api/fuel' + query);
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFuel();
  }, [user.roleId, user.phone, selectedDate]);

  const format12Hr = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Fuel Status</h2>
      
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
                <div className="flex flex-col items-end">
                  <div className="h-6 w-20 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((r, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between border-b pb-2 mb-2">
                <div>
                  <span className="font-bold text-lg block">{r.driverName}</span>
                  <span className="text-sm text-gray-500">{r.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded block">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-bold block">{format12Hr(r.createdAt)}</span>
                  {r.sitename && <span className="text-xs text-blue-600 font-bold block mt-1">📍 {r.sitename}</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Inread Meter</p>
                  {r.initialPhoto ? (
                    <button onClick={() => setModalImage(r.initialPhoto)} className="w-full text-xs bg-blue-100 text-blue-800 py-1.5 rounded font-bold">View Inread Photo</button>
                  ) : <span className="text-sm text-gray-400">N/A</span>}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Fullread Meter</p>
                  {r.finalPhoto ? (
                    <button onClick={() => setModalImage(r.finalPhoto)} className="w-full text-xs bg-blue-100 text-blue-800 py-1.5 rounded font-bold">View Fullread Photo</button>
                  ) : <span className="text-sm text-gray-400">N/A</span>}
                </div>
              </div>
              
              {r.location && (
                <div className="mt-3 bg-gray-50 p-2 rounded text-[10px] text-gray-500">
                  GPS: {r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}
                </div>
              )}
            </div>
          ))}
          {records.length === 0 && <p className="text-center text-gray-500 mt-10">No fuel records found for this date.</p>}
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

export default FuelStatusList;
