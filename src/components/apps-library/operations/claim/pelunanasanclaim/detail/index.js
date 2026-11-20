import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaSave, FaTrashAlt, FaPlus, FaBox, FaUsers, 
  FaMoneyBillWave, FaClipboardList, FaTruck, FaFileInvoiceDollar,
  FaBuilding, FaPrint, FaCamera, FaCreditCard, FaListAlt, FaEye,
  FaUndo, FaCheckCircle, FaCode
} from "react-icons/fa";

const PelunasanClaimDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedClaim: initialClaim } = location.state || {};

  const [selectedClaim, setSelectedClaim] = useState(initialClaim);
  const [activeTab, setActiveTab] = useState("rincian_claim");

  // State Form Karyawan
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeAmount, setEmployeeAmount] = useState("");
  const [employeePayablesList, setEmployeePayablesList] = useState([]);
  const [claimGoods, setClaimGoods] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [companyPayable, setCompanyPayable] = useState(0);
  const [employeePayable, setEmployeePayable] = useState(0);
  const [isReturned, setIsReturned] = useState(false);

  // State untuk Rincian Pembayaran
  const [paymentCategory, setPaymentCategory] = useState("Karyawan");
  const [paymentName, setPaymentName] = useState("");
  const [paymentPrice, setPaymentPrice] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentImage, setPaymentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [paymentDetailsList, setPaymentDetailsList] = useState([]);

  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";

  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: token ? `Basic ${token}` : "",
    };
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  };

  // ==========================================
  // FETCH CLAIM PAYMENT DATA USING FILTER
  // ==========================================
  const fetchClaimPaymentData = async (claimPaymentId) => {
    try {
      const url = `${baseUrl}/operations/claimpayment?filter_by_col=id&filter_by_text=${claimPaymentId}`;
      const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
      if (response.ok) {
        const resData = await response.json();
        let data = null;
        if (resData?.express21?.results?.data) data = resData.express21.results.data[0];
        else if (resData?.results?.data) data = resData.results.data[0];
        else if (resData?.data) data = resData.data[0];
        else if (Array.isArray(resData)) data = resData[0];
        
        if (data) {
          console.log("Fetched Claim Data:", data);
          setSelectedClaim(data);
          setTotalPrice(data.total_price || data.total_harga || 0);
          setCompanyPayable(data.company_payable || data.ditanggung_perusahaan || 0);
          setEmployeePayable(data.employee_payable || data.ditanggung_karyawan || 0);
          setIsReturned(data.is_returned === 1 || data.is_returned === true);
          
          // Fetch additional data
          fetchEmployeePayables(data.id);
          fetchClaimGoods(data.claim_id);
          // Use claimpayment_id (data.id) to fetch payment details
          fetchPaymentDetails(data.id);
        }
      }
    } catch (err) {
      console.error("Error fetching claim payment data:", err);
    }
  };

  useEffect(() => {
    console.log("Selected Claim Data:", selectedClaim);
    if (selectedClaim) {
      const total = selectedClaim.total_harga || selectedClaim.total_price || 0;
      const company = selectedClaim.ditanggung_perusahaan || selectedClaim.company_payable || 0;
      const employee = selectedClaim.ditanggung_karyawan || selectedClaim.employee_payable || 0;
      
      setTotalPrice(total);
      setCompanyPayable(company);
      setEmployeePayable(employee);
      setIsReturned(selectedClaim.is_returned === 1 || selectedClaim.is_returned === true);
      
      fetchEmployeePayables(selectedClaim.id);
      fetchClaimGoods(selectedClaim.claim_id);
      // Use claimpayment_id (selectedClaim.id) to fetch payment details
      fetchPaymentDetails(selectedClaim.id);
    }
  }, [selectedClaim]);

  // ==========================================
  // FETCH & ACTIONS FOR RINCIAN PEMBAYARAN - USING claimpayment_id
  // ==========================================
  const fetchPaymentDetails = async (claimpaymentId) => {
    try {
      console.log("Fetching payment details with claimpayment_id:", claimpaymentId);
      // Use filter_by_col=claimpayment_id to filter by claimpayment_id
      const url = `${baseUrl}/operations/claimpaymentdetail?filter_by_col=claimpayment_id&filter_by_text=${claimpaymentId}`;
      const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
      if (response.ok) {
        const resData = await response.json();
        let data = [];
        if (resData?.express21?.results?.data) data = resData.express21.results.data;
        else if (resData?.results?.data) data = resData.results.data;
        else if (resData?.data) data = resData.data;
        else if (Array.isArray(resData)) data = resData;
        
        // Filter the data to only show records with matching claimpayment_id
        const filteredData = data.filter(item => item.claimpayment_id === claimpaymentId);
        setPaymentDetailsList(filteredData);
        console.log("Payment details fetched with claimpayment_id:", claimpaymentId, filteredData);
      } else {
        console.error("Failed to fetch payment details:", response.status);
        setPaymentDetailsList([]);
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setPaymentDetailsList([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSavePaymentDetail = async () => {
    if (!paymentName || !paymentPrice) {
      alert("Harap isi Nama Pembayar dan Jumlah Bayar terlebih dahulu!");
      return;
    }

    if (parseFloat(paymentPrice) < 0) {
      alert("Jumlah bayar tidak boleh negatif!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("secret", "Cqy7T9bX");
      formData.append("claimpayment_id", selectedClaim.id);
      formData.append("category", paymentCategory);
      formData.append("name", paymentName);
      formData.append("price", paymentPrice);
      formData.append("note", paymentNote);
      if (paymentImage) {
        formData.append("payment_image", paymentImage);
      }

      const response = await fetch(`${baseUrl}/operations/claimpaymentdetail`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: formData,
      });

      if (response.ok) {
        alert("Rincian Pembayaran berhasil disimpan!");
        setPaymentName("");
        setPaymentPrice("");
        setPaymentNote("");
        setPaymentImage(null);
        setImagePreview(null);
        // Refresh using claimpayment_id
        await fetchPaymentDetails(selectedClaim.id);
      } else {
        alert("Gagal menyimpan rincian pembayaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Error menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentDetail = async (id) => {
    if (!window.confirm("Apakah anda yakin ingin menghapus rincian pembayaran ini?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/operations/claimpaymentdetail`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: id }),
      });

      if (response.ok) {
        alert("Rincian Pembayaran berhasil dihapus.");
        // Refresh using claimpayment_id
        await fetchPaymentDetails(selectedClaim.id);
      } else {
        alert("Gagal menghapus data.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saat menghapus data.");
    } finally {
      setLoading(false);
    }
  };

  const totalPaidAmount = paymentDetailsList.reduce((sum, item) => sum + (item.price || 0), 0);
  const remainingPayment = totalPrice - totalPaidAmount;

  const getMaxEmployeePayable = () => {
    return Math.max(0, totalPrice - companyPayable);
  };

  const calculateEmployeePayableFromList = () => {
    return employeePayablesList.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const getDisplayEmployeePayable = () => {
    return Math.max(0, totalPrice - companyPayable);
  };

  // ==========================================
  // HANDLE DELETE GOODS - Using employeepayable API
  // ==========================================
  const handleDeleteGoods = async (goodsItem) => {
    // Get the ID from the goods item
    const id = goodsItem.id || goodsItem.goods_id || goodsItem.item_id || goodsItem.uid;
    
    if (!id) {
      alert("Tidak dapat menemukan ID barang yang akan dihapus!");
      return;
    }

    if (!window.confirm(`Apakah anda yakin ingin menghapus barang "${goodsItem.item_code || goodsItem.kode_item || 'ini'}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      // Using /operations/employeepayable API with { "id": id } format
      const response = await fetch(`${baseUrl}/operations/employeepayable`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: id })
      });
      
      if (response.ok) {
        alert("Barang klaim berhasil dihapus!");
        // Refresh the goods list using claim_id
        await fetchClaimGoods(selectedClaim.claim_id || selectedClaim.id);
      } else {
        const errorData = await response.text();
        alert(`Gagal menghapus barang: ${errorData}`);
      }
    } catch (err) {
      console.error("Error deleting goods:", err);
      alert("Terjadi kesalahan saat menghapus barang.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE DELETE EMPLOYEE PAYABLE - Using employeepayable API
  // ==========================================
  const handleDeleteEmployeePayable = async (payableId) => {
    if (!window.confirm("Apakah anda yakin ingin menghapus data tanggungan karyawan ini?")) return;
    
    setLoading(true);
    try {
      // Using /operations/employeepayable API with { "id": id } format
      const response = await fetch(`${baseUrl}/operations/employeepayable`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: payableId })
      });
      
      if (response.ok) {
        alert("Data tanggungan karyawan berhasil dihapus!");
        // Refresh the employee payables list
        await fetchEmployeePayables(selectedClaim.id);
      } else {
        const errorData = await response.text();
        alert(`Gagal menghapus data: ${errorData}`);
      }
    } catch (err) {
      console.error("Error deleting employee payable:", err);
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE RETURN GOODS
  // ==========================================
  const handleReturnGoods = async () => {
    if (!window.confirm("Apakah Anda yakin barang sudah kembali?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const claimId = selectedClaim.claim_id || selectedClaim.id;
      const response = await fetch(`${baseUrl}/operations/claim/returned`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: claimId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Return goods response:", result);
        alert("Status barang berhasil diubah menjadi RETURNED!");
        setIsReturned(true);
        await fetchPaymentDetails(selectedClaim.id);
      } else {
        const errorData = await response.json();
        alert(`Gagal mengubah status barang: ${errorData?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error returning goods:", error);
      alert("Terjadi kesalahan saat mengubah status barang.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH EMPLOYEE PAYABLES
  // ==========================================
  const fetchEmployeePayables = async (claimpaymentId) => {
    try {
      const url = `${baseUrl}/operations/employeepayable?filter_by_col=claimpayment_id&filter_by_text=${claimpaymentId}`;
      const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
      if (response.ok) {
        const resData = await response.json();
        let allPayables = [];
        if (resData?.express21?.results?.data) allPayables = resData.express21.results.data;
        else if (resData?.results?.data) allPayables = resData.results.data;
        else if (resData?.data) allPayables = resData.data;
        else if (Array.isArray(resData)) allPayables = resData;
        
        setEmployeePayablesList(allPayables);
        const totalEmployeeAmount = allPayables.reduce((sum, item) => sum + (item.price || 0), 0);
        setEmployeePayable(totalEmployeeAmount);
      }
    } catch (err) {
      console.error("Error fetching employee payables:", err);
    }
  };

  // ==========================================
  // FETCH CLAIM GOODS - USING claim_id
  // ==========================================
  const fetchClaimGoods = async (claimId) => {
    try {
      console.log("Fetching goods with claim_id:", claimId);
      const url = `${baseUrl}/operations/goods?filter_by_col=claim_id&filter_by_text=${claimId}`;
      const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
      if (response.ok) {
        const resData = await response.json();
        let items = [];
        if (resData?.express21?.results?.data) items = resData.express21.results.data;
        else if (resData?.results?.data) items = resData.results.data;
        else if (resData?.data) items = resData.data;
        else if (Array.isArray(resData)) items = resData;
        setClaimGoods(items);
        console.log("Claim Goods Data fetched with claim_id:", claimId, items);
      } else {
        console.error("Failed to fetch goods:", response.status);
      }
    } catch (err) {
      console.error("Error fetching items table data:", err);
    }
  };

  // ==========================================
  // HANDLE EMPLOYEE LIABILITY
  // ==========================================
  const handleAddEmployeeLiability = async () => {
    if (!employeeName || !employeeId || !employeeAmount) {
      alert("Harap lengkapi field Nama, ID, dan Jumlah Ditanggung Karyawan terlebih dahulu!");
      return;
    }

    const parsedPrice = parseFloat(employeeAmount);
    
    if (parsedPrice < 0) {
      alert("Jumlah ditanggung tidak boleh negatif!");
      return;
    }

    const maxEmployeePayable = getMaxEmployeePayable();
    const newTotalEmployeePayable = employeePayable + parsedPrice;
    
    if (newTotalEmployeePayable > maxEmployeePayable) {
      alert(`Total Ditanggung Karyawan (${formatCurrency(newTotalEmployeePayable)}) tidak boleh melebihi Total Harga - Ditanggung Perusahaan (${formatCurrency(maxEmployeePayable)})`);
      return;
    }

    const postPayload = {
      claimpayment_id: selectedClaim.id,
      price: parsedPrice,
      name: employeeName,
      employee_id: parseInt(employeeId)
    };

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/operations/employeepayable`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(postPayload)
      });
      if (response.ok) {
        alert("Data berhasil ditambahkan!");
        setEmployeeName("");
        setEmployeeId("");
        setEmployeeAmount("");
        await fetchEmployeePayables(selectedClaim.id);
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE SAVE CLAIM CHANGES
  // ==========================================
  const handleSaveClaimChanges = async () => {
    const totalEmployeeFromList = calculateEmployeePayableFromList();
    const calculatedEmployeePayable = getDisplayEmployeePayable();

    if (totalEmployeeFromList > calculatedEmployeePayable) {
      alert(`Total Detail Ditanggung Karyawan (${formatCurrency(totalEmployeeFromList)}) tidak boleh melebihi Total Harga - Ditanggung Perusahaan (${formatCurrency(calculatedEmployeePayable)})`);
      return;
    }

    let claimPaymentId = selectedClaim.id;
    
    if (employeePayablesList.length > 0 && employeePayablesList[0].claimpayment_id) {
      claimPaymentId = employeePayablesList[0].claimpayment_id;
    }

    const payload = {
      id: parseInt(claimPaymentId) || parseInt(selectedClaim.id) || selectedClaim.id,
      claim_id: parseInt(selectedClaim.claim_id) || selectedClaim.claim_id || parseInt(selectedClaim.id) || selectedClaim.id,
      total_price: parseFloat(totalPrice) || 0,
      company_payable: parseFloat(companyPayable) || 0,
      employee_payable: parseFloat(calculatedEmployeePayable) || 0
    };

    console.log("Saving claim data:", payload);

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/operations/claimpayment`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Save response:", result);
        alert("Data Klaim Berhasil Disimpan!");
        navigate("/Operations/Claim/Payment");
      } else {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        alert(`Gagal menyimpan data: ${errorData}`);
      }
    } catch (err) {
      console.error("Error saving claim:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrDeleteClaim = async () => {
    if (!window.confirm("Apakah anda yakin ingin menghapus data pelunasan klaim ini?")) return;
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/operations/claimpayment`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: selectedClaim.id })
      });
      if (response.ok) {
        alert("Data Pelunasan Klaim Berhasil Dihapus.");
        navigate("/Operations/Claim/Payment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const pdfUrl = `${baseUrl}/operations/claim/pdf?id=${selectedClaim.claim_id || selectedClaim.id}`;
    window.open(pdfUrl, '_blank');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (!selectedClaim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaFileInvoiceDollar className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 mb-4">Tidak ada data claim yang dipilih.</p>
          <button 
            onClick={() => navigate("/Operations/Claim/Payment")} 
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const showReturnButton = remainingPayment <= 0 && !isReturned;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
              <p className="text-slate-600">Memproses...</p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/Operations/Claim/Payment")}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm group"
        >
          <FaArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Kembali ke Daftar</span>
        </button>

        {isReturned && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700">
            <FaCheckCircle size={18} />
            <span className="font-medium">Status: Barang telah dikembalikan (RETURNED)</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileInvoiceDollar className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Edit Pelunasan Claim (Detail Claim)</h2>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-all"
              >
                <FaPrint size={14} /> Cetak PDF
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaTruck className="text-blue-700" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">NO. RESI</p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedClaim.shipment_code || selectedClaim.no_resi || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FaCode className="text-indigo-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">KODE KLAIM</p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedClaim.claim_code || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaBuilding className="text-purple-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">KLAIM DARI</p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedClaim.claim_customer || selectedClaim.claim_from || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-amber-600" size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">JENIS KLAIM</p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedClaim.claimtype_name || selectedClaim.jenis_claim || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
            <button 
              onClick={() => setActiveTab("rincian_claim")}
              className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === "rincian_claim" 
                  ? "text-blue-700 border-blue-700" 
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              Rincian Claim
            </button>
            <button 
              onClick={() => setActiveTab("rincian_pembayaran")}
              className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === "rincian_pembayaran" 
                  ? "text-blue-700 border-blue-700" 
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              Rincian Pembayaran
            </button>
          </div>

          {/* Tab Content 1: Rincian Claim */}
          {activeTab === "rincian_claim" && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Add Employee Form */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <FaUsers className="text-blue-700" size={14} /> Tambah Tanggungan Karyawan
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Karyawan</label>
                          <input 
                            type="text" 
                            value={employeeName} 
                            onChange={(e) => setEmployeeName(e.target.value)} 
                            placeholder="Masukkan nama karyawan"
                            className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">ID Karyawan</label>
                          <input 
                            type="number" 
                            value={employeeId} 
                            onChange={(e) => setEmployeeId(e.target.value)} 
                            placeholder="Masukkan ID karyawan"
                            className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Ditanggung</label>
                        <input 
                          type="number" 
                          min="0"
                          step="1"
                          value={employeeAmount} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || parseFloat(val) >= 0) {
                              setEmployeeAmount(val);
                            }
                          }}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val < 0) {
                              setEmployeeAmount("0");
                            }
                          }}
                          placeholder="Masukkan nominal (minimal 0)"
                          className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">* Minimal 0 (tidak boleh negatif)</p>
                        <p className="text-xs text-blue-600 mt-1">
                          * Maksimal: {formatCurrency(getMaxEmployeePayable())}
                        </p>
                      </div>
                      <button 
                        onClick={handleAddEmployeeLiability} 
                        disabled={loading}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      >
                        <FaPlus size={12} /> Tambah Tanggungan
                      </button>
                    </div>
                  </div>

                  {/* Employee Liability Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <FaMoneyBillWave className="text-amber-600" size={14} /> Detail Ditanggung Karyawan (Tabel)
                      </h3>
                    </div>
                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr className="border-b border-slate-200">
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-12">No.</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-16">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Nama</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Jumlah Ditanggung</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-16">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {employeePayablesList.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-sm">
                                Belum ada data tanggungan karyawan
                              </td>
                            </tr>
                          ) : (
                            <>
                              {employeePayablesList.map((emp, i) => (
                                <tr key={emp.id || i} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-2.5 text-center text-sm text-slate-500">{i + 1}</td>
                                  <td className="px-4 py-2.5 text-center text-sm font-mono text-slate-700">{emp.employee_id || "-"}</td>
                                  <td className="px-4 py-2.5 text-sm text-slate-800">{emp.name || "-"}</td>
                                  <td className="px-4 py-2.5 text-right text-sm font-semibold text-amber-600">{formatCurrency(emp.price)}</td>
                                  <td className="px-4 py-2.5 text-center">
                                    <button 
                                      onClick={() => handleDeleteEmployeePayable(emp.id)} 
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                      <FaTrashAlt size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-amber-50 border-t-2 border-amber-200">
                                <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-slate-800">
                                  JUMLAH DETAIL:
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-amber-600">
                                  {formatCurrency(employeePayable)}
                                </td>
                                <td className="px-4 py-3"></td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Financial Summary Right Panel */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-slate-100 to-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <FaFileInvoiceDollar className="text-blue-700" size={14} /> Ringkasan Keuangan
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <span className="text-xs text-slate-600 font-medium block mb-1">Total Harga</span>
                        <input 
                          type="number" 
                          value={totalPrice} 
                          readOnly
                          disabled
                          className="w-full text-right text-black border border-slate-300 rounded-xl p-2 text-sm font-bold bg-slate-100 cursor-not-allowed focus:ring-0"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-slate-600 font-medium block mb-1">Ditanggung Perusahaan</span>
                        <input 
                          type="number" 
                          min="0"
                          step="1"
                          value={companyPayable} 
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value) || 0;
                            setCompanyPayable(newValue);
                            const maxEmployee = Math.max(0, totalPrice - newValue);
                            if (employeePayable > maxEmployee) {
                              setEmployeePayable(maxEmployee);
                            }
                          }}
                          className="w-full text-right border border-slate-300 rounded-xl p-2 text-sm font-bold text-emerald-600 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">* Masukkan nilai 0 jika tidak ada</p>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium block mb-1">Total Ditanggung Karyawan</span>
                        <div className="w-full text-right bg-blue-50 rounded-xl p-2 text-sm font-bold text-blue-600">
                          {formatCurrency(Math.max(0, totalPrice - companyPayable))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          * Total Harga - Ditanggung Perusahaan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claimed Goods Details */}
              <div className="mt-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                    <FaBox className="text-blue-700" size={14} /> Detail Barang Klaim
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-16">Hapus</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-12">No.</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Kode Item</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-24">Foto Barang</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-16">Jumlah</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Harga Satuan</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Total Harga</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {claimGoods.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-slate-400 text-sm">
                            Tidak ada data barang untuk klaim ini
                          </td>
                        </tr>
                      ) : (
                        claimGoods.map((goods, idx) => {
                          const imageUrl = goods.link_url || goods.image_url || goods.foto_barang || null;
                          const pricePerUnit = goods.price || goods.price_per_unit || goods.harga_satuan || 0;
                          const quantity = goods.quantity || goods.jumlah_barang || 0;
                          const totalPriceGoods = pricePerUnit * quantity;
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-2 text-center">
                                <button 
                                  onClick={() => handleDeleteGoods(goods)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTrashAlt size={13} />
                                </button>
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-slate-500">{idx + 1}</td>
                              <td className="px-4 py-2 text-sm font-mono font-semibold text-slate-700">{goods.item_code || goods.kode_item || "-"}</td>
                              <td className="px-4 py-2 text-center">
                                {imageUrl ? (
                                  <a 
                                    href={imageUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block w-16 h-12 mx-auto rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
                                  >
                                    <img 
                                      src={imageUrl} 
                                      alt="Goods" 
                                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                          <div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                          </div>
                                        `;
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                      <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                                    </div>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center text-sm text-slate-700">{quantity}</td>
                              <td className="px-4 py-2 text-right text-sm text-slate-700">{formatCurrency(pricePerUnit)}</td>
                              <td className="px-4 py-2 text-right text-sm font-semibold text-slate-900">{formatCurrency(totalPriceGoods)}</td>
                              <td className="px-4 py-2 text-sm text-slate-500 max-w-[150px] truncate" title={goods.note || ""}>
                                {goods.note || "-"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-slate-200">
                <button onClick={handleSaveClaimChanges} disabled={loading} className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2">
                  <FaSave size={14} /> Simpan Perubahan
                </button>
                <button onClick={handleCancelOrDeleteClaim} disabled={loading} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2">
                  <FaTrashAlt size={14} /> Hapus Klaim
                </button>
              </div>
            </div>
          )}

          {/* Tab Content 2: Rincian Pembayaran */}
          {activeTab === "rincian_pembayaran" && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Input Payment Form */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <FaCreditCard className="text-blue-700" size={14} /> Input Data Pembayaran
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                            <select 
                              value={paymentCategory} 
                              onChange={(e) => setPaymentCategory(e.target.value)}
                              className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="Karyawan">Karyawan</option>
                              <option value="Perusahaan">Perusahaan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pembayar</label>
                            <input 
                              type="text"
                              value={paymentName}
                              onChange={(e) => setPaymentName(e.target.value)}
                              placeholder="Masukkan nama pembayar"
                              className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Bayar</label>
                            <input 
                              type="number"
                              min="0"
                              value={paymentPrice}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || parseFloat(val) >= 0) {
                                  setPaymentPrice(val);
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val < 0) {
                                  setPaymentPrice("0");
                                }
                              }}
                              placeholder="Masukkan nominal bayar"
                              className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Lampiran</label>
                            <div className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors relative h-32 overflow-hidden group">
                              {imagePreview ? (
                                <>
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaCamera className="text-white" size={20} />
                                  </div>
                                </>
                              ) : (
                                <div className="text-center space-y-1">
                                  <FaCamera className="mx-auto text-slate-400" size={24} />
                                  <p className="text-xs text-slate-500 font-medium">Klik untuk upload foto</p>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan</label>
                            <textarea 
                              rows="2"
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                              placeholder="Tambahkan catatan pembayaran..."
                              className="w-full text-black border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button 
                          onClick={handleSavePaymentDetail}
                          disabled={loading}
                          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <FaSave size={14} /> Simpan Pembayaran
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <FaListAlt className="text-blue-700" size={14} /> Detail Pembayaran
                      </h3>
                    </div>
                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr className="border-b border-slate-200">
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-12">No.</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-24">Penanggung</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Pembayar</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Jumlah Bayar</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-24">Foto Lampiran</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Catatan</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 w-16">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paymentDetailsList.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-4 py-8 text-center text-slate-400 text-sm">
                                Belum ada rekam jejak rincian pembayaran
                              </td>
                            </tr>
                          ) : (
                            paymentDetailsList.map((item, idx) => {
                              const imageUrl = item.payment_image || item.link_url || item.image_url || null;
                              return (
                                <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-2.5 text-center text-sm text-slate-500">{idx + 1}</td>
                                  <td className="px-4 py-2.5 text-center">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                      item.category === "Perusahaan" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                      {item.category || "-"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-sm font-medium text-slate-800">{item.name || "-"}</td>
                                  <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-900">{formatCurrency(item.price)}</td>
                                  <td className="px-4 py-2.5 text-center">
                                    {imageUrl ? (
                                      <a 
                                        href={imageUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block w-16 h-12 mx-auto rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
                                      >
                                        <img 
                                          src={imageUrl} 
                                          alt="Lampiran" 
                                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `
                                              <div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                              </div>
                                            `;
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <FaEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                                        </div>
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 text-xs">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-left text-slate-500 text-xs max-w-xs truncate" title={item.note || ""}>
                                    {item.note || "-"}
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    <button 
                                      onClick={() => handleDeletePaymentDetail(item.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                      <FaTrashAlt size={13} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Buttons with Return Goods Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-200">
                    <div className="flex gap-4">
                      <button 
                        onClick={handleSaveClaimChanges} 
                        disabled={loading} 
                        className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
                      >
                        <FaSave size={14} /> Simpan Perubahan
                      </button>
                      <button 
                        onClick={handleCancelOrDeleteClaim} 
                        disabled={loading} 
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
                      >
                        <FaTrashAlt size={14} /> Hapus Klaim
                      </button>
                    </div>

                    {showReturnButton && (
                      <button
                        onClick={handleReturnGoods}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-400 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-400/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaUndo size={16} />
                        Barang Sudah Kembali
                        <FaCheckCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column - Payment Summary */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                      <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                        <FaMoneyBillWave className="text-emerald-400" size={14} /> Status Pelunasan
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-400 text-xs font-medium mb-1">TOTAL TAGIHAN</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs font-medium mb-1">TOTAL DIBAYAR</p>
                          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaidAmount)}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-700">
                          <p className="text-slate-400 text-xs font-medium mb-1">SISA BAYAR</p>
                          <p className={`text-3xl font-black ${remainingPayment <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            {formatCurrency(remainingPayment)}
                          </p>
                        </div>
                        {isReturned && (
                          <div className="pt-3 border-t border-slate-700">
                            <p className="text-emerald-400 text-xs font-medium flex items-center gap-2">
                              <FaCheckCircle size={14} />
                              Status: RETURNED
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PelunasanClaimDetail;