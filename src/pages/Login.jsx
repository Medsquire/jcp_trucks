import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login without text entry
    localStorage.setItem('user', JSON.stringify({ username: 'Driver_1' }));
    navigate('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center py-10">
        <div className="w-32 h-32 bg-jcb-yellow rounded-full flex flex-col items-center justify-center mb-8 shadow-inner">
          <h1 className="text-4xl font-black text-jcb-black tracking-widest">JCB</h1>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-8">Driver Portal</h2>
        
        <button 
          onClick={handleLogin}
          className="w-3/4 bg-jcb-yellow text-jcb-black font-bold text-lg p-4 rounded-md shadow-lg hover:bg-yellow-400 active:scale-95 transition"
        >
          QUICK LOGIN
        </button>
      </div>
    </div>
  );
};

export default Login;
