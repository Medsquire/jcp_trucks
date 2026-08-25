import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }
    
    if (password.length <= 6) {
      setError('Password must be more than 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      
      // Clear any old data from the browser (old attendance, fuel, etc)
      localStorage.clear();
      
      localStorage.setItem('user', JSON.stringify(data));
      
      // roleId 1 = Admin, 2 = Supervisor, 3 = Driver
      if (data.roleId === 1 || data.roleId === 2) {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center py-10 px-8">
        <div className="w-32 h-32 bg-jcb-yellow rounded-full flex flex-col items-center justify-center mb-8 shadow-inner">
          <h1 className="text-4xl font-black text-jcb-black tracking-widest">JCB</h1>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-8">Driver Portal</h2>
        
        {error && <div className="w-full bg-red-100 text-red-600 p-3 mb-4 rounded text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleLogin} className="w-full space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow"
              placeholder="Enter 10 digit phone number"
              pattern="\d{10}"
              maxLength="10"
              title="Phone number must be exactly 10 digits"
              required
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jcb-yellow pr-10"
              placeholder="Enter password"
              minLength="7"
              title="Password must be more than 6 characters"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-jcb-yellow text-jcb-black font-bold text-lg p-4 rounded-md shadow-lg hover:bg-yellow-400 active:scale-95 transition mt-4 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
