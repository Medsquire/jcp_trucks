import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const MaintenanceList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchMaintenance = async () => {
    try {
      const query = user.roleId === 2 ? `?supervisorPhone=${user.phone}` : '';
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
  }, [user.roleId, user.phone]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch('/api/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, status: newStatus })
      });
      // Update local state directly for immediate feedback
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

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-jcb-yellow" size={48} /></div>;

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Maintenance Logs</h2>
      <div className="space-y-4">
        {records.map((r, i) => (
          <div key={r._id || i} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-bold">{r.phone}</span>
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
            <p className="text-sm text-gray-700 mt-2">{r.details || 'No details provided.'}</p>
            {r.photos && r.photos.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {r.photos.map((photo, pIdx) => (
                  <img key={pIdx} src={photo} alt="Maintenance" className="h-20 w-20 object-cover rounded flex-shrink-0" />
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {records.length === 0 && <p className="text-center text-gray-500">No maintenance records found.</p>}
      </div>
    </div>
  );
};

export default MaintenanceList;
