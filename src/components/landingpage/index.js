import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";


const ProfilePreview = () => {
  const [userProfile, setUserProfile] = useState({
    name: "Loading...",
    role: "Loading...",
    email: "Loading...",
    joinDate: "Loading...",
    location: "Loading...",
    bio: "Loading..."
  });

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("account");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Get username
      const userName = userData.username || userData.name || "User";
      
      setUserProfile({
        name: userName,
        role: userData.roles?.name || userData.role || "Staff",
        email: userData.email || `${userName.toLowerCase()}@example.com`,
        joinDate: userData.created_at || userData.joinDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        location: userData.location || userData.branch || "Jakarta, Indonesia",
        bio: userData.bio || `Welcome to Fleet Management System. I'm ${userName} and I help manage fleet operations efficiently.`
      });
    } else {
      // Fallback if no user data found
      setUserProfile({
        name: "Guest User",
        role: "Guest",
        email: "guest@example.com",
        joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        location: "Jakarta, Indonesia",
        bio: "Welcome to Fleet Management System. Please login to access all features."
      });
    }
  }, []);

  return (  
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header bar - 21 Express brand color */}
          <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-800"></div>
          
          <div className="p-8">
            {/* Top section: avatar + main info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Same SVG icon from topbar */}
              <FaUserCircle className="w-24 h-24 text-gray-600 border-4 border-blue-500 rounded-full bg-white" />
              
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-800">{userProfile.name}</h1>
                <p className="text-blue-600 mt-1 font-medium">{userProfile.role}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">📧 {userProfile.email}</span>
                
                </div>
              </div>
            </div>


            {/* Additional info section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Username:</span>
                  <p className="text-gray-800 font-medium">{userProfile.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <p className="text-gray-800 font-medium">{userProfile.role}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="text-gray-800 font-medium">{userProfile.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfilePreview;