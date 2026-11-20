import React, { useState, useEffect } from 'react';
import { Search, Camera, Plus, Save, Trash2, ArrowLeft, FileText, Package, ClipboardList, Loader2, Building, CreditCard, Eye, ExternalLink, File, User, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

// Custom Animated Alert Component
const AnimatedAlert = ({ isOpen, onClose, type, title, message, details }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={28} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={28} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={28} />;
      default:
        return <Info className="text-blue-500" size={28} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  let parsedDetails = details;
  if (typeof details === 'string') {
    try {
      parsedDetails = JSON.parse(details);
    } catch (e) {
      // If not JSON, keep as is
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative max-w-md w-full rounded-xl shadow-2xl border ${getBgColor()} p-6 animate-slideUp`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${getTitleColor()} mb-2`}>
              {title}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {message}
            </p>
            
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const ProfessionalClaimForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;

  // ============================================
  // GET PAGE FROM URL
  // ============================================
  const queryParams = new URLSearchParams(location.search);
  const returnPage = parseInt(queryParams.get('page')) || 1;
  const returnItemsPerPage = parseInt(queryParams.get('itemsPerPage')) || 10;

  console.log("=== PROFESSIONAL CLAIM FORM DEBUG ===");
  console.log("ID from URL params:", id);
  console.log("Is Edit Mode:", isEditMode);
  console.log("Return Page:", returnPage);
  console.log("Return ItemsPerPage:", returnItemsPerPage);
  console.log("Current URL:", location.pathname + location.search);

  // ============================================
  // STORE CURRENT CLAIM INFO IN GLOBAL MEMORY
  // ============================================
  useEffect(() => {
    if (id) {
      // Store in window object so it survives navigation
      window.__returnToClaim = {
        claimId: id,
        page: returnPage,
        itemsPerPage: returnItemsPerPage,
        timestamp: Date.now()
      };
      
      console.log("🔵 STORED IN MEMORY:", window.__returnToClaim);
    }
    
    // Clean up when component unmounts (optional - keep for 5 seconds then clear)
    return () => {
      // Don't clear immediately - the list page needs this data
      // It will be cleared after the list page uses it
    };
  }, [id, returnPage, returnItemsPerPage]);

  const SECRET_KEY = "Cqy7T9bX";

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";

  const [selectedCompany, setSelectedCompany] = useState('ANDALAN');
  const [editingId, setEditingId] = useState(null);

  const [claimCode, setClaimCode] = useState('');
  const [claimType, setClaimType] = useState('');
  const [claimTypeId, setClaimTypeId] = useState('');
  const [claimTypeOptions, setClaimTypeOptions] = useState([]);
  const [isLoadingClaimTypes, setIsLoadingClaimTypes] = useState(false);
  const [awbResi, setAwbResi] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Bank account fields
  const [accountBank, setAccountBank] = useState('');
  const [accountBankId, setAccountBankId] = useState('');
  const [accountBankName, setAccountBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankOptions, setBankOptions] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  const [instrumentFile, setInstrumentFile] = useState(null);
  const [instrumentFileName, setInstrumentFileName] = useState('');
  const [instrumentFileUrl, setInstrumentFileUrl] = useState('');

  const [originCity, setOriginCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [totalKoli, setTotalKoli] = useState('');
  const [totalKilo, setTotalKilo] = useState('');

  const [kodeItem, setKodeItem] = useState('');
  const [jenisItem, setJenisItem] = useState('');
  const [category, setCategory] = useState('');
  const [jumlahBarang, setJumlahBarang] = useState('');
  const [hargaSatuan, setHargaSatuan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  const [items, setItems] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentClaimId, setCurrentClaimId] = useState(null);
  const [claimDataLoaded, setClaimDataLoaded] = useState(false);

  // User data for verification
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  // Alert state
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    details: null
  });

  // Function to show alert
  const showAlert = (type, title, message, details = null) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      details
    });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  // Parse error from API response
  const parseApiError = (error) => {
    console.log('Parsing error:', error);
    
    if (error.response?.data?.express21?.status) {
      const status = error.response.data.express21.status;
      console.log('Found express21 status:', status);
      return {
        error_code: status.error_code || 'N/A',
        error_message: status.error_message || status.message || 'Terjadi kesalahan',
        status_code: status.status_code || 'N/A',
        message: status.message || '',
        full_error: status,
        raw_response: error.response.data
      };
    }
    
    if (error.response?.data?.status) {
      const status = error.response.data.status;
      console.log('Found status:', status);
      return {
        error_code: status.error_code || 'N/A',
        error_message: status.error_message || status.message || 'Terjadi kesalahan',
        status_code: status.status_code || 'N/A',
        message: status.message || '',
        full_error: status,
        raw_response: error.response.data
      };
    }
    
    if (error.response?.data?.express21?.results?.message) {
      return {
        error_message: error.response.data.express21.results.message,
        error_code: error.response.data.express21.results.error_code || 'N/A',
        status_code: error.response.status || 'N/A',
        full_error: error.response.data.express21.results,
        raw_response: error.response.data
      };
    }
    
    if (error.response?.data?.message) {
      return {
        error_message: error.response.data.message,
        status_code: error.response.status || 'N/A',
        full_error: error.response.data,
        raw_response: error.response.data
      };
    }
    
    if (error.message) {
      return {
        error_message: error.message,
        full_error: error
      };
    }
    
    return {
      error_message: 'Terjadi kesalahan yang tidak diketahui',
      full_error: error
    };
  };

  // Function to show error alert from API
  const showApiError = (error, defaultMessage = 'Terjadi kesalahan. Silakan coba lagi.') => {
    const parsed = parseApiError(error);
    console.log('Parsed error details:', parsed);
    
    if (parsed.error_message?.toLowerCase().includes('claim with this shipment code has been accepted')) {
      showAlert(
        'error',
        '⚠️ Klaim Gagal Dibuat',
        'Maaf, nomor resi ini sudah memiliki klaim yang diterima sebelumnya.\n\n' +
        'Silakan gunakan nomor resi lain atau hubungi administrator untuk informasi lebih lanjut.',
        {
          error_code: parsed.error_code || 2001,
          status_code: parsed.status_code || 500,
          error_message: parsed.error_message,
          message: parsed.message || 'something went wrong'
        }
      );
      return;
    }
    
    const details = {
      error_code: parsed.error_code || 'N/A',
      status_code: parsed.status_code || 'N/A',
      error_message: parsed.error_message
    };
    
    if (parsed.message && parsed.message !== parsed.error_message) {
      details.message = parsed.message;
    }
    
    showAlert(
      'error',
      '❌ Error',
      parsed.error_message || defaultMessage,
      details
    );
  };

  const showSuccess = (title, message, details = null) => {
    showAlert('success', title, message, details);
  };

  const showWarning = (title, message, details = null) => {
    showAlert('warning', title, message, details);
  };

  const showInfo = (title, message, details = null) => {
    showAlert('info', title, message, details);
  };

  // Function to check if user can see verify button
  const canVerify = () => {
    const allowedUsers = ['mia-sub', 'superadmin'];
    return allowedUsers.includes(userName?.toLowerCase());
  };

  const handleViewInstrument = () => {
    if (instrumentFileUrl) {
      window.open(instrumentFileUrl, '_blank');
      showInfo('📄 File Instrument', 'Membuka file instrument di tab baru');
    } else if (instrumentFile) {
      const url = URL.createObjectURL(instrumentFile);
      window.open(url, '_blank');
      showInfo('📄 File Instrument', 'Membuka file preview di tab baru');
    } else {
      showWarning('⚠️ File Tidak Ditemukan', 'Tidak ada file instrument untuk ditampilkan');
    }
  };

  const fetchBankList = async () => {
    setIsLoadingBanks(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await axios.get(`${baseUrl}/masters/bank`, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });

      const banks = response.data?.express21?.results?.data || [];
      setBankOptions(banks);
      console.log('Bank options loaded:', banks);
      showSuccess('✅ Berhasil', `Berhasil memuat ${banks.length} daftar bank`);
    } catch (error) {
      console.error('Error fetching bank list:', error);
      showApiError(error, 'Gagal memuat daftar bank. Menggunakan data bank default.');
      setBankOptions([
        { id: 1, name: 'BANK CENTRAL ASIA (BCA)' },
        { id: 2, name: 'BANK NEGARA INDONESIA (BNI)' },
        { id: 3, name: 'BANK MANDIRI' },
        { id: 4, name: 'BANK TABUNGAN NEGARA' },
        { id: 5, name: 'BANK SYARIAH INDONESIA' }
      ]);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handleSearchResi = async (resiToSearch = null) => {
    const resiNumber = resiToSearch || awbResi;

    if (!resiNumber?.trim()) {
      setSearchError('Masukkan nomor resi terlebih dahulu');
      showWarning('⚠️ Resi Kosong', 'Harap masukkan nomor resi terlebih dahulu sebelum mencari');
      return false;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return false;
      }

      const response = await axios.get(
        `${baseUrl}/siscos/shipment/detail?shipment_code=${resiNumber}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const shipmentData = response.data?.express21?.results?.data?.[0]?.shipment_detail?.[0];

      if (shipmentData) {
        setOriginCity(shipmentData.origin_city || '');
        setDestCity(shipmentData.dest_city || '');
        setCustomerName(shipmentData.customer_name || '');
        setCustomerCode(shipmentData.customer_code || '');
        setTotalKoli(shipmentData.ttl_piece?.toString() || '');
        setTotalKilo(shipmentData.ttl_chargeable_weight?.toString() || '');
        setSearchError('');
        
        const message = `✅ Data Resi Ditemukan!\n\n` +
          `📦 Resi: ${resiNumber}\n` +
          `🏢 Customer: ${shipmentData.customer_name || '-'}\n` +
          `📍 Asal: ${shipmentData.origin_city || '-'}\n` +
          `📍 Tujuan: ${shipmentData.dest_city || '-'}\n` +
          `📦 Koli: ${shipmentData.ttl_piece || 0}\n` +
          `⚖️ Berat: ${shipmentData.ttl_chargeable_weight || 0} Kg`;
        
        showSuccess('✅ Resi Ditemukan', message);
        return true;
      } else {
        const errorMsg = `Data tidak ditemukan untuk nomor resi: ${resiNumber}`;
        setSearchError(errorMsg);
        showWarning('⚠️ Resi Tidak Ditemukan', errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error searching resi:', error);
      const errorMsg = error.response?.data?.express21?.results?.message || 
                       error.message || 
                       'Gagal mencari data resi. Silakan coba lagi.';
      setSearchError(errorMsg);
      showApiError(error, errorMsg);
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const fetchAllGoodsData = async () => {
    const token = getAuthToken();
    if (!token) {
      showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
      return;
    }

    try {
      const goodsResponse = await axios.get(
        `${baseUrl}/operations/goods?filter_by_col=claim_id&filter_by_text=${id}`,
        { headers: { Authorization: `Basic ${token}` } }
      );

      const goodsData = goodsResponse.data?.express21?.results?.data || [];

      const formattedItems = goodsData.map((item) => ({
        id: item.uid,
        isExisting: true,
        claim_id: item.claim_id,
        item_code: item.item_code,
        item_type: item.item_type,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        note: item.note,
        fotoPreview: item.link_url,
        isVerified: item.is_verified || false,
        verifiedBy: item.verified_by || null,
        verifiedAt: item.verified_at || null
      }));

      setItems(formattedItems);
      
    } catch (err) {
      console.error("Fetch error:", err);
      showApiError(err, 'Gagal memuat data barang. Silakan refresh halaman.');
    }
  };

  const fetchClaimData = async () => {
    if (!id) {
      showWarning('⚠️ ID Tidak Valid', 'ID Klaim tidak ditemukan');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(true);

    try {
      const claimResponse = await axios.get(
        `${baseUrl}/operations/claim?filter_by_col=id&filter_by_text=${id}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let claimData = null;
      if (claimResponse.data?.express21?.results?.data &&
        Array.isArray(claimResponse.data.express21.results.data)) {
        claimData = claimResponse.data.express21.results.data[0];
      }

      if (claimData && claimData.id) {
        setCurrentClaimId(claimData.id);
        setClaimCode(claimData.claim_code || '');
        setClaimTypeId(claimData.type_id?.toString() || '');
        setSelectedCompany(claimData.ownership || 'ANDALAN');
        setCustomerName(claimData.customer_name || '');
        setCustomerCode(claimData.customer_code || '');
        setOriginCity(claimData.origin_city || '');
        setDestCity(claimData.dest_city || '');
        setTotalKoli(claimData.total_koli?.toString() || '');
        setTotalKilo(claimData.total_kilo?.toString() || '');
        
        setAccountBank(claimData.account_bank || '');
        setAccountBankId(claimData.account_bank_id || '');
        setAccountBankName(claimData.account_bank_name || '');
        setAccountNumber(claimData.account_number || '');

        if (claimData.link_url) {
          setInstrumentFileUrl(claimData.link_url);
          setInstrumentFileName(claimData.link_filename || 'Lampiran File');
        }

        const resiNumber = claimData.shipment_code || '';
        if (resiNumber) {
          setAwbResi(resiNumber);
          await handleSearchResi(resiNumber);
        }

        await fetchAllGoodsData();
        setClaimDataLoaded(true);
        
      } else {
        const errorMsg = `Claim dengan ID ${id} tidak ditemukan`;
        setError(errorMsg);
        showWarning('⚠️ Data Tidak Ditemukan', errorMsg);
      }
    } catch (err) {
      const errorMsg = `Gagal memuat data klaim: ${err.message}`;
      setError(errorMsg);
      showApiError(err, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimTypes = async () => {
    const token = getAuthToken();
    if (!token) {
      showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
      return;
    }

    setIsLoadingClaimTypes(true);

    try {
      const response = await axios.get(`${baseUrl}/masters/claimtype`, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });

      const claimTypes = response.data?.express21?.results?.data || [];
      setClaimTypeOptions(claimTypes);
      console.log('Claim types loaded:', claimTypes);
      showSuccess('✅ Berhasil', `Berhasil memuat ${claimTypes.length} jenis klaim`);
    } catch (error) {
      console.error('Error fetching claim types:', error);
      showApiError(error, 'Gagal memuat jenis klaim. Menggunakan data default.');
      setClaimTypeOptions([
        { id: 1, name: 'PENYOK' },
        { id: 2, name: 'RUSAK' },
        { id: 3, name: 'HILANG' }
      ]);
    } finally {
      setIsLoadingClaimTypes(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axios.get(`${baseUrl}/auth/profile`, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const user = response.data?.express21?.results?.data || response.data?.data || response.data;
      const name = user?.name || user?.username || user?.email || '';
      setUserName(name);
      setUserRole(user?.role || user?.role_name || '');
      console.log('User data loaded:', { name, role: user?.role });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUserName(userData?.name || userData?.username || '');
          setUserRole(userData?.role || '');
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchClaimTypes();
      await fetchBankList();
      await fetchUserData();
      if (id) {
        await fetchClaimData();
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (claimDataLoaded && claimTypeId && claimTypeOptions.length > 0) {
      const typeOption = claimTypeOptions.find(t => t.id.toString() === claimTypeId);
      if (typeOption && !claimType) {
        setClaimType(typeOption.name);
      }
    }
  }, [claimDataLoaded, claimTypeId, claimTypeOptions, claimType]);

  const handleInstrumentBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showWarning('⚠️ File Terlalu Besar', 
            `Ukuran file terlalu besar!\n\n` +
            `📄 Nama: ${file.name}\n` +
            `📦 Ukuran: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
            `📏 Maksimal: 5 MB\n\n` +
            `Silakan pilih file yang lebih kecil.`
          );
          return;
        }
        setInstrumentFile(file);
        setInstrumentFileName(file.name);
        setInstrumentFileUrl('');
        showSuccess('✅ File Dipilih', 
          `File berhasil dipilih!\n\n` +
          `📄 Nama: ${file.name}\n` +
          `📦 Ukuran: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
          `📁 Format: ${file.type || 'Tidak diketahui'}`
        );
      }
    };
    input.click();
  };

  const handleFotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showWarning('⚠️ Foto Terlalu Besar', 
            `Ukuran foto terlalu besar!\n\n` +
            `📷 Nama: ${file.name}\n` +
            `📦 Ukuran: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
            `📏 Maksimal: 2 MB\n\n` +
            `Silakan pilih foto yang lebih kecil atau kompres foto terlebih dahulu.`
          );
          return;
        }
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
        showSuccess('✅ Foto Diupload', 
          `Foto berhasil diupload!\n\n` +
          `📷 Nama: ${file.name}\n` +
          `📦 Ukuran: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
          `📁 Format: ${file.type || 'Tidak diketahui'}`
        );
      }
    };
    input.click();
  };

  const handleDeleteItem = async (uid) => {
    if (!uid) {
      setItems(items.filter(item => item.id !== uid));
      showInfo('🗑️ Item Dihapus', 'Item berhasil dihapus dari list (belum tersimpan di database)');
      return;
    }
    
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) return;
    
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      await axios.delete(`${baseUrl}/operations/goods`, {
        headers: { 
          Authorization: `Basic ${token}`, 
          'X-Secret-Key': SECRET_KEY,
          "Content-Type": "application/json"
        },
        data: { uid: uid }
      });
      setItems(items.filter(item => item.id !== uid));
      console.log(`Item with UID ${uid} deleted successfully`);
      showSuccess('✅ Item Dihapus', `Item berhasil dihapus dari database!\n\n🆔 ID: ${uid}`);
    } catch (err) {
      console.error('Error deleting item:', err);
      showApiError(err, 'Gagal menghapus barang dari database');
    }
  };

  const handleEditItem = (item) => {
    setEditingId(item.id);
    setKodeItem(item.item_code || '');
    setJenisItem(item.item_type || '');
    setCategory(item.category || '');
    setJumlahBarang(item.quantity || '');
    setHargaSatuan(item.price || '');
    setCatatan(item.note || '');
    setFotoPreview(item.fotoPreview || '');
    setFotoFile(item.fotoFile || null);
    showInfo('✏️ Edit Item', 
      `Mengedit item: ${item.item_code}\n\n` +
      `📦 Jenis: ${item.item_type}\n` +
      `📊 Kategori: ${item.category || '-'}\n` +
      `📐 Jumlah: ${item.quantity}\n` +
      `💰 Harga: Rp ${Number(item.price).toLocaleString('id-ID')}`
    );
  };

  // Handle verify item
  const handleVerifyItem = async (item) => {
    if (!item.id) {
      showWarning('⚠️ Item Tidak Valid', 'ID item tidak ditemukan untuk verifikasi');
      return;
    }
    
    if (item.isVerified) {
      showWarning('⚠️ Sudah Diverifikasi', 
        `Item ini sudah diverifikasi sebelumnya.\n\n` +
        `📦 Kode: ${item.item_code}\n` +
        `👤 Diverifikasi oleh: ${item.verifiedBy || 'Tidak diketahui'}\n` +
        `🕐 Waktu: ${item.verifiedAt ? new Date(item.verifiedAt).toLocaleString('id-ID') : 'Tidak diketahui'}`
      );
      return;
    }
    
    if (!window.confirm(
      `🔍 Verifikasi Item\n\n` +
      `Apakah Anda yakin ingin memverifikasi item ini?\n\n` +
      `📦 Kode: ${item.item_code}\n` +
      `📊 Jenis: ${item.item_type}\n` +
      `💰 Harga: Rp ${Number(item.price).toLocaleString('id-ID')}\n` +
      `📐 Jumlah: ${item.quantity}\n\n` +
      `Item akan ditandai sebagai terverifikasi.`
    )) return;

    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await axios.put(
        `${baseUrl}/operations/goods/verify/${item.id}`,
        {
          uid: item.id,
          status: 'verified',
          verified_by: userName,
          verified_at: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Item verified:', response.data);
      
      setItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { 
              ...prevItem, 
              isVerified: true, 
              verifiedBy: userName, 
              verifiedAt: new Date().toISOString() 
            }
          : prevItem
      ));

      showSuccess('✅ Item Terverifikasi', 
        `Item berhasil diverifikasi!\n\n` +
        `📦 Kode: ${item.item_code}\n` +
        `📊 Jenis: ${item.item_type}\n` +
        `👤 Diverifikasi oleh: ${userName}\n` +
        `🕐 Waktu: ${new Date().toLocaleString('id-ID')}`
      );

    } catch (error) {
      console.error('Error verifying item:', error);
      showApiError(error, 'Gagal memverifikasi item. Silakan coba lagi.');
    }
  };

  const handleAddItem = async () => {
    if (!kodeItem || !jenisItem || !jumlahBarang || !hargaSatuan) {
      showWarning('⚠️ Data Tidak Lengkap', 
        'Harap lengkapi semua field item!\n\n' +
        'Field yang wajib diisi:\n' +
        '✓ Kode Item\n' +
        '✓ Jenis Item\n' +
        '✓ Jumlah Barang\n' +
        '✓ Harga Satuan'
      );
      return;
    }

    const activeParentId = id || currentClaimId;
    
    if (!activeParentId) {
      showWarning('⚠️ Claim ID Tidak Ditemukan', 
        'Claim ID tidak ditemukan!\n\n' +
        'Harap simpan klaim terlebih dahulu sebelum menambahkan item.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }
      
      const formData = new FormData();
      formData.append('secret', SECRET_KEY);
      formData.append('claim_id', String(activeParentId));
      formData.append('quantity', String(jumlahBarang));
      formData.append('price', String(hargaSatuan));
      formData.append('item_code', kodeItem.trim());
      formData.append('item_type', jenisItem.trim());
      formData.append('category', category.trim() || '-');
      if (catatan) formData.append('note', catatan);
      if (fotoFile) formData.append('goods_image', fotoFile);

      let response;
      let newItemId;

      if (editingId) {
        formData.append('uid', editingId);
        response = await axios.put(
          `${baseUrl}/operations/goods?id=${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Basic ${token}`,
              'X-Secret-Key': SECRET_KEY,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        newItemId = response.data?.express21?.results?.data?.uid || 
                    response.data?.results?.data?.uid || 
                    response.data?.data?.uid || 
                    editingId;
        
        setItems(prev => prev.map(item =>
          item.id === editingId ? { 
            ...item, 
            item_code: kodeItem.trim(),
            item_type: jenisItem.trim(),
            category: category.trim() || '-',
            quantity: Number(jumlahBarang),
            price: Number(hargaSatuan),
            note: catatan,
            fotoPreview: fotoPreview,
            fotoFile: fotoFile,
            isExisting: true,
            id: newItemId
          } : item
        ));
        
        setEditingId(null);
        console.log('Item updated successfully:', response.data);
        showSuccess('✅ Item Diupdate', 
          `Item berhasil diupdate!\n\n` +
          `📦 Kode: ${kodeItem.trim()}\n` +
          `📊 Jenis: ${jenisItem.trim()}\n` +
          `📐 Jumlah: ${jumlahBarang}\n` +
          `💰 Harga: Rp ${Number(hargaSatuan).toLocaleString('id-ID')}\n` +
          `🆔 ID: ${newItemId}`
        );
        
      } else {
        response = await axios.post(
          `${baseUrl}/operations/goods`,
          formData,
          {
            headers: {
              Authorization: `Basic ${token}`,
              'X-Secret-Key': SECRET_KEY,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        newItemId = response.data?.express21?.results?.data?.uid || 
                    response.data?.results?.data?.uid || 
                    response.data?.data?.uid || 
                    response.data?.uid;

        console.log('API Response:', response.data);
        console.log('New Item UID:', newItemId);

        const itemData = {
          id: newItemId || Date.now(),
          isExisting: true,
          claim_id: activeParentId,
          item_code: kodeItem.trim(),
          item_type: jenisItem.trim(),
          category: category.trim() || '-',
          quantity: Number(jumlahBarang),
          price: Number(hargaSatuan),
          note: catatan,
          fotoPreview: fotoPreview,
          fotoFile: fotoFile,
          isVerified: false,
          verifiedBy: null,
          verifiedAt: null
        };

        setItems(prev => [...prev, itemData]);
        console.log('New item added with ID:', newItemId);
        showSuccess('✅ Item Ditambahkan', 
          `Item berhasil ditambahkan!\n\n` +
          `📦 Kode: ${kodeItem.trim()}\n` +
          `📊 Jenis: ${jenisItem.trim()}\n` +
          `📐 Jumlah: ${jumlahBarang}\n` +
          `💰 Harga: Rp ${Number(hargaSatuan).toLocaleString('id-ID')}\n` +
          `🆔 ID: ${newItemId || 'Local'}`
        );
      }

      setKodeItem('');
      setJenisItem('');
      setCategory('');
      setJumlahBarang('');
      setHargaSatuan('');
      setCatatan('');
      setFotoFile(null);
      setFotoPreview('');

    } catch (error) {
      console.error('Error saving item:', error);
      console.error('Error response:', error.response?.data);
      showApiError(error, 'Gagal menyimpan item. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleClaimTypeChange = (e) => {
    const selectedId = e.target.value;
    const selectedOption = claimTypeOptions.find(option => option.id.toString() === selectedId);
    if (selectedOption) {
      setClaimTypeId(selectedId);
      setClaimType(selectedOption.name);
      showInfo('📋 Jenis Klaim', `Jenis klaim dipilih: ${selectedOption.name}`);
    }
  };

  const handleDeleteClaim = async () => {
    if (!id) {
      showWarning('⚠️ ID Tidak Valid', 'ID Klaim tidak ditemukan untuk dihapus');
      return;
    }
    
    const confirmDelete = window.confirm(
      "⚠️ PERINGATAN!\n\n" +
      "Apakah Anda yakin ingin menghapus klaim ini?\n" +
      "Seluruh data barang terkait juga akan terhapus secara permanen.\n" +
      `ID Klaim: ${id}\n\n` +
      "Tindakan ini tidak dapat dibatalkan!"
    );
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      const response = await axios.delete(`${baseUrl}/operations/claim`, {
        headers: {
          Authorization: `Basic ${token}`,
          "X-Secret-Key": SECRET_KEY,
          "Content-Type": "application/json",
        },
        data: { id: id }
      });

      if (response.data) {
        console.log("Delete Success. Claim ID:", response.data.id);
      }
      
      showSuccess('✅ Klaim Dihapus', 
        `Klaim berhasil dihapus!\n\n` +
        `🆔 ID Klaim: ${id}\n` +
        `📋 Kode Klaim: ${claimCode || '-'}`
      );
      navigate(`/Operations/AccPengajuanKlaim/?page=${returnPage}&itemsPerPage=${returnItemsPerPage}`);
    } catch (err) {
      console.error("Error deleting claim:", err);
      showApiError(err, 'Gagal menghapus klaim');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReport = async () => {
    if (!awbResi) {
      showWarning('⚠️ Resi Kosong', 'Harap isi nomor resi terlebih dahulu');
      return;
    }
    if (!claimTypeId) {
      showWarning('⚠️ Jenis Klaim Kosong', 'Harap pilih jenis klaim');
      return;
    }
    if (items.length === 0) {
      showWarning('⚠️ Tidak Ada Barang', 'Minimal harus ada 1 barang untuk menyimpan laporan');
      return;
    }

    setIsSaving(true);

    try {
      const token = getAuthToken();
      if (!token) {
        showWarning('🔑 Autentikasi', 'Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      const formData = new FormData();
      formData.append('secret', SECRET_KEY);
      formData.append('shipment_code', awbResi);
      formData.append('ownership', selectedCompany);
      formData.append('customer_code', customerCode || '');
      formData.append('customer_name', customerName || '');
      formData.append('type_id', claimTypeId);
      formData.append('status_id', '1');
      formData.append('claim_code', claimCode || '');
      formData.append('total_price', grandTotal.toString());
      
      if (accountBank) formData.append('account_bank', accountBank);
      if (accountBankId) formData.append('account_bank_id', accountBankId);
      if (accountBankName) formData.append('account_bank_name', accountBankName);
      if (accountNumber) formData.append('account_number', accountNumber);
      
      if (instrumentFile) formData.append('claim_image', instrumentFile);
      
      if (id) formData.append('id', id);

      const claimResponse = await axios.post(
        `${baseUrl}/operations/claim`,
        formData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            'X-Secret-Key': SECRET_KEY,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('CLAIM RESPONSE:', claimResponse.data);

      let finalClaimId = null;

      if (isEditMode) {
        finalClaimId = id;
      } else {
        const respData = claimResponse.data;
        finalClaimId =
          respData?.express21?.results?.data?.id ||
          respData?.results?.data?.id ||
          respData?.data?.id ||
          respData?.id;
      }

      if (!finalClaimId) {
        throw new Error('Could not determine Claim ID for saving items.');
      }

      console.log('FINAL CLAIM ID:', finalClaimId);

      let savedItems = 0;
      for (const item of items) {
        const goodsFormData = new FormData();
        goodsFormData.append('secret', SECRET_KEY);
        goodsFormData.append('claim_id', String(finalClaimId));
        goodsFormData.append('quantity', item.quantity);
        goodsFormData.append('price', item.price);
        if (item.item_code) goodsFormData.append('item_code', item.item_code);
        if (item.item_type) goodsFormData.append('item_type', item.item_type);
        if (item.category) goodsFormData.append('category', item.category);
        if (item.note) goodsFormData.append('note', item.note);
        if (item.fotoFile) goodsFormData.append('goods_image', item.fotoFile);

        if (item.isExisting && item.id) {
          goodsFormData.append('uid', item.id);
          await axios.put(
            `${baseUrl}/operations/goods?id=${item.id}`,
            goodsFormData,
            {
              headers: {
                Authorization: `Basic ${token}`,
                'X-Secret-Key': SECRET_KEY,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          console.log(`UPDATED GOODS ID: ${item.id} for Claim: ${finalClaimId}`);
        } else {
          await axios.post(
            `${baseUrl}/operations/goods`,
            goodsFormData,
            {
              headers: {
                Authorization: `Basic ${token}`,
                'X-Secret-Key': SECRET_KEY,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          console.log(`CREATED NEW GOODS for Claim: ${finalClaimId}`);
        }
        savedItems++;
      }

      const successMessage = isEditMode 
        ? `✅ Laporan berhasil diupdate!\n\n` +
          `🆔 ID Klaim: ${finalClaimId}\n` +
          `📋 Kode Klaim: ${claimCode || '-'}\n` +
          `📦 Total Item: ${savedItems}\n` +
          `💰 Total Nilai: Rp ${grandTotal.toLocaleString('id-ID')}\n` +
          `🏢 Perusahaan: ${selectedCompany}`
        : `✅ Laporan berhasil disimpan!\n\n` +
          `🆔 ID Klaim: ${finalClaimId}\n` +
          `📋 Kode Klaim: ${claimCode || '-'}\n` +
          `📦 Total Item: ${savedItems}\n` +
          `💰 Total Nilai: Rp ${grandTotal.toLocaleString('id-ID')}\n` +
          `🏢 Perusahaan: ${selectedCompany}`;

      showSuccess(isEditMode ? '✅ Laporan Diupdate' : '✅ Laporan Disimpan', successMessage);

      if (isEditMode) {
        await fetchClaimData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(`/Operations/Claim/List/${finalClaimId}?page=${returnPage}&itemsPerPage=${returnItemsPerPage}`);
      }

    } catch (error) {
      console.error('Error saving report:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.express21?.status) {
        const status = error.response.data.express21.status;
        console.log('Express21 status error:', status);
        
        if (status.error_message?.toLowerCase().includes('claim with this shipment code has been accepted')) {
          showAlert(
            'error',
            '⚠️ Klaim Gagal Dibuat',
            'Maaf, nomor resi ini sudah memiliki klaim yang diterima sebelumnya.\n\n' +
            'Silakan gunakan nomor resi lain atau hubungi administrator untuk informasi lebih lanjut.',
            {
              error_code: status.error_code || 2001,
              status_code: status.status_code || 500,
              error_message: status.error_message,
              message: status.message || 'something went wrong'
            }
          );
        } else {
          showAlert(
            'error',
            '❌ Error',
            status.error_message || status.message || 'Gagal menyimpan laporan',
            {
              error_code: status.error_code || 'N/A',
              status_code: status.status_code || 'N/A',
              error_message: status.error_message,
              message: status.message || ''
            }
          );
        }
      } else if (error.response?.data?.status) {
        const status = error.response.data.status;
        showAlert(
          'error',
          '❌ Error',
          status.error_message || status.message || 'Gagal menyimpan laporan',
          {
            error_code: status.error_code || 'N/A',
            status_code: status.status_code || 'N/A',
            error_message: status.error_message,
            message: status.message || ''
          }
        );
      } else {
        showApiError(error, 'Gagal menyimpan laporan. Silakan coba lagi.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Memuat data klaim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-20 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <AnimatedAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        details={alert.details}
      />

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isEditMode ? 'Edit Pengajuan Klaim' : 'Form Pengajuan Klaim'}
            </h1>
            <p className="text-sm text-slate-500">
              {isEditMode ? `Edit data pengajuan klaim ID: ${id}` : 'Silahkan lengkapi informasi pengiriman dan detail barang.'}
            </p>
            {canVerify() && (
              <div className="mt-2 inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                <CheckCircle size={14} />
                Verifikasi Aktif - {userName}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 text-sm font-medium rounded-md shadow-sm hover:bg-slate-50 transition">BERANDA</button>
            <button className="bg-rose-600 text-white px-4 py-2 text-sm font-medium rounded-md shadow-sm hover:bg-rose-700 transition">KELUAR</button>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-center">
            <p className="text-red-600 bg-red-100 border border-red-300 rounded p-4">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

          <div className="p-8 border-b border-slate-100 bg-slate-50/50">

            <div className="mb-6 flex justify-start">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 inline-flex items-center gap-1">
                <button
                  onClick={() => setSelectedCompany('ANDALAN')}
                  className={`px-6 py-2 rounded-md font-bold text-sm transition-all duration-200 ${selectedCompany === 'ANDALAN'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  ANDALAN
                </button>
                <button
                  onClick={() => setSelectedCompany('GLOBALINDO')}
                  className={`px-6 py-2 rounded-md font-bold text-sm transition-all duration-200 ${selectedCompany === 'GLOBALINDO'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  GLOBALINDO
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Kode Klaim</label>
                  <input
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-slate-50 cursor-not-allowed"
                    placeholder="Masukkan kode klaim"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Jenis Klaim</label>
                  <select
                    value={claimTypeId}
                    onChange={handleClaimTypeChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white cursor-pointer"
                    disabled={isLoadingClaimTypes}
                  >
                    <option value="">{isLoadingClaimTypes ? 'Loading...' : 'Pilih Jenis Klaim'}</option>
                    {claimTypeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Jumlah Koli</label>
                    <input
                      type="number"
                      value={totalKoli}
                      onChange={(e) => setTotalKoli(e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Total Kilo (Kg)</label>
                    <input
                      type="number"
                      value={totalKilo}
                      onChange={(e) => setTotalKilo(e.target.value)}
                      step="0.1"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Customer</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-2"
                    placeholder="Nama Customer"
                  />
                  <input
                    type="text"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50"
                    placeholder="Kode Customer"
                    readOnly
                  />
                </div>
                
                {/* Lampiran Instrument - with View button */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Lampiran File</label>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 flex shadow-sm">
                      <input
                        type="text"
                        value={instrumentFileName}
                        className="flex-grow border border-slate-300 rounded-l-md px-3 py-2 text-sm bg-slate-50 cursor-not-allowed"
                        placeholder="Pilih file..."
                        readOnly
                      />
                      <button
                        onClick={handleInstrumentBrowse}
                        className="bg-slate-800 text-white px-4 text-xs font-medium rounded-r-md hover:bg-black transition uppercase"
                      >
                        Browse
                      </button>
                    </div>
                    
                    {instrumentFileUrl && (
                      <button
                        onClick={handleViewInstrument}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2 shadow-sm"
                        title="Lihat Instrument"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium hidden sm:inline">Lihat</span>
                      </button>
                    )}
                  </div>
                  
                  {instrumentFileUrl && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <File size={14} />
                        <span className="font-medium">File tersedia:</span>
                        <span className="text-xs truncate max-w-[200px]">{instrumentFileName}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2 - AWB/Resi, Kota Asal, Kota Tujuan, then Bank Account */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">AWB / Resi</label>
                  <div className="flex shadow-sm">
                    <input
                      type="text"
                      value={awbResi}
                      onChange={(e) => setAwbResi(e.target.value)}
                      className="flex-grow border border-slate-300 rounded-l-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Masukkan No. Resi"
                    />
                    <button
                      onClick={() => handleSearchResi()}
                      disabled={isSearching}
                      className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700 transition disabled:bg-blue-400"
                    >
                      {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-xs text-red-600 mt-1">{searchError}</p>
                  )}
                </div>

                {/* Kota Asal and Kota Tujuan - Now above Bank Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Kota Asal</label>
                    <input
                      type="text"
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Kota Tujuan</label>
                    <input
                      type="text"
                      value={destCity}
                      onChange={(e) => setDestCity(e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-slate-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Bank Account Fields - Below Kota Asal and Kota Tujuan */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building size={14} /> Informasi Bank
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Nama Bank</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500">
                          <Building size={14} />
                        </span>
                        <select
                          value={accountBank}
                          onChange={(e) => {
                            const selectedBankName = e.target.value;
                            setAccountBank(selectedBankName);
                            const selectedBank = bankOptions.find(bank => bank.name === selectedBankName);
                            if (selectedBank) {
                              setAccountBankId(selectedBank.id);
                              showInfo('🏦 Bank Dipilih', `Bank dipilih: ${selectedBankName}`);
                            }
                          }}
                          className="w-full border border-slate-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white"
                          disabled={isLoadingBanks}
                        >
                          <option value="">{isLoadingBanks ? 'Loading banks...' : 'Pilih Bank'}</option>
                          {bankOptions.map((bank) => (
                            <option key={bank.id} value={bank.name}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Atas Nama - account_bank_name (nama pemilik rekening) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Atas Nama</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500">
                          <User size={14} />
                        </span>
                        <input
                          type="text"
                          value={accountBankName}
                          onChange={(e) => setAccountBankName(e.target.value)}
                          className="w-full border border-slate-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                          placeholder="Masukkan nama pemilik rekening"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">No. Rekening</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500">
                          <CreditCard size={14} />
                        </span>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full border border-slate-300 rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                          placeholder="Masukkan nomor rekening"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 - Empty for now */}
              <div className="space-y-4">
              </div>
            </div>
          </div>

          {/* Tambah Detail Barang Section */}
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <Package className="text-blue-600" size={20} />
              <h2 className="font-semibold text-slate-800 uppercase tracking-wider text-sm">Tambah Detail Barang</h2>
              {items.length > 0 && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Total {items.length} item(s)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Kode Item</label>
                  <input
                    type="text"
                    value={kodeItem}
                    onChange={(e) => setKodeItem(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4"
                    placeholder="Masukkan kode item"
                  />

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Jenis Item</label>
                  <input
                    type="text"
                    value={jenisItem}
                    onChange={(e) => setJenisItem(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4"
                    placeholder="Masukkan jenis item"
                  />

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Masukkan kategori"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Jumlah Barang</label>
                  <input
                    type="number"
                    value={jumlahBarang}
                    onChange={(e) => setJumlahBarang(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4"
                    placeholder="Masukkan jumlah"
                  />

                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Harga Satuan</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">Rp</span>
                    <input
                      type="number"
                      value={hargaSatuan}
                      onChange={(e) => setHargaSatuan(e.target.value)}
                      className="w-full border border-slate-300 rounded-r-md px-3 py-2 text-sm"
                      placeholder="Masukkan harga satuan"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Catatan / Note</label>
                  <textarea
                    rows="3"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                    placeholder="Berikan alasan klaim secara detail..."
                  />
                </div>
              </div>

              <div className="lg:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase text-center md:text-left">Foto Barang</label>
                <div
                  onClick={handleFotoUpload}
                  className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-4 flex flex-col items-center justify-center min-h-[180px] hover:border-blue-400 transition cursor-pointer group"
                >
                  {fotoPreview ? (
                    <div className="text-center">
                      <img
                        src={fotoPreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg mx-auto mb-2"
                      />
                      <p className="text-xs text-green-600 font-medium">Foto terupload</p>
                      <p className="text-[10px] text-slate-400 mt-1">Klik untuk ganti</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition">
                        <Camera size={24} className="text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Upload Bukti Foto</p>
                      <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG (Max 2MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddItem}
                disabled={isSaving}
                className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-emerald-700 shadow-md transition transform active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {isSaving ? 'Menyimpan...' : 'Tambah Ke List'}
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Aksi</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">No.</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Claim ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Kode Item</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Jenis Item</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Kategori</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Foto</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-center">Qty</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Harga</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Note</th>
                  {canVerify() && (
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-center">Verifikasi</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr className="hover:bg-slate-50 transition">
                    <td colSpan={canVerify() ? 12 : 11} className="px-4 py-8 text-center text-sm text-slate-500 italic">
                      Tidak ada data barang untuk klaim ini
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{index + 1}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          {item.claim_id || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">{item.item_code}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{item.item_type}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{item.category}</td>
                      <td className="px-4 py-4">
                        {item.fotoPreview ? (
                          <img
                            src={item.fotoPreview}
                            alt="item"
                            className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80"
                            onClick={() => window.open(item.fotoPreview, '_blank')}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 max-w-[200px] truncate" title={item.note}>
                        {item.note || '-'}
                      </td>
                      {canVerify() && (
                        <td className="px-4 py-4 text-center">
                          {item.isVerified ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                                <CheckCircle size={12} />
                                Terverifikasi
                              </span>
                              {item.verifiedBy && (
                                <span className="text-[10px] text-slate-500">
                                  oleh {item.verifiedBy}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleVerifyItem(item)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1 mx-auto"
                            >
                              <CheckCircle size={14} />
                              Verify
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}

                {/* Footer Row for Grand Total */}
                {items.length > 0 && (
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={canVerify() ? 10 : 9} className="px-4 py-4 text-right font-bold text-slate-700">Grand Total:</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">
                      Rp {grandTotal.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-4"></td>
                    {canVerify() && <td className="px-4 py-4"></td>}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================== */}
        {/* ACTION BUTTONS - WITH MEMORY */}
        {/* ========================================== */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              // Get page from URL
              const params = new URLSearchParams(location.search);
              const page = parseInt(params.get('page')) || 1;
              const items = parseInt(params.get('itemsPerPage')) || 10;
              
              console.log("🔵 GOING BACK TO LIST - Page:", page, "Items:", items);
              console.log("🔵 Memory stored:", window.__returnToClaim);
              
              navigate(`/Operations/AccPengajuanKlaim/?page=${page}&itemsPerPage=${items}`);
            }}
            className="order-2 sm:order-1 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium px-4 py-2 transition"
          >
            <ArrowLeft size={18} /> Kembali ke List Klaim
          </button>

          <div className="order-1 sm:order-2 flex gap-4 w-full sm:w-auto">
            <button
              onClick={() => {
                const params = new URLSearchParams(location.search);
                const page = parseInt(params.get('page')) || 1;
                const items = parseInt(params.get('itemsPerPage')) || 10;
                navigate(`/Operations/AccPengajuanKlaim/?page=${page}&itemsPerPage=${items}`);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-100 text-rose-700 px-8 py-3 rounded-lg font-bold hover:bg-rose-200 transition"
            >
              Batal
            </button>

            {isEditMode && (
              <button
                onClick={handleDeleteClaim}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-rose-200 hover:bg-rose-700 transition transform active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={18} /> Hapus Klaim
              </button>
            )}
            <button
              onClick={handleSaveReport}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Menyimpan...' : (isEditMode ? 'Update Laporan' : 'Simpan Laporan')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalClaimForm;