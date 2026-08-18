import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Added icons for password toggle
import { useAppDispatch } from '../../store/hooks';
import { loginUser, registerUser } from '../../services/auth.service';
import { Role } from '../../types/global.types';
import styles from './LoginPage.module.scss';
import { LoginPageProps } from './LoginPage.types';

export const LoginPage: React.FC<LoginPageProps> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Restored your EXACT original submission and navigation logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegistering) {
        await registerUser(email, password, firstName, lastName, 'VIEWER'); // Defaulting to VIEWER
      } else {
        await loginUser(email, password);
      }
      // Navigating happens automatically due to ProtectedRoute or manually here
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you don\'t have an account yet, please sign up first.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.leftPanel}>
        <div className={styles.brandContainer}>
          <div className={styles.logo}>&infin;</div>
          <span className={styles.brandName}>Orbit</span>
        </div>
        
        <div className={styles.heroContent}>
          <h1>Engineered for collective precision.</h1>
          <p>Synchronize your team's neural pathways. Experience the next generation of high-fidelity spatial workspaces.</p>
        </div>
        
        <div className={styles.statusFooter}>
          <span className={styles.line}></span>
          <span className={styles.statusText}>Developed by Rohan Mathad</span>
          <span className={styles.statusDot}></span>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>{isRegistering ? 'Create an account' : 'Welcome back'}</h2>
            <p>{isRegistering ? 'Sign up to build your workspace.' : 'Enter your credentials to access the workspace.'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorText} style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

            {isRegistering && (
              <>
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <input 
                      type="text" 
                      className={styles.floatingInput}
                      placeholder=" "
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <label className={styles.floatingLabel}>First name</label>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <input 
                      type="text" 
                      className={styles.floatingInput}
                      placeholder=" "
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                    <label className={styles.floatingLabel}>Last name</label>
                  </div>
                </div>
              </>
            )}

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input 
                  type="email" 
                  className={styles.floatingInput}
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className={styles.floatingLabel}>Email address</label>
              </div>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={styles.floatingInput}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className={styles.floatingLabel}>Password</label>
                <button 
                  type="button" 
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {!isRegistering && (
              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotPassword}>Forgot password?</a>
              </div>
            )}
            
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'PROCESSING...' : (isRegistering ? 'SIGN UP' : 'SIGN IN')}
            </button>
          </form>
          
          <div className={styles.signupPrompt}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); }}>
              {isRegistering ? 'Sign in' : 'Sign up now'}
            </a>
          </div>

          {/* Legal footer remains here exactly as requested in the layout updates */}
          <div className={styles.legalFooter}>
            <a href="#">Privacy Policy</a>
            <span className={styles.dot}>&bull;</span>
            <a href="#">Terms of Service</a>
          </div>

        </div>
      </div>
    </div>
  );
};