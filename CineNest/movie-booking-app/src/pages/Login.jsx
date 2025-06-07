import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // Initialize Google Auth
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: '1095775355311-29hmjlupiac0tgs8nmrakvsbs70o3s73.apps.googleusercontent.com',
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          
          setIsGoogleReady(true);
        } catch (error) {
          console.error('Google Auth initialization failed:', error);
        }
      }
    };

    // Load Google Identity script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Failed to load Google Identity script');
      };
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }

    // Cleanup function
    return () => {
      // Clean up any Google auth state if needed
    };
  }, []);

  // Handle Google OAuth response
  const handleGoogleResponse = (response) => {
    setIsGoogleLoading(true);
    try {
      // Decode the JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        authType: 'google'
      };

      // Store user data (Note: In production, avoid localStorage for sensitive data)
      localStorage.setItem('user', JSON.stringify(googleUser));
      
      alert('Google login successful!');
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Custom Google Sign In button handler
  const handleGoogleSignIn = () => {
    if (window.google && window.google.accounts && isGoogleReady) {
      setIsGoogleLoading(true);
      
      // Use the renderButton method to create a popup
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);
      
      try {
        // Create a temporary button and click it programmatically
        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          width: 200
        });
        
        // Click the Google button
        setTimeout(() => {
          const googleBtn = tempDiv.querySelector('div[role="button"]');
          if (googleBtn) {
            googleBtn.click();
          } else {
            // Fallback: use prompt method
            window.google.accounts.id.prompt();
          }
          document.body.removeChild(tempDiv);
        }, 100);
        
      } catch (error) {
        console.error('Error triggering Google Sign-In:', error);
        document.body.removeChild(tempDiv);
        setIsGoogleLoading(false);
        alert('Google Sign-In failed. Please try again.');
      }
    } else {
      alert('Google Sign-In is not ready. Please refresh the page and try again.');
    }
  };

  // Get stored users from localStorage
  const getStoredUsers = () => {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  };

  // Store user in localStorage
  const storeUser = (user) => {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('authChange'));  // To Notify other components of auth change
  };

  // Find user by email
  const findUserByEmail = (email) => {
    const users = getStoredUsers();
    return users.find(user => user.email === email);
  };

  // Input change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation logic
  const validate = () => {
    const newErrors = {};
    if (isSignup && !formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (isSignup) {
        // Check if user already exists
        const existingUser = findUserByEmail(formData.email);
        if (existingUser) {
          setErrors({ email: 'Email already registered' });
          return;
        }

        // Store new user
        const newUser = {
          id: Date.now().toString(),
          name: formData.fullName,
          email: formData.email,
          password: formData.password, // In production, hash this!
          authType: 'local'
        };
        storeUser(newUser);
        alert('Account created successfully! Please login.');
        
        // Switch to login mode
        setIsSignup(false);
        setFormData({ fullName: '', email: '', password: '' });
      } else {
        // Login logic
        const user = findUserByEmail(formData.email);
        if (!user) {
          setErrors({ email: 'Email not found' });
          return;
        }
        if (user.password !== formData.password) {
          setErrors({ password: 'Incorrect password' });
          return;
        }

        // Store current user session
        const sessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          authType: user.authType
        };
        localStorage.setItem('user', JSON.stringify(sessionUser));
        
        alert('Login successful!');
        navigate('/');
      }
      
      // Reset form
      setFormData({ fullName: '', email: '', password: '' });
    }
  };

  return (
    <motion.div
      className="container mt-5"
      style={{ maxWidth: '400px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="mb-4 text-center text-light">{isSignup ? 'Sign Up' : 'Login'}</h3>

      {/* Custom Google Sign In Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || !isGoogleReady}
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          style={{ height: '45px' }}
        >
          {isGoogleLoading ? (
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <FaGoogle className="me-2" />
          )}
          {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        {/* Loading state for Google initialization */}
        {!isGoogleReady && (
          <div className="text-center text-light mt-2">
            <small>Loading Google Sign-In...</small>
          </div>
        )}
      </div>

      <div className="text-center mb-3">
        <span className="text-light">or</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={isSignup ? 'signup' : 'login'}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {isSignup && (
            <div className="mb-3">
              <label className="form-label text-light">Full Name</label>
              <input
                type="text"
                name="fullName"
                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-light">Email address</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-danger w-100 mb-3">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </motion.form>
      </AnimatePresence>

      <motion.p
        className="text-center mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-light">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        </span>
        <button
          type="button"
          className="btn btn-link p-0 text-primary"
          onClick={() => {
            setErrors({});
            setFormData({ fullName: '', email: '', password: '' });
            setIsSignup(!isSignup);
          }}
        >
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </motion.p>

      {/* Debug info (remove in production) */}
      <div className="mt-4 p-3 bg-dark rounded">
        <small className="text-muted">
          <strong>Debug Info:</strong><br/>
          Registered Users: {getStoredUsers().length}<br/>
          Current User: {localStorage.getItem('user') ? 'Logged in' : 'Not logged in'}<br/>
          Google Ready: {isGoogleReady ? 'Yes' : 'No'}
        </small>
      </div>
    </motion.div>
  );
}

export default Login;