import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const AttendanceList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Date picker state, defaults to today
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Image modal state
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        let query = `?dateString=${selectedDate}`;
        if (user.roleId === 2) {
          query += `&supervisorPhone=${user.phone}`;
        }
        const res = await fetch('/api/attendance' + query);
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user.roleId, user.phone, selectedDate]);

  const format12Hr = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDuration = (start, end) => {
    if (!start) return '--';
    const endTime = end ? new Date(end) : new Date();
    const diff = endTime - new Date(start);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Attendance List</h2>
      
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
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 w-full bg-gray-100 rounded mt-3 mb-3"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
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
                  {r.sitename && <span className="text-xs text-blue-600 font-bold block mt-1">📍 {r.sitename}</span>}
                </div>
              </div>
              
              <div className="flex justify-between mt-3 bg-gray-50 p-2 rounded">
                <span className="text-sm font-bold text-gray-700">Duration:</span>
                <span className="text-sm font-black text-jcb-yellow">{getDuration(r.checkInTime, r.checkOutTime)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Check In</p>
                  <p className="text-md font-bold">{format12Hr(r.checkInTime)}</p>
                  {r.checkInLocation && (
                    <p className="text-[10px] text-gray-400">Lat: {r.checkInLocation.lat.toFixed(4)}<br/>Lng: {r.checkInLocation.lng.toFixed(4)}</p>
                  )}
                  
                  <div className="mt-2 space-y-2">
                    {r.checkInImages?.dash && (
                      <button onClick={() => setModalImage(r.checkInImages.dash)} className="w-full text-xs bg-blue-100 text-blue-800 py-1 rounded font-bold">View Dash Image</button>
                    )}
                    {r.checkInImages?.person && (
                      <button onClick={() => setModalImage(r.checkInImages.person)} className="w-full text-xs bg-blue-100 text-blue-800 py-1 rounded font-bold">View User Image</button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Check Out</p>
                  <p className="text-md font-bold">{format12Hr(r.checkOutTime)}</p>
                  {r.checkOutLocation && (
                    <p className="text-[10px] text-gray-400">Lat: {r.checkOutLocation.lat.toFixed(4)}<br/>Lng: {r.checkOutLocation.lng.toFixed(4)}</p>
                  )}
                  
                  <div className="mt-2 space-y-2">
                    {r.checkOutImages?.dash && (
                      <button onClick={() => setModalImage(r.checkOutImages.dash)} className="w-full text-xs bg-blue-100 text-blue-800 py-1 rounded font-bold">View Dash Image</button>
                    )}
                    {r.checkOutImages?.person && (
                      <button onClick={() => setModalImage(r.checkOutImages.person)} className="w-full text-xs bg-blue-100 text-blue-800 py-1 rounded font-bold">View User Image</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {records.length === 0 && <p className="text-center text-gray-500 mt-10">No attendance records found for this date.</p>}
        </div>
      )}

      {/* Image Modal Popup */}
      {modalImage && (
        <div className="fixed inset-0 bg-black/80 z-[300] flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setModalImage(null)} 
            className="absolute top-4 right-4 bg-white text-black rounded-full p-2"
          >
            <X size={24} />
          </button>
          <img src={modalImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded" />
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
