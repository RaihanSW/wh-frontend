import React, { useState, useEffect } from 'react';
import { Search, Camera, Plus, Save, Trash2, ArrowLeft, FileText, Package, ClipboardList, Loader2, Eye, ExternalLink, File, Building, CreditCard, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ProfessionalClaimForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const SECRET_KEY = "Cqy7T9bX"; 

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

  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";

  const [selectedCompany, setSelectedCompany] = useState('ANDALAN');
  const [claimCode, setClaimCode] = useState('');
  const [claimType, setClaimType] = useState('');
  const [claimTypeId, setClaimTypeId] = useState('');
  const [claimTypeOptions, setClaimTypeOptions] = useState([]);
  const [isLoadingClaimTypes, setIsLoadingClaimTypes] = useState(false);
  const [awbResi, setAwbResi] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // Bank account fields
  const [accountBank, setAccountBank] = useState(''); // Nama Bank (display name)
  const [accountBankId, setAccountBankId] = useState(''); // ID Bank dari options
  const [accountBankName, setAccountBankName] = useState(''); // Atas Nama / Nama pemilik rekening
  const [accountNumber, setAccountNumber] = useState(''); // No. Rekening
  
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

  // Bank options state
  const [bankOptions, setBankOptions] = useState([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  // Fetch bank list from API
  const fetchBankList = async () => {
    setIsLoadingBanks(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}/masters/bank`, {
        method: 'GET',
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const banks = data?.express21?.results?.data || [];
        setBankOptions(banks);
      } else {
        // Fallback to default options
        setBankOptions([
          { id: 1, name: 'BCA' },
          { id: 2, name: 'BNI' },
          { id: 3, name: 'BRI' },
          { id: 4, name: 'Mandiri' },
          { id: 5, name: 'Bank Danamon' },
          { id: 6, name: 'Bank Permata' },
          { id: 7, name: 'Bank CIMB Niaga' },
          { id: 8, name: 'Bank Mega' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching bank list:', error);
      setBankOptions([
        { id: 1, name: 'BCA' },
        { id: 2, name: 'BNI' },
        { id: 3, name: 'BRI' },
        { id: 4, name: 'Mandiri' },
        { id: 5, name: 'Bank Danamon' },
        { id: 6, name: 'Bank Permata' },
        { id: 7, name: 'Bank CIMB Niaga' },
        { id: 8, name: 'Bank Mega' }
      ]);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  useEffect(() => {
    const fetchClaimTypes = async () => {
      setIsLoadingClaimTypes(true);
      try {
        const response = await fetch(`${baseUrl}/masters/claimtype`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const claimTypes = data?.express21?.results?.data || [];
        setClaimTypeOptions(claimTypes);
      } catch (error) {
        console.error('Error fetching claim types:', error);
        setClaimTypeOptions([
          { id: 1, name: 'PENYOK' },
          { id: 2, name: 'RUSAK' },
          { id: 3, name: 'HILANG' }
        ]);
      } finally {
        setIsLoadingClaimTypes(false);
      }
    };

    fetchClaimTypes();
    fetchBankList(); // Fetch bank list on mount
  }, []);

  useEffect(() => {
    if (id) {
      fetchClaimData();
    }
  }, [id]);

  const fetchClaimData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/operations/claim?filter_by_col=id&filter_by_text=${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claim data');
      }

      const data = await response.json();
      const claimData = data?.express21?.results?.data?.[0];

      if (claimData) {
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
        
        // Set bank account fields with correct mapping
        setAccountBank(claimData.account_bank || '');
        setAccountBankId(claimData.account_bank_id || '');
        setAccountBankName(claimData.account_bank_name || '');
        setAccountNumber(claimData.account_number || '');
        
        if (claimData.link_url) {
          setInstrumentFileUrl(claimData.link_url);
          setInstrumentFileName(claimData.link_filename || 'Lampiran Instrument');
        }

        if (claimData.shipment_code) {
          setAwbResi(claimData.shipment_code);
          await fetchShipmentDetails(claimData.shipment_code);
        }

        await fetchGoodsItems(claimData.id);
      }
    } catch (error) {
      console.error('Error fetching claim data:', error);
      setError('Gagal memuat data klaim');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentDetails = async (shipmentCode) => {
    try {
      const response = await fetch(`${baseUrl}/siscos/shipment/detail?shipment_code=${shipmentCode}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const shipmentData = data?.express21?.results?.data?.[0]?.shipment_detail?.[0];
        
        if (shipmentData) {
          setOriginCity(shipmentData.origin_city || '');
          setDestCity(shipmentData.dest_city || '');
          setTotalKoli(shipmentData.ttl_piece?.toString() || '');
          setTotalKilo(shipmentData.ttl_chargeable_weight?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Error fetching shipment details:', error);
    }
  };

  const fetchGoodsItems = async (claimId) => {
    try {
      const response = await fetch(`${baseUrl}/operations/goods?filter_by_col=claim_id&filter_by_text=${claimId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const goodsData = data?.express21?.results?.data || [];
        
        const formattedItems = goodsData.map((item) => ({
          uid: item.uid,
          id: item.uid,
          isExisting: true,
          item_code: item.item_code || '',
          item_type: item.item_type || '',
          category: item.category || '',
          quantity: item.quantity || 0,
          price: item.price || 0,
          total: (item.quantity || 0) * (item.price || 0),
          note: item.note || '',
          fotoPreview: item.link_url || '',
          fotoFile: null,
        }));
        
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching goods items:', error);
    }
  };

  const handleViewLampiran = () => {
    if (instrumentFileUrl) {
      window.open(instrumentFileUrl, '_blank');
    } else if (instrumentFile) {
      const url = URL.createObjectURL(instrumentFile);
      window.open(url, '_blank');
    } else {
      alert('Tidak ada lampiran untuk ditampilkan');
    }
  };

  const handleSearchResi = async () => {
    if (!awbResi.trim()) {
      setSearchError('Masukkan nomor resi terlebih dahulu');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const response = await fetch(`${baseUrl}/siscos/shipment/detail?shipment_code=${awbResi}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const shipmentData = data?.express21?.results?.data?.[0]?.shipment_detail?.[0];
      
      if (shipmentData) {
        setOriginCity(shipmentData.origin_city || '');
        setDestCity(shipmentData.dest_city || '');
        setCustomerName(shipmentData.customer_name || '');
        setCustomerCode(shipmentData.customer_code || '');
        setTotalKoli(shipmentData.ttl_piece?.toString() || '');
        setTotalKilo(shipmentData.ttl_chargeable_weight?.toString() || '');
        setSearchError('');
      } else {
        setSearchError('Data tidak ditemukan untuk nomor resi tersebut');
      }
    } catch (error) {
      console.error('Error searching resi:', error);
      setSearchError('Gagal mencari data resi. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInstrumentBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setInstrumentFile(file);
        setInstrumentFileName(file.name);
        setInstrumentFileUrl('');
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
      if (file && file.size <= 2 * 1024 * 1024) {
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
      } else if (file) {
        alert('Ukuran file maksimal 2MB');
      }
    };
    input.click();
  };

  const handleAddItem = () => {
    if (!kodeItem.trim() || !jenisItem.trim() || !jumlahBarang || !hargaSatuan) {
      alert('Harap lengkapi semua field item');
      return;
    }

    const qty = Number(jumlahBarang);
    const harga = Number(hargaSatuan);

    const newItem = {
      tempId: Date.now(),
      isExisting: false,
      item_code: kodeItem.trim(),
      item_type: jenisItem.trim(),
      category: category.trim() || 'general',
      quantity: qty,
      price: harga,
      total: qty * harga,
      note: catatan,
      fotoPreview: fotoPreview,
      fotoFile: fotoFile,
    };

    setItems([...items, newItem]);
    
    setKodeItem('');
    setJenisItem('');
    setCategory('');
    setJumlahBarang('');
    setHargaSatuan('');
    setCatatan('');
    setFotoFile(null);
    setFotoPreview('');
  };

  const handleDeleteItem = async (item) => {
    if (!item.uid && !item.isExisting) {
      setItems(prevItems => prevItems.filter(i => i.tempId !== item.tempId));
      return;
    }

    const itemUid = item.uid;
    
    if (!itemUid) {
      setItems(prevItems => prevItems.filter(i => i.tempId !== item.tempId));
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${baseUrl}/operations/goods`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'X-Secret-Key': SECRET_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: itemUid.toString() }),
      });

      const result = await response.json();
      console.log('Delete API response:', result);

      if (!response.ok) {
        throw new Error(result?.message || `HTTP error! status: ${response.status}`);
      }
      
      setItems(prevItems => prevItems.filter(i => i.uid !== itemUid));
      
      alert('Barang berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Gagal menghapus barang: ${error.message}`);
    }
  };

  const handleEditItem = (item) => {
    setKodeItem(item.item_code);
    setJenisItem(item.item_type);
    setCategory(item.category);
    setJumlahBarang(item.quantity);
    setHargaSatuan(item.price);
    setCatatan(item.note);
    setFotoPreview(item.fotoPreview);
    setFotoFile(item.fotoFile);
    handleDeleteItem(item);
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleClaimTypeChange = (e) => {
    const selectedId = e.target.value;
    const selectedOption = claimTypeOptions.find(option => option.id.toString() === selectedId);
    if (selectedOption) {
      setClaimTypeId(selectedId);
      setClaimType(selectedOption.name);
    }
  };

  const handleBack = () => {
    navigate('/Operations/Claim');
  };

  const handleSaveReport = async () => {
    if (!awbResi) {
      alert('Harap isi nomor resi terlebih dahulu');
      return; 
    }
    
    if (!claimTypeId) {
      alert('Harap pilih jenis klaim');
      return;
    }

    if (items.length === 0) {
      alert('Minimal harus ada 1 barang');
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('secret', SECRET_KEY);
      formData.append('shipment_code', awbResi);
      formData.append('ownership', selectedCompany);
      formData.append('customer_code', customerCode || '');
      formData.append('customer_name', customerName || '');
      formData.append('type_id', claimTypeId);
      formData.append('status_id', '1');
      formData.append('total_price', grandTotal.toString());
      
      // Add bank account fields with correct mapping
      if (accountBank) formData.append('account_bank', accountBank);
      if (accountBankId) formData.append('account_bank_id', accountBankId);
      if (accountBankName) formData.append('account_bank_name', accountBankName);
      if (accountNumber) formData.append('account_number', accountNumber);
      
      if (isEditMode && currentClaimId) {
        formData.append('id', currentClaimId);
      }
      
      if (claimCode) {
        formData.append('claim_code', claimCode);
      }
      
      if (instrumentFile) {
        formData.append('claim_image', instrumentFile);
      }
      
      const goodsList = items.map(item => ({
        item_code: item.item_code,
        item_type: item.item_type,
        category: item.category,
        note: item.note,
        quantity: item.quantity,
        price: item.price
      }));
      formData.append('goods_list', JSON.stringify(goodsList));
      
      items.forEach((item) => {
        if (item.fotoFile) {
          formData.append('goods_images', item.fotoFile);
        }
      });

      const token = getAuthToken();
      const url = `${baseUrl}/operations/claim`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'X-Secret-Key': SECRET_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);
      alert(isEditMode ? 'Laporan berhasil diupdate!' : 'Laporan berhasil disimpan!');
      
      if (!isEditMode) {
        navigate('/Operations/Claim');
      } else {
        await fetchClaimData();
      }
      
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Gagal menyimpan laporan. Silakan coba lagi.');
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
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isEditMode ? 'Edit Pengajuan Klaim' : 'Form Pengajuan Klaim'}
            </h1>
            <p className="text-sm text-slate-500">Silahkan lengkapi informasi pengiriman dan detail barang.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 text-sm font-medium rounded-md shadow-sm hover:bg-slate-50 transition">BERANDA</button>
            <button className="bg-rose-600 text-white px-4 py-2 text-sm font-medium rounded-md shadow-sm hover:bg-rose-700 transition">KELUAR</button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="text-blue-600" size={20} />
              <h2 className="font-semibold text-slate-800 uppercase tracking-wider text-sm">Informasi Utama</h2>
            </div>
            
            <div className="mb-6 flex justify-start">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 inline-flex items-center gap-1">
                <button
                  onClick={() => setSelectedCompany('ANDALAN')}
                  className={`px-6 py-2 rounded-md font-bold text-sm transition-all duration-200 ${
                    selectedCompany === 'ANDALAN'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ANDALAN
                </button>
                <button
                  onClick={() => setSelectedCompany('GLOBALINDO')}
                  className={`px-6 py-2 rounded-md font-bold text-sm transition-all duration-200 ${
                    selectedCompany === 'GLOBALINDO'
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
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" 
                    placeholder="Masukkan kode klaim" 
                    readOnly={isEditMode}
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
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Total Kilo (Kg)</label>
                    <input 
                      type="number" 
                      value={totalKilo}
                      onChange={(e) => setTotalKilo(e.target.value)}
                      step="0.1"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
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
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Lampiran Instrument</label>
                  
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
                        onClick={handleViewLampiran}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2 shadow-sm"
                        title="Lihat Lampiran"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium hidden sm:inline">Lihat</span>
                      </button>
                    )}
                  </div>
                  
                  {instrumentFileUrl && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <File size={14} />
                          <span className="font-medium">File tersedia:</span>
                          <span className="text-xs truncate max-w-[200px]">{instrumentFileName}</span>
                        </div>
                        <button
                          onClick={handleViewLampiran}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Buka di tab baru
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2 */}
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
                      onClick={handleSearchResi}
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

                {/* Bank Account Fields */}
                <div className="border-t border-slate-200 pt-3">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-2">
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
                    
                    {/* Atas Nama - account_bank_name */}
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
                    
                    {/* No. Rekening - account_number */}
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

              {/* Column 3 */}
              <div className="space-y-4">
              </div>
            </div>
          </div>

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
                  ></textarea>
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
                className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-emerald-700 shadow-md transition transform active:scale-95"
              >
                <Plus size={18} /> Tambah Ke List
              </button>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Aksi</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Kode Item</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Jenis Item</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Foto</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-center">Qty</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap"></td>
                    <td className="px-6 py-4 text-sm text-slate-500 italic" colSpan="9">
                      Data barang yang ditambahkan akan muncul di sini...
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.tempId || item.uid || index} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" 
                            title="Edit"
                          >
                            <FileText size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" 
                            title="Hapus"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                       </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.item_code}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.item_type}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">Rp {item.price.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate" title={item.note}>{item.note || '-'}</td>
                    </tr>
                  ))
                )}
                {items.length > 0 && (
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={8} className="px-6 py-4 text-right font-bold text-slate-700">Grand Total:</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">Rp {grandTotal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleBack}
            className="order-2 sm:order-1 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium px-4 py-2 transition"
          >
            <ArrowLeft size={18} /> Kembali ke List Klaim
          </button>
          
          <div className="order-1 sm:order-2 flex gap-4 w-full sm:w-auto">
            <button 
              onClick={handleBack}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-100 text-rose-700 px-8 py-3 rounded-lg font-bold hover:bg-rose-200 transition"
            >
              Batal
            </button>
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