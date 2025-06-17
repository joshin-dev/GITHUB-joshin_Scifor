import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentResetCode, setCurrentResetCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_APP_EMAILJS_SERVICE_ID || 'service_z47nqgh';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID || 'template_0tvgnsd';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY || 'UJR8duC8-tvOtYfNr';

  // Initialize EmailJS
  useEffect(() => {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('EmailJS initialization failed:', error);
    }
  }, []);

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

    return () => {
      // Cleanup
    };
  }, []);

  // Generate random reset code
  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send password reset email with enhanced error handling
  const sendResetEmail = async (email, resetCode) => {
    const templateParams = {
      to_email: email,
      reset_code: resetCode,
      to_name: 'User',
    };

    try {
      console.log('Sending email with params:', templateParams);
      console.log('EmailJS Config:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY
      });

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
      
      console.log('Email sent successfully:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  };

  // Handle Google OAuth response
  const handleGoogleResponse = (response) => {
    setIsGoogleLoading(true);
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        authType: 'google'
      };

      localStorage.setItem('user', JSON.stringify(googleUser));
      
      // Also store in registered users for password reset functionality
      const users = getStoredUsers();
      const existingUser = users.find(user => user.email === googleUser.email);
      if (!existingUser) {
        const newUser = {
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          password: null, // Google users don't have passwords
          authType: 'google'
        };
        storeUser(newUser);
      }
      
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
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);
      
      try {
        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          width: 200
        });
        
        setTimeout(() => {
          const googleBtn = tempDiv.querySelector('div[role="button"]');
          if (googleBtn) {
            googleBtn.click();
          } else {
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

  // Get stored users from localStorage with debugging
  const getStoredUsers = () => {
    try {
      const users = localStorage.getItem('registeredUsers');
      const parsedUsers = users ? JSON.parse(users) : [];
      console.log('Retrieved users from localStorage:', parsedUsers);
      return parsedUsers;
    } catch (error) {
      console.error('Error retrieving users from localStorage:', error);
      return [];
    }
  };

  // Store user in localStorage
  const storeUser = (user) => {
    try {
      const users = getStoredUsers();
      users.push(user);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      console.log('User stored successfully:', user);
      window.dispatchEvent(new CustomEvent('authChange'));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  // Update user in localStorage
  const updateUser = (updatedUser) => {
    try {
      const users = getStoredUsers();
      const userIndex = users.findIndex(user => user.email === updatedUser.email);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        console.log('User updated successfully:', updatedUser);
        return true;
      }
      console.log('User not found for update:', updatedUser.email);
      return false;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  // Find user by email with debugging
  const findUserByEmail = (email) => {
    try {
      const users = getStoredUsers();
      const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
      console.log(`Looking for user with email: ${email}`);
      console.log('Available users:', users.map(u => u.email));
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  };

  // Input change handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });
  };

  const handleResetPasswordChange = (e) => {
    setResetPasswordData({ ...resetPasswordData, [e.target.name]: e.target.value });
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

  // Forgot password validation
  const validateForgotPassword = () => {
    const newErrors = {};
    if (!forgotPasswordData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(forgotPasswordData.email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  // Reset password validation
  const validateResetPassword = () => {
    const newErrors = {};
    if (!resetPasswordData.resetCode.trim()) {
      newErrors.resetCode = 'Reset code is required';
    }
    if (!resetPasswordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (resetPasswordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!resetPasswordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  // Handle forgot password submission with enhanced debugging
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForgotPassword();
    setForgotPasswordErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const email = forgotPasswordData.email.trim();
      console.log('Attempting to find user with email:', email);
      
      const user = findUserByEmail(email);
      
      if (!user) {
        console.log('User not found for email:', email);
        console.log('All registered users:', getStoredUsers());
        setForgotPasswordErrors({ email: 'Email not found. Please check if you have registered with this email.' });
        return;
      }

      // Check if user is Google-authenticated
      if (user.authType === 'google') {
        setForgotPasswordErrors({ email: 'This account uses Google Sign-In. Please use Google to login.' });
        return;
      }

      setIsSendingEmail(true);
      const resetCode = generateResetCode();
      
      try {
        console.log('Sending reset email to:', email);
        const result = await sendResetEmail(email, resetCode);
        
        if (result.success) {
          setCurrentResetCode(resetCode);
          setResetEmail(email);
          setShowForgotPassword(false);
          setShowResetForm(true);
          setForgotPasswordData({ email: '' });
          setForgotPasswordErrors({});
          alert('Reset code sent to your email!');
        } else {
          console.error('EmailJS error:', result.error);
          alert(`Failed to send reset email: ${result.error}`);
        }
      } catch (error) {
        console.error('Error sending reset email:', error);
        alert('Failed to send reset email. Please try again.');
      } finally {
        setIsSendingEmail(false);
      }
    }
  };

  // Handle reset password submission
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateResetPassword();
    setResetPasswordErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (resetPasswordData.resetCode !== currentResetCode) {
        setResetPasswordErrors({ resetCode: 'Invalid reset code' });
        return;
      }

      const user = findUserByEmail(resetEmail);
      if (!user) {
        alert('User not found. Please try again.');
        return;
      }

      const updatedUser = { 
        ...user, 
        password: resetPasswordData.newPassword 
      };
      
      if (updateUser(updatedUser)) {
        alert('Password reset successful! You can now login with your new password.');
        setShowResetForm(false);
        setResetPasswordData({ resetCode: '', newPassword: '', confirmPassword: '' });
        setResetPasswordErrors({});
        setCurrentResetCode('');
        setResetEmail('');
      } else {
        alert('Failed to reset password. Please try again.');
      }
    }
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (isSignup) {
        const existingUser = findUserByEmail(formData.email);
        if (existingUser) {
          setErrors({ email: 'Email already registered' });
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          authType: 'local'
        };
        storeUser(newUser);
        alert('Account created successfully! Please login.');
        
        setIsSignup(false);
        setFormData({ fullName: '', email: '', password: '' });
      } else {
        const user = findUserByEmail(formData.email);
        if (!user) {
          setErrors({ email: 'Email not found' });
          return;
        }
        if (user.password !== formData.password) {
          setErrors({ password: 'Incorrect password' });
          return;
        }

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
      
      setFormData({ fullName: '', email: '', password: '' });
    }
  };

  return (
    <>
      <motion.div
        className="container mt-5"
        style={{ maxWidth: '400px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="mb-4 text-center text-light">{isSignup ? 'Sign Up' : 'Login'}</h3>

        {/* EmailJS Configuration Warning */}
        {(EMAILJS_SERVICE_ID === 'your_service_id' || 
          EMAILJS_TEMPLATE_ID === 'your_template_id' || 
          EMAILJS_PUBLIC_KEY === 'your_public_key') && (
          <div className="alert alert-warning mb-4">
            <small>
              <strong>Setup Required:</strong> Configure EmailJS credentials in the component to enable email functionality.
            </small>
          </div>
        )}

       

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

            {!isSignup && (
              <div className="mb-3 text-end">
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary small"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
            )}

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

        {/* Enhanced Debug info */}
        <div className="mt-4 p-3 bg-dark rounded">
          <small className="text-muted">
            <strong>Debug Info:</strong><br/>
            Environment: {window.location.hostname}<br/>
            Registered Users: {getStoredUsers().length}<br/>
            User Emails: {getStoredUsers().map(u => u.email).join(', ')}<br/>
            Current User: {localStorage.getItem('user') ? 'Logged in' : 'Not logged in'}<br/>
            Google Ready: {isGoogleReady ? 'Yes' : 'No'}<br/>
            EmailJS Ready: {EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY ? 'Yes' : 'No'}
          </small>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            className="modal d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-dialog modal-dialog-centered"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-content bg-dark text-light">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title">Forgot Password</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordData({ email: '' });
                      setForgotPasswordErrors({});
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Enter your email address and we'll send you a reset code.
                  </p>
                  <form onSubmit={handleForgotPasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Email address</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${forgotPasswordErrors.email ? 'is-invalid' : ''}`}
                        placeholder="Enter your email"
                        value={forgotPasswordData.email}
                        onChange={handleForgotPasswordChange}
                        disabled={isSendingEmail}
                      />
                      {forgotPasswordErrors.email && (
                        <div className="invalid-feedback">{forgotPasswordErrors.email}</div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary flex-fill"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordData({ email: '' });
                          setForgotPasswordErrors({});
                        }}
                        disabled={isSendingEmail}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-danger flex-fill"
                        disabled={isSendingEmail}
                      >
                        {isSendingEmail ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Sending...
                          </>
                        ) : (
                          'Send Reset Code'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetForm && (
          <motion.div
            className="modal d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-dialog modal-dialog-centered"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-content bg-dark text-light">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title">Reset Password</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetPasswordData({ resetCode: '', newPassword: '', confirmPassword: '' });
                      setResetPasswordErrors({});
                      setCurrentResetCode('');
                      setResetEmail('');
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Enter the reset code sent to <strong>{resetEmail}</strong> and your new password.
                  </p>
                  <form onSubmit={handleResetPasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Reset Code</label>
                      <input
                        type="text"
                        name="resetCode"
                        className={`form-control ${resetPasswordErrors.resetCode ? 'is-invalid' : ''}`}
                        placeholder="Enter 6-digit reset code"
                        value={resetPasswordData.resetCode}
                        onChange={handleResetPasswordChange}
                        maxLength="6"
                      />
                      {resetPasswordErrors.resetCode && (
                        <div className="invalid-feedback">{resetPasswordErrors.resetCode}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        className={`form-control ${resetPasswordErrors.newPassword ? 'is-invalid' : ''}`}
                        placeholder="Enter new password"
                        value={resetPasswordData.newPassword}
                        onChange={handleResetPasswordChange}
                      />
                      {resetPasswordErrors.newPassword && (
                        <div className="invalid-feedback">{resetPasswordErrors.newPassword}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className={`form-control ${resetPasswordErrors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Confirm new password"
                        value={resetPasswordData.confirmPassword}
                        onChange={handleResetPasswordChange}
                      />
                      {resetPasswordErrors.confirmPassword && (
                        <div className="invalid-feedback">{resetPasswordErrors.confirmPassword}</div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary flex-fill"
                        onClick={() => {
                          setShowResetForm(false);
                          setResetPasswordData({ resetCode: '', newPassword: '', confirmPassword: '' });
                          setResetPasswordErrors({});
                          setCurrentResetCode('');
                          setResetEmail('');
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-danger flex-fill">
                        Reset Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Login;