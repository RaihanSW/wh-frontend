import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaIdBadge } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Main Component
const MasterBank = () => {
  const [bankList, setBankList] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: "",
  });

  const { uid } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}/masters/bank`, {
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const bankListData = response.data?.express21?.results?.data;
      if (Array.isArray(bankListData)) {
        setBankList(bankListData);
      } else {
        throw new Error('Unexpected data format from API');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    setIsSubmitting(true);
    setFormStatus("");

    try {
      let response;
      response = await axios.post(
        `${process.env.REACT_APP_BACKEND_HOST}/masters/bank`,
        formData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const responseData = response.data?.express21?.results?.data;
  
      if (response.status === 200 && responseData) {
        setFormStatus("Data added successfully!");
        setFormData({ name: ""});
        fetchBankData();
      } 
    } catch (err) {
      const serverError =
        err.response?.data?.express21?.error_message || "An error occurred while submitting the data.";
      console.error("Error submitting data:", err);
      setError(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBank = bankList.filter(
    (bankList) =>
      bankList.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SearchBar Component
  const SearchBar = ({ searchQuery, setSearchQuery }) => (
    <div className="flex items-center space-x-4">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        ref={inputRef}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full text-black p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // UserList Component
  const BankList = ({ users, handleRevokeAccess }) => {
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const paginatedData = users.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
  
    // Navigate to the next page
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    if (users.length === 0) {
      return <p className="text-center text-gray-500 mt-4">No data found.</p>;
    }

    return (
      <section className="mt-6 bg-white shadow-md rounded-lg p-6">
        <section className="flex items-center justify-between mb-6">
            <div className="w-full">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
        </section>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">No.</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-center">Nama Bank</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((instance, index) => (
                <tr
                  key={instance.id}
                  className="border-t hover:bg-gray-50 transition-all duration-200"
                >
                    <td className="px-6 py-4 text-gray-700 font-medium">
                    {index + 1} 
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium text-center">
                    {instance.name} 
                    </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-300 rounded ${
              currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-400"
            }`}
          >
            Previous
          </button>
          <p className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </p>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-gray-300 rounded ${
              currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-400"
            }`}
          >
            Next
          </button>
        </div>
      </section>
    );
  };

  return (
    // Added padding top 100px to push content below topbar
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 rounded-lg shadow-xl space-y-12" style={{ paddingTop: "100px" }}>
      {/* Title Section */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Master Bank</h2>
  
        <div className="flex justify-between items-center space-x-4">
            <div className="w-full md:w-1/2">
                <label
                    htmlFor="first_name"
                    className="block font-semibold text-gray-700 mb-1"
                >
                    Tambah Bank
                </label>
                <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full text-gray-600 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Input Nama Bank disini"
                    
                    />
                </div>
            </div>
            <button
            type="submit"
            className="bg-[#419854] text-white py-2 px-4 rounded hover:bg-[#357d44] transition duration-300"
            onClick={handleSubmit}
            >
            Submit
            </button>
        </div>

        {formStatus && (
        <section className="text-center">
          <p className="text-green-600 bg-green-100 border border-green-300 rounded p-4">
            {formStatus}
          </p>
        </section>
      )}


      {/* Error Message Section */}
      {error && (
        <section className="text-center">
          <p className="text-red-600 bg-red-100 border border-red-300 rounded p-4">
            {error}
          </p>
        </section>
      )}

      {/* BankList Section */}
      <BankList users={filteredBank} />
    </div>
  );
};

export default MasterBank;