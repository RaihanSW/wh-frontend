import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  ResponsiveContainer
} from "recharts";

const FleetTable = () => {
  const [fleetData, setFleetData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]); 
  const [repairData, setRepairData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDashboard, setShowDashboard] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // User profile data
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    role: "Fleet Manager",
    email: "john.doe@express21.com",
    avatar: "https://ui-avatars.com/api/?background=0D9488&color=fff&size=200&name=John+Doe",
    joinDate: "January 2024"
  });

  const fetchData = async (url, setter, transform = (data) => data) => {
    try {
      const response = await axios.get(url);
      setter(transform(response.data));
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
    }
  };

  useEffect(() => {
    if (showDashboard) {
      fetchData(`${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/fleet/repair`, (data) => {
        setFleetData(data.express21.results.data);
        setLoading(false);
      });

      fetchData(`${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/fleet/repair`, (data) => {
        if (data.express21?.results) {
          setRepairData([
            { name: "Reparasi Berat", value: data.express21.results.reparasi_berat },
            { name: "Reparasi Ringan", value: data.express21.results.reparasi_ringan },
          ]);
        }
      });

      fetchData(`${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/fleet/status`, (data) => {
        if (data.express21?.results?.data) {
          setStatusData(  
            Object.entries(data.express21.results.data)
              .filter(([key]) => ["IN", "OUT", "REPARASI"].includes(key))
              .map(([key, value]) => ({
                name: key,
                value,
              }))
          );
        }
      });

      fetchData(`${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/fleet/city`, (data) => {
        if (data.express21?.results?.data) {
          setCityData(
            Object.entries(data.express21.results.data).map(([key, value]) => ({
              city: key,
              count: value,
            }))
          );
        }
      });
    }
  }, [showDashboard]);

  useEffect(() => {
    if (showDashboard) {
      setPaginatedData(fleetData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
    }
  }, [currentPage, fleetData, showDashboard]);

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
              Welcome to Fleet Management
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Your comprehensive solution for fleet tracking and management
            </p>
            <button
              onClick={() => setShowDashboard(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              Enter Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4">🚛</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">Monitor your fleet vehicles in real-time with GPS tracking</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Comprehensive analytics and reports for better decision making</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Maintenance Alerts</h3>
            <p className="text-gray-600">Automated maintenance scheduling and alerts</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h2 className="text-2xl font-bold text-white text-center">User Profile</h2>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                />
              </div>
              
              {/* Profile Info */}
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {userProfile.name}
                </h3>
                <p className="text-lg text-blue-600 mb-4">{userProfile.role}</p>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                    <span className="text-gray-400">📧</span> {userProfile.email}
                  </p>
                  <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                    <span className="text-gray-400">📅</span> Member since {userProfile.joinDate}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowDashboard(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 w-full md:w-auto"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Fleet Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Active Vehicles</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">On-time Delivery</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Component (Legacy Code)
  const Dashboard = () => (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-screen-xxl mx-auto">
        
        {/* Header Section with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDashboard(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-200"
            >
              ← Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Fleet Dashboard</h1>
          </div>
          <button
            onClick={() => navigate("/Masters/Fleet/Detail")}
            className="bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-800 transition duration-200"
          >
            + Add Fleet Data
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Pie Chart - Repair */}
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={repairData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                label
              >
                {repairData.map((_, index) => (
                  <Cell key={index} fill={["#FF5733", "#FFC300"][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Pie Chart - Status */}
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                label
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={["#FF5733", "#FFC300", "#0088FE", "#00C49F", "#FFBB28", "#A833FF", "#FF3380"][index % 7]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Bar Chart - Fleet Position */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="city" 
                tick={{ fontSize: 10, angle: -45, textAnchor: "end" }} 
                interval={0} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>  

        {/* Fleet Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse shadow-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-md border-b">
                <th className="py-4 px-6 text-left">Plate Number</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Note</th>
              </tr>
            </thead>  
            <tbody className="text-gray-700 text-md">
              {paginatedData.map((fleet) => (
                <tr key={fleet.id} className="border-b border-gray-300 hover:bg-gray-100 transition duration-200">
                  <td className="py-4 px-6">{fleet.plat_number}</td>
                  <td className="py-4 px-6">{fleet.status || "N/A"}</td>
                  <td className="py-4 px-6">{fleet.note || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render either landing page or dashboard
  return showDashboard ? <Dashboard /> : <LandingPage />;
};

export default FleetTable;