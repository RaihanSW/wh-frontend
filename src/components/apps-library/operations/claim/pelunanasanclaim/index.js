import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaFileInvoiceDollar, FaBuilding, 
  FaUserTie, FaRegStickyNote, FaCalendarAlt, FaHashtag,
  FaPrint 
} from "react-icons/fa";

const PelunasanClaimList = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState(null);

  // ============================================================
  // PAGINATION STATE — 15 items per page (default)
  // ============================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // API Base Configuration
  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";

  // Auth Session Resolution Helpers
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      Authorization: token ? `Basic ${token}` : "",
      "Content-Type": "application/json",
    };
  };

  // Fetch Pelunasan Data Payload from API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${baseUrl}/operations/claimpayment`;
      
      // Use keywords parameter for search
      if (searchKeyword && searchKeyword.trim() !== "") {
        url += `?keywords=${encodeURIComponent(searchKeyword.trim())}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      
      let dataPayload = [];
      // Parse the dynamic API response
      if (jsonResponse?.express21?.results?.data && Array.isArray(jsonResponse.express21.results.data)) {
        dataPayload = jsonResponse.express21.results.data;
      } else if (jsonResponse?.results?.data && Array.isArray(jsonResponse.results.data)) {
        dataPayload = jsonResponse.results.data;
      } else if (jsonResponse?.data && Array.isArray(jsonResponse.data)) {
        dataPayload = jsonResponse.data;
      } else if (Array.isArray(jsonResponse)) {
        dataPayload = jsonResponse;
      }

      // Set payments with dynamic data from API
      setPayments(dataPayload);
      setCurrentPage(1); // Reset to page 1 when new data arrives
    } catch (err) {
      console.error("Error fetching claim payments:", err);
      setError("Gagal memuat data pelunasan barang klaim.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Navigate to Detail Page with selected claim data - UPDATED with correct field mapping
  const handleRowClick = (payment) => {
    navigate("/Operations/Claim/Payment/Detail", {
      state: {
        selectedClaim: {
          // ID fields
          id: payment.id,
          claim_id: payment.claim_id,
          
          // NO. RESI
          shipment_code: payment.shipment_code,
          no_resi: payment.no_resi || payment.shipment_code,
          
          // KODE KLAIM
          claim_code: payment.claim_code,
          
          // KLAIM DARI / Customer
          claim_customer: payment.claim_customer,
          claim_from: payment.claim_from || payment.claim_customer,
          
          // JENIS KLAIM
          claimtype_name: payment.claimtype_name,
          jenis_claim: payment.jenis_claim || payment.claimtype_name,
          
          // Employee
          employee_name: payment.employee_name,
          
          // Financial - IMPORTANT: Map both field names for compatibility
          total_harga: payment.total_price || payment.total_harga || 0,
          total_price: payment.total_price || payment.total_harga || 0,
          
          // Ditanggung Perusahaan - Map both company_liability AND company_payable
          ditanggung_perusahaan: payment.company_liability || payment.ditanggung_perusahaan || payment.company_payable || 0,
          company_payable: payment.company_liability || payment.ditanggung_perusahaan || payment.company_payable || 0,
          company_liability: payment.company_liability || payment.ditanggung_perusahaan || payment.company_payable || 0,
          
          // Ditanggung Karyawan - Map both employee_liability AND employee_payable
          ditanggung_karyawan: payment.employee_liability || payment.ditanggung_karyawan || payment.employee_payable || 0,
          employee_payable: payment.employee_liability || payment.ditanggung_karyawan || payment.employee_payable || 0,
          employee_liability: payment.employee_liability || payment.ditanggung_karyawan || payment.employee_payable || 0,
          
          // Notes
          catatan: payment.note,
          note: payment.note,
          
          // Status
          is_returned: payment.is_returned,
          is_verified: payment.is_verified,
          
          // Additional fields
          link_url: payment.link_url,
          link_filename: payment.link_filename,
          rowstatus: payment.rowstatus
        }
      }
    });
  };

  // PDF Engine: Target Claim PDF generation endpoints bound to row specific claim_id values
  const handlePrint = (payment, event) => {
    event.stopPropagation();
    
    const targetClaimId = payment.claim_id || payment.id;

    if (!targetClaimId) {
      alert("ID Klaim tidak ditemukan untuk data pelunasan ini.");
      console.error("Missing claim tracking reference context on row payload:", payment);
      return;
    }

    const pdfUrl = `${baseUrl}/operations/claim/pdf?id=${targetClaimId}`;
    console.log(`Routing direct request targeting sync path to claim ID [${targetClaimId}]:`, pdfUrl);
    window.open(pdfUrl, '_blank');
  };

  // Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate metrics dynamically from API data
  const metrics = payments.reduce((acc, curr) => {
    acc.totalPrice += (curr.total_price || curr.total_harga || 0);
    acc.companyShare += (curr.company_liability || curr.ditanggung_perusahaan || curr.company_payable || 0);
    acc.employeeShare += (curr.employee_liability || curr.ditanggung_karyawan || curr.employee_payable || 0);
    return acc;
  }, { totalPrice: 0, companyShare: 0, employeeShare: 0 });

  // ============================================================
  // PAGINATION LOGIC
  // ============================================================
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const getPaginatedPayments = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return payments.slice(start, end);
  };

  const paginatedPayments = getPaginatedPayments();

  // Generate page numbers with ellipsis
  const getPaginationPages = () => {
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

  // Handle search on Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchPayments();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[100px] pb-12 px-4 sm:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pelunasan Barang Klaim</h1>
            <p className="text-slate-500 mt-1">Pantau rincian distribusi settlement klaim perusahaan dan karyawan</p>
          </div>
          
          {/* Dynamic Filter Search Group */}
          <div className="flex w-full md:w-auto shadow-sm rounded-lg overflow-hidden bg-white border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="relative flex-grow min-w-[260px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cari No. Resi / Surat Klaim..." 
                className="w-full pl-9 pr-4 py-2.5 text-sm outline-none bg-transparent"
              />
            </div>
            <button 
              onClick={fetchPayments}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 text-sm transition-colors"
            >
              Cari
            </button>
          </div>
        </div>

        {/* Dashboard KPIs Metric Metrics - Dynamically calculated from API */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
              <FaFileInvoiceDollar size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Nilai Klaim</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{formatCurrency(metrics.totalPrice)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 text-emerald-600">
              <FaBuilding size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ditanggung Perusahaan</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{formatCurrency(metrics.companyShare)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-lg bg-amber-50 text-amber-600">
              <FaUserTie size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ditanggung Karyawan</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{formatCurrency(metrics.employeeShare)}</p>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

        {/* Main Records Presentation Grid Table - Dynamically displays API data */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-teal-600"></div>
              <p className="text-sm text-slate-400">Memproses berkas pelunasan...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 gap-3">
              <FaFileInvoiceDollar className="text-slate-300" size={48} />
              <p className="text-sm text-slate-400">Tidak ada data pelunasan</p>
              <button onClick={fetchPayments} className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
                Refresh
              </button>
            </div>
          ) : (
            <>
              {/* Table Toolbar: Page Size Selector + Total Info */}
              <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                <div className="text-sm text-slate-600">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-900">
                    {((currentPage - 1) * itemsPerPage) + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * itemsPerPage, payments.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-900">{payments.length}</span> data
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Tampilkan:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  >
                    <option value={15}>15 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-5 text-center w-36">Aksi</th>
                      <th className="py-4 px-4 text-center w-16">No.</th>
                      <th className="py-4 px-4"><span className="flex items-center gap-2"><FaHashtag size={12}/> No. Resi</span></th>
                      <th className="py-4 px-4">No. Surat Klaim</th>
                      <th className="py-4 px-4 text-right">Total Harga</th>
                      <th className="py-4 px-4 text-right">Ditanggung Perusahaan</th>
                      <th className="py-4 px-4 text-right">Ditanggung Karyawan</th>
                      <th className="py-4 px-5 max-w-[240px]"><span className="flex items-center gap-2"><FaRegStickyNote size={12}/> Catatan</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {paginatedPayments.map((payment, index) => (
                      <tr 
                        key={payment.id || index} 
                        onClick={() => handleRowClick(payment)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        {/* Aksi Column */}
                        <td className="p-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handlePrint(payment, e)}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-150 transform active:scale-95"
                            title={`Cetak Surat Klaim untuk ID ${payment.claim_id || payment.id}`}
                          >
                            <FaPrint size={12} />
                            Cetak PDF
                          </button>
                         </td>

                        {/* Row number — continues across pages */}
                        <td className="py-4 px-4 text-center text-slate-400 font-mono">
                          {((currentPage - 1) * itemsPerPage) + index + 1}
                        </td>
                        
                        {/* No. Resi - Dynamically displays shipment_code from API like "201400073589" */}
                        <td className="py-4 px-4 text-slate-900 font-bold tracking-tight">
                          {payment.shipment_code || payment.no_resi || "-"}
                        </td>
                        
                        {/* No. Surat Klaim - Dynamically from API */}
                        <td className="py-4 px-4 text-slate-600">
                          {payment.claim_code || payment.no_surat_klaim || "-"}
                        </td>
                        
                        {/* Total Harga - Dynamically from API */}
                        <td className="py-4 px-4 text-right text-slate-900 font-bold">
                          {formatCurrency(payment.total_price || payment.total_harga || 0)}
                        </td>
                        
                         {/* Ditanggung Perusahaan - Dynamically from API */}
                        <td className="py-4 px-4 text-right text-emerald-600 font-bold">
                          {formatCurrency(payment.company_liability || payment.ditanggung_perusahaan || payment.company_payable || 0)}
                        </td>
                        
                        {/* Ditanggung Karyawan - Dynamically from API */}
                        <td className="py-4 px-4 text-right text-amber-600 font-bold">
                          {formatCurrency(payment.employee_liability || payment.ditanggung_karyawan || payment.employee_payable || 0)}
                        </td>
                        
                        {/* Catatan - Dynamically from API */}
                        <td className="py-4 px-5 text-xs text-slate-500 max-w-[240px] whitespace-pre-line leading-relaxed">
                          {payment.note || payment.catatan || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ============================================================ */}
              {/* PAGINATION CONTROLS — 15 items per page                       */}
              {/* ============================================================ */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Info: Showing X - Y of Z */}
                  <div className="text-sm text-slate-600">
                    Halaman{" "}
                    <span className="font-semibold text-slate-900">{currentPage}</span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-900">{totalPages}</span>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white"
                      title="Halaman Pertama"
                    >
                      ««
                    </button>

                    {/* Previous */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white"
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
                              className="px-2 py-1.5 text-sm text-slate-400 select-none"
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
                                ? "bg-teal-600 text-white font-semibold shadow-sm"
                                : "border border-slate-300 hover:bg-slate-50 bg-white"
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
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white"
                    >
                      Next
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1.5 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white"
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
  );
};

export default PelunasanClaimList;