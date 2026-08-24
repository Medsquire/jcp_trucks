import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const AttendanceList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const query = user.roleId === 2 ? `?supervisorPhone=${user.phone}` : '';
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
  }, [user.roleId, user.phone]);

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-jcb-yellow" size={48} /></div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Attendance List</h2>
      <div className="space-y-4">
        {records.map((r, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-bold">{r.phone}</span>
              <span className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">Check In</p>
                <p className="text-sm">{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '--:--'}</p>
                <div className="flex gap-2 mt-1">
                  {r.checkInImages?.dash && (
                    <img src={r.checkInImages.dash} alt="Dash" className="w-1/2 h-20 object-cover rounded" />
                  )}
                  {r.checkInImages?.person && (
                    <img src={r.checkInImages.person} alt="Check In" className="w-1/2 h-20 object-cover rounded" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Check Out</p>
                <p className="text-sm">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '--:--'}</p>
                <div className="flex gap-2 mt-1">
                  {r.checkOutImages?.dash && (
                    <img src={r.checkOutImages.dash} alt="Dash" className="w-1/2 h-20 object-cover rounded" />
                  )}
                  {r.checkOutImages?.person && (
                    <img src={r.checkOutImages.person} alt="Check Out" className="w-1/2 h-20 object-cover rounded" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && <p className="text-center text-gray-500">No attendance records found.</p>}
      </div>
    </div>
  );
};

export default AttendanceList;
