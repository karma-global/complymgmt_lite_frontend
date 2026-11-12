import { useEffect, useState } from 'react';
import '../style/changePassword.css';
import { changePassword, changeTemporaryPasswordStatus } from '../api/service';
import Snackbars from '../component/Snackbars';
import { useNavigate } from 'react-router-dom';
import { decryptData } from './utils/encrypt';

function ChangePassword({ setIsChangePassword }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: '',
    severityType: '',
  });
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    return errors;
  };
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    const validationErrors = validatePassword(password);
    if (password.length === 0) return { strength: 'none', label: '' };
    if (validationErrors.length > 3) return { strength: 'weak', label: 'Weak' };
    if (validationErrors.length > 1) return { strength: 'medium', label: 'Medium' };
    return { strength: 'strong', label: 'Strong' };
  };
  // const currentUserId = localStorage.getItem('user_id');
      const currentUserId = decryptData(localStorage.getItem('user_id'));
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };
  useEffect(() => {
    const fetchTempPasswordStatus = async () => {
      try {
        const response = await changeTemporaryPasswordStatus(currentUserId);
        if (response && typeof response.is_temp_password !== "undefined") {
          setIsChangePassword(response.is_temp_password);
        }
      } catch{
        // handle error silently
      }
    };
    fetchTempPasswordStatus();
  }, [currentUserId, setIsChangePassword]);
  const validate = () => {
    const tempErrors = {};

    // Validate current password
    // if (!formData.currentPassword) {
    //   tempErrors.currentPassword = 'Current password is required';
    // }

    // Validate new password
    if (!formData.newPassword) {
      tempErrors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        tempErrors.newPassword = 'Password must meet all requirements';
      }
    }

    // Ensure new and confirm passwords match
    // if (formData.newPassword !== formData.confirmPassword) {
    //   tempErrors.confirmPassword = 'Passwords do not match';
    // }

    // Prevent using the same password as current
    // if (
    //   formData.currentPassword &&
    //   formData.newPassword &&
    //   formData.currentPassword === formData.newPassword
    // ) {
    //   tempErrors.newPassword = 'New password must be different from current password';
    // }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      const response = await changePassword(currentUserId, payload);
      const message = response?.message || 'Password changed successfully';


      // Update temp password status
      const userId = decryptData(localStorage.getItem('user_id')) || currentUserId;
      const changeTempPasswordStatusResponse = await changeTemporaryPasswordStatus(userId);
      setIsChangePassword(changeTempPasswordStatusResponse?.is_temp_password || false);
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: 'success',
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      // Show error snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message || 'Something went wrong. Please try again.',
        severityType: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optional: show password strength dynamically
  const passwordStrength = getPasswordStrength(formData.newPassword);


  return (
    <div className="change-password-container">
      <Snackbars issnackbarsOpen={issnackbarsOpen} setIsSnackbarsOpen={setIsSnackbarsOpen} />
      <div className="change-password-card">
        <div className="card-header">
          <h1>Change Password</h1>
          <p>Update your password to keep your account secure</p>
        </div>

        <div className="password-form">
          {/* <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={errors.currentPassword ? 'error' : ''}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
          </div> */}

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? 'error' : ''}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.newPassword && (
              <div className="password-strength">
                <div className={`strength-bar strength-${passwordStrength.strength}`}>
                  <div className="strength-fill"></div>
                </div>
                <span className={`strength-label strength-${passwordStrength.strength}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                {validatePassword(formData.newPassword).map((req, index) => (
                  <li key={index} className="requirement-missing">{req}</li>
                ))}
                {validatePassword(formData.newPassword).length === 0 && formData.newPassword && (
                  <li className="requirement-met">All requirements met ✓</li>
                )}
              </ul>
            </div>
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="toggle-password justify-content-center"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="change-password-btn-secondary justify-content-center" onClick={() => { setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setIsSubmitting(false); }}>Cancel</button>
            <button
              onClick={handleSubmit}
              className="change-password-btn-primary justify-content-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;