import React, { useState, useEffect } from 'react';
import CameraCapture from '../components/CameraCapture';
import { uploadToImgbb } from '../utils/imgbb';
import { Loader2, Droplet, Camera } from 'lucide-react';

const Fuel = () => {
  const [fuelData, setFuelData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [step, setStep] = useState(1);
  const [cameraState, setCameraState] = useState({ isOpen: false, type: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // We only fetch the latest fuel record if it's incomplete for today
    if (user?.phone) {
      fetch(`/api/fuel?phone=${user.phone}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const latest = data[0];
            // If it's today and finalPhoto is missing, continue flow
            const isToday = new Date(latest.createdAt).toDateString() === new Date().toDateString();
            if (isToday && !latest.finalPhoto) {
              setFuelData(latest);
              setStep(2);
            }
          }
        })
        .catch(console.error);
    }
  }, [user?.phone]);

  const handleCapture = async (imageSrc) => {
    setCameraState({ isOpen: false, type: '' });
    setIsProcessing(true);
    
    try {
      const getPosition = () => new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => resolve(null),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      const [url, location] = await Promise.all([
        uploadToImgbb(imageSrc),
        getPosition()
      ]);
      
      if (cameraState.type === 'initial') {
        const payload = {
          phone: user.phone,
          initialPhoto: url,
          location: location
        };
        const res = await fetch('/api/fuel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Failed to save to database');
        
        const saved = await res.json();
        setFuelData(saved);
        setStep(2);
        alert('Inread photo saved successfully!');
      } else if (cameraState.type === 'final') {
        const payload = {
          phone: user.phone,
          initialPhoto: fuelData.initialPhoto,
          finalPhoto: url,
          location: location
        };
        const res = await fetch('/api/fuel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('Failed to save to database');
        
        const saved = await res.json();
        setFuelData(saved);
        setStep(3);
        alert('Fullread photo saved successfully!');
      }
    } catch (err) {
      alert("Error: Please try again. Failed to save data to database.");
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="w-16 h-16 bg-jcb-yellow rounded-full flex items-center justify-center mb-4 shadow-md">
        <Droplet size={32} className="text-jcb-black" />
      </div>
      <h2 className="text-xl font-bold mb-6 text-gray-800">Fuel Photo Log</h2>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center flex-col text-white">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p>Uploading Photo...</p>
        </div>
      )}

      {cameraState.isOpen && (
        <CameraCapture 
          onCapture={handleCapture}
          onCancel={() => setCameraState({ isOpen: false, type: '' })}
          facingMode="environment"
          overlayText={cameraState.type === 'initial' ? 'Inread Fuel Meter' : 'Fullread Fuel Meter'}
        />
      )}

      <div className="w-full max-w-md space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-700 mb-2">1. Inread Fuel Meter</h3>
          {!fuelData?.initialPhoto ? (
            <button 
              onClick={() => setCameraState({ isOpen: true, type: 'initial' })}
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-md flex items-center justify-center space-x-2 shadow active:scale-95 transition"
            >
              <Camera size={24} />
              <span>Capture Inread Meter</span>
            </button>
          ) : (
            <div>
              <img src={fuelData.initialPhoto} alt="Inread Meter" className="w-full h-48 object-cover rounded-md border" />
              <div className="mt-2 bg-green-100 text-green-800 p-2 rounded text-sm text-center font-bold">✓ Inread Photo Saved</div>
            </div>
          )}
        </div>

        {step >= 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-700 mb-2">2. Fullread Fuel Meter</h3>
            {!fuelData?.finalPhoto ? (
              <button 
                onClick={() => setCameraState({ isOpen: true, type: 'final' })}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-md flex items-center justify-center space-x-2 shadow active:scale-95 transition"
              >
                <Camera size={24} />
                <span>Capture Fullread Meter</span>
              </button>
            ) : (
              <div>
                <img src={fuelData.finalPhoto} alt="Fullread Meter" className="w-full h-48 object-cover rounded-md border" />
                <div className="mt-2 bg-green-100 text-green-800 p-2 rounded text-sm text-center font-bold">✓ Fullread Photo Saved</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fuel;
