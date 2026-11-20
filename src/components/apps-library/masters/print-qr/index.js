import React from "react";

const ProfilePreview = () => {
  const userProfile = {
    name: "John Doe",
    role: "Senior Product Designer",
    email: "john.doe@example.com",
    avatar: "https://ui-avatars.com/api/?background=2C3E50&color=fff&size=200&name=John+Doe",
    joinDate: "January 2024",
    location: "San Francisco, CA",
    bio: "Passionate designer with 8+ years of experience creating beautiful, user-centric digital experiences."
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header bar - neutral gray */}
        <div className="h-2 bg-gray-700"></div>
        
        <div className="p-8">
          {/* Top section: avatar + main info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-800">{userProfile.name}</h1>
              <p className="text-gray-600 mt-1">{userProfile.role}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <span>📧 {userProfile.email}</span>
                <span>📍 {userProfile.location}</span>
                <span>📅 Joined {userProfile.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-200" />

          {/* Bio only */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">About</h3>
            <p className="text-gray-700 mt-2 leading-relaxed">{userProfile.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;