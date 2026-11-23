import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle, FaBars } from "react-icons/fa";
import axios from "axios";

const Nav = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuList, setMenuList] = useState([]);
  const [parentMenu, setParentMenu] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [topbarHeight, setTopbarHeight] = useState(0);
  const navigate = useNavigate();
  const topbarRef = useRef(null);

  // To be deleted later
  const webMenu = [
                {
                    "fa_tag": "",
                    "id": 3,
                    "name": "Master",
                    "order_id": 1,
                    "parent_id": null,
                    "parent_name": "",
                    "slug": "masters",
                    "url": "#"
                },
                {
                    "fa_tag": "",
                    "id": 7,
                    "name": "List Klaim",
                    "order_id": 1,
                    "parent_id": 4,
                    "parent_name": "Claim",
                    "slug": "operations_claim",
                    "url": "/Operations/Claim"
                },
                {
                    "fa_tag": "",
                    "id": 11,
                    "name": "User",
                    "order_id": 1,
                    "parent_id": 6,
                    "parent_name": "Users",
                    "slug": "users_user",
                    "url": "Users/User/List"
                },
                {
                    "fa_tag": "",
                    "id": 4,
                    "name": "Claim",
                    "order_id": 2,
                    "parent_id": null,
                    "parent_name": "",
                    "slug": "claim",
                    "url": "#"
                },
                {
                    "fa_tag": "",
                    "id": 12,
                    "name": "Role",
                    "order_id": 2,
                    "parent_id": 6,
                    "parent_name": "Users",
                    "slug": "users_role",
                    "url": "Users/Role/List"
                },
                {
                    "fa_tag": "",
                    "id": 13,
                    "name": "AccessUser",
                    "order_id": 3,
                    "parent_id": 6,
                    "parent_name": "Users",
                    "slug": "users_accessuser",
                    "url": "Users/Accessuser/List"
                },
                {
                    "fa_tag": "",
                    "id": 1,
                    "name": "Menu",
                    "order_id": 4,
                    "parent_id": null,
                    "parent_name": "",
                    "slug": "menu",
                    "url": "#"
                },
                {
                    "fa_tag": "",
                    "id": 2,
                    "name": "Webmenu",
                    "order_id": 4,
                    "parent_id": 1,
                    "parent_name": "Menu",
                    "slug": "menu_webmenu",
                    "url": "Menu/Webmenu/List"
                },
                {
                    "fa_tag": "",
                    "id": 14,
                    "name": "AccessRole",
                    "order_id": 4,
                    "parent_id": 6,
                    "parent_name": "Users",
                    "slug": "users_accessrole",
                    "url": "Users/Accessrole/List"
                },
                {
                    "fa_tag": "",
                    "id": 6,
                    "name": "Users",
                    "order_id": 5,
                    "parent_id": null,
                    "parent_name": "",
                    "slug": "users",
                    "url": "#"
                },
            ]

  const storedToken = localStorage.getItem("token");

  useEffect(() => {
    handleWebMenuList();

    // Load user data from localStorage
    const storedUser = localStorage.getItem("account");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Measure topbar height on mount and when window resizes
  useEffect(() => {
    const updateTopbarHeight = () => {
      if (topbarRef.current) {
        setTopbarHeight(topbarRef.current.offsetHeight);
      }
    };

    updateTopbarHeight();
    window.addEventListener('resize', updateTopbarHeight);
    
    return () => {
      window.removeEventListener('resize', updateTopbarHeight);
    };
  }, []);

  const handleWebMenuList = () => {
    if (storedToken == null) {
      window.location.href = "/";
    }

    const urls = `${process.env.REACT_APP_BACKEND_HOST}/menus/web-menu/list?access=true`;
    axios
      .get(urls, {
        headers: {
          Authorization: `Basic ${storedToken}`,
        },
      })
      .then(
        (res) => {
          const listMenu = webMenu.map((menu) => ({
            ...menu,
            isVisible: false,
          }));
          setMenuList(listMenu);
          const menuParent = listMenu.filter((menu) => menu.parent_id === null);
          setParentMenu(menuParent);
          setLoading(false);
        },
        (error) => {
          const listMenu = webMenu.map((menu) => ({
            ...menu,
            isVisible: false,
          }));
          setMenuList(listMenu);
          const menuParent = listMenu.filter((menu) => menu.parent_id === null);
          setParentMenu(menuParent);
          setLoading(false);

          if (error.response.status === 401) {
            console.error("Silahkan login kembali.");
            setError("Silahkan login kembali");
          }
          setError(error.message);
          setLoading(false);
          // localStorage.removeItem("account");
          // localStorage.removeItem("token");
          // window.location.href = "/";
        }
      );
  };

  const toggleChildMenu = (id) => {
    setMenuList((prev) =>
      prev.map((menu) =>
        menu.parent_id === id
          ? { ...menu, isVisible: !menu.isVisible }
          : { ...menu }
      )
    );
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    localStorage.removeItem("account");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogoClick = () => {
    navigate("/landingpage");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileDropdown]);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-900 shadow-md px-6 py-3">
        <div className="text-center text-white">Loading menu...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar - Fixed at top */}
      <nav 
        ref={topbarRef}
        className="fixed top-0 right-0 left-0 z-50 bg-white shadow-md px-6 py-3 flex justify-between items-center"
        style={{ 
          marginLeft: menuOpen ? "16rem" : "4rem",
          width: menuOpen ? "calc(100% - 16rem)" : "calc(100% - 4rem)"
        }}
      >
        {/* Left side - Burger Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMenu}
            className="p-2 bg-[#B8D4FA] rounded-lg hover:bg-[#CEDCFE] transition-all duration-300 focus:outline-none transform hover:scale-105"
            title={menuOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <FaBars className="text-xl text-white" />
          </button>
          
          {/* Logo/Brand Name */}
          <h1 className="text-lg font-semibold text-[#345D98] hidden sm:block hover:text-[#B8D4FA] transition-colors duration-300 cursor-default">
            Warehouse Management
          </h1>
        </div>

        {/* Right side - Profile Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity group"
            >
              <FaUserCircle className="text-2xl text-[#345D98] group-hover:text-[#B8D4FA] transition-colors duration-300" />
              <span className="hidden md:inline text-sm font-medium text-[#345D98] group-hover:text-[#B8D4FA] transition-colors duration-300">
                {user?.username || "User"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-[60] border border-gray-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.roles?.name || "Role"}
                  </p>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 flex items-center space-x-2 group"
                >
                  <FaSignOutAlt className="group-hover:text-blue-600 transition-colors duration-300" />
                  <span className="group-hover:text-blue-600 transition-colors duration-300">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Layout with padding top to account for fixed navbar */}
      <div>
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`fixed left-0 flex-shrink-0 h-screen ${
              menuOpen ? "w-64" : "w-16"
            } bg-white text-black transition-all duration-300 p-4 flex flex-col items-start space-y-6 border-r border-gray-300 z-40 shadow-2xl shadow-gray-500/50 overflow-y-auto`}
            
          >
            {/* Logo Section - Clickable */}
            <div 
              className="w-full flex justify-center items-center mb-4 cursor-pointer hover:opacity-80 transition-opacity transform hover:scale-105 duration-300"
              onClick={handleLogoClick}
            >
              {menuOpen ? (
                <div className="flex justify-center w-full px-2">
                  <img 
                    src="/rottenfanger_express.png"
                    alt="21 Express Logo"
                    className="w-40 h-20 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <img 
                  src="/rottenfanger_express.png"
                  alt="21 Express Logo"
                  className="w-14 h-14 object-contain rounded-lg"
                />
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-2"></div>

            {/* Sidebar Menu */}
            {menuOpen && (
              <>
                {parentMenu.map((parent) => (
                  <div key={parent.name} className="w-full">
                    <button
                      onClick={() => toggleChildMenu(parent.id)}
                      className="flex items-center justify-start w-full text-left p-2 text-lg font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-md transition-all duration-300 group"
                    >
                      <svg
                        className="w-5 h-5 mr-4 group-hover:text-blue-600 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      {parent.name}
                    </button>

                    {/* Child Menu */}
                    {menuList
                      .filter((menu) => menu.parent_id === parent.id)
                      .map((child) => (
                        <div
                          key={child.name}
                          className={`ml-6 pl-4 transition-all duration-300 ${
                            child.isVisible ? "block" : "hidden"
                          }`}
                        >
                          <Link to={`${child.url}`} className="block">
                            <p className="text-md font-medium p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-300">
                              {child.name}
                            </p>
                          </Link>
                        </div>
                      ))}
                  </div>
                ))}
               </>
            )}

            {menuOpen && (
              <div className="w-full mt-6">
                <a
                  href="https://docs.google.com/document/d/1XkZbPrLyzTVZ7IXaHMbcxnoNixbvj9Ha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full text-left py-2 px-4 text-lg font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-300 group"
                >
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Manual
                </a>
              </div>
            )}
          </aside>

          {/* Main Content Wrapper */}
          <div 
            className="flex-1 transition-all duration-300"
            style={{ 
              marginLeft: menuOpen ? "16rem" : "4rem",
              minHeight: '100vh'
            }}
          >
            <div className="p-6">
              {/* Your page content will be rendered here */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;