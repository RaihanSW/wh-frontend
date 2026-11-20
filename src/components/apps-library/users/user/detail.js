import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaIdBadge } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { uid } = useParams();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    roles_id: "",
    branch_name: "",
  });

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        // Fetch roles
        const rolesResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_HOST}/users/roles/list`,
          {
            headers: {
              Authorization: `Basic ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const rolesData = rolesResponse.data?.express21?.results?.data;
        if (Array.isArray(rolesData)) {
          setRoles(rolesData);
        }

        // Fetch branches
        const branchesResponse = await axios.get(
          "https://partner-api.21express.co.id/masters/branch",
          {
            headers: {
              Authorization: `Basic ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const branchesData = branchesResponse.data?.express21?.results?.data;
        if (Array.isArray(branchesData)) {
          setBranches(branchesData);
        }

        // Fetch user data if UID exists
        if (uid && uid !== ":uid") {
          const userResponse = await axios.get(
            `${process.env.REACT_APP_BACKEND_HOST}/users/account?uid=${uid}`,
            {
              headers: {
                Authorization: `Basic ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const userData = userResponse.data?.express21?.results?.data;
          if (userData) {
            setFormData({
              first_name: userData.first_name || "",
              last_name: userData.last_name || "",
              email: userData.email || "",
              roles_id: userData.roles_id || "",
              branch_name: userData.branch_name || "",
            });
            setUser(userData);
          } else {
            throw new Error("User not found");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, isDeleted]);

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
      username: formData.email.split("@")[0],
      is_admin: false,
      is_active: true,
    };

    try {
      let response;
      if (uid && uid !== ":uid") {
        response = await axios.post(
          `${process.env.REACT_APP_BACKEND_HOST}/users/account`,
          { ...updatedData, uid },
          {
            headers: {
              Authorization: `Basic ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_BACKEND_HOST}/users/account`,
          updatedData,
          {
            headers: {
              Authorization: `Basic ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const responseData = response.data?.express21?.results?.data;

      if (response.status === 200 && responseData) {
        setFormStatus(uid && uid !== ":uid" ? "User updated successfully!" : "User added successfully!");
        if (!uid || uid === ":uid") {
          setFormData({ first_name: "", last_name: "", email: "", roles_id: "", branch_name: "" });
        }
      } else {
        const errorMessage = response.data?.express21?.error_message || "Unknown error occurred.";
        setFormStatus(`Failed to submit data: ${errorMessage}`);
      }
    } catch (err) {
      const serverError =
        err.response?.data?.express21?.error_message || "An error occurred while submitting the data.";
      console.error("Error submitting data:", err);
      setFormStatus(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uid) => {
    const token = localStorage.getItem("token");

    try {
      setIsSubmitting(true);

      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_HOST}/users/account`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
          data: { uid },
        }
      );

      if (response.status === 200) {
        setFormStatus("User deleted successfully!");
        setIsDeleted(true);
        setFormData({ first_name: "", last_name: "", email: "", roles_id: "" });
        setTimeout(() => {
          navigate("/users");
        }, 500);
      } else {
        setFormStatus(`Failed to delete user: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setFormStatus("An error occurred while deleting the user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
  <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
    <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
      {uid && uid !== ":uid" ? `Edit User - ${user?.username}` : "Add New User"}
    </h1>

    {error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name and Last Name Row */}
        <div className="flex justify-between items-center space-x-4">
          <div className="flex-1">
            <label className="block font-semibold text-gray-700 mb-1">First Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter first name"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>

        {/* Email and Role Row */}
        <div className="flex justify-between items-center space-x-4">
          <div className="flex-1">
            <label className="block font-semibold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block font-semibold text-gray-700 mb-1">Role</label>
            <div className="relative">
              <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
              <select
                name="roles_id"
                value={formData.roles_id}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Branch Row - Now on its own line */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Branch</label>
          <div className="relative">
            <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
            <select
              name="branch_name"
              value={formData.branch_name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 flex items-center space-x-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <AiOutlineLoading3Quarters className="animate-spin" /> : uid && uid !== ":uid" ? "Update User" : "Add User"}
          </button>

          {uid && uid !== ":uid" && (
            <button
              onClick={() => handleDelete(uid)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Delete User"}
            </button>
          )}
        </div>

        {formStatus && (
          <p className={`text-center mt-4 ${formStatus.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {formStatus}
          </p>
        )}
      </form>
    )}
  </div>
</div>
  );
};

export default Dashboard;