import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'

const LoginPortal = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAccount = JSON.parse(localStorage.getItem('account'));
    if (storedAccount) {
        navigate('/landingpage');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const apiUrl = `${process.env.REACT_APP_BACKEND_HOST}/users/account/login`;

    try {
      console.log('Sending data:', { username, password });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error(errorData.message || 'Incorrect Username or Password');
      }

      const data = await response.json();
      localStorage.setItem('account', JSON.stringify(data.express21.results.data.account));
      localStorage.setItem('token', data.express21.results.data.api_key);
      navigate('/landingpage');
    } catch (err) {
      setError(err.message);
      console.error('Login Error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-800">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        
        <div className="flex justify-center mb-4">
          <img 
            src="https://storage.googleapis.com/21e_hayzm5123abc_qweasdzxc/aiRheTjkQwe/web-ess/logo%20ess%20FIX.png" 
            alt="Fleet 21 Logo"
            className="w-40 h-40 object-contain rounded-2xl"
          />
        </div>

        <h2 className="text-3xl font-mono font-bold text-center text-black-700 mb-2" style={{ wordSpacing: "-12px" }}>ESS 21 Express</h2>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border-2 border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:border-blue-500 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-2 border-gray-300 p-3 rounded-lg mb-6 w-full focus:outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          Login
        </button>

        <div className="text-center mt-4">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPortal;