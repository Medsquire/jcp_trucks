import React, { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import { uploadToImgbb } from '../utils/imgbb';
import { Loader2, Wrench, Camera } from 'lucide-react';

const Maintenance = () => {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('maintenanceLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [cameraOpen, setCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startCapture = () => {
    setCameraOpen(true);
  };

  const handleCapture = async (imageSrc) => {
    setCameraOpen(false);
    setIsProcessing(true);
    
    try {
      const url = await uploadToImgbb(imageSrc);
      
      const newLog = {
        id: Date.now(),
        photo: url,
        timestamp: new Date().toISOString()
      };
      
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('maintenanceLogs', JSON.stringify(updatedLogs));
    } catch (err) {
      alert("Failed to upload repair photo. Try again.");
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
        <p className="text-gray-600 text-sm mb-4 text-center">Capture a photo of the repair or maintenance work completed.</p>
        
        <button 
          onClick={startCapture}
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
              <div key={log.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <p className="text-xs text-gray-500 mb-2 font-bold">{formatDate(log.timestamp)}</p>
                <img src={log.photo} alt="Repair" className="w-full h-48 object-cover rounded-md border" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
