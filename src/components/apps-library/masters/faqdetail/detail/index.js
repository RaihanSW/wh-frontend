import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaEnvelope, FaIdBadge } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Main Component 
const UserPageTest = () => {
  const [accessRoles, setAccessRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [formStatus, setFormStatus] = useState(""); // Form status message
  const [isSubmitting, setIsSubmitting] = useState(false); // Submit button state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [webmenuList, setWebmenuList] = useState([]); // State for webmenu list
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    id: "",
    question: "",
    answer: "",
    topic_id: "",
  });
  
  const { id } = useParams();
  const roles_id = id;
  const navigate = useNavigate();

  useEffect(() => {
    fetchWebmenuList();
    if (id && id !== ":id") {
      setLoading(true)
      fetchWebMenuData();
    }
  }, []);

  // Fetch webmenu list for parent selection
  const fetchWebmenuList = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/masters/faq_detail?filter_by_col=topic_id&filter_by_text=${id}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data?.express21?.results?.data;
      if (Array.isArray(data)) {
        setWebmenuList(data);
      }
    } catch (err) {
      console.error("Error fetching webmenu list:", err);
    }
  };

  const fetchWebMenuData = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/masters/faq_detail?filter_by_col=id&filter_by_text=${id}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const faqDetailData = response.data?.express21?.results?.data;
      if (faqDetailData) {
        setFormData({
          id: faqDetailData[0].id || "",
          question: faqDetailData[0].question || "",
          answer: faqDetailData[0].answer || "",
          topic_id: faqDetailData[0].topic_id || "",
        });
      } else {
        throw new Error("User not found");
      }
    } catch (err) {
      console.error("Error fetching webmenu data:", err);
      setError("Failed to load webmenu data.");
    } finally {
      setLoading(false);
    }
  };

  // Get parent name by parent_id
  const getParentName = (parentId) => {
    if (!parentId) return "";
    const parent = webmenuList.find(item => item.id === parseInt(parentId));
    return parent ? parent.name : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    setIsSubmitting(true);
    setFormStatus("");
  
    const updatedData = {
      ...formData,
      id: parseInt(formData.id, 10),
      parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
      order_id: parseInt(formData.order_id, 10),
    };
  
    try {
      let response;
      response = await axios.post(
        `${process.env.REACT_APP_BACKEND_HOST}/masters/faq_detail`,
        updatedData,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const responseData = response.data?.express21?.results?.data;
  
      if (response.status === 200 && responseData) {
        setFormStatus(id && id !== ":id" ? "User updated successfully!" : "User added successfully!");
        if (!id || id === ":id") {
          setFormData({ first_name: "", last_name: "", email: "", roles_id: "" });
        }
        // Refresh the list after successful submit
        fetchWebmenuList();
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

  const handleCancel = () => {
    setFormData({
      id: '',
      role: '',
      admin: '',
    });
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    setIsSubmitting(true);
    setFormStatus("");
  
    const updatedData = {
      ...formData,
      id: parseInt(formData.id, 10),
      parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
      order_id: parseInt(formData.order_id, 10),
    };
  
    try {
      let response;
      response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_HOST || "http://192.168.4.27:7777"}/menus/web-menu`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
          data: updatedData,
        }
      );
  
      const responseData = response.data?.express21?.results?.data;
  
      if (response.status === 200 && responseData) {
        setFormStatus("User Deleted successfully!");
        // Refresh the list after successful delete
        fetchWebmenuList();
      } 
    } catch (err) {
      const serverError =
        err.response?.data?.express21?.error_message || "An error occurred while Deleting the data.";
      console.error("Error Deleting data:", err);
      setError(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ marginTop: '80px' }}>
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-600" />
        <span className="ml-3 text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div 
      className="max-w-7xl mx-auto p-8 bg-gray-50 rounded-lg shadow-xl space-y-12"
      style={{ marginTop: '80px' }}
    >
      {/* Title Section */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6">FAQ Detail</h2>
  
      <div className="flex justify-between items-center space-x-4">
        <div className="flex-1">
          <label
            htmlFor="id"
            className="block font-semibold text-gray-700 mb-1"
          >
            Id
          </label>
          <div className="relative">
            <input
              disabled
              type="text"
              id="id"
              name="id"
              value={formData.id}
              className="w-3/4 text-gray-600 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              placeholder=""
            />
          </div>
        </div>

      </div>

      <div className="flex justify-between items-center space-x-4">
        <div className="flex-1">
          <label
            htmlFor="name"
            className="block font-semibold text-gray-700 mb-1"
          >
            Question
          </label>
          <div className="relative">
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              className="w-3/4 text-gray-600 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center space-x-4">
        <div className="flex-1">
          <label
            htmlFor="fa_tag"
            className="block font-semibold text-gray-700 mb-1"
          >
            Answer
          </label>
          <div className="relative">
            <input
              type="text"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              className="w-3/4 text-gray-600 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center space-x-4">
        <div className="flex-1">
          <label
            htmlFor="fa_tag"
            className="block font-semibold text-gray-700 mb-1"
          >
            Topic Id
          </label>
          <div className="relative">
            <input
              type="text"
              name="topic_id"
              value={formData.topic_id}
              onChange={handleChange}
              className="w-3/4 text-gray-600 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
            />
          </div>
        </div>
      </div>

      {/* Error Message Section */}
      {error && (
        <section className="text-center">
          <p className="text-red-600 bg-red-100 border border-red-300 rounded p-4">
            {error}
          </p>
        </section>
      )}

      {/* Success Message Section */}
      {formStatus && (
        <section className="text-center">
          <p className="text-green-600 bg-green-100 border border-green-300 rounded p-4">
            {formStatus}
          </p>
        </section>
      )}

      <div className="mt-10 flex justify-center space-x-4 w-full">
        <button
          type="submit"
          className="bg-[#419854] text-white py-2 px-4 rounded hover:bg-[#357d44] transition duration-300"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!formData.id}
          className={`py-2 px-4 rounded text-white transition duration-300 ${
            !formData.id
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#D43A3A] hover:bg-[#a12c2c]"
          }`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserPageTest;