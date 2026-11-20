import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Main Component
const FAQDetail = () => {
  const [faqDetail, setFAQDetail] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    fetchFAQDetail();
  }, []);

  const fetchFAQDetail = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}/masters/faq_detail?filter_by_col=topic_id&filter_by_text=${id}`, {
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const usersData = response.data?.express21?.results?.data;
      if (Array.isArray(usersData)) {
        setFAQDetail(usersData);
      } else {
        throw new Error('Unexpected data format from API');
      }
    } catch (err) {
      setError('Failed to load faqDetail');
      console.error('Error fetching faqDetail:', err);
    }
  };

  const filteredUsers = faqDetail.filter(
    (user) =>
      user.question.toLowerCase().includes(searchQuery.toLowerCase())
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

  // FAQDetailList Component
  const FAQDetailList = ({ faqDetail }) => {
    if (faqDetail.length === 0) {
      return <p className="text-center text-gray-500 mt-4">No faqDetail found.</p>;
    }

    return (
      <section className="mt-6 bg-white shadow-md rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">No.</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Pertanyaan</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Jawaban</th>
              </tr>
            </thead>
            <tbody>
              {faqDetail.map((user, index) => (
                <tr
                  key={user.uid}
                  className="border-t hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/Master/FAQDetail/Detail/${user.id}`, {
                    state: {
                      topicId: user.topic_id,
                    },
                  })}
                > 
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {user.question}
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {user.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    // Added padding top 100px to push content below topbar
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 rounded-lg shadow-xl space-y-12" style={{ paddingTop: "100px" }}>
      {/* Title Section */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6">FAQ Detail List</h2>

      {/* Search and Add User Section */}
      <section className="flex items-center text-black justify-between mb-6">
        <div className="w-3/4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <button
          onClick={() => navigate('/faqDetail/User/detail/uid')} // Redirect to "Add User" page
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-150 ml-4"
        >
          + Add Question
        </button>
      </section>

      {/* Error Message Section */}
      {error && (
        <section className="text-center">
          <p className="text-red-600 bg-red-100 border border-red-300 rounded p-4">
            {error}
          </p>
        </section>
      )}

      {/* FAQDetailList Section */}
      <FAQDetailList faqDetail={filteredUsers} />
    </div>
  );
};

export default FAQDetail;