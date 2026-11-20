import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

const formatDateTime = (datetime) => {
  const dateObj = new Date(datetime);
  const tanggal = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const jam = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return { tanggal, jam };
};

const getStatusStyle = (status) => {
  switch (status.toUpperCase()) {
    case "IN":
      return "bg-green-100 border-l-8 border-l-green-500";
    case "OUT":
      return "bg-orange-100 border-l-8 border-l-orange-400";
    case "REPARASI RINGAN":
      return "bg-red-100 border-l-8 border-l-red-300";
    case "REPARASI BERAT":
      return "bg-red-200 border-l-8 border-l-red-500";
    default:
      return "bg-blue-100 border-l-8 border-l-blue-500";
  }
};

const getStatusBadgeStyle = (status) => {
  switch (status.toUpperCase()) {
    case "IN":
      return "bg-green-500 text-white";
    case "OUT":
      return "bg-orange-400 text-white";
    case "REPARASI RINGAN":
      return "bg-red-300 text-black";
    case "REPARASI BERAT":
      return "bg-red-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
};

const getPlatNumberCardStyle = (status) => {
  switch (status.toUpperCase()) {
    case "IN":
      return "bg-green-500 text-white shadow-lg";
    case "OUT":
      return "bg-orange-400 text-white shadow-lg";
    case "REPARASI RINGAN":
      return "bg-red-300 text-black shadow-lg";
    case "REPARASI BERAT":
      return "bg-red-500 text-white shadow-lg";
    default:
      return "bg-blue-500 text-white shadow-lg";
  }
};

const getTextColor = (status) => {
  switch (status.toUpperCase()) {
    case "IN":
      return "text-green-800";
    case "OUT":
      return "text-orange-800";
    case "REPARASI RINGAN":
      return "text-red-800";
    case "REPARASI BERAT":
      return "text-red-900";
    default:
      return "text-blue-800";
  }
};

const FleetTable = () => {
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("21 Express Pulogadung");
  const [branchKeyword, setBranchKeyword] = useState("");
  const [branchData, setBranchData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const autoscrollInterval = 15;
  const timerRef = useRef(null);
  const animationRef = useRef(null);

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


  const handleSuggestionClick = (branch) => {
    setSuggestions([]);
    setBranchKeyword(branch.name);
    setBranchFilter(branch.name);
    setBranchData([branch]);
  };

  const filteredData = fleetData.filter((fleet) =>
    fleet.plat_number.toLowerCase().includes(filter.toLowerCase())
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

  timerRef.current = setInterval(() => {
    setCurrentPage((prevPage) => {
      if (totalPages <= 1) {
        fetchFleetData(); // Refresh data if there's only one page
        return 1;
      }

      const nextPage = prevPage + 1;
      return nextPage > totalPages ? 1 : nextPage;
    });
  }, autoscrollInterval * 1000);
};


  useEffect(() => {
    resetTimer();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [filteredData.length, totalPages]);
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-screen-xxl mx-auto">
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Fleet List - {branchFilter}</h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Enter Branch Keyword"
              value={branchKeyword}
              onChange={(e) => setBranchKeyword(e.target.value)}
              className="p-2 text-black border border-gray-300 rounded-lg w-full"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 w-full bg-white text-black border border-gray-300 rounded-lg mt-1 z-10">
                {suggestions.map((branch) => (
                  <div
                    key={branch.id}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSuggestionClick(branch)}
                  >
                    {branch.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 mt-4">Loading data...</p>
        ) : error ? (
          <p className="text-red-500 mt-4">{error}</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="w-[40rem] py-3 px-6 text-center">Plat Number</th>
                  <th className="w-[20rem] py-3 px-6 text-center">Waktu IN</th>
                  <th className="w-[20rem] py-3 px-6 text-center">Waktu OUT</th>
                  <th className="w-[24rem] py-3 px-10 text-center">Status</th>
                  <th className="w-[20rem] py-3 px-6 text-center">Driver</th>
                  <th className="w-[20rem] py-3 px-6 text-center">Tujuan</th>
                  <th className="w-[40rem] py-3 px-6 text-center">Vehicle Type</th>
                </tr>
              </thead>

              <AnimatePresence mode="sync">
                <motion.tbody
                  key={currentPage}
                  className="text-gray-600 text-sm font-light"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  {currentData.map((fleet, index) => (
                    <motion.tr
                      key={fleet.id}
                      className={`border-b border-gray-300 ${getStatusStyle(fleet.status_id || "")}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <td className="py-3 px-6 text-center">
                        <div className={`rounded-lg p-4 ${getPlatNumberCardStyle(fleet.status_id || "")}`}>
                          <span className="text-3xl font-bold">
                            {fleet.plat_number}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-6 text-center ${getTextColor(fleet.status_id || "")}`}>
                        {fleet.in_time ? (() => {
                          const { tanggal, jam } = formatDateTime(fleet.in_time);
                          return (
                            <div>
                              <div className="text-xl font-bold">{tanggal}</div>
                              <div className="text-xl font-bold">{jam}</div>
                            </div>
                          );
                        })() : ""}
                      </td>
                      <td className={`py-3 px-6 text-center ${getTextColor(fleet.status_id || "")}`}>
                        {fleet.out_time ? (() => {
                          const { tanggal, jam } = formatDateTime(fleet.out_time);
                          return (
                            <div>
                              <div className="text-xl font-bold">{tanggal}</div>
                              <div className="text-xl font-bold">{jam}</div>
                            </div>
                          );
                        })() : ""}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className={`rounded-lg p-3 ${getStatusBadgeStyle(fleet.status_id || "")}`}>
                          <span className="text-2xl font-semibold">
                            {fleet.status_id}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-6 text-2xl text-center font-bold ${getTextColor(fleet.status_id || "")}`}>
                        {fleet.driver}
                      </td>
                      <td className={`py-3 px-6 text-2xl text-center font-bold ${getTextColor(fleet.status_id || "")}`}>
                        {fleet.destination}
                      </td>
                      <td className={`py-3 px-6 text-2xl text-center font-bold line-clamp-2 max-w-[90rem] ${getTextColor(fleet.status_id || "")}`}>
                        {fleet.vehicletype}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-300 rounded ${currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-400"}`}
          >
            Previous
          </button>
          <p className="text-sm text-gray-700">Page {currentPage} of {totalPages}</p>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-gray-300 rounded ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-400"}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FleetTable;