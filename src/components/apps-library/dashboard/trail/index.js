import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const FleetTable = () => {
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("21 Express Pulogadung");
  const [branchKeyword, setBranchKeyword] = useState("");
  const [branchData, setBranchData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPlatNumber, setSelectedPlatNumber] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!branchKeyword || branchKeyword.length < 3) {
      setSuggestions([]);
      return;
    }
    
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `https://partner-api.21express.co.id/masters/branch?keywords=${branchKeyword}`
        );
        setSuggestions(response.data.express21.results.data || []);
      } catch (err) {
        setError("Failed to fetch branch data.");
      }
    };

    fetchBranchData();
  }, [branchKeyword]);

  

  useEffect(() => {
    if (currentPage === 1 && branchFilter) {
      fetchFleetData(); 
    }
  }, [currentPage, branchFilter]);

  const fetchFleetData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/masters/fleet?filter_by_col=branch_name&filter_by_text=${branchFilter}&order_by_col=status&order_by_type=ASC`
      );
      setFleetData(response.data.express21.results.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch fleet data.");
    } finally {
      setLoading(false);
    }
  };





  const handlePlatNumberClick = async (platNumber) => {
    setDetailLoading(true);
    setSelectedPlatNumber(platNumber);
    try {
      // Fetch detail data using the statuslog API
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/masters/statuslog?filter_by_col=plat_number&filter_by_text=${platNumber}`
      );
      
      const detailData = response.data.express21.results.data || [];
      setDetailData(detailData);
      setShowDetailModal(true);
    } catch (err) {
      setError(`Failed to fetch details for ${platNumber}`);
      console.error("Error fetching detail data:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPlatNumber(null);
    setDetailData([]);
  };

  // Function to navigate to Trail Dashboard
  const handleGoToTrailDashboard = () => {
    navigate('/Dashboard/Trail');
  };

  const handleSuggestionClick = (branch) => {
    setSuggestions([]);
    setBranchKeyword(branch.name);
    setBranchFilter(branch.name);
    setBranchData([branch]);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    resetTimer();
  };

  const filteredData = fleetData.filter((fleet) =>
    fleet.plat_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fleet.status_id && fleet.status_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      resetTimer();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      resetTimer();
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  useEffect(() => {
    resetTimer();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [filteredData.length, totalPages]);

  // Status color mapping
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('active') || statusLower?.includes('ready')) {
      return 'bg-green-500';
    } else if (statusLower?.includes('maintenance') || statusLower?.includes('repair')) {
      return 'bg-yellow-500';
    } else if (statusLower?.includes('inactive') || statusLower?.includes('broken')) {
      return 'bg-red-500';
    } else {
      return 'bg-blue-500';
    }
  };

  

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString || 'N/A';
    }
  };

const getStatusColorBadge = (status) => {
  const statusLower = status?.toLowerCase();
  
  if (statusLower === 'in') {
    return 'bg-green-100 text-green-800 border-green-300';
  } else if (statusLower === 'out') {
    return 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (statusLower === 'reparasi ringan') {
    return 'bg-red-100 text-red-800 border-red-300';
  } else if (statusLower === 'reparasi berat') {
    return 'bg-red-500 text-white border-red-600';
  } else if (statusLower === 'loading') {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  } else {
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

  
  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
      {/* Header Section with Marker Style */}
      <div className="relative mb-8">
        <div className="bg-white shadow-2xl rounded-2xl p-8 border-l-8 border-blue-600 relative overflow-hidden">
          {/* Marker Effect */}
          <div className="absolute top-0 left-0 w-6 h-full bg-blue-600 opacity-10"></div>
          <div className="absolute top-4 -left-2 w-8 h-8 bg-blue-600 rounded-full opacity-20"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-4 h-12 bg-blue-600 rounded-r-lg mr-4 shadow-lg"></div>
              <h1 className="text-4xl font-bold text-gray-800">
                Fleet List - <span className="text-blue-600">{branchFilter}</span>
              </h1>
            </div>
            
            {/* Navigation and Search Container */}
            <div className="flex items-center gap-4">
              {/* Trail Dashboard Button */}
              <button
                onClick={handleGoToTrailDashboard}
                className="bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-150 text-xl shadow-lg hover:shadow-xl flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Trail Dashboard
              </button>
              
              {/* Search Container */}
              <div className="relative flex items-center">
                <div className="absolute left-4 z-10 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search fleet or status..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-12 pr-4 py-4 text-xl text-black border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
                />
                <button
                  onClick={handleSearch}
                  className="ml-3 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-150 text-xl shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold">Total Fleet</p>
                  <p className="text-3xl font-bold mt-2">{fleetData.length}</p>
                </div>
                <div className="text-4xl">🚛</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold">Active</p>
                  <p className="text-3xl font-bold mt-2">
                    {fleetData.filter(f => f.status_id?.toLowerCase().includes('active')).length}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay for Detail Loading */}
     <AnimatePresence>
  {detailLoading && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
        <p className="text-2xl text-gray-700">Loading fleet details...</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>

{/* Detail Modal Popup */}
<AnimatePresence>
  {showDetailModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCloseDetailModal}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">
                Trail Details - <span className="text-yellow-300">{selectedPlatNumber}</span>
              </h2>
              <p className="text-blue-100 mt-2">
                Branch: {branchFilter} • Total Records: {detailData.length}
              </p>
            </div>
            <button
              onClick={handleCloseDetailModal}
              className="text-white hover:text-yellow-300 transition-all duration-200 p-2 rounded-full hover:bg-blue-800"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {detailData.length > 0 ? (
            <div className="space-y-4">
              {detailData.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                        <span className="text-lg font-bold">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-4">
                        {/* Status */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-500 mb-2">STATUS</span>
                          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-lg font-bold border-2 ${getStatusColorBadge(log.status_name)}`}>
                            {log.status_name || 'N/A'}
                          </span>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-500 mb-2">DATE & TIME</span>
                          <div className="text-lg font-semibold text-gray-800">
                            {(() => {
                              try {
                                const date = new Date(log.dateprocess);
                                const day = date.getDate().toString().padStart(2, '0');
                                const month = date.toLocaleDateString('en-US', { month: 'short' });
                                const year = date.getFullYear();
                                const time = date.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                });
                                return (
                                  <div>
                                    <div>{day} {month} {year}</div>
                                    <div className="text-sm text-gray-600">{time}</div>
                                  </div>
                                );
                              } catch {
                                return 'N/A';
                              }
                            })()}
                          </div>
                        </div>

                        {/* Driver */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-500 mb-2">DRIVER</span>
                          <span className="text-lg font-semibold text-gray-800">
                            {log.driver || 'N/A'}
                          </span>
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-500 mb-2">DESTINATION</span>
                          <span className="text-lg font-semibold text-gray-800">
                            {log.destination || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Plat Number */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-500 mb-2">PLAT NUMBER</span>
                          <span className="text-lg font-semibold text-gray-800">
                            {log.plat_number || 'N/A'}
                          </span>
                        </div>

                        {/* Branch */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-500 mb-2">BRANCH</span>
                          <span className="text-lg font-semibold text-gray-800">
                            {log.branch_name || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {log.note && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm font-semibold text-gray-500 mb-2 block">NOTES</span>
                          <p className="text-lg text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {log.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No Status History Found</h3>
              <p className="text-gray-500 text-xl">No status records available for this fleet vehicle.</p>
            </div>
          )}

          {/* Summary Stats */}
          {detailData.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">{detailData.length}</div>
                <div className="text-lg font-semibold text-blue-800">Total Records</div>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {detailData.filter(log => log.status_name?.toLowerCase() === 'out').length}
                </div>
                <div className="text-lg font-semibold text-green-800">OUT Status</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {new Set(detailData.map(log => log.driver)).size}
                </div>
                <div className="text-lg font-semibold text-purple-800">Unique Drivers</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {new Set(detailData.map(log => log.destination)).size}
                </div>
                <div className="text-lg font-semibold text-orange-800">Destinations</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Main Content Box */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 border-l-4 border-blue-500 relative overflow-hidden">
        {/* Side Marker */}
        <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="text-2xl text-gray-500 ml-4">Loading fleet data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <p className="text-2xl text-red-700 text-center">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-2xl leading-relaxed">
                  <th className="py-6 px-8 text-left font-bold border-r-2 border-gray-300">No</th>
                  <th className="py-6 px-8 text-left font-bold border-r-2 border-gray-300">Plat Number</th>
                  <th className="py-6 px-8 text-left font-bold">Status Terakhir</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-2xl font-normal">
                <AnimatePresence>
                  {currentData.map((fleet, index) => (
                    <motion.tr
                      key={fleet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border-b-2 border-gray-100 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <td className="py-5 px-8 text-left font-semibold border-r-2 border-gray-100 group-hover:border-blue-200">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-5 px-8 text-left whitespace-nowrap font-bold text-2xl border-r-2 border-gray-100 group-hover:border-blue-200">
                        <button
                          onClick={() => handlePlatNumberClick(fleet.plat_number)}
                          className="relative inline-block text-left focus:outline-none group"
                        >
                          <span className="text-gray-800 group-hover:text-blue-700 group-hover:font-extrabold transition-all duration-300 ease-out transform group-hover:translate-x-2 cursor-pointer">
                            {fleet.plat_number}
                          </span>
                          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:w-full transition-all duration-500 ease-out rounded-full"></div>
                          <div className="absolute -inset-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out -z-10"></div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                            Click to view trail details
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </button>
                      </td>
                      <td className="py-5 px-8 text-left font-semibold">
                        {fleet.status_id}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination with Box Design */}
        <div className="bg-gray-50 rounded-xl p-6 mt-8 border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-8 py-4 rounded-xl font-semibold text-xl transition-all duration-200 flex items-center ${
                currentPage === 1 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <p className="text-xl text-gray-700 font-semibold">
              Page <span className="text-blue-600 font-bold">{currentPage}</span> of <span className="text-blue-600 font-bold">{totalPages}</span>
            </p>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-8 py-4 rounded-xl font-semibold text-xl transition-all duration-200 flex items-center ${
                currentPage === totalPages 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              Next
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetTable;