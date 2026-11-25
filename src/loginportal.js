import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'

import warehouseBG from "../src/assets/img/warehouse_1.png"

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
    const apiUrl = `${process.env.REACT_APP_BACKEND_HOST}/account/login`;

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
      localStorage.setItem('account', JSON.stringify(data.warehouse.results.data));
      localStorage.setItem('token', data.warehouse.results.token);
      console.log(data.warehouse.results.token);
      debugger
      navigate('/landingpage');
    } catch (err) {
      setError(err.message);
      console.error('Login Error:', err);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/*  */}
      <section
        className="hidden lg:flex items-center justify-center bg-cover bg-center bg-no-repeat p-10"
        style={{ backgroundImage: `url(${warehouseBG})` }}
      >
      </section>

      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-5 sm:px-10 lg:px-16">
        <form onSubmit={handleLogin} className="w-full max-w-md -translate-y-10">
          <div className="mb-5 text-center lg:text-left">
            <div className="mb-3 flex justify-center">
              <img
                src="/rottenfanger_express.png"
                alt="21 Express"
                className="h-28 w-28 object-contain"
              />
            </div>

            <div className='text-center'>
              <h1 className="text-3xl font-mono font-bold text-gray-900">
                Warehouse Management
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Login untuk dapat mengakses fitur Warehouse Management
              </p>
            </div>
            
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mb-5 w-full rounded-lg border-2 border-gray-300 p-3 focus:border-blue-500 focus:outline-none transition"
          />

          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-6 w-full rounded-lg border-2 border-gray-300 p-3 focus:border-blue-500 focus:outline-none transition"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-[#B8D4FA] p-3 font-semibold transition duration-300 ease-in-out hover:bg-[#9FC4F5]"
          >
            Login
          </button>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-[#345D98] hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LoginPortal;