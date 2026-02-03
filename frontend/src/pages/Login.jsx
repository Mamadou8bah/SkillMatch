import React, { useState, useEffect } from 'react'
import '../styles/login.css'
import { Eye, EyeOff, Building, User as UserIcon, MapPin, Briefcase, FileText } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

import Loader from '../components/Loader'

export const Login = () => {
    const navigate = useNavigate()
    const locationState = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [location, setLocation] = useState('')
    const [role, setRole] = useState('CANDIDATE')
    const [companyName, setCompanyName] = useState('')
    const [industry, setIndustry] = useState('')
    const [description, setDescription] = useState('')

    const [userId, setUserId] = useState(null)
    const [regStage, setRegStage] = useState(1)

    const [focused, setFocused] = useState('')
    const [hasAccount, setHasAccount] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (locationState.state?.mode === 'signup') {
            setHasAccount(false)
        } else if (locationState.state?.mode === 'login') {
            setHasAccount(true)
        }
    }, [locationState])

    const handleLogin = async (e) => {
        e.preventDefault()
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
        setIsLoading(true)
        try {
            const response = await fetch(`/api/auth/register/stage2/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location, role })
            })
            const data = await response.json()
            if (data.success) {
                if (role === 'EMPLOYER') {
                    setRegStage(3)
                } else {
                    alert('Registration stage 1 & 2 complete. Please verify your email.')
                    setHasAccount(true)
                }
            }
        } catch (err) {
            setError('Update failed.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStage3 = async (e) => {
        e.preventDefault()
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
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                        <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
                    </svg>
                </button>
            </div>
            {error && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '10px', background: '#ffebee' }}>{error}</div>}
            
            {hasAccount ? (
                <div className="login-form">
                    <p className="welcome-back">Welcome back 👋</p>
                    <p className="welcome-subheading">We are happy to see you again. To use your account, you should log in first.</p>
                    <form onSubmit={handleLogin}>
                        <div className={focused === 'email' ? 'input-div focused' : 'input-div'}>
                            <label><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg></label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder='Email' />
                        </div>
                        <div className={focused === 'password' ? 'input-div focused' : 'input-div'}>
                            <label><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg></label>
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
                <div className="signup-form">
                    <p className="welcome-back">{regStage === 1 ? 'Create account' : regStage === 2 ? 'Almost there' : 'Business Details'}</p>
                    <p className="welcome-subheading">Step {regStage} of {role === 'EMPLOYER' ? 3 : 2}</p>

                    {regStage === 1 && (
                        <form onSubmit={handleStage1}>
                            <div className={focused === 'name' ? 'input-div focused' : 'input-div'}>
                                <label><UserIcon size={20} /></label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} placeholder='Full Name' />
                            </div>
                            <div className={focused === 'email' ? 'input-div focused' : 'input-div'}>
                                <label><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg></label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder='Email' />
                            </div>
                            <div className={focused === 'password' ? 'input-div focused' : 'input-div'}>
                                <label><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg></label>
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder='Password' />
                            </div>
                            <div className={focused === 'confirm-password' ? 'input-div focused' : 'input-div'}>
                                <label><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg></label>
                                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setFocused('confirm-password')} onBlur={() => setFocused('')} placeholder='Confirm Password' />
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Next Step'}
                            </button>
                        </form>
                    )}

                    {regStage === 2 && (
                        <form onSubmit={handleStage2}>
                            <div className={focused === 'location' ? 'input-div focused' : 'input-div'}>
                                <label><MapPin size={20} /></label>
                                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} onFocus={() => setFocused('location')} onBlur={() => setFocused('')} placeholder='Location (City, Country)' />
                            </div>
                            <div className="role-selection" style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                                <div 
                                    className={`role-card ${role === 'CANDIDATE' ? 'active' : ''}`}
                                    onClick={() => setRole('CANDIDATE')}
                                    style={{ border: role === 'CANDIDATE' ? '2px solid #ff8c00' : '1px solid #ddd', padding: '1rem', borderRadius: '8px', cursor: 'pointer', flex: 1, textAlign: 'center' }}
                                >
                                    <UserIcon />
                                    <p>Candidate</p>
                                </div>
                                <div 
                                    className={`role-card ${role === 'EMPLOYER' ? 'active' : ''}`}
                                    onClick={() => setRole('EMPLOYER')}
                                    style={{ border: role === 'EMPLOYER' ? '2px solid #ff8c00' : '1px solid #ddd', padding: '1rem', borderRadius: '8px', cursor: 'pointer', flex: 1, textAlign: 'center' }}
                                >
                                    <Building />
                                    <p>Employer</p>
                                </div>
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Next Step'}
                            </button>
                        </form>
                    )}

                    {regStage === 3 && (
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
