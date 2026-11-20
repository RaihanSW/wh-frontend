import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, PackageOpen, ChevronLeft, ChevronRight, ShoppingCart, User, Calendar, Truck } from 'lucide-react';

const UserPageTest = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use the new API endpoint directly
  const baseUrl = "https://ess-api.21express.co.id";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${baseUrl}/operations/claiminventory`, {
        headers: {
          Authorization: token ? `Basic ${token}` : "",
          'Content-Type': 'application/json',
        },
      });

      const dataResults = response.data?.express21?.results?.data;
      if (Array.isArray(dataResults)) {
        setItems(dataResults);
      } else {
        throw new Error('Format data dari API tidak sesuai');
      }
    } catch (err) {
      setError('Gagal memuat data inventaris klaim');
      console.error('Error fetching claim inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const filteredItems = items.filter((item) =>
    (item.item_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.item_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.created_by || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.shipment_code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // InventarisTable Component
  const InventarisTable = ({ dataList }) => {
    const totalPages = Math.ceil(dataList.length / itemsPerPage) || 1;

    const paginatedData = dataList.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Fungsi pusat untuk navigasi ke halaman detail
    const handleRowClick = (itemId) => {
      navigate(`/Operations/Claim/Inventory/Detail/${itemId}`);
    };

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat data dari server...</p>
        </div>
      );
    }

    if (dataList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <PackageOpen size={44} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">Tidak ada data inventaris ditemukan</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4 text-center w-16">No.</th>
                <th className="px-6 py-4"><span className="flex items-center gap-1.5"><Truck size={13} /> No. Resi </span></th>
                <th className="px-6 py-4">Kode Item</th>
                <th className="px-6 py-4"> Nama Barang</th>
                <th className="px-6 py-4 text-center">Foto Barang</th>
                <th className="px-6 py-4 text-center w-28">Sisa Stok</th>
                <th className="px-6 py-4 text-right">Harga Satuan</th>
                <th className="px-6 py-4 text-right">Total Harga</th>
                <th className="px-6 py-4">Dibuat Oleh</th>
                <th className="px-6 py-4">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.map((item, index) => {
                const displayStok = item.stock_left !== undefined ? item.stock_left : 0;
                const displayHarga = item.price || 0;
                const displayTotal = displayHarga * displayStok;

                return (
                  <tr 
                    key={item.id || item.goodsdetail_uid || index} 
                    className="hover:bg-slate-50/70 transition duration-150 ease-in-out cursor-pointer"
                    onClick={() => handleRowClick(item.id)}
                  >
                    <td className="px-6 py-4 text-center font-medium text-slate-400">
                      {((currentPage - 1) * itemsPerPage) + index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                      {item.shipment_code || '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {item.item_code || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md">
                        {item.item_type || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {item.link_url ? (
                        <div className="flex justify-center">
                          <img 
                            src={item.link_url} 
                            alt={item.link_filename || 'Barang'} 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 transition"
                            onClick={() => window.open(item.link_url, '_blank')}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg mx-auto flex items-center justify-center text-[10px] text-slate-300">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        displayStok === 0 
                          ? 'bg-rose-50 text-rose-700' 
                          : displayStok <= 5 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {displayStok} Pcs
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      Rp {displayHarga.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      Rp {displayTotal.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span className="font-medium">{item.created_by || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {formatDate(item.created_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRowClick(item.id)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm shadow-blue-100 hover:shadow-md transition active:scale-[0.98]"
                      >
                        <ShoppingCart size={13} />
                        Transaksi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-md bg-white font-medium hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Sebelumnya
          </button>
          <span className="font-medium text-slate-600">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-md bg-white font-medium hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Selanjutnya <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen w-full bg-slate-50/50 p-6 sm:p-8 font-sans antialiased text-slate-900" 
      style={{ marginTop: '80px' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Inventaris Barang Klaim
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Kelola data stok barang operasional dan transaksi klaim.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Cari kode, jenis, resi, atau pembuat..."
                value={searchQuery}
                ref={inputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition duration-150"
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-sm transition active:scale-95 flex items-center justify-center min-w-[70px]"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Cari'}
            </button>
          </form>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="text-sm font-medium text-red-600 bg-red-50 border border-red-200/60 p-4 rounded-xl flex items-center">
            {error}
          </div>
        )}

        {/* Table Content Section */}
        <InventarisTable dataList={filteredItems} />

      </div>
    </div>
  );
};

export default UserPageTest;