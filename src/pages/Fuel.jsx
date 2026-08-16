import React, { useState } from 'react';
import CameraCapture from '../components/CameraCapture';
import { uploadToImgbb } from '../utils/imgbb';
import { Loader2, Droplet, Camera } from 'lucide-react';

const Fuel = () => {
  const [fuelData, setFuelData] = useState(() => {
    const saved = localStorage.getItem('fuelData');
    return saved ? JSON.parse(saved) : null;
  });

  const [step, setStep] = useState(1); // 1: initial capture, 2: final capture
  const [cameraState, setCameraState] = useState({ isOpen: false, type: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Restore step based on existing data
  React.useEffect(() => {
    if (fuelData?.initialPhoto && fuelData?.finalPhoto) {
      setStep(3); // Completed
    } else if (fuelData?.initialPhoto) {
      setStep(2); // Ready for final
    }
  }, [fuelData]);

  const startInitialCapture = () => {
    setCameraState({ isOpen: true, type: 'initial' });
  };

  const startFinalCapture = () => {
    setCameraState({ isOpen: true, type: 'final' });
  };

  const handleCapture = async (imageSrc) => {
    setCameraState({ isOpen: false, type: '' });
    setIsProcessing(true);
    
    try {
      const url = await uploadToImgbb(imageSrc);
      
      if (cameraState.type === 'initial') {
        const data = {
          initialPhoto: url,
          timestamp: new Date().toISOString()
        };
        setFuelData(data);
        localStorage.setItem('fuelData', JSON.stringify(data));
        setStep(2);
      } else if (cameraState.type === 'final') {
        const data = {
          ...fuelData,
          finalPhoto: url,
        };
        setFuelData(data);
        localStorage.setItem('fuelData', JSON.stringify(data));
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
          overlayText={cameraState.type === 'initial' ? 'Initial Fuel Meter' : 'Filled Fuel Meter'}
        />
      )}

      <div className="w-full max-w-md space-y-6">
        
        {/* Step 1: Initial Fuel Capture */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-700 mb-2">1. Initial Fuel Meter</h3>
          {!fuelData?.initialPhoto ? (
            <button 
              onClick={startInitialCapture}
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-md flex items-center justify-center space-x-2 shadow active:scale-95 transition"
            >
              <Camera size={24} />
              <span>Capture Initial Meter</span>
            </button>
          ) : (
            <div>
              <img src={fuelData.initialPhoto} alt="Initial Meter" className="w-full h-48 object-cover rounded-md border" />
              <div className="mt-2 bg-green-100 text-green-800 p-2 rounded text-sm text-center font-bold">
                ✓ Initial Photo Saved
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Final Fuel Capture */}
        {step >= 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-700 mb-2">2. Final Fuel Meter</h3>
            {!fuelData?.finalPhoto ? (
              <button 
                onClick={startFinalCapture}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-md flex items-center justify-center space-x-2 shadow active:scale-95 transition"
              >
                <Camera size={24} />
                <span>Capture Final Meter</span>
              </button>
            ) : (
              <div>
                <img src={fuelData.finalPhoto} alt="Final Meter" className="w-full h-48 object-cover rounded-md border" />
                <div className="mt-2 bg-green-100 text-green-800 p-2 rounded text-sm text-center font-bold">
                  ✓ Final Photo Saved
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Fuel;
