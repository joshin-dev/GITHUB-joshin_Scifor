import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaSearch, FaTimes, FaSignOutAlt } from "react-icons/fa";

function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);

  // Function to check and update user authentication status
  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Check for user authentication on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for storage changes (when user logs in/out in other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check auth status when location changes (navigation)
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  // Listen for custom authentication events
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Listen for custom events that you can dispatch from login/logout
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  // Alternative: Poll for auth changes (less efficient but more reliable)
  useEffect(() => {
    const authCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 1000); // Check every second

    return () => clearInterval(authCheckInterval);
  }, []);

  // Close search when clicking outside - Desktop only
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only apply click-outside behavior on desktop (large screens)
      if (window.innerWidth < 992) return;
      
      const searchContainer = searchInputRef.current;
      const searchButton = event.target.closest('[data-search-toggle]');
      
      // Check if click is inside the search container
      const isClickingInsideSearch = searchContainer && searchContainer.contains(event.target);
      
      if (searchOpen && !isClickingInsideSearch && !searchButton) {
        setSearchOpen(false);
        setSearchTerm("");
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileContainer = profileRef.current;
      const profileButton = event.target.closest('[data-profile-toggle]');
      
      if (profileOpen && profileContainer && !profileContainer.contains(event.target) && !profileButton) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileOpen]);

  // Close search and profile on route change
  useEffect(() => {
    setSearchOpen(false);
    setSearchTerm("");
    setProfileOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (searchOpen) {
          setSearchOpen(false);
          setSearchTerm("");
        }
        if (profileOpen) {
          setProfileOpen(false);
        }
      }
    };

    if (searchOpen || profileOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [searchOpen, profileOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setProfileOpen(false); // Close profile when opening search
    if (!searchOpen) {
      // Focus input after state update
      setTimeout(() => {
        const input = searchInputRef.current?.querySelector('input');
        if (input) {
          input.focus();
        }
      }, 100);
    } else {
      setSearchTerm("");
    }
  };

  const toggleProfile = () => {
    if (user) {
      setProfileOpen(!profileOpen);
      setSearchOpen(false); // Close search when opening profile
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    // Clear user data from storage
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authChange'));
    
    navigate('/');
  };

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.querySelector('input')?.focus();
  };

  // Handle input interaction for mobile
  const handleInputInteraction = (e) => {
    // Prevent event from bubbling up and triggering click-outside
    e.stopPropagation();
    e.preventDefault();
    
    // Ensure the input gets focus
    const input = e.target;
    if (input && input.focus) {
      input.focus();
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-transparent">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center w-100 position-relative">
          <Link className="navbar-brand fw-bold" to="/" style={{ fontSize: '3.0rem' }}>
            CineNest
          </Link>
          
          {/* Search overlay for mobile */}
          {searchOpen && (
            <div 
              className="position-absolute top-0 start-0 w-100 d-lg-none"
              style={{ zIndex: 1000 }}
            >
              <div ref={searchInputRef} className="d-flex align-items-center bg-dark p-2 rounded">
                <form className="flex-grow-1 position-relative me-2" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    className="form-control pe-4"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn position-absolute top-50 translate-middle-y border-0 bg-transparent"
                    style={{ right: '8px' }}
                    disabled={!searchTerm.trim()}
                  >
                    <FaSearch 
                      style={{ 
                        color: searchTerm.trim() ? '#dc3545' : '#6c757d',
                        fontSize: '0.9rem'
                      }} 
                    />
                  </button>
                </form>
                <button
                  onClick={toggleSearch}
                  className="btn btn-link p-0 border-0"
                  style={{ color: "white", fontSize: "1.25rem" }}
                  data-search-toggle
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
          
          <div className="d-flex align-items-center position-relative">
            {/* Desktop search */}
            {searchOpen && (
              <div ref={searchInputRef} className="search-container me-2 d-none d-lg-block">
                <form className="d-flex position-relative" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    className="form-control pe-4"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ minWidth: '250px' }}
                  />
                  <button
                    type="submit"
                    className="btn position-absolute top-50 translate-middle-y border-0 bg-transparent"
                    style={{ right: '8px' }}
                    disabled={!searchTerm.trim()}
                  >
                    <FaSearch 
                      style={{ 
                        color: searchTerm.trim() ? '#dc3545' : '#6c757d',
                        fontSize: '0.9rem'
                      }} 
                    />
                  </button>
                </form>
              </div>
            )}
            
            <button
              onClick={toggleSearch}
              className="btn btn-link p-0 me-3 border-0 d-flex align-items-center"
              style={{ 
                color: "white", 
                fontSize: "1.25rem",
                textDecoration: 'none',
                height: '1.5rem',
                lineHeight: '1'
              }}
              aria-label={searchOpen ? "Close search" : "Open search"}
              data-search-toggle
            >
              {searchOpen && window.innerWidth >= 992 ? <FaTimes /> : <FaSearch />}
            </button>
            
            {/* Profile section */}
            <div className="position-relative">
              <button
                onClick={toggleProfile}
                className="btn btn-link p-0 border-0 d-flex align-items-center"
                style={{ 
                  color: "white",
                  textDecoration: 'none',
                  height: '1.5rem',
                  background: 'none'
                }}
                aria-label={user ? "User profile menu" : "Login"}
                data-profile-toggle
              >
                <FaUserCircle 
                  style={{ 
                    color: user ? "#dc3545" : "white", // Red if logged in
                    fontSize: "1.5rem",
                    lineHeight: '1'
                  }}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && user && (
                <div 
                  ref={profileRef}
                  className="position-absolute bg-dark border rounded shadow-lg"
                  style={{
                    top: '100%',
                    right: '0',
                    marginTop: '0.5rem',
                    minWidth: '200px',
                    zIndex: 1000,
                    border: '1px solid #495057'
                  }}
                >
                  <div className="p-3">
                    <div className="text-light mb-2">
                      <small className="text-muted">Welcome back,</small>
                      <div className="fw-bold">{user.name || user.username || user.email}</div>
                    </div>
                    <hr className="my-2" style={{ borderColor: '#495057' }} />
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center"
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;