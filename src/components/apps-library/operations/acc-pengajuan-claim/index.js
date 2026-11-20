import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaPlus, FaChevronDown, FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaEye, FaPrint, FaClock, FaUndo, FaCommentAlt } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// ============================================
// MODULE-LEVEL STATE - Survives component remounts
// ============================================
const memory = {
  page: 1,
  itemsPerPage: 10,
  scrollY: 0,
  clickedId: null,
  clickedIndex: null
};

const ClaimList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read from URL
  const params = new URLSearchParams(location.search);
  const urlPage = parseInt(params.get('page'));
  const urlItems = parseInt(params.get('itemsPerPage'));
  
  // Check if there's a claim stored in window memory (from detail page)
  const storedData = window.__returnToClaim || null;
  const storedClaimId = storedData?.claimId || null;
  const storedPage = storedData?.page || null;
  const storedItems = storedData?.itemsPerPage || null;

  console.log("=== CLAIM LIST ===");
  console.log("URL page:", urlPage);
  console.log("Stored from detail:", storedData);
  console.log("Stored claim ID:", storedClaimId);
  console.log("Stored page:", storedPage);
  console.log("Memory page:", memory.page);

  // ============================================
  // DETERMINE FINAL PAGE
  // ============================================
  let finalPage = 1;
  let finalItems = 10;

  if (urlPage && !isNaN(urlPage) && urlPage > 0) {
    finalPage = urlPage;
    console.log("✅ Using URL page:", urlPage);
  } else if (storedPage && !isNaN(storedPage) && storedPage > 0) {
    finalPage = storedPage;
    console.log("✅ Using stored page from detail:", storedPage);
  } else if (memory.page && memory.page > 0) {
    finalPage = memory.page;
    console.log("✅ Using memory page:", memory.page);
  }

  if (urlItems && !isNaN(urlItems) && urlItems > 0) {
    finalItems = urlItems;
  } else if (storedItems && !isNaN(storedItems) && storedItems > 0) {
    finalItems = storedItems;
  } else if (memory.itemsPerPage && memory.itemsPerPage > 0) {
    finalItems = memory.itemsPerPage;
  }

  console.log("🔵 Final page:", finalPage);
  console.log("🔵 Final itemsPerPage:", finalItems);
  console.log("🔵 Highlighting ID:", storedClaimId || memory.clickedId);

  // ============================================
  // ALL STATE DECLARATIONS
  // ============================================
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(finalPage);
  const [itemsPerPage, setItemsPerPage] = useState(finalItems);

  const tableRef = useRef(null);
  const hasRestored = useRef(false);
  const isSearchingForClaim = useRef(false);

  const [highlightedId, setHighlightedId] = useState(storedClaimId || memory.clickedId);

  // Dynamic Option states
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  // Modal states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedAcceptClaimId, setSelectedAcceptClaimId] = useState(null);
  const [selectedAcceptShipmentCode, setSelectedAcceptShipmentCode] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectClaimId, setSelectedRejectClaimId] = useState(null);
  const [selectedRejectShipmentCode, setSelectedRejectShipmentCode] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  // Filters state
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ============================================
  // BASE URL & AUTH
  // ============================================
  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: token ? `Basic ${token}` : "",
      "Content-Type": "application/json",
    };
  };

  // ============================================
  // FIND AND NAVIGATE TO CLAIM
  // ============================================
  const findAndNavigateToClaim = (claimId, data) => {
    if (!claimId || !data || data.length === 0) return false;
    
    console.log("🔍 Searching for claim ID:", claimId);
    console.log("🔍 Total claims:", data.length);
    console.log("🔍 Items per page:", itemsPerPage);
    console.log("🔍 Current page:", currentPage);
    
    const index = data.findIndex(item => {
      const id = item.id || item.claim_id;
      return String(id) === String(claimId);
    });
    
    if (index === -1) {
      console.log("❌ Claim ID not found in data:", claimId);
      return false;
    }
    
    console.log("✅ Claim found at index:", index);
    
    const calculatedPage = Math.floor(index / itemsPerPage) + 1;
    console.log("📄 Calculated page:", calculatedPage);
    console.log("📄 Current page:", currentPage);
    
    if (calculatedPage !== currentPage) {
      console.log("🔄 Navigating to page:", calculatedPage);
      setCurrentPage(calculatedPage);
      memory.page = calculatedPage;
      
      const p = new URLSearchParams();
      p.set('page', calculatedPage);
      p.set('itemsPerPage', itemsPerPage);
      navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
      
      setHighlightedId(claimId);
      memory.clickedId = claimId;
      
      return true;
    }
    
    return true;
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (!loading && filteredClaims.length > 0 && storedClaimId && !hasRestored.current) {
      console.log("🔍 Checking for stored claim ID:", storedClaimId);
      
      const found = findAndNavigateToClaim(storedClaimId, filteredClaims);
      
      if (!found) {
        console.log("🔄 Trying full claims list...");
        findAndNavigateToClaim(storedClaimId, claims);
      }
      
      hasRestored.current = true;
    }
  }, [loading, filteredClaims, claims, storedClaimId, itemsPerPage]);

  useEffect(() => {
    if (!loading && filteredClaims.length > 0) {
      const idToHighlight = highlightedId || storedClaimId || memory.clickedId;
      
      if (idToHighlight) {
        setTimeout(() => {
          const row = document.getElementById(`row-${idToHighlight}`);
          if (row) {
            console.log("🔵 Highlighting row:", idToHighlight);
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.style.backgroundColor = '#fef3c7';
            row.style.transition = 'background-color 0.5s';
            setTimeout(() => {
              row.style.backgroundColor = '';
            }, 300);
            
            setTimeout(() => {
              memory.clickedId = null;
              memory.clickedIndex = null;
              setHighlightedId(null);
            }, 300);
          } else {
            console.log("🔵 Row not found in current data:", idToHighlight);
            if (storedClaimId) {
              console.log("🔄 Retrying search for claim:", storedClaimId);
              findAndNavigateToClaim(storedClaimId, filteredClaims);
            }
          }
        }, 500);
      }
      
      if (memory.scrollY > 0 && !highlightedId) {
        setTimeout(() => {
          window.scrollTo({ top: memory.scrollY, behavior: 'smooth' });
        }, 300);
      }
    }
  }, [loading, filteredClaims, highlightedId, storedClaimId, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.__returnToClaim = null;
      console.log("🔵 Cleared window.__returnToClaim");
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('page', currentPage);
    p.set('itemsPerPage', itemsPerPage);
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    memory.page = currentPage;
    memory.itemsPerPage = itemsPerPage;
    console.log("🔵 Updated memory page:", memory.page);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const saveScroll = () => {
      memory.scrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', saveScroll);
    return () => window.removeEventListener('scroll', saveScroll);
  }, []);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getStatusName = (id) => {
    if (!id) return "-";
    const s = statusOptions.find(x => String(x.id) === String(id));
    return s ? s.name : `Status ${id}`;
  };

  const getTypeName = (id) => {
    if (!id) return "-";
    const t = typeOptions.find(x => String(x.id) === String(id));
    return t ? t.name : `Jenis ${id}`;
  };

  const getStatusBadge = (status) => {
    const map = {
      "CREATED": { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-700/10", icon: <FaClock className="mr-1" size={10} /> },
      "VERIFIED": { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-600/20", icon: <MdVerified className="mr-1" size={10} /> },
      "ACCEPTED": { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-600/20", icon: <FaCheckCircle className="mr-1" size={10} /> },
      "REJECTED": { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-600/10", icon: <FaTimesCircle className="mr-1" size={10} /> },
      "RETURNED": { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-500/10", icon: <FaUndo className="mr-1" size={10} /> }
    };
    return map[status] || { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-500/10", icon: null };
  };

  const getTypeBadge = (name) => {
    const map = {
      "RUSAK": { bg: "bg-red-500", border: "border-red-600", text: "text-white" },
      "PENYOK": { bg: "bg-orange-500", border: "border-orange-600", text: "text-white" },
      "HILANG": { bg: "bg-gray-700", border: "border-gray-800", text: "text-white" },
      "KERUSAKAN": { bg: "bg-rose-500", border: "border-rose-600", text: "text-white" },
      "KETERLAMBATAN": { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-white" },
      "KEKURANGAN": { bg: "bg-purple-500", border: "border-purple-600", text: "text-white" },
      "KELEBIHAN": { bg: "bg-indigo-500", border: "border-indigo-600", text: "text-white" },
      "BASAH": { bg: "bg-cyan-500", border: "border-cyan-600", text: "text-white" },
      "SALAH KIRIM": { bg: "bg-pink-500", border: "border-pink-600", text: "text-white" },
      "RETUR": { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-white" }
    };
    const defaultStyle = { bg: "bg-blue-500", border: "border-blue-600", text: "text-white" };
    const key = Object.keys(map).find(k => name?.toUpperCase().includes(k));
    return key ? map[key] : defaultStyle;
  };

  // ============================================
  // FETCH FUNCTIONS
  // ============================================
  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseUrl}/operations/claim?filter_by_col=is_verified&filter_by_text=1`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      let data = json?.express21?.results?.data || json?.results?.data || json?.data || [];
      if (!Array.isArray(data)) data = [];
      setClaims(data);
      setFilteredClaims(data);
    } catch (err) {
      setError(err.message);
      setClaims([]);
      setFilteredClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const res = await fetch(`${baseUrl}/masters/claimstatus`, { headers: getAuthHeaders() });
      const json = await res.json();
      const data = json?.express21?.results?.data || json?.results?.data || json?.data || [];
      setStatusOptions(data);
    } catch (e) { console.error(e); }
  };

  const fetchTypeOptions = async () => {
    try {
      const res = await fetch(`${baseUrl}/masters/claimtype`, { headers: getAuthHeaders() });
      const json = await res.json();
      const data = json?.express21?.results?.data || json?.results?.data || json?.data || [];
      setTypeOptions(data);
    } catch (e) { console.error(e); }
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================
  const handleFilter = () => {
    let result = [...claims];
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(c =>
        c.shipment_code?.toLowerCase().includes(kw) ||
        c.claim_code?.toLowerCase().includes(kw) ||
        c.customer_name?.toLowerCase().includes(kw)
      );
    }
    if (selectedType) result = result.filter(c => String(c.type_id) === String(selectedType));
    if (selectedStatus) result = result.filter(c => String(c.status_id) === String(selectedStatus));
    if (startDate) result = result.filter(c => new Date(c.created_date) >= new Date(startDate));
    if (endDate) result = result.filter(c => new Date(c.created_date) <= new Date(endDate + "T23:59:59.999Z"));
    setFilteredClaims(result);
    console.log("Filtered claims:", result.length);
  };

  const handleShowReason = (reason, e) => {
    e?.stopPropagation();
    setSelectedReason(reason);
    setShowReasonModal(true);
  };

  const openAcceptModal = (id, code, e) => {
    e.stopPropagation();
    setSelectedAcceptClaimId(id);
    setSelectedAcceptShipmentCode(code);
    setShowAcceptModal(true);
  };

  const handleAcceptClaim = async () => {
    try {
      const res = await fetch(`${baseUrl}/operations/claim/accepted`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: selectedAcceptClaimId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Klaim ${selectedAcceptShipmentCode} diterima!`);
        setShowAcceptModal(false);
        setSelectedAcceptClaimId(null);
        setSelectedAcceptShipmentCode("");
        await fetchClaims();
      } else {
        alert(`Gagal: ${data.message || "Unknown error"}`);
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handlePrintSurat = (id, e) => {
    e.stopPropagation();
    window.open(`${baseUrl}/operations/claim/pdf?id=${id}`, '_blank');
  };

  const handleViewDetail = (claimId, index, e) => {
    e?.stopPropagation();
    
    memory.page = currentPage;
    memory.itemsPerPage = itemsPerPage;
    memory.scrollY = window.scrollY || 0;
    memory.clickedId = claimId;
    memory.clickedIndex = index;
    
    window.__returnToClaim = {
      claimId: claimId,
      page: currentPage,
      itemsPerPage: itemsPerPage,
      timestamp: Date.now()
    };
    
    console.log("🔵 SAVED TO MEMORY:", {
      page: memory.page,
      itemsPerPage: memory.itemsPerPage,
      clickedId: memory.clickedId,
      clickedIndex: memory.clickedIndex,
      scrollY: memory.scrollY
    });
    
    navigate(`/Operations/Claim/List/${claimId}?page=${currentPage}&itemsPerPage=${itemsPerPage}`);
  };

  const openRejectModal = (id, code, e) => {
    e.stopPropagation();
    setSelectedRejectClaimId(id);
    setSelectedRejectShipmentCode(code);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectClaim = async () => {
    if (!rejectReason.trim()) {
      alert("Berikan alasan penolakan");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/operations/claim/reject`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: selectedRejectClaimId, reject_reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Klaim ${selectedRejectShipmentCode} ditolak!`);
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedRejectClaimId(null);
        setSelectedRejectShipmentCode("");
        await fetchClaims();
      } else {
        alert(`Gagal: ${data.message || "Unknown error"}`);
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    memory.page = 1;
    handleFilter();
  };

  const handleReset = () => {
    setSelectedStatus("");
    setSelectedType("");
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setFilteredClaims(claims);
    setCurrentPage(1);
    memory.page = 1;
    memory.scrollY = 0;
    memory.clickedId = null;
    memory.clickedIndex = null;
    setHighlightedId(null);
    window.__returnToClaim = null;
  };

  // ============================================
  // EFFECTS FOR DATA LOADING
  // ============================================
  useEffect(() => {
    fetchStatusOptions();
    fetchTypeOptions();
    fetchClaims();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [claims]);

  const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    handleFilter();
    setCurrentPage(1);
    memory.page = 1;
  }, [selectedStatus, selectedType, startDate, endDate, searchKeyword]);

  // ============================================
  // PAGINATION FUNCTIONS
  // ============================================
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClaims.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);

  const handlePageChange = (page) => {
    console.log("🔵 Changing to page:", page);
    setCurrentPage(page);
    memory.page = page;
    const p = new URLSearchParams();
    p.set('page', page);
    p.set('itemsPerPage', itemsPerPage);
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleItemsPerPageChange = (val) => {
    console.log("🔵 Changing items per page to:", val);
    setItemsPerPage(val);
    memory.itemsPerPage = val;
    setCurrentPage(1);
    memory.page = 1;
    const p = new URLSearchParams();
    p.set('page', 1);
    p.set('itemsPerPage', val);
    navigate({ pathname: location.pathname, search: p.toString() }, { replace: true });
  };

  const getPageNumbers = () => {
    const nums = [];
    const max = 5;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) nums.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) nums.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) nums.push(i);
    }
    return nums;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const date = new Date(d);
      return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`;
    } catch { return "-"; }
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 pt-[100px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 pt-[100px] px-4">
        <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <button onClick={fetchClaims} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentData = getCurrentPageData();
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredClaims.length);

  return (
    <div className="min-h-screen bg-slate-100 pt-[100px] pb-12 px-4 sm:px-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filter Jenis</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-slate-50"
              >
                <option value="">Pilih Jenis</option>
                {typeOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filter Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-slate-50"
              >
                <option value="">Pilih Status</option>
                {statusOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Awal</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Akhir</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-slate-50" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t">
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
              placeholder="Masukkan Kata Kunci"
              className="w-full max-w-xs border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm bg-slate-50"
            />
            <button onClick={handleSearchClick} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Cari</button>
            <button onClick={handleReset} className="bg-gray-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600">Reset</button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">List Pengajuan Klaim Terverifikasi</h2>
            {(highlightedId || storedClaimId || memory.clickedId) && (
              <p className="text-xs text-blue-600 mt-1">🔵 Kembali ke klaim ID: {highlightedId || storedClaimId || memory.clickedId}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">Halaman {currentPage} dari {totalPages}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={e => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div ref={tableRef} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4 text-center w-16">No.</th>
                  <th className="p-4 text-center w-28">Lihat Detail</th>
                  <th className="p-4 w-44">No. Resi</th>
                  <th className="p-4 w-56">No. Surat Klaim</th>
                  <th className="p-4 w-36">Tanggal</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4 w-36">Jenis</th>
                  <th className="p-4 text-center w-40">Status</th>
                  <th className="p-4 text-center w-56">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr><td colSpan="9" className="text-center p-12 text-slate-400">Tidak ada data</td></tr>
                ) : (
                  currentData.map((claim, index) => {
                    const globalIndex = startIndex + index;
                    const status = claim.status_name || getStatusName(claim.status_id);
                    const statusStyle = getStatusBadge(status);
                    const isAccepted = status === 'ACCEPTED';
                    const isRejected = status === 'REJECTED';
                    const isReturned = status === 'RETURNED';
                    const type = claim.type_name || getTypeName(claim.type_id) || "-";
                    const typeStyle = getTypeBadge(type);
                    const hasRejectReason = claim.reject_reason && claim.reject_reason !== " - ";
                    const claimId = claim.id || claim.claim_id;
                    const rowId = `row-${claimId}`;
                    const isHighlighted = highlightedId === claimId || storedClaimId === claimId || memory.clickedId === claimId;

                    return (
                      <tr 
                        key={claimId || index} 
                        id={rowId}
                        className={`hover:bg-slate-50/70 transition-colors ${isHighlighted ? 'bg-amber-50' : ''}`}
                      >
                        <td className="p-3 text-center font-mono text-slate-400">{globalIndex}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={e => handleViewDetail(claimId, globalIndex - 1, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          >
                            <FaEye size={12} /> Detail
                          </button>
                        </td>
                        <td className="p-3 font-semibold">{claim.shipment_code || "-"}</td>
                        <td className="p-3 font-mono text-xs">{claim.claim_code || "-"}</td>
                        <td className="p-3 text-xs text-slate-500">{formatDate(claim.created_date)}</td>
                        <td className="p-3 font-medium">{claim.customer_name || "-"}</td>
                        <td className="p-3">
                          <span className={`inline-block ${typeStyle.bg} text-white text-xs font-bold px-3 py-0.5 rounded-md min-w-[85px] border ${typeStyle.border}`}>
                            {type}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold min-w-[100px] ${statusStyle.bg} ${statusStyle.text} ring-1 ring-inset ${statusStyle.ring}`}>
                            {statusStyle.icon} {status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isAccepted ? (
                            <button onClick={e => handlePrintSurat(claimId, e)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700">
                              <FaPrint size={12} /> Cetak
                            </button>
                          ) : isRejected || isReturned ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-slate-400 italic">{isRejected ? 'Ditolak' : 'Dikembalikan'}</span>
                              {hasRejectReason && (
                                <button onClick={e => handleShowReason(claim.reject_reason, e)} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                                  <FaCommentAlt size={10} /> Lihat Alasan
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex gap-2">
                                <button onClick={e => openAcceptModal(claimId, claim.shipment_code, e)} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700">
                                  <FaCheck size={10} className="inline mr-1" /> Accepted
                                </button>
                                <button onClick={e => openRejectModal(claimId, claim.shipment_code, e)} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700">
                                  <FaTimes size={10} className="inline mr-1" /> Rejected
                                </button>
                              </div>
                              {hasRejectReason && (
                                <button onClick={e => handleShowReason(claim.reject_reason, e)} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                                  <FaCommentAlt size={10} /> Lihat Alasan
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredClaims.length > 0 && totalPages > 1 && (
            <div className="border-t bg-slate-50/50 px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs text-slate-500">
                  Menampilkan {startIndex} - {endIndex} dari {filteredClaims.length} data
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <FaChevronLeft size={10} className="inline mr-1" /> Sebelumnya
                  </button>
                  
                  {getPageNumbers().map(p => (
                    <button 
                      key={p} 
                      onClick={() => handlePageChange(p)} 
                      className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-lg ${currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    Selanjutnya <FaChevronRight size={10} className="inline ml-1" />
                  </button>
                  
                  <select 
                    value={currentPage} 
                    onChange={e => handlePageChange(Number(e.target.value))} 
                    className="border border-slate-300 rounded-lg px-2 py-1 text-xs bg-white"
                  >
                    {[...Array(totalPages)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="border-b px-6 py-4"><h3 className="text-lg font-semibold">Konfirmasi Penerimaan</h3></div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">Setujui klaim dengan no.resi:</p>
              <p className="text-lg font-bold text-center py-2 bg-slate-50 rounded-lg border">{selectedAcceptShipmentCode}</p>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowAcceptModal(false)} className="px-4 py-2 text-sm font-medium bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
              <button onClick={handleAcceptClaim} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Lanjut</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="border-b px-6 py-4"><h3 className="text-lg font-semibold">Tolak Klaim</h3></div>
            <div className="p-6">
              <p className="text-slate-700 mb-4">Tolak klaim dengan no.resi:</p>
              <p className="text-lg font-bold text-center py-2 bg-slate-50 rounded-lg border">{selectedRejectShipmentCode}</p>
              <label className="block text-sm font-medium text-slate-700 mt-4 mb-2">Alasan Penolakan</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Masukkan alasan..." />
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm font-medium bg-slate-100 rounded-lg hover:bg-slate-200">Batal</button>
              <button onClick={handleRejectClaim} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Tolak</button>
            </div>
          </div>
        </div>
      )}

      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FaCommentAlt className="text-red-600" /> Alasan Penolakan</h3>
              <button onClick={() => setShowReasonModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{selectedReason}</p>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowReasonModal(false)} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimList;