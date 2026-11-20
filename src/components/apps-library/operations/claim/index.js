import React, { useState, useEffect } from "react";
import {
  FaPlus, FaSearch, FaCalendarAlt, FaEye, FaDownload,
  FaInfoCircle, FaUser, FaBox, FaMoneyBillWave, FaClock,
  FaCheckCircle, FaTimesCircle, FaUndo, FaFileAlt, FaImage,
  FaExternalLinkAlt, FaCopy, FaPrint, FaFilter, FaTrash,
  FaCheck, FaTimes, FaEdit
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { MdVerified, MdReplay, MdAssignmentTurnedIn } from "react-icons/md";

// ============================================================
// CSS Animations (inline styles)
// ============================================================
const styles = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-slideDown {
    animation: slideDown 0.25s ease-out forwards;
  }

  .animate-shake {
    animation: shake 0.3s ease-in-out;
  }

  .animate-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// ============================================================
// CUSTOM ANIMATED ALERT COMPONENT
// ============================================================
const AnimatedAlert = ({ isOpen, onClose, type, title, message, details }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" size={28} />;
      case 'error':
        return <FaTimesCircle className="text-red-500" size={28} />;
      case 'warning':
        return <FaInfoCircle className="text-yellow-500" size={28} />;
      default:
        return <FaInfoCircle className="text-blue-500" size={28} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error':   return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default:        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success': return 'text-green-800';
      case 'error':   return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      default:        return 'text-blue-800';
    }
  };

  let parsedDetails = details;
  if (typeof details === 'string') {
    try { parsedDetails = JSON.parse(details); } catch (e) {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative max-w-md w-full rounded-xl shadow-2xl border ${getBgColor()} p-6 animate-slideDown`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getIcon()}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${getTitleColor()} mb-2`}>{title}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>

            {parsedDetails && typeof parsedDetails === 'object' && (
              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg border border-gray-200">
                {parsedDetails.error_message && (
                  <div className="mt-2 pt-2 border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Error Message:</p>
                    <p className="text-xs text-red-600 mt-1 font-mono bg-red-50 p-2 rounded">
                      {parsedDetails.error_message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 ${
              type === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : type === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : type === 'warning'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// REUSABLE DATE PICKER COMPONENT
// ============================================================
const DatePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
  error,
  showPicker,
  setShowPicker,
  buttonText,
  showCalendarIcon = true,
  className = ""
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [localError, setLocalError] = useState(error);

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    setLocalError(error);
  }, [startDate, endDate, error]);

  const getMaxEndDate = () => {
    if (!localStartDate) return new Date().toISOString().split('T')[0];
    const start = new Date(localStartDate);
    const maxDate = new Date(start);
    maxDate.setDate(start.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    setLocalEndDate(newEnd);
    setLocalError('');

    if (localStartDate && newEnd) {
      const start = new Date(localStartDate);
      const end = new Date(newEnd);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        setLocalError('⚠️ Rentang tanggal tidak boleh melebihi 30 hari dari tanggal mulai');
      }
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setLocalStartDate(newStart);
    setLocalError('');

    if (newStart && localEndDate) {
      const start = new Date(newStart);
      const end = new Date(localEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        setLocalError('⚠️ Rentang tanggal tidak boleh melebihi 30 hari dari tanggal mulai');
      }
    }
  };

  const handleApply = () => {
    if (localStartDate && localEndDate) {
      const start = new Date(localStartDate);
      const end = new Date(localEndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        setLocalError('⚠️ Rentang tanggal tidak boleh melebihi 30 hari dari tanggal mulai');
        return;
      }
    }

    onStartDateChange(localStartDate);
    onEndDateChange(localEndDate);
    onApply();
    setShowPicker(false);
  };

  const handleClear = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setLocalError('');
    onStartDateChange('');
    onEndDateChange('');
    onClear();
    setShowPicker(false);
  };

  const handleClose = () => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    setLocalError(error);
    setShowPicker(false);
  };

  const getDateRangeText = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    return buttonText || 'Select date range';
  };

  const getDaysDifference = () => {
    if (!localStartDate || !localEndDate) return 0;
    const start = new Date(localStartDate);
    const end = new Date(localEndDate);
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`relative w-full md:w-auto ${className}`}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 w-full md:w-auto"
      >
        {showCalendarIcon && <FaCalendarAlt className="text-gray-500" size={16} />}
        <span className="text-sm text-gray-700 flex-1 text-left truncate max-w-[180px]">
          {getDateRangeText()}
        </span>
        <FaFilter className="text-gray-400 flex-shrink-0" size={14} />
      </button>

      {showPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-xl p-4 z-50 w-80 md:w-96 animate-slideDown">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Filter by Date</h4>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={localStartDate}
                onChange={handleStartDateChange}
                max={localEndDate || new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={localEndDate}
                onChange={handleEndDateChange}
                min={localStartDate || undefined}
                max={getMaxEndDate()}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {localStartDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Max end date: {getMaxEndDate()} (30 days from start)
                </p>
              )}
            </div>

            {localStartDate && localEndDate && getDaysDifference() > 0 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getDaysDifference() <= 30 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                <FaClock size={14} className={getDaysDifference() <= 30 ? 'text-blue-600' : 'text-red-600'} />
                <span className={`text-xs font-medium ${getDaysDifference() <= 30 ? 'text-blue-700' : 'text-red-600'}`}>
                  {getDaysDifference()} days {getDaysDifference() > 30 && '(Exceeds 30-day limit)'}
                </span>
              </div>
            )}

            {localError && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md animate-shake">
                <span className="text-red-500 flex-shrink-0">⚠️</span>
                <p className="text-xs text-red-600">{localError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(today.getDate() - 30);
                  setLocalStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
                  setLocalEndDate(today.toISOString().split('T')[0]);
                  setLocalError('');
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t">
            <button
              onClick={handleApply}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Apply
            </button>
          </div>

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-700">
              <span className="font-semibold">⏱️ Batas 30 Hari:</span> Pencarian dibatasi maksimal 30 hari dari tanggal mulai
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ClaimList = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [userRole, setUserRole] = useState(null);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Temporary filter states for UI (only applied when search is clicked)
  const [tempSelectedStatus, setTempSelectedStatus] = useState("");
  const [tempSelectedType, setTempSelectedType] = useState("");
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [tempSearchKeyword, setTempSearchKeyword] = useState('');

  // ============================================================
  // PAGINATION STATE — 15 items per page (default)
  // ============================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Sorting
  const [sortField, setSortField] = useState("created_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // ============================================================
  // ALERT STATE
  // ============================================================
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    details: null,
  });

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    claimId: null,
    claimCode: '',
    shipmentCode: '',
  });

  // API Base URL from .env
  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Get user role from localStorage
  const getUserRole = () => {
    const account = localStorage.getItem("account");
    if (account) {
      try {
        const userData = JSON.parse(account);
        return userData?.roles?.name || null;
      } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
      }
    }
    return null;
  };

  // Check if user can verify
  const canVerify = userRole === 'Superadmin' || userRole === 'Finance';

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      Authorization: token ? `Basic ${token}` : "",
      "Content-Type": "application/json",
    };
  };

  // ============================================================
  // ALERT HELPERS
  // ============================================================
  const showAlert = (type, title, message, details = null) => {
    setAlert({ isOpen: true, type, title, message, details });
  };

  const closeAlert = () => setAlert({ ...alert, isOpen: false });

  const parseApiError = (error) => {
    console.log('Parsing error:', error);

    if (error.response?.data?.express21?.status) {
      const status = error.response.data.express21.status;
      return {
        error_code: status.error_code || 'N/A',
        error_message: status.error_message || status.message || 'Terjadi kesalahan',
        status_code: status.status_code || 'N/A',
        message: status.message || '',
        full_error: status,
        raw_response: error.response.data,
      };
    }

    if (error.response?.data?.status) {
      const status = error.response.data.status;
      return {
        error_code: status.error_code || 'N/A',
        error_message: status.error_message || status.message || 'Terjadi kesalahan',
        status_code: status.status_code || 'N/A',
        message: status.message || '',
        full_error: status,
        raw_response: error.response.data,
      };
    }

    if (error.response?.data?.message) {
      return {
        error_message: error.response.data.message,
        status_code: error.response.status || 'N/A',
        full_error: error.response.data,
        raw_response: error.response.data,
      };
    }

    if (error.message) {
      return { error_message: error.message, full_error: error };
    }

    return { error_message: 'Terjadi kesalahan yang tidak diketahui', full_error: error };
  };

  const showApiError = (error, defaultMessage = 'Terjadi kesalahan. Silakan coba lagi.') => {
    const parsed = parseApiError(error);
    const details = {
      error_code: parsed.error_code || 'N/A',
      status_code: parsed.status_code || 'N/A',
      error_message: parsed.error_message,
    };
    showAlert('error', '❌ Error', parsed.error_message || defaultMessage, details);
  };

  const showSuccess = (title, message, details = null) => showAlert('success', title, message, details);
  const showWarning = (title, message, details = null) => showAlert('warning', title, message, details);
  const showInfo = (title, message, details = null) => showAlert('info', title, message, details);

  // ============================================================
  // DATE VALIDATION
  // ============================================================
  const validateDateRange = (start, end) => {
    if (!start || !end) return true;
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const diffTime = Math.abs(endDateObj - startDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      setDateError('⚠️ Rentang tanggal tidak boleh melebihi 30 hari');
      return false;
    }
    setDateError('');
    return true;
  };

  const getDaysDifference = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  };

  // Fetch claim status options
  const fetchStatusOptions = async () => {
    try {
      const response = await fetch(`${baseUrl}/masters/claimstatus`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      let statusData = [];
      if (data?.express21?.results?.data && Array.isArray(data.express21.results.data)) {
        statusData = data.express21.results.data;
      } else if (data?.results?.data && Array.isArray(data.results.data)) {
        statusData = data.results.data;
      } else if (Array.isArray(data)) {
        statusData = data;
      } else if (data.data && Array.isArray(data.data)) {
        statusData = data.data;
      }

      setStatusOptions(statusData);
    } catch (error) {
      console.error("Error fetching status options:", error);
    }
  };

  // Fetch claim type options
  const fetchTypeOptions = async () => {
    try {
      const response = await fetch(`${baseUrl}/masters/claimtype`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      let typeData = [];
      if (data?.express21?.results?.data && Array.isArray(data.express21.results.data)) {
        typeData = data.express21.results.data;
      } else if (data?.results?.data && Array.isArray(data.results.data)) {
        typeData = data.results.data;
      } else if (Array.isArray(data)) {
        typeData = data;
      } else if (data.data && Array.isArray(data.data)) {
        typeData = data.data;
      }

      setTypeOptions(typeData);
    } catch (error) {
      console.error("Error fetching type options:", error);
    }
  };

  // Fetch claims list
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      const filterCols = [];
      const filterTexts = [];

      if (selectedStatus) {
        filterCols.push("status_id");
        filterTexts.push(selectedStatus);
      }

      if (selectedType) {
        filterCols.push("type_id");
        filterTexts.push(selectedType);
      }

      if (filterCols.length > 0) {
        params.append("filter_by_col", filterCols.join(","));
        params.append("filter_by_text", filterTexts.join(","));
      }

      if (startDate) {
        params.append("start_date", startDate);
      }

      if (endDate) {
        params.append("end_date", endDate);
      }

      if (searchKeyword) {
        params.append("keywords", searchKeyword);
      }

      const url = `${baseUrl}/operations/claim${params.toString() ? `?${params.toString()}` : ''}`;
      console.log("Fetching URL:", url);

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const jsonResponse = await response.json();
      console.log("API Response:", jsonResponse);

      let claimsData = [];
      let total = 0;

      if (jsonResponse?.express21?.results?.data && Array.isArray(jsonResponse.express21.results.data)) {
        claimsData = jsonResponse.express21.results.data;
        total = jsonResponse.express21.results.total_records || claimsData.length;
      }
      else if (jsonResponse?.results?.data && Array.isArray(jsonResponse.results.data)) {
        claimsData = jsonResponse.results.data;
        total = jsonResponse.results.total_records || claimsData.length;
      }
      else if (Array.isArray(jsonResponse)) {
        claimsData = jsonResponse;
        total = claimsData.length;
      }
      else if (jsonResponse?.data && Array.isArray(jsonResponse.data)) {
        claimsData = jsonResponse.data;
        total = jsonResponse.total_records || claimsData.length;
      }
      else {
        console.warn("Unknown response structure:", jsonResponse);
      }

      setClaims(claimsData);
      setTotalRecords(total);
    } catch (error) {
      console.error("Error fetching claims:", error);
      setClaims([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Get status name from status_id
  const getStatusName = (statusId) => {
    if (!statusId) return "-";
    const status = statusOptions.find(s => String(s.id) === String(statusId));
    return status ? status.name : `Status ${statusId}`;
  };

  // Get type name from type_id
  const getTypeName = (typeId) => {
    if (!typeId) return "-";
    const type = typeOptions.find(t => String(t.id) === String(typeId));
    return type ? type.name : `Jenis ${typeId}`;
  };

  // Get type badge styling
  const getTypeBadge = (typeName) => {
    const typeColorMap = {
      "RUSAK": { bg: "bg-red-500", border: "border-red-600", text: "text-white" },
      "RUSAK SEBAGIAN": { bg: "bg-orange-500", border: "border-orange-600", text: "text-white" },
      "RUSAK TOTAL": { bg: "bg-red-700", border: "border-red-800", text: "text-white" },
      "KERUSAKAN": { bg: "bg-rose-500", border: "border-rose-600", text: "text-white" },
      "PENYOK": { bg: "bg-orange-500", border: "border-orange-600", text: "text-white" },
      "HILANG": { bg: "bg-gray-700", border: "border-gray-800", text: "text-white" },
      "HILANG SEBAGIAN": { bg: "bg-gray-500", border: "border-gray-600", text: "text-white" },
      "KETERLAMBATAN": { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-white" },
      "DELAY": { bg: "bg-amber-500", border: "border-amber-600", text: "text-white" },
      "KEKURANGAN": { bg: "bg-purple-500", border: "border-purple-600", text: "text-white" },
      "KELEBIHAN": { bg: "bg-indigo-500", border: "border-indigo-600", text: "text-white" },
      "BASAH": { bg: "bg-cyan-500", border: "border-cyan-600", text: "text-white" },
      "PENYUSUTAN": { bg: "bg-teal-500", border: "border-teal-600", text: "text-white" },
      "SALAH KIRIM": { bg: "bg-pink-500", border: "border-pink-600", text: "text-white" },
      "SALAH ALAMAT": { bg: "bg-fuchsia-500", border: "border-fuchsia-600", text: "text-white" },
      "KOMPLAIN": { bg: "bg-slate-500", border: "border-slate-600", text: "text-white" },
      "RETUR": { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-white" }
    };

    const defaultStyle = { bg: "bg-blue-500", border: "border-blue-600", text: "text-white" };

    let matchedKey = Object.keys(typeColorMap).find(key =>
      typeName?.toUpperCase() === key
    );

    if (!matchedKey) {
      matchedKey = Object.keys(typeColorMap).find(key =>
        typeName?.toUpperCase().includes(key)
      );
    }

    const style = matchedKey ? typeColorMap[matchedKey] : defaultStyle;

    return {
      bg: style.bg,
      border: style.border,
      text: style.text,
    };
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      "CREATED": { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-700/10", icon: <FaClock className="mr-1" size={10} /> },
      "VERIFIED": { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-600/20", icon: <MdVerified className="mr-1" size={10} /> },
      "ACCEPTED": { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-600/20", icon: <FaCheckCircle className="mr-1" size={10} /> },
      "REJECTED": { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/10", icon: <FaTimesCircle className="mr-1" size={10} /> },
      "RETURNED": { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-500/10", icon: <FaUndo className="mr-1" size={10} /> }
    };
    return statusMap[status] || { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-500/10", icon: null };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "-";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get summary statistics
  const getSummaryStats = () => {
    const total = claims.length;
    const totalValue = claims.reduce((sum, claim) => sum + (claim.total_price || 0), 0);
    const accepted = claims.filter(c => c.status_name === "ACCEPTED").length;
    const pending = claims.filter(c => c.status_name === "CREATED" || c.status_name === "VERIFIED").length;
    const returned = claims.filter(c => c.status_name === "RETURNED").length;
    const rejected = claims.filter(c => c.status_name === "REJECTED").length;

    return { total, totalValue, accepted, pending, returned, rejected };
  };

  // Handle row click
  const handleRowClick = (claimId) => {
    console.log("Navigating to claim ID:", claimId);
    navigate(`/Operations/Claim/List/${claimId}`);
  };

  // Handle edit button click
  const handleEditClick = (claimId, event) => {
    event.stopPropagation();
    console.log("Editing claim ID:", claimId);
    navigate(`/Operations/Claim/List/${claimId}`);
  };

  // Handle view detail modal
  const handleViewDetail = (claim, event) => {
    event.stopPropagation();
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  // ============================================================
  // HANDLE VIEW PDF — fetch with auth token, then open blob
  // (so protected endpoints work; window.open alone would 401)
  // ============================================================
  const handleViewPDF = async (claimId, event) => {
    event?.stopPropagation();
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${baseUrl}/operations/claim/pdf?id=${claimId}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Basic ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            data: { message: `HTTP ${response.status} - Gagal mengunduh PDF` },
          },
        };
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Open PDF in new tab
      window.open(blobUrl, "_blank");

      // Revoke after a delay (so the tab can load it first)
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (error) {
      console.error("Error viewing PDF:", error);
      showApiError(error, "Gagal membuka PDF klaim.");
    }
  };

  // Handle view image
  const handleViewImage = (imageUrl, event) => {
    event?.stopPropagation();
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Handle verify action
  const handleVerify = async (claimId, event) => {
    event.stopPropagation();
    try {
      const response = await fetch(`${baseUrl}/operations/claim/verify`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: claimId }),
      });

      if (response.ok) {
        await fetchClaims();
      } else {
        showApiError(
          { message: "Gagal memverifikasi klaim. Silakan coba lagi." },
          "Gagal memverifikasi klaim."
        );
      }
    } catch (error) {
      console.error("Error verifying claim:", error);
      showApiError(error, "Terjadi kesalahan saat memverifikasi klaim.");
    }
  };

  // ============================================================
  // HANDLE DELETE CLAIM (opens confirmation modal)
  // ============================================================
  const handleDelete = (claimId, event) => {
    event.stopPropagation();

    const claim = claims.find(c => (c.id || c.claim_id) === claimId);

    setDeleteConfirm({
      isOpen: true,
      claimId,
      claimCode: claim?.claim_code || '-',
      shipmentCode: claim?.shipment_code || '-',
    });
  };

  // ============================================================
  // ACTUALLY PERFORM THE DELETE AFTER CONFIRMATION
  // ============================================================
  const confirmDeleteClaim = async () => {
    const { claimId, claimCode, shipmentCode } = deleteConfirm;
    if (!claimId) return;

    setDeleteConfirm({ isOpen: false, claimId: null, claimCode: '', shipmentCode: '' });

    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await fetch(`${baseUrl}/operations/claim`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: claimId }),
      });

      let responseBody = null;
      try { responseBody = await response.json(); } catch (e) {}

      if (!response.ok) {
        throw {
          response: { data: responseBody, status: response.status },
          message: responseBody?.message || `HTTP ${response.status}`,
        };
      }

      const deletedId = responseBody?.id ?? claimId;

      showSuccess(
        '✅ Klaim Dihapus',
        `Klaim berhasil dihapus!\n\n` +
        `🆔 ID Klaim: ${deletedId}\n` +
        `📋 Kode Klaim: ${claimCode}\n` +
        `📦 No. Resi: ${shipmentCode}`
      );

      // ✅ Optimistic remove (instant UI update) — no waiting for API
      setClaims(prev => prev.filter(c => (c.id || c.claim_id) !== claimId));

      // ✅ Then re-fetch from server to ensure sync with DB
      await fetchClaims();

    } catch (error) {
      console.error('Error deleting claim:', error);
      showApiError(error, 'Gagal menghapus klaim. Silakan coba lagi.');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(text);
    showInfo('📋 Copied', 'Nomor resi berhasil dicopy ke clipboard!');
  };

  // Handle search
  const handleSearch = () => {
    setSelectedStatus(tempSelectedStatus);
    setSelectedType(tempSelectedType);
    setSearchKeyword(tempSearchKeyword);

    if (tempStartDate && tempEndDate) {
      const isValid = validateDateRange(tempStartDate, tempEndDate);
      if (!isValid) return;
    }

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
  };

  // Handle reset filters
  const handleReset = () => {
    setTempSelectedStatus("");
    setTempSelectedType("");
    setTempStartDate('');
    setTempEndDate('');
    setTempSearchKeyword('');
    setSelectedStatus("");
    setSelectedType("");
    setStartDate('');
    setEndDate('');
    setSearchKeyword('');
    setDateError('');
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sorted and paginated claims
  const getSortedAndPaginatedClaims = () => {
    let sorted = [...claims];

    sorted.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";

      if (sortField === "total_price") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (sortField === "created_date" || sortField === "modified_date") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sorted.slice(start, end);
  };

  // ============================================================
  // PAGINATION HELPER — Generate page numbers with ellipsis
  // ============================================================
  const getPaginationPages = () => {
    const totalPages = Math.ceil(claims.length / itemsPerPage);
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = maxVisible;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - maxVisible + 1;
      endPage = totalPages - 1;
    }

    if (startPage > 2) pages.push('...');

    for (let i = startPage; i <= endPage; i++) pages.push(i);

    if (endPage < totalPages - 1) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  // Set current date and user role
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setCurrentDate(formattedDate);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setTempStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setTempEndDate(today.toISOString().split('T')[0]);

    const role = getUserRole();
    setUserRole(role);
    console.log("User role:", role);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchStatusOptions();
    fetchTypeOptions();
    fetchClaims();
  }, []);

  // Fetch claims when filter states change
  useEffect(() => {
    fetchClaims();
  }, [selectedStatus, selectedType, startDate, endDate]);

  // Search keyword effect
  useEffect(() => {
    if (searchKeyword !== undefined) {
      fetchClaims();
    }
  }, [searchKeyword]);

  const stats = getSummaryStats();
  const displayedClaims = getSortedAndPaginatedClaims();
  const totalPages = Math.ceil(claims.length / itemsPerPage);

  return (
    <>
      <style>{styles}</style>

      {/* ANIMATED ALERT */}
      <AnimatedAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        details={alert.details}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-[100px] pb-12 px-4 sm:px-8 font-sans text-gray-900">
        <div className="max-w-7xl mx-auto">

          {canVerify && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                ✅ Anda memiliki akses verifikasi sebagai {userRole}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Klaim</h1>
            <p className="text-gray-600">Kelola dan pantau status pengajuan klaim armada Anda</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Klaim</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <FaFileAlt className="text-blue-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Klaim Diterima</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.accepted}</p>
                </div>
                <div className="bg-emerald-100 rounded-full p-3">
                  <FaCheckCircle className="text-emerald-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Menunggu Proses</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <FaClock className="text-amber-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ditolak/Dikembalikan</p>
                  <p className="text-2xl font-bold text-red-600">{stats.returned + stats.rejected}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <FaTimesCircle className="text-red-600" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Filter Data</h3>
              {dateError && (
                <span className="text-xs text-red-600 ml-2 animate-shake">{dateError}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-48">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filter Jenis</label>
                <select
                  value={tempSelectedType}
                  onChange={(e) => setTempSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Semua Jenis</option>
                  {typeOptions.map((type, index) => (
                    <option key={type.id || index} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Filter Status</label>
                <select
                  value={tempSelectedStatus}
                  onChange={(e) => setTempSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Semua Status</option>
                  {statusOptions.map((status, index) => (
                    <option key={status.id || index} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Range</label>
                <div className="flex items-center gap-2">
                  <DatePicker
                    startDate={tempStartDate}
                    endDate={tempEndDate}
                    onStartDateChange={setTempStartDate}
                    onEndDateChange={setTempEndDate}
                    onApply={() => {
                      if (tempStartDate && tempEndDate) {
                        validateDateRange(tempStartDate, tempEndDate);
                      }
                    }}
                    onClear={() => {
                      setTempStartDate('');
                      setTempEndDate('');
                      setDateError('');
                    }}
                    error={dateError}
                    showPicker={showDatePicker}
                    setShowPicker={setShowDatePicker}
                    buttonText="Select date range"
                    showCalendarIcon={false}
                  />

                  {tempStartDate && tempEndDate && getDaysDifference() > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn">
                      <FaClock size={14} className="text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium whitespace-nowrap">
                        {getDaysDifference()} days
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pencarian</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={tempSearchKeyword}
                    onChange={(e) => setTempSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Cari No. Resi / No. Surat / Customer..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Cari
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Active filters indicator */}
            {(startDate || endDate || selectedStatus || selectedType || searchKeyword) && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200 animate-fadeIn">
                <span className="text-xs text-slate-500 font-medium">Active Filters:</span>
                {startDate && endDate && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    <FaCalendarAlt size={12} />
                    {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setDateError('');
                        setTempStartDate('');
                        setTempEndDate('');
                      }}
                      className="ml-1 hover:text-blue-900"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    Status: {getStatusName(selectedStatus)}
                    <button
                      onClick={() => {
                        setSelectedStatus('');
                        setTempSelectedStatus('');
                      }}
                      className="ml-1 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    Jenis: {getTypeName(selectedType)}
                    <button
                      onClick={() => {
                        setSelectedType('');
                        setTempSelectedType('');
                      }}
                      className="ml-1 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searchKeyword && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    <FaSearch size={12} />
                    {searchKeyword}
                    <button
                      onClick={() => {
                        setSearchKeyword('');
                        setTempSearchKeyword('');
                      }}
                      className="ml-1 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-gray-900 font-bold text-xl tracking-tight">
                  List Pengajuan Klaim
                </h2>
                <p className="text-xs text-gray-500 mt-1">Kelola dan pantau status klaim armada Anda</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to page 1 when changing page size
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value={15}>15 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <button
                  onClick={() => navigate('/Operations/Claim/Detail')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all text-sm"
                >
                  <FaPlus size={12} /> Tambah Data
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : displayedClaims.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Tidak ada data klaim</p>
                  <button onClick={fetchClaims} className="text-blue-600 hover:text-blue-700 text-sm">
                    Refresh data
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-black border-collapse min-w-[1400px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        {canVerify && (
                          <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Verify</th>
                        )}
                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Aksi</th>
                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort("shipment_code")}>
                          No. Resi {sortField === "shipment_code" && (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No. Surat Klaim</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort("created_date")}>
                          Tanggal Dibuat {sortField === "created_date" && (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="p-4 text-xs font-bold text-black-500 uppercase tracking-wider">Customer</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ownership</th>
                        <th className="p-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Status</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort("total_price")}>
                          Total Harga {sortField === "total_price" && (sortDirection === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dibuat Oleh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayedClaims.map((claim, index) => {
                        const displayStatus = claim.status_name || getStatusName(claim.status_id);
                        const displayType = claim.type_name || getTypeName(claim.type_id);
                        const statusStyle = getStatusBadge(displayStatus);
                        const typeStyle = getTypeBadge(displayType);
                        const isVerified = claim.is_verified === 1;
                        const claimId = claim.id || claim.claim_id;
                        const isAccepted = displayStatus === "ACCEPTED";

                        return (
                          <tr
                            key={claimId || index}
                            className="hover:bg-blue-50/20 transition-colors group cursor-pointer"
                            onClick={() => handleRowClick(claimId)}
                          >
                            {canVerify && (
                              <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => handleVerify(claimId, e)}
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all w-full justify-center ${isVerified
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                                    }`}
                                  title={isVerified ? "Klik untuk batalkan verifikasi" : "Klik untuk verifikasi"}
                                >
                                  {isVerified ? (
                                    <>
                                      <FaCheck size={10} /> Terverifikasi
                                    </>
                                  ) : (
                                    <>
                                      <FaTimes size={10} /> Verifikasi
                                    </>
                                  )}
                                </button>
                              </td>
                            )}

                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1 justify-center flex-wrap">
                                <button
                                  onClick={(e) => handleViewDetail(claim, e)}
                                  className="p-1.5 rounded-md hover:bg-blue-100 text-blue-600"
                                  title="Lihat Detail"
                                >
                                  <FaInfoCircle size={14} />
                                </button>
                                <button
                                  onClick={(e) => handleEditClick(claimId, e)}
                                  className="p-1.5 rounded-md hover:bg-green-100 text-green-600"
                                  title="Edit Data"
                                >
                                  <FaEdit size={14} />
                                </button>

                                {/* ✅ PRINT/PDF BUTTON — ONLY WHEN STATUS = ACCEPTED */}
                                {isAccepted && (
                                  <button
                                    onClick={(e) => handleViewPDF(claimId, e)}
                                    className="p-1.5 rounded-md hover:bg-red-100 text-red-600"
                                    title="Cetak PDF"
                                  >
                                    <FaPrint size={14} />
                                  </button>
                                )}

                                {claim.link_url && (
                                  <button
                                    onClick={(e) => handleViewImage(claim.link_url, e)}
                                    className="p-1.5 rounded-md hover:bg-purple-100 text-purple-600"
                                    title="Lihat Gambar"
                                  >
                                    <FaImage size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => copyToClipboard(claim.shipment_code, e)}
                                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                                  title="Copy Resi"
                                >
                                  <FaCopy size={14} />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(claimId, e)}
                                  className="p-1.5 rounded-md hover:bg-red-100 text-red-600"
                                  title="Hapus"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </td>

                            <td className="p-4 text-center text-sm font-medium text-gray-400">
                              {((currentPage - 1) * itemsPerPage) + index + 1}
                            </td>

                            <td className="p-4">
                              <div className="font-bold text-gray-900">{claim.shipment_code || "-"}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {claim.claim_code || "-"}
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-gray-700">{formatDate(claim.created_date)}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-gray-800">{claim.customer_name || "-"}</div>
                              <div className="text-xs text-gray-500">{claim.customer_code || "-"}</div>
                            </td>

                            <td className="p-4">
                              <span className={`inline-block ${typeStyle.bg} ${typeStyle.border} text-white text-xs font-bold px-3 py-1 rounded-md text-center min-w-[85px] shadow-sm border`}>
                                {displayType}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${claim.ownership === "ANDALAN" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                }`}>
                                {claim.ownership || "-"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-bold w-24 ${statusStyle.bg} ${statusStyle.text} ring-1 ring-inset ${statusStyle.ring}`}>
                                {statusStyle.icon} {displayStatus}
                              </span>
                              {claim.reject_reason && claim.reject_reason !== " - " && (
                                <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={claim.reject_reason}>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-sm font-bold text-gray-900">
                              {formatCurrency(claim.total_price)}
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {claim.created_by || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ============================================================ */}
                {/* PAGINATION — 15 items per page                                */}
                {/* ============================================================ */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Info: Showing X - Y of Z */}
                    <div className="text-sm text-gray-600">
                      Menampilkan{" "}
                      <span className="font-semibold text-gray-900">
                        {((currentPage - 1) * itemsPerPage) + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold text-gray-900">
                        {Math.min(currentPage * itemsPerPage, claims.length)}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-gray-900">{claims.length}</span> data
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {/* First Page */}
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        title="Halaman Pertama"
                      >
                        ««
                      </button>

                      {/* Previous */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {getPaginationPages().map((page, idx) => {
                          if (page === '...') {
                            return (
                              <span
                                key={`ellipsis-${idx}`}
                                className="px-2 py-1.5 text-sm text-gray-400 select-none"
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                currentPage === page
                                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        title="Halaman Terakhir"
                      >
                        »»
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Detail Klaim #{selectedClaim.id || selectedClaim.claim_id}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Status Verifikasi</label>
                  <p className={`font-medium inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${selectedClaim.is_verified === 1
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                    }`}>
                    {selectedClaim.is_verified === 1 ? (
                      <><FaCheck size={12} /> Terverifikasi</>
                    ) : (
                      <><FaTimes size={12} /> Belum Verifikasi</>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">No. Resi</label>
                  <p className="text-black font-medium">{selectedClaim.shipment_code}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">No. Surat Klaim</label>
                  <p className="text-black font-medium">{selectedClaim.claim_code || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Customer</label>
                  <p className="text-black font-medium">{selectedClaim.customer_name}</p>
                  <p className="text-xs text-gray-500">{selectedClaim.customer_code}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Ownership</label>
                  <p className="text-black font-medium">{selectedClaim.ownership}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Jenis Klaim</label>
                  <p className="text-black font-medium">{selectedClaim.type_name || getTypeName(selectedClaim.type_id)}</p>
                  <p className="text-xs text-gray-400">Type ID: {selectedClaim.type_id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Total Harga</label>
                  <p className="text-black font-medium text-emerald-600">{formatCurrency(selectedClaim.total_price)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tanggal Dibuat</label>
                  <p className="text-black font-medium">{formatDate(selectedClaim.created_date)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Dibuat Oleh</label>
                  <p className="text-black font-medium">{selectedClaim.created_by}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Terakhir Diubah</label>
                  <p className="text-black font-medium">{formatDate(selectedClaim.modified_date)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Diubah Oleh</label>
                  <p className="text-black font-medium">{selectedClaim.modified_by}</p>
                </div>
                {selectedClaim.reject_reason && selectedClaim.reject_reason !== " - " && (
                  <div className="col-span-2">
                  </div>
                )}
              </div>

              {selectedClaim.link_url && (
                <div>
                  <label className="text-xs text-gray-500">Dokumen Pendukung</label>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => window.open(selectedClaim.link_url, '_blank')}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <FaExternalLinkAlt size={12} /> Lihat Dokumen
                    </button>
                    <button
                      onClick={() => handleViewImage(selectedClaim.link_url)}
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
                    >
                      <FaImage size={12} /> Preview Gambar
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{selectedClaim.link_filename}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">

                {/* ✅ PRINT/PDF BUTTON IN MODAL — ONLY WHEN STATUS = ACCEPTED */}
                {(selectedClaim.status_name || getStatusName(selectedClaim.status_id)) === "ACCEPTED" && (
                  <button
                    onClick={(e) => handleViewPDF(selectedClaim.id || selectedClaim.claim_id, e)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FaPrint size={14} /> Cetak PDF
                  </button>
                )}

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
            <img src={selectedImage} alt="Claim Document" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================ */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm({ isOpen: false, claimId: null, claimCode: '', shipmentCode: '' })}
          />
          <div className="relative max-w-md w-full rounded-xl shadow-2xl bg-white p-6 animate-slideDown">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FaTrash className="text-red-600" size={20} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ⚠️ Konfirmasi Hapus Klaim
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Apakah Anda yakin ingin menghapus klaim ini?
                  <br />
                  <span className="text-xs text-red-600 font-medium">
                    Seluruh data barang terkait juga akan terhapus secara permanen.
                  </span>
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">ID Klaim:</span>
                    <span className="font-mono font-semibold text-red-700">{deleteConfirm.claimId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Kode Klaim:</span>
                    <span className="font-medium text-gray-800">{deleteConfirm.claimCode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">No. Resi:</span>
                    <span className="font-medium text-gray-800">{deleteConfirm.shipmentCode}</span>
                  </div>
                </div>

                <p className="text-xs text-red-600 mt-3 font-medium">
                  ⚠️ Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, claimId: null, claimCode: '', shipmentCode: '' })}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteClaim}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
              >
                <FaTrash size={13} /> Hapus Klaim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClaimList;