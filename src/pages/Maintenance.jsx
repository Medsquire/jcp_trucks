import React, { useState, useEffect } from 'react';
import CameraCapture from '../components/CameraCapture';
import { uploadToImgbb } from '../utils/imgbb';
import { Loader2, Wrench, Camera } from 'lucide-react';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      fetch(`/api/maintenance?phone=${user.phone}`)
        .then(res => res.json())
        .then(setLogs)
        .catch(console.error);
    }
  }, [user?.phone]);

  const handleCapture = async (imageSrc) => {
    setCameraOpen(false);
    setIsProcessing(true);
    
    try {
      const url = await uploadToImgbb(imageSrc);
      
      const payload = {
        phone: user.phone,
        photos: [url],
        status: 'pending'
      };

      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save to database');
      
      const saved = await res.json();
      setLogs([saved, ...logs]);
      
      setDetails('');
      setPhotos([]);
      alert("Maintenance log saved successfully!");
      
    } catch (err) {
      alert("Error: Please try again. Failed to save data to database.");
    }
    
    setIsProcessing(false);
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-md">
        <Wrench size={32} className="text-white" />
      </div>
      <h2 className="text-xl font-bold mb-6 text-gray-800">Maintenance Photos</h2>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center flex-col text-white">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p>Saving Photo...</p>
        </div>
      )}

      {cameraOpen && (
        <CameraCapture 
          onCapture={handleCapture}
          onCancel={() => setCameraOpen(false)}
          facingMode="environment"
          overlayText="Repair Photo"
        />
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6">
        <button 
          onClick={() => setCameraOpen(true)}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-md shadow flex justify-center items-center space-x-2 active:scale-95 transition"
        >
          <Camera size={24} />
          <span>Capture Repair Photo</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <h3 className="font-bold text-gray-700 mb-3">Recent Repairs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center p-4 bg-white rounded-md shadow-sm">No repairs logged yet.</p>
        ) : (
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log._id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 font-bold">{formatDate(log.createdAt || new Date())}</p>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${log.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {log.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                {log.photos && log.photos.length > 0 && (
                   <img src={log.photos[0]} alt="Repair" className="w-full h-48 object-cover rounded-md border" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
