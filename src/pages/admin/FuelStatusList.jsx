import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const FuelStatusList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFuel = async () => {
      try {
        const query = user.roleId === 2 ? `?supervisorPhone=${user.phone}` : '';
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
  }, [user.roleId, user.phone]);

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-jcb-yellow" size={48} /></div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Fuel Logs</h2>
      <div className="space-y-4">
        {records.map((r, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-bold">{r.phone}</span>
              <span className="text-sm text-gray-500">{new Date(r.timestamp || r.createdAt).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Inread Meter</p>
                {r.initialPhoto ? (
                  <img src={r.initialPhoto} alt="Inread" className="w-full h-24 object-cover rounded" />
                ) : <span className="text-sm text-gray-400">N/A</span>}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Fullread Meter</p>
                {r.finalPhoto ? (
                  <img src={r.finalPhoto} alt="Fullread" className="w-full h-24 object-cover rounded" />
                ) : <span className="text-sm text-gray-400">N/A</span>}
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && <p className="text-center text-gray-500">No fuel records found.</p>}
      </div>
    </div>
  );
};

export default FuelStatusList;
