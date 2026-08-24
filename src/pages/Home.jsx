import React, { useState, useEffect } from 'react';
import CameraCapture from '../components/CameraCapture';
import { uploadToImgbb } from '../utils/imgbb';
import { Loader2, Camera as CameraIcon } from 'lucide-react';

const Home = () => {
  const [attendance, setAttendance] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.phone) {
      const dateString = new Date().toISOString().split('T')[0];
      fetch(`/api/attendance?phone=${user.phone}&dateString=${dateString}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) setAttendance(data[0]);
        })
        .catch(err => console.error(err));
    }
  }, [user?.phone]);

  const [activeFlow, setActiveFlow] = useState('none');
  const [step, setStep] = useState(1);
  const [cameraState, setCameraState] = useState({ isOpen: false, mode: 'none' });
  const [tempImages, setTempImages] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCapture = async (imageSrc) => {
    const mode = cameraState.mode;
    setCameraState({ isOpen: false, mode: 'none' });
    
    if (mode === 'checkin-dash' || mode === 'checkout-dash') {
      setTempImages({ ...tempImages, dash: imageSrc });
      setStep(2);
    } 
    else if (mode === 'checkin-person' || mode === 'checkout-person') {
      setTempImages({ ...tempImages, person: imageSrc });
      
      setIsProcessing(true);
      try {
        const dashUrl = await uploadToImgbb(tempImages.dash);
        const personUrl = await uploadToImgbb(imageSrc);
        
        const payload = {
          phone: user.phone,
        };

        if (activeFlow === 'checkin') {
          payload.checkInTime = new Date().toISOString();
          payload.checkInImages = { dash: dashUrl, person: personUrl };
          payload.status = 'checked-in';
        } else if (activeFlow === 'checkout') {
          payload.checkOutTime = new Date().toISOString();
          payload.checkOutImages = { dash: dashUrl, person: personUrl };
          payload.status = 'checked-out';
        }

        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const savedData = await res.json();
        setAttendance(savedData);

      } catch (err) {
        alert("Failed to save photos. Please try again.");
      }
      setIsProcessing(false);
      setActiveFlow('none');
      setTempImages({});
      setStep(1);
    }
  };

  const startCheckIn = () => { setActiveFlow('checkin'); setStep(1); setTempImages({}); };
  const startCheckOut = () => { setActiveFlow('checkout'); setStep(1); setTempImages({}); };
  const cancelFlow = () => { setActiveFlow('none'); setTempImages({}); setStep(1); };
  
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

  if (activeFlow !== 'none') {
    const isCheckin = activeFlow === 'checkin';
    return (
      <div className="p-4 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {isCheckin ? 'Check In Process' : 'Check Out Process'}
        </h2>

        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center flex-col text-white">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p>Saving records...</p>
          </div>
        )}

        {cameraState.isOpen && (
          <CameraCapture 
            onCapture={handleCapture}
            onCancel={() => setCameraState({ isOpen: false, mode: 'none' })}
            facingMode={cameraState.mode.includes('dash') ? 'environment' : 'user'}
            overlayText={cameraState.mode.includes('dash') ? '1. Vehicle dashboard (Back Camera)' : '2. User phone (Front Camera)'}
          />
        )}

        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-700 mb-2">1. Vehicle dashboard (Back Camera)</h3>
            {!tempImages.dash ? (
              <button 
                onClick={() => setCameraState({ isOpen: true, mode: isCheckin ? 'checkin-dash' : 'checkout-dash' })}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-md flex items-center justify-center space-x-2 shadow active:scale-95 transition"
              >
                <CameraIcon size={24} />
                <span>Capture Dashboard</span>
              </button>
            ) : (
              <div>
                <img src={tempImages.dash} alt="Dashboard" className="w-full h-48 object-cover rounded-md border" />
                <div className="mt-2 bg-green-100 text-green-800 p-2 rounded text-sm text-center font-bold">✓ Saved</div>
              </div>
            )}
          </div>

          {step >= 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-700 mb-2">2. User phone (Front Camera)</h3>
              {!tempImages.person ? (
                <button 
                  onClick={() => setCameraState({ isOpen: true, mode: isCheckin ? 'checkin-person' : 'checkout-person' })}
                  className="w-full bg-blue-500 text-white font-bold py-4 rounded-md flex items-center justify-center space-x-2 shadow active:scale-95 transition"
                >
                  <CameraIcon size={24} />
                  <span>Capture User Phone</span>
                </button>
              ) : (
                <div>
                  <img src={tempImages.person} alt="User Phone" className="w-full h-48 object-cover rounded-md border" />
                  <div className="mt-2 bg-green-100 text-green-800 p-2 rounded text-sm text-center font-bold">✓ Saved</div>
                </div>
              )}
            </div>
          )}

          <button onClick={cancelFlow} className="w-full border-2 border-gray-300 text-gray-700 font-bold py-4 rounded-md active:bg-gray-100 transition">
            Cancel {isCheckin ? 'Check In' : 'Check Out'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Today's Attendance</h2>

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
          <button onClick={startCheckIn} className="w-full bg-green-500 text-white font-bold py-4 rounded-md shadow-lg active:scale-95 transition">
            CHECK IN
          </button>
        ) : (
          <button onClick={startCheckOut} className="w-full bg-red-500 text-white font-bold py-4 rounded-md shadow-lg active:scale-95 transition">
            CHECK OUT
          </button>
        )}
      </div>
      
      {attendance?.checkInImages && (
        <div className="w-full max-w-md mt-4 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-2">Check-in Photos</h3>
          <div className="grid grid-cols-2 gap-2">
            <img src={attendance.checkInImages.dash} alt="Dashboard" className="rounded-md object-cover h-32 w-full" />
            <img src={attendance.checkInImages.person} alt="User Phone" className="rounded-md object-cover h-32 w-full" />
          </div>
        </div>
      )}
      
      {attendance?.checkOutImages && (
        <div className="w-full max-w-md mt-4 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-2">Check-out Photos</h3>
          <div className="grid grid-cols-2 gap-2">
            <img src={attendance.checkOutImages.dash} alt="Dashboard" className="rounded-md object-cover h-32 w-full" />
            <img src={attendance.checkOutImages.person} alt="User Phone" className="rounded-md object-cover h-32 w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
