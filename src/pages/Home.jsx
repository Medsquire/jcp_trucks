import React, { useState, useEffect } from 'react';
import CameraCapture from '../components/CameraCapture';
import { uploadToImgbb } from '../utils/imgbb';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : null;
  });

  const [cameraState, setCameraState] = useState({
    isOpen: false,
    mode: 'none', // 'checkin-dash', 'checkin-person', 'checkout-dash', 'checkout-person'
  });
  
  const [tempImages, setTempImages] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCapture = async (imageSrc) => {
    const mode = cameraState.mode;
    
    if (mode === 'checkin-dash') {
      setTempImages({ ...tempImages, checkinDash: imageSrc });
      setCameraState({ isOpen: true, mode: 'checkin-person' });
    } 
    else if (mode === 'checkin-person') {
      setIsProcessing(true);
      setCameraState({ isOpen: false, mode: 'none' });
      try {
        const dashUrl = await uploadToImgbb(tempImages.checkinDash);
        const personUrl = await uploadToImgbb(imageSrc);
        
        const newAttendance = {
          checkInTime: new Date().toISOString(),
          checkInImages: { dash: dashUrl, person: personUrl },
          status: 'checked-in'
        };
        setAttendance(newAttendance);
        localStorage.setItem('attendance', JSON.stringify(newAttendance));
      } catch (err) {
        alert("Failed to save check-in photos. Please try again.");
      }
      setIsProcessing(false);
    }
    else if (mode === 'checkout-dash') {
      setTempImages({ ...tempImages, checkoutDash: imageSrc });
      setCameraState({ isOpen: true, mode: 'checkout-person' });
    }
    else if (mode === 'checkout-person') {
      setIsProcessing(true);
      setCameraState({ isOpen: false, mode: 'none' });
      try {
        const dashUrl = await uploadToImgbb(tempImages.checkoutDash);
        const personUrl = await uploadToImgbb(imageSrc);
        
        const updatedAttendance = {
          ...attendance,
          checkOutTime: new Date().toISOString(),
          checkOutImages: { dash: dashUrl, person: personUrl },
          status: 'checked-out'
        };
        setAttendance(updatedAttendance);
        localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
      } catch (err) {
        alert("Failed to save check-out photos. Please try again.");
      }
      setIsProcessing(false);
    }
  };

  const startCheckIn = () => setCameraState({ isOpen: true, mode: 'checkin-dash' });
  const startCheckOut = () => setCameraState({ isOpen: true, mode: 'checkout-dash' });
  const cancelCamera = () => {
    setCameraState({ isOpen: false, mode: 'none' });
    setTempImages({});
  };

  const getDuration = (start, end) => {
    if (!start) return '00:00';
    const diff = (end ? new Date(end) : currentTime) - new Date(start);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs.toString().padStart(2, '0')}hr : ${mins.toString().padStart(2, '0')}min`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Today's Attendance</h2>
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center flex-col text-white">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p>Saving records...</p>
        </div>
      )}

      {cameraState.isOpen && (
        <CameraCapture 
          onCapture={handleCapture}
          onCancel={cancelCamera}
          facingMode={cameraState.mode.includes('dash') ? 'environment' : 'user'}
          overlayText={cameraState.mode.includes('dash') ? 'Dashboard Photo' : 'Driver Photo'}
        />
      )}

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Check In</p>
            <p className="text-lg font-bold">{attendance?.checkInTime ? formatTime(attendance.checkInTime) : '--:--'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Check Out</p>
            <p className="text-lg font-bold">{attendance?.checkOutTime ? formatTime(attendance.checkOutTime) : '--:--'}</p>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-1">Duration</p>
          <p className="text-3xl font-black text-jcb-yellow">
            {attendance?.checkInTime ? getDuration(attendance.checkInTime, attendance.checkOutTime) : '00hr : 00min'}
          </p>
        </div>

        {!attendance || attendance.status === 'checked-out' ? (
          <button 
            onClick={startCheckIn}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-md shadow-lg active:scale-95 transition"
          >
            CHECK IN
          </button>
        ) : (
          <button 
            onClick={startCheckOut}
            className="w-full bg-red-500 text-white font-bold py-4 rounded-md shadow-lg active:scale-95 transition"
          >
            CHECK OUT
          </button>
        )}
      </div>
      
      {/* Display Photos if checked in/out */}
      {attendance && attendance.checkInImages && (
        <div className="w-full max-w-md mt-4 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-2">Check-in Photos</h3>
          <div className="grid grid-cols-2 gap-2">
            <img src={attendance.checkInImages.dash} alt="Dashboard" className="rounded-md object-cover h-32 w-full" />
            <img src={attendance.checkInImages.person} alt="Driver" className="rounded-md object-cover h-32 w-full" />
          </div>
        </div>
      )}
      
      {attendance && attendance.checkOutImages && (
        <div className="w-full max-w-md mt-4 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-2">Check-out Photos</h3>
          <div className="grid grid-cols-2 gap-2">
            <img src={attendance.checkOutImages.dash} alt="Dashboard" className="rounded-md object-cover h-32 w-full" />
            <img src={attendance.checkOutImages.person} alt="Driver" className="rounded-md object-cover h-32 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
