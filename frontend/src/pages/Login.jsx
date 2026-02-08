import React, { useState, useEffect } from 'react'
import '../styles/login.css'
import { Eye, EyeOff, Building, User as UserIcon, MapPin, Briefcase, FileText } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

import Loader from '../components/Loader'

export const Login = () => {
    const navigate = useNavigate()
    const locationState = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [location, setLocation] = useState('')
    const [role, setRole] = useState('CANDIDATE') // Only Candidates now
    const [companyName, setCompanyName] = useState('')
    const [industry, setIndustry] = useState('')
    const [description, setDescription] = useState('')
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])

    const [userId, setUserId] = useState(null)
    const [regStage, setRegStage] = useState(1)

    const [focused, setFocused] = useState('')
    const [hasAccount, setHasAccount] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePassword = (pass) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(pass);
    };

    useEffect(() => {
        if (locationState.state?.mode === 'signup') {
            setHasAccount(false)
        } else if (locationState.state?.mode === 'login') {
            setHasAccount(true)
        }
    }, [locationState])

    const handleLogin = async (e) => {
        e.preventDefault()
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        setIsLoading(true)
        setError('')

        // Test login shortcut
        if (email === 'test@gmail.com' && password === 'test') {
            localStorage.setItem('token', 'test-token');
            localStorage.setItem('userId', 'test-user-id');
            localStorage.setItem('userRole', 'CANDIDATE');
            localStorage.setItem('registrationStage', '4');
            navigate('/');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (data.success) {
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('userId', data.data.userId)
                localStorage.setItem('userRole', data.data.role)
                localStorage.setItem('registrationStage', data.data.registrationStage)
                
                navigate('/')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('System error. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStage1 = async (e) => {
        e.preventDefault()
        
        if (fullName.trim().split(' ').length < 2) {
            setError('Please enter your full name (First and Last name)')
            return
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }
        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        setError('')
        try {
            const response = await fetch('/api/auth/register/stage1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password })
            })
            const data = await response.json()
            if (data.success) {
                setUserId(data.data.id)
                setRegStage(2)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStage2 = async (e) => {
        e.preventDefault()
        
        if (location.trim().length < 3) {
            setError('Please enter a valid location (City, Country)')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/auth/register/stage2/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, role: 'CANDIDATE' })
            })
            const data = await response.json()
            if (data.success) {
                setRegStage(3)
            }
        } catch (err) {
            setError('Update failed.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerification = async (e) => {
        e.preventDefault()
        const code = verificationCode.join('')
        if (code.length < 6) {
            setError('Please enter the complete 6-digit code')
            return
        }

        setIsLoading(true)
        setError('')
        try {
            const response = await fetch(`/api/auth/register/verify?token=${code}`)
            const data = await response.json()
            if (data.success) {
                alert('Account verified successfully! You can now log in.')
                setHasAccount(true)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Verification failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        setIsLoading(true)
        setError('')
        try {
            // Re-use stage 2 to trigger email resend or add a dedicated endpoint
            // For now, let's assume stage 2 re-triggers email or we add a simple resend
            const response = await fetch(`/api/auth/register/resend-code?email=${email}`)
            const data = await response.json()
            if (data.success) {
                alert('A new code has been sent to your email.')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to resend code.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCodeChange = (index, value) => {
        if (isNaN(value)) return
        const newCode = [...verificationCode]
        newCode[index] = value.substring(value.length - 1)
        setVerificationCode(newCode)

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`).focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus()
        }
    }

    const handleStage3 = async (e) => {
        e.preventDefault()
        
        if (companyName.trim().length < 2) {
            setError('Please enter a valid company name')
            return
        }
        if (industry.trim().length < 2) {
            setError('Please specify your industry')
            return
        }
        if (description.trim().length < 20) {
            setError('Company description should be at least 20 characters')
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/auth/register/stage3/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName, industry, description })
            })
            const data = await response.json()
            if (data.success) {
                alert('Registration complete! Please verify your email.')
                setHasAccount(true)
            }
        } catch (err) {
            setError('Finalization failed.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="back-button">
                <button onClick={() => navigate('/')}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
                    </svg>
                </button>
            </div>
            {error && (
                <div className="error-message" style={{ 
                    background: '#fff5f5', 
                    color: '#c53030', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    margin: '0 2rem 1rem 2rem',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    border: '1px solid #feb2b2' 
                }}>
                    {error}
                </div>
            )}
            
            {hasAccount ? (
                <div className="login-form" key="login">
                    <div className="login-logo-container" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" style={{ height: '60px' }} />
                    </div>
                    <p className="welcome-back">Welcome back 👋</p>
                    <p className="welcome-subheading">We are happy to see you again. To use your account, you should log in first.</p>
                    <form onSubmit={handleLogin}>
                        <div className={focused === 'email' ? 'input-div focused' : 'input-div'}>
                            <label>
                                <svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2091 5.41992C15.5991 16.0599 8.39906 16.0499 2.78906 5.41992" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M1.99023 7.39001V17.39C1.99023 18.4509 2.41166 19.4682 3.1618 20.2184C3.91195 20.9685 4.92937 21.39 5.99023 21.39H17.9902C19.0511 21.39 20.0685 20.9685 20.8186 20.2184C21.5688 19.4682 21.9902 18.4509 21.9902 17.39V7.39001C21.9902 6.32915 21.5688 5.31167 20.8186 4.56152C20.0685 3.81138 19.0511 3.39001 17.9902 3.39001H5.99023C4.92937 3.39001 3.91195 3.81138 3.1618 4.56152C2.41166 5.31167 1.99023 6.32915 1.99023 7.39001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                            </label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder='Email' />
                        </div>
                        <div className={focused === 'password' ? 'input-div focused' : 'input-div'}>
                            <label>
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Iconly/Curved/Password"> <g id="Password"> <path id="Stroke 1" fill-rule="evenodd" clip-rule="evenodd" d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 3" d="M10.6918 12H17.0098V13.852" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 5" d="M14.182 13.852V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 7" fill-rule="evenodd" clip-rule="evenodd" d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g> </g></svg>
                            </label>
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder='Password' />
                            {showPassword ? <EyeOff className='eye-icon' onClick={() => setShowPassword(false)} /> : <Eye className='eye-icon' onClick={() => setShowPassword(true)} />}
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? <Loader size="small" /> : 'Log In'}
                        </button>
                    </form>
                    <div className="signup-link">
                        <p>Don't have an account? <span onClick={() => { setHasAccount(false); setRegStage(1); }}>Sign Up</span></p>
                    </div>
                </div>
            ) : (
                <div className="signup-form" key={`signup-${regStage}`}>
                    <div className="login-logo-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" style={{ height: '50px' }} />
                    </div>
                    <p className="welcome-back">
                        {regStage === 1 ? 'Create account' : regStage === 2 ? 'Almost there' : 'Check your email'}
                    </p>
                    <p className="welcome-subheading">
                        {regStage === 3 ? `A 6-digit verification code has been delivered to ${email}` : `Step ${regStage} of 2`}
                    </p>

                    {regStage === 1 && (
                        <form onSubmit={handleStage1}>
                            <div className={focused === 'name' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" stroke="currentColor" stroke-width="1.5"></circle> <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" stroke-width="1.5"></path> </g></svg>
                                </label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} placeholder='Full Name' />
                            </div>
                            <div className={focused === 'email' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2091 5.41992C15.5991 16.0599 8.39906 16.0499 2.78906 5.41992" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M1.99023 7.39001V17.39C1.99023 18.4509 2.41166 19.4682 3.1618 20.2184C3.91195 20.9685 4.92937 21.39 5.99023 21.39H17.9902C19.0511 21.39 20.0685 20.9685 20.8186 20.2184C21.5688 19.4682 21.9902 18.4509 21.9902 17.39V7.39001C21.9902 6.32915 21.5688 5.31167 20.8186 4.56152C20.0685 3.81138 19.0511 3.39001 17.9902 3.39001H5.99023C4.92937 3.39001 3.91195 3.81138 3.1618 4.56152C2.41166 5.31167 1.99023 6.32915 1.99023 7.39001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                </label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder='Email' />
                            </div>
                            <div className={focused === 'password' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Iconly/Curved/Password"> <g id="Password"> <path id="Stroke 1" fill-rule="evenodd" clip-rule="evenodd" d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 3" d="M10.6918 12H17.0098V13.852" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 5" d="M14.182 13.852V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 7" fill-rule="evenodd" clip-rule="evenodd" d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g> </g></svg>
                                </label>
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder='Password' />
                            </div>
                            <div className={focused === 'confirm-password' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Iconly/Curved/Password"> <g id="Password"> <path id="Stroke 1" fill-rule="evenodd" clip-rule="evenodd" d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 3" d="M10.6918 12H17.0098V13.852" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 5" d="M14.182 13.852V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path id="Stroke 7" fill-rule="evenodd" clip-rule="evenodd" d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g> </g></svg>
                                </label>
                                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setFocused('confirm-password')} onBlur={() => setFocused('')} placeholder='Confirm Password' />
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Next Step'}
                            </button>
                        </form>
                    )}

                    {regStage === 2 && (
                        <form onSubmit={handleStage2}>
                            <div className={focused === 'location' ? 'input-div google-places-div focused' : 'input-div google-places-div'}>
                                <label><MapPin size={20} /></label>
                                <div className="google-places-container">
                                    <GooglePlacesAutocomplete
                                        apiKey="YOUR_GOOGLE_MAPS_API_KEY"
                                        selectProps={{
                                            value: location ? { label: location, value: location } : null,
                                            onChange: (val) => setLocation(val ? val.label : ''),
                                            placeholder: 'Location (City, Country)',
                                            styles: {
                                                control: (provided) => ({
                                                    ...provided,
                                                    border: 'none',
                                                    boxShadow: 'none',
                                                    background: 'transparent',
                                                    minHeight: '45px',
                                                    width: '100%'
                                                }),
                                                input: (provided) => ({
                                                    ...provided,
                                                    color: '#333'
                                                }),
                                                singleValue: (provided) => ({
                                                    ...provided,
                                                    color: '#333'
                                                })
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Complete Registration'}
                            </button>
                        </form>
                    )}

                    {regStage === 3 && (
                        <form onSubmit={handleVerification}>
                            <div className="verification-code-container">
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="code-input"
                                    />
                                ))}
                            </div>
                            <div className="resend-container">
                                <p>Didn't get the code? <span onClick={handleResendCode}>Resend Code</span></p>
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Continue'}
                            </button>
                        </form>
                    )}

                    {regStage === 4 && (
                        <form onSubmit={handleStage3}>
                            <div className={focused === 'company' ? 'input-div focused' : 'input-div'}>
                                <label><Building size={20} /></label>
                                <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} onFocus={() => setFocused('company')} onBlur={() => setFocused('')} placeholder='Company Name' />
                            </div>
                            <div className={focused === 'industry' ? 'input-div focused' : 'input-div'}>
                                <label><Briefcase size={20} /></label>
                                <input type="text" required value={industry} onChange={(e) => setIndustry(e.target.value)} onFocus={() => setFocused('industry')} onBlur={() => setFocused('')} placeholder='Industry' />
                            </div>
                            <div className={focused === 'desc' ? 'input-div focused' : 'input-div'}>
                                <label><FileText size={20} /></label>
                                <textarea 
                                    required 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    onFocus={() => setFocused('desc')} 
                                    onBlur={() => setFocused('')} 
                                    placeholder='Company Description'
                                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', minHeight: '100px', padding: '10px' }}
                                />
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Finish Registration'}
                            </button>
                        </form>
                    )}

                    <div className="signup-link" style={{ marginTop: '2rem' }}>
                        <p>Already have an account? <span onClick={() => setHasAccount(true)}>Sign In</span></p>
                    </div>
                </div>
            )}
        </div>
    )
}
