import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getCurrentLocation } from '../utils/location';

const CameraCapture = ({ onCapture, onCancel, facingMode = 'environment', overlayText = '' }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Request location first
    getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(err => {
        console.error("Location error:", err);
        // We still allow camera even if location fails, just without location text
      });
      
    // Check camera permission manually to show helpful errors
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then((stream) => {
        setHasPermission(true);
        // Stop the stream immediately, let Webcam component handle it
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => {
        console.error("Camera error:", err);
        setError("Camera access denied or not available. Please allow camera permissions in your browser.");
      });
  }, [facingMode]);

  const handleUserMediaError = (err) => {
    setError("Failed to access camera. Make sure permissions are granted and you are on a secure (HTTPS) connection.");
  };

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Failed to take photo. Please try again.");
      return;
    }
    
    // Add timestamp and location overlay
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Overlay setup
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      
      const time = new Date().toLocaleString();
      setTimestamp(time);
      
      const locText = location ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Location not available';
      
      ctx.fillText(time, 10, canvas.height - 70);
      ctx.fillText(locText, 10, canvas.height - 40);
      if (overlayText) {
         ctx.fillText(overlayText, 10, canvas.height - 10);
      }
      
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = imageSrc;
  }, [webcamRef, location, overlayText]);

  const retake = () => setCapturedImage(null);

  const handleSave = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-white p-6 text-center flex flex-col items-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <p className="text-lg font-bold mb-2">Camera Error</p>
            <p className="text-gray-300">{error}</p>
            <p className="mt-4 text-sm text-yellow-400">Note: Camera requires HTTPS on mobile devices.</p>
          </div>
        ) : !capturedImage ? (
          hasPermission && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              onUserMediaError={handleUserMediaError}
              className="w-full h-full object-cover"
              playsInline
            />
          )
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        )}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full z-10"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="bg-gray-900 p-6 flex justify-around items-center h-32 border-t border-gray-800">
        {!error && !capturedImage && hasPermission && (
          <button 
            onClick={capture}
            className="bg-jcb-yellow text-jcb-black p-4 rounded-full border-4 border-white active:scale-95 transition"
          >
            <Camera size={32} />
          </button>
        )}
        {capturedImage && (
          <>
            <button 
              onClick={retake}
              className="bg-gray-700 text-white p-4 rounded-full flex flex-col items-center active:scale-95 transition"
            >
              <RefreshCw size={24} />
              <span className="text-xs mt-1">Retake</span>
            </button>
            <button 
              onClick={handleSave}
              className="bg-green-500 text-white p-4 rounded-full flex flex-col items-center active:scale-95 transition"
            >
              <Check size={24} />
              <span className="text-xs mt-1">Save</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
