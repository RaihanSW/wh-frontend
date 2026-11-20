import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Camera, Calendar, User, FileText, Loader2 } from 'lucide-react';

const ClaimTransactionDetail = () => {
  const { id } = useParams(); // Mengambil ID master inventory dari URL
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777";
  const SECRET_KEY = "Cqy7T9bX";

  // State Informasi Utama Master Item
  const [itemInfo, setItemInfo] = useState({
    item_code: '',
    item_type: '',
    stock_left: 0,
    price: 0,
    link_url: '',
    link_filename: ''
  });

  // State for Transaction Types
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);

  // State Form Transaksi Baru
  const [tanggalTransaksi, setTanggalTransaksi] = useState(new Date().toISOString().split('T')[0]);
  const [transactiontypeId, setTransactiontypeId] = useState('');
  const [transaksiOleh, setTransaksiOleh] = useState('');
  const [hargaSatuan, setHargaSatuan] = useState(0);
  const [jumlah, setJumlah] = useState(1);
  const [diskon, setDiskon] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  // State Kontrol UI & List Riwayat
  const [transactionList, setTransactionList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Kalkulasi form lokal otomatis
  const totalHarga = hargaSatuan * jumlah;
  const hargaAkhir = totalHarga - diskon;

  useEffect(() => {
    if (id) {
      fetchItemDetail();
      fetchTransactionHistory();
      fetchTransactionTypes();
    }
  }, [id]);

  // Fetch Transaction Types from API
  const fetchTransactionTypes = async () => {
    setIsLoadingTypes(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/masters/transactiontype`, {
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'Content-Type': 'application/json',
        },
      });

      const typesData = response.data?.express21?.results?.data;
      if (Array.isArray(typesData)) {
        setTransactionTypes(typesData);
        // Set default value to first type if available
        if (typesData.length > 0) {
          setTransactiontypeId(typesData[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching transaction types:', err);
      // Fallback to default options
      setTransactionTypes([
        { id: 1, name: 'BUY' },
        { id: 2, name: 'GIFT' }
      ]);
      setTransactiontypeId('1');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // 1. Fetch Detail Master Item
  const fetchItemDetail = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/operations/claiminventory?filter_by_col=id&filter_by_text=${id}`, {
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'Content-Type': 'application/json',
        },
      });

      const data = response.data?.express21?.results?.data?.[0];
      if (data) {
        setItemInfo({
          item_code: data.item_code || '',
          item_type: data.item_type || '',
          stock_left: data.stock_left !== undefined ? data.stock_left : 0,
          price: data.price || 0,
          link_url: data.link_url || '',
          link_filename: data.link_filename || ''
        });
        setHargaSatuan(data.price || 0);
      }
    } catch (err) {
      setError('Gagal memuat detail item inventaris');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Riwayat Transaksi berdasarkan inventory_id
  const fetchTransactionHistory = async () => {
    setIsLoadingTable(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/operations/claimtransaction?filter_by_col=inventory_id&filter_by_text=${id}`, {
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'Content-Type': 'application/json',
        },
      });

      const txData = response.data?.express21?.results?.data;
      if (Array.isArray(txData)) {
        setTransactionList(txData);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat transaksi:', err);
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handleFotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
      }
    };
    input.click();
  };

  // Reset form function
  const resetForm = () => {
    setTanggalTransaksi(new Date().toISOString().split('T')[0]);
    setTransaksiOleh('');
    setJumlah(1);
    setDiskon(0);
    setCatatan('');
    setFotoFile(null);
    setFotoPreview('');
  };

  // 3. POST Transaksi Baru Menggunakan form-data Ke Server
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!jumlah || jumlah <= 0) {
      alert('Jumlah barang tidak boleh kosong atau negatif');
      return;
    }

    if (!transactiontypeId) {
      alert('Silakan pilih jenis transaksi terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('secret', SECRET_KEY);
      formData.append('inventory_id', id);
      formData.append('transactiontype_id', transactiontypeId);
      formData.append('transaction_by', transaksiOleh);
      formData.append('transaction_date', tanggalTransaksi); 
      formData.append('price', hargaSatuan.toString());
      formData.append('quantity', jumlah.toString());
      formData.append('discount', diskon.toString());
      formData.append('final_price', hargaAkhir.toString());
      formData.append('note', catatan);

      if (fotoFile) {
        formData.append('transaction_image', fotoFile);
      }

      const response = await axios.post(`${baseUrl}/operations/claimtransaction`, formData, {
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Transaksi berhasil disimpan:', response.data);
      alert('Transaksi baru berhasil ditambahkan!');

      // Reset Form setelah sukses
      resetForm();

      // Refresh Data Master Info (untuk update sisa stok) dan Tabel Riwayat Transaksi
      fetchItemDetail();
      fetchTransactionHistory();

    } catch (err) {
      console.error('Error submitting transaction:', err);
      alert('Gagal menambahkan transaksi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. INTEGRATED API DELETE TRANSACTION
  const handleDeleteTx = async (txId) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini secara permanen?");
    if (!isConfirmed) return;

    setIsLoadingTable(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.delete(`${baseUrl}/operations/claimtransaction`, {
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'Content-Type': 'application/json',
        },
        data: {
          id: txId
        }
      });

      console.log('Delete successful:', response.data);
      alert('Catatan transaksi berhasil dihapus dari server.');

      // Re-fetch ulang data master dan tabel untuk menyinkronkan data stok terbaru
      fetchItemDetail();
      fetchTransactionHistory();

    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Gagal menghapus transaksi dari server. Silakan coba lagi.');
      setIsLoadingTable(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Get transaction type name by ID
  const getTransactionTypeName = (typeId) => {
    const type = transactionTypes.find(t => t.id === typeId);
    return type ? type.name : '-';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center" style={{ marginTop: '80px' }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-slate-500 font-medium">Memuat data operasional...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full bg-slate-50/50 p-6 sm:p-8 font-sans antialiased text-slate-900"
      style={{ marginTop: '80px' }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Detail Operasional & Buat Transaksi</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola mutasi keluar masuk barang klaim logistik.</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition"
          >
            <ArrowLeft size={16} /> Kembali ke List
          </button>
        </div>

        {error && (
          <div className="p-4 text-sm bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium">{error}</div>
        )}

        {/* Master Data Readonly Box - Updated with Larger Image */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image Column - Made Larger */}
            <div className="flex-shrink-0 w-full md:w-48">
              <div className="w-full aspect-square rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                {itemInfo.link_url ? (
                  <img 
                    src={itemInfo.link_url} 
                    alt={itemInfo.link_filename || 'Item Image'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-slate-400">
                          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Filename removed */}
            </div>

            {/* Info Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kode Item</label>
                <input type="text" value={itemInfo.item_code} readOnly className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jenis Item</label>
                <input type="text" value={itemInfo.item_type} readOnly className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jumlah Stok Barang</label>
                <input type="text" value={`${itemInfo.stock_left} Pcs`} readOnly className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 outline-none cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Pembuatan Transaksi */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Buat Transaksi Baru</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Transaksi</label>
                <input type="date" value={tanggalTransaksi} onChange={(e) => setTanggalTransaksi(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Transaksi</label>
                <select 
                  value={transactiontypeId} 
                  onChange={(e) => setTransactiontypeId(e.target.value)} 
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition cursor-pointer"
                  disabled={isLoadingTypes || transactionTypes.length === 0}
                >
                  {isLoadingTypes ? (
                    <option value="">Memuat jenis transaksi...</option>
                  ) : transactionTypes.length === 0 ? (
                    <option value="">Tidak ada jenis transaksi</option>
                  ) : (
                    transactionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaksi Oleh</label>
                <input type="text" value={transaksiOleh} onChange={(e) => setTransaksiOleh(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Satuan (Rp)</label>
                  <input 
                    type="number" 
                    value={hargaSatuan} 
                    disabled 
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah</label>
                  <input type="number" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition" />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan</label>
                  <textarea rows="4" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Tambahkan deskripsi transaksi..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition resize-none"></textarea>
                </div>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-center">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Total Harga:</span>
                    <span className="font-semibold text-slate-700">Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Potongan / Diskon (Rp)</label>
                    <input type="number" value={diskon} onChange={(e) => setDiskon(Number(e.target.value))} className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium outline-none text-right" />
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2 font-bold text-slate-900">
                    <span>Harga Akhir:</span>
                    <span className="text-blue-600">Rp {hargaAkhir.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan - Media Upload Bukti Lampiran */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 text-center lg:text-left">Foto Lampiran Bukti</label>
                <div onClick={handleFotoUpload} className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4 flex flex-col items-center justify-center min-h-[170px] hover:border-blue-400 cursor-pointer transition group">
                  {fotoPreview ? (
                    <div className="text-center">
                      <img src={fotoPreview} alt="Preview Bukti" className="w-24 h-24 object-cover rounded-lg mx-auto border" />
                      <p className="text-xs text-emerald-600 font-medium mt-2">Lampiran Berhasil Dimuat</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Klik untuk mengganti</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:scale-105 transition mb-2">
                        <Camera size={22} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Unggah Berkas Gambar</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4 lg:mt-0">
                <button 
                  onClick={handleAddTransaction}
                  disabled={isSubmitting}
                  className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> 
                      Tambah Ke Catatan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Log Catatan Transaksi */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Catatan Transaksi Barang</h3>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="px-4 py-3 text-center w-10">No.</th>
                    <th className="px-4 py-3">Jenis Transaksi</th>
                    <th className="px-4 py-3">Transaksi Oleh</th>
                    <th className="px-4 py-3">Tanggal Transaksi</th>
                    <th className="px-4 py-3 text-center">Jumlah</th>
                    <th className="px-4 py-3 text-right">Harga Satuan</th>
                    <th className="px-4 py-3 text-right">Total Harga</th>
                    <th className="px-4 py-3 text-right">Diskon</th>
                    <th className="px-4 py-3 text-right">Harga Akhir</th>
                    <th className="px-4 py-3 text-center">Foto Lampiran</th>
                    <th className="px-4 py-3">Catatan</th>
                    <th className="px-4 py-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingTable ? (
                    <tr>
                      <td colSpan="12" className="px-4 py-8 text-center text-slate-500">
                        <Loader2 size={20} className="animate-spin mx-auto text-blue-600 mb-2" />
                        Sedang memuat riwayat transaksi...
                      </td>
                    </tr>
                  ) : transactionList.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-4 py-8 text-center text-slate-400 italic">
                        Belum ada riwayat transaksi untuk item ini.
                      </td>
                    </tr>
                  ) : (
                    transactionList.map((tx, idx) => {
                      const computedTotal = (tx.price || 0) * (tx.quantity || 0);
                      const typeName = getTransactionTypeName(tx.transactiontype_id);
                      
                      return (
                        <tr key={tx.id || idx} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                              tx.transactiontype_id === 1 || tx.transactiontype_id === 2 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {typeName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium flex items-center gap-1">
                            <User size={11} className="text-slate-400" /> {tx.transaction_by || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={11} className="text-slate-400" /> 
                              {formatDate(tx.transaction_date)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-900">{tx.quantity || 0} Pcs</td>
                          <td className="px-4 py-3 text-right">Rp {(tx.price || 0).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-medium">Rp {computedTotal.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right text-rose-600">-Rp {(tx.discount || 0).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">Rp {(tx.final_price || 0).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3 text-center">
                            {tx.link_url ? (
                              <img 
                                src={tx.link_url} 
                                alt={tx.link_filename || 'Lampiran'} 
                                className="w-8 h-8 object-cover rounded border mx-auto cursor-pointer hover:opacity-80 transition" 
                                onClick={() => window.open(tx.link_url, '_blank')} 
                              />
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={tx.note}>
                            <div className="flex items-center gap-1">
                              <FileText size={11} className="text-slate-400" /> 
                              {tx.note || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => handleDeleteTx(tx.id)} 
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Hapus transaksi"
                            >
                              <Trash2 size={14} />
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
        </div>

        {/* Action Button Box */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-8 py-2.5 rounded-lg shadow-sm transition active:scale-95"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClaimTransactionDetail;