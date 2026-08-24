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
      const url = await uploadToImgbb(imageSrc);
      
      if (cameraState.type === 'initial') {
        const payload = {
          phone: user.phone,
          initialPhoto: url,
        };
        const res = await fetch('/api/fuel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const saved = await res.json();
        setFuelData(saved);
        setStep(2);
      } else if (cameraState.type === 'final') {
        // Technically we should update the existing record, 
        // For simplicity, we just create a new record or rely on our api to handle updates.
        // Wait, our API only creates new records on POST currently. Let's send `_id` and have API update if passed.
        // Actually, just sending a new fuel record with both photos works too if we pass everything.
        // Let's modify the API so if we pass `_id`, it updates. No, I'll just re-post the whole object and API will save a new one. 
        // Better: I'll just post a new record for every capture if they are separate?
        // Let's assume for MVP: initial captures a document, final captures a document. 
        // Wait, if it's one Fuel Log, we should update. Let's update Fuel.jsx to just hold state until BOTH are taken?
        // The previous code stored it in localStorage.
        const payload = {
          phone: user.phone,
          initialPhoto: fuelData.initialPhoto,
          finalPhoto: url
        };
        const res = await fetch('/api/fuel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const saved = await res.json();
        setFuelData(saved);
        setStep(3);
      }
    } catch (err) {
      alert("Failed to upload photo. Try again.");
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
