import React, { useState, useEffect } from 'react'
import '../styles/login.css'
import { Eye, EyeOff, MapPin, Briefcase, Plus, X, Code, Palette, TrendingUp, Edit3, BarChart, PieChart, Users, Target, Headphones, Package, Cloud, ShieldCheck, Megaphone, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'

import Loader from '../components/Loader'
import { apiFetch, isTokenExpired } from '../utils/api'
import { AVATAR_STYLES, AVATAR_VARIANTS, buildAvatarUrl, saveAvatarConfig } from '../utils/avatar'

export const Login = () => {
    const navigate = useNavigate()
    const locationState = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [location, setLocation] = useState('')
    const [profession, setProfession] = useState('')
    const [experienceLevel, setExperienceLevel] = useState('')
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
    const [skills, setSkills] = useState([])
    const [skillInput, setSkillInput] = useState('')
    const [avatarStyle, setAvatarStyle] = useState('adventurer')
    const [avatarVariant, setAvatarVariant] = useState('1')
    const [isGoogleOnboarding, setIsGoogleOnboarding] = useState(localStorage.getItem('regAuthProvider') === 'GOOGLE')

    const [userId, setUserId] = useState(null)
    const [regStage, setRegStage] = useState(1)

    useEffect(() => {
        const savedUserId = localStorage.getItem('regUserId');
        const savedRegStage = localStorage.getItem('regStage');
        const savedEmail = localStorage.getItem('regEmail');
        const savedAuthProvider = localStorage.getItem('regAuthProvider');
        
        if (savedUserId && savedRegStage) {
            setUserId(savedUserId);
            const parsedStage = parseInt(savedRegStage, 10);
            // Stage 3 (photo) is deprecated; continue at skills stage.
            setRegStage(parsedStage === 3 ? 4 : parsedStage);
            if (savedEmail) setEmail(savedEmail);
            if (savedAuthProvider === 'GOOGLE') setIsGoogleOnboarding(true);
            setHasAccount(false);
        }
    }, []);

    const diverseSkills = [
        { title: "Software Dev", icon: <Code size={18} /> },
        { title: "UI/UX Design", icon: <Palette size={18} /> },
        { title: "Data Analysis", icon: <BarChart size={18} /> },
        { title: "Project Mgmt", icon: <Briefcase size={18} /> },
        { title: "Digital Marketing", icon: <TrendingUp size={18} /> },
        { title: "Content Writing", icon: <Edit3 size={18} /> },
        { title: "Finance", icon: <PieChart size={18} /> },
        { title: "Human Resources", icon: <Users size={18} /> },
        { title: "Sales", icon: <Target size={18} /> },
        { title: "Customer Success", icon: <Headphones size={18} /> },
        { title: "Product Mgmt", icon: <Package size={18} /> },
        { title: "DevOps & Cloud", icon: <Cloud size={18} /> },
        { title: "Cyber Security", icon: <ShieldCheck size={18} /> },
        { title: "Public Relations", icon: <Megaphone size={18} /> },
        { title: "Operations", icon: <Settings size={18} /> }
    ];

    const professionOptions = [
        'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer',
        'Data Analyst', 'Data Scientist', 'Product Manager', 'Project Manager', 'DevOps Engineer', 'QA Engineer',
        'UI/UX Designer', 'Graphic Designer', 'Digital Marketer', 'Content Writer', 'Sales Representative',
        'Account Manager', 'Customer Support Specialist', 'HR Specialist', 'Recruiter', 'Accountant',
        'Financial Analyst', 'Business Analyst', 'Operations Manager', 'Teacher', 'Lecturer', 'Nurse', 'Doctor',
        'Pharmacist', 'Lawyer', 'Legal Officer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
        'Architect', 'Supply Chain Specialist', 'Logistics Coordinator', 'Administrative Assistant',
        'Executive Assistant', 'Public Relations Officer', 'Social Media Manager', 'Security Analyst'
    ];

    const locationOptions = [
        'Banjul, The Gambia',
        'Kanifing, The Gambia',
        'Serrekunda, The Gambia',
        'Bakau, The Gambia',
        'Brikama, The Gambia',
        'Sukuta, The Gambia',
        'Lamin, The Gambia',
        'Farato, The Gambia',
        'Gunjur, The Gambia',
        'Sanyang, The Gambia',
        'Tanji, The Gambia',
        'Kotu, The Gambia',
        'Kololi, The Gambia',
        'Fajara, The Gambia',
        'Kerr Serign, The Gambia',
        'Abuko, The Gambia',
        'Yundum, The Gambia',
        'Basse, The Gambia',
        'Soma, The Gambia',
        'Farafenni, The Gambia',
        'Kerewan, The Gambia',
        'Mansa Konko, The Gambia',
        'Essau, The Gambia',
        'Barra, The Gambia',
        'Bwiam, The Gambia',
        'Janjanbureh, The Gambia'
    ];

    const canonicalFromOptions = (value, options) => {
        const trimmed = value.trim();
        const match = options.find(o => o.toLowerCase() === trimmed.toLowerCase());
        return match || '';
    };

    const mapIndustryFromProfession = (professionName) => {
        const key = (professionName || '').toLowerCase().trim();
        const map = {
            'software engineer': 'Technology',
            'frontend developer': 'Technology',
            'backend developer': 'Technology',
            'full stack developer': 'Technology',
            'mobile developer': 'Technology',
            'data analyst': 'Data & Analytics',
            'data scientist': 'Data & Analytics',
            'product manager': 'Technology',
            'project manager': 'Business Operations',
            'devops engineer': 'Technology',
            'qa engineer': 'Technology',
            'ui/ux designer': 'Design',
            'graphic designer': 'Design',
            'digital marketer': 'Marketing',
            'content writer': 'Marketing',
            'sales representative': 'Sales',
            'account manager': 'Sales',
            'customer support specialist': 'Customer Service',
            'hr specialist': 'Human Resources',
            'recruiter': 'Human Resources',
            'accountant': 'Finance',
            'financial analyst': 'Finance',
            'business analyst': 'Business Operations',
            'operations manager': 'Business Operations',
            'teacher': 'Education',
            'lecturer': 'Education',
            'nurse': 'Healthcare',
            'doctor': 'Healthcare',
            'pharmacist': 'Healthcare',
            'lawyer': 'Legal',
            'legal officer': 'Legal',
            'civil engineer': 'Engineering',
            'mechanical engineer': 'Engineering',
            'electrical engineer': 'Engineering',
            'architect': 'Engineering',
            'supply chain specialist': 'Logistics',
            'logistics coordinator': 'Logistics',
            'administrative assistant': 'Administration',
            'executive assistant': 'Administration',
            'public relations officer': 'Communications',
            'social media manager': 'Marketing',
            'security analyst': 'Cybersecurity'
        };
        return map[key] || 'General';
    };

    const toggleSkill = (skill) => {
        const isSelected = skills.some(s => s.toLowerCase() === skill.toLowerCase());
        if (isSelected) {
            setSkills(skills.filter(s => s.toLowerCase() !== skill.toLowerCase()));
        } else {
            setSkills([...skills, skill]);
        }
    };

    const addManualSkill = () => {
        if (skillInput.trim() && !skills.some(s => s.toLowerCase() === skillInput.trim().toLowerCase())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const [focused, setFocused] = useState('')
    const [hasAccount, setHasAccount] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleProcessing, setIsGoogleProcessing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(pass);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedAuthProvider = localStorage.getItem('regAuthProvider');
        const stage = parseInt(localStorage.getItem('registrationStage') || '0', 10);
        const googleIncomplete = savedAuthProvider === 'GOOGLE' && stage > 0 && stage < 3;

        if (token && !isTokenExpired(token) && !googleIncomplete) {
            const role = localStorage.getItem('userRole');
            navigate(role === 'ADMIN' ? '/admin' : '/');
            return;
        }

        if (token && !isTokenExpired(token) && googleIncomplete) {
            setHasAccount(false);
            setIsGoogleOnboarding(true);
            const stagedUserId = localStorage.getItem('regUserId') || localStorage.getItem('userId');
            if (stagedUserId) setUserId(stagedUserId);
            const parsedStage = stage === 3 ? 4 : stage;
            if (parsedStage > 0) {
                setRegStage(parsedStage);
                localStorage.setItem('regStage', String(parsedStage));
            }
            return;
        }

        const hasVisited = localStorage.getItem('hasVisited');
        if (!hasVisited) {
            navigate('/intro', { replace: true });
            return;
        }

        if (locationState.state?.mode === 'signup') {
            setHasAccount(false)
        } else if (locationState.state?.mode === 'login') {
            setHasAccount(true)
        }
    }, [locationState, navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })
            if (data.success) {
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('userId', data.data.userId)
                localStorage.setItem('userRole', data.data.role)
                localStorage.setItem('registrationStage', data.data.registrationStage)
                localStorage.setItem('firstName', data.data.firstName)
                localStorage.setItem('hasVisited', 'true')
                
                const role = data.data.role;
                const from = locationState.state?.from?.pathname || (role === 'ADMIN' ? '/admin' : '/');
                navigate(from, { replace: true })
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError(err.message || 'System error. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const data = await apiFetch('/api/auth/google/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: tokenResponse?.access_token || tokenResponse?.credential || tokenResponse?.code || tokenResponse?.id_token,
                        accessToken: tokenResponse?.access_token,
                        credential: tokenResponse?.credential,
                        code: tokenResponse?.code,
                        idToken: tokenResponse?.id_token
                    })
                });
                if (data.success) {
                    localStorage.setItem('token', data.data.token)
                    localStorage.setItem('userId', data.data.userId)
                    localStorage.setItem('userRole', data.data.role)
                    localStorage.setItem('registrationStage', data.data.registrationStage)
                    localStorage.setItem('firstName', data.data.firstName)
                    localStorage.setItem('hasVisited', 'true')
                    localStorage.setItem('regAuthProvider', 'GOOGLE')
                    setIsGoogleOnboarding(true)

                    // Google users never require email verification. If skills are done (stage >= 3), continue to app.
                    if (data.data.registrationStage >= 3) {
                        localStorage.removeItem('regUserId')
                        localStorage.removeItem('regStage')
                        localStorage.removeItem('regEmail')
                        localStorage.removeItem('regAuthProvider')
                        const role = data.data.role;
                        navigate(role === 'ADMIN' ? '/admin' : '/');
                    } else {
                        const nextStage = data.data.registrationStage === 3 ? 4 : data.data.registrationStage;
                        setUserId(data.data.userId);
                        setRegStage(nextStage);
                        setHasAccount(false);
                        localStorage.setItem('regUserId', data.data.userId);
                        localStorage.setItem('regStage', nextStage);
                    }
                }
            } catch (err) {
                setError(err.message || 'Google login failed. Please try again.');
            } finally {
                setIsGoogleProcessing(false);
                setIsLoading(false);
            }
        },
        onError: () => {
            setIsGoogleProcessing(false);
            setIsLoading(false);
            setError('Google login was unsuccessful.');
        },
        scope: 'openid email profile'
    });

    const handleGoogleClick = () => {
        setError('');
        setIsGoogleProcessing(true);
        loginWithGoogle();
    };

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
            const data = await apiFetch('/api/auth/register/stage1', {
                method: 'POST',
                body: JSON.stringify({ fullName, email, password })
            })
            if (data.success) {
                setUserId(data.data.id)
                let nextStage = 2;
                if (data.data.registrationStage === 1) nextStage = 2;
                else if (data.data.registrationStage === 2) nextStage = 4; // photo stage removed
                else if (data.data.registrationStage === 3) nextStage = 5;
                
                setRegStage(nextStage)
                localStorage.setItem('regUserId', data.data.id)
                localStorage.setItem('regStage', nextStage)
                localStorage.setItem('regEmail', email)
                localStorage.setItem('regAuthProvider', 'EMAIL')
                setIsGoogleOnboarding(false)
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
        
        const selectedLocation = canonicalFromOptions(location, locationOptions);
        if (!selectedLocation) {
            setError('Please search and select a location from the list')
            return
        }
        const selectedProfession = canonicalFromOptions(profession, professionOptions);
        if (!selectedProfession) {
            setError('Please search and select a profession from the list')
            return
        }

        if (!experienceLevel) {
            setError('Please select your experience level')
            return
        }

        setIsLoading(true)
        try {
            const mappedIndustry = mapIndustryFromProfession(selectedProfession);
            const data = await apiFetch(`/api/auth/register/stage2/${userId}`, {
                method: 'POST',
                body: JSON.stringify({ 
                    location: selectedLocation, 
                    profession: selectedProfession,
                    industry: mappedIndustry,
                    experienceLevel,
                    role: 'CANDIDATE' 
                })
            })
            if (data.success) {
                // Photo stage removed; continue directly to skills.
                setRegStage(4)
                localStorage.setItem('regStage', 4)
            }
        } catch (err) {
            setError('Update failed.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStage4 = async (e) => {
        e.preventDefault()
        if (skills.length < 3) {
            setError('Please select at least 3 skills to continue')
            return
        }
        setIsLoading(true)
        try {
            const data = await apiFetch(`/api/auth/register/stage3/${userId}`, {
                method: 'POST',
                body: JSON.stringify({ skills })
            })
            if (data.success) {
                localStorage.setItem('avatarStyle', avatarStyle)
                saveAvatarConfig(localStorage.getItem('userId') || userId, avatarStyle, avatarVariant)
                if (isGoogleOnboarding) {
                    localStorage.setItem('registrationStage', '3')
                    localStorage.removeItem('regUserId')
                    localStorage.removeItem('regStage')
                    localStorage.removeItem('regEmail')
                    localStorage.removeItem('regAuthProvider')
                    const role = localStorage.getItem('userRole')
                    navigate(role === 'ADMIN' ? '/admin' : '/')
                } else {
                    setRegStage(5)
                    localStorage.setItem('regStage', 5)
                }
            } else {
                setError(data.message || 'Failed to save skills. Please try again.')
            }
        } catch (err) {
            setError('Failed to save skills. Please try again.')
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
            const data = await apiFetch(`/api/auth/register/verify?token=${code}`)
            if (data.success) {
                alert('Account verified successfully! You can now log in.')
                localStorage.removeItem('regUserId')
                localStorage.removeItem('regStage')
                localStorage.removeItem('regEmail')
                localStorage.removeItem('regAuthProvider')
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
            const data = await apiFetch(`/api/auth/register/resend-code?email=${email}`)
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
        if (value && index < 5) document.getElementById(`code-${index + 1}`).focus()
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus()
        }
    }

    return (
        <div className="login-page">
            {isGoogleProcessing && (
                <div className="google-processing-page">
                    <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" className="google-processing-logo" />
                    <div className="google-processing-spinner" />
                    <h2>Securing Your Google Sign-In</h2>
                    <p>We are verifying your account and preparing your workspace.</p>
                </div>
            )}
            {!isGoogleProcessing && (
            <>
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
                    <div className="login-logo-container" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" style={{ height: '80px' }} />
                    </div>
                    <p className="welcome-back">Welcome back 👋</p>
                    <p className="welcome-subheading">We are happy to see you again. To use your account, you should log in first.</p>
                    <form onSubmit={handleLogin}>
                        <div className={focused === 'email' ? 'input-div focused' : 'input-div'}>
                            <label>
                                <svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2091 5.41992C15.5991 16.0599 8.39906 16.0499 2.78906 5.41992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M1.99023 7.39001V17.39C1.99023 18.4509 2.41166 19.4682 3.1618 20.2184C3.91195 20.9685 4.92937 21.39 5.99023 21.39H17.9902C19.0511 21.39 20.0685 20.9685 20.8186 20.2184C21.5688 19.4682 21.9902 18.4509 21.9902 17.39V7.39001C21.9902 6.32915 21.5688 5.31167 20.8186 4.56152C20.0685 3.81138 19.0511 3.39001 17.9902 3.39001H5.99023C4.92937 3.39001 3.91195 3.81138 3.1618 4.56152C2.41166 5.31167 1.99023 6.32915 1.99023 7.39001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                            </label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder='Email' />
                        </div>
                        <div className={focused === 'password' ? 'input-div focused' : 'input-div'}>
                            <label>
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Iconly/Curved/Password"> <g id="Password"> <path id="Stroke 1" fillRule="evenodd" clipRule="evenodd" d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 3" d="M10.6918 12H17.0098V13.852" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 5" d="M14.182 13.852V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 7" fillRule="evenodd" clipRule="evenodd" d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g> </g> </g></svg>
                            </label>
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder='Password' />
                            {showPassword ? <EyeOff className='eye-icon' onClick={() => setShowPassword(false)} /> : <Eye className='eye-icon' onClick={() => setShowPassword(true)} />}
                        </div>
                        <button type="submit" className="login-button" disabled={isLoading}>
                            {isLoading ? <Loader size="small" /> : 'Log In'}
                        </button>
                    </form>
                    <div className="social-login" style={{ marginTop: '1rem' }}>
                            <button 
                                type="button" 
                                className="google-login-btn" 
                                onClick={handleGoogleClick}
                                disabled={isLoading || isGoogleProcessing}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                                Continue with Google
                        </button>
                    </div>
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
                        {regStage === 1 ? 'Create account' : 
                         regStage === 2 ? 'About you' : 
                         regStage === 4 ? 'What are your skills?' :
                         'Verify Identity'}
                    </p>
                    <p className="welcome-subheading">
                        {regStage === 5 ? `A 6-digit verification code has been delivered to ${email}` : 
                         regStage === 4 ? 'Select skills that best describe what you can do' :
                         `Step ${regStage === 4 ? 3 : regStage} of 3`}
                    </p>

                    {regStage === 1 && (
                        <form onSubmit={handleStage1}>
                            <div className={focused === 'name' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"></circle> <path d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" strokeWidth="1.5"></path> </g></svg>
                                </label>
                                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused('')} placeholder='Full Name' />
                            </div>
                            <div className={focused === 'email' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2091 5.41992C15.5991 16.0599 8.39906 16.0499 2.78906 5.41992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M1.99023 7.39001V17.39C1.99023 18.4509 2.41166 19.4682 3.1618 20.2184C3.91195 20.9685 4.92937 21.39 5.99023 21.39H17.9902C19.0511 21.39 20.0685 20.9685 20.8186 20.2184C21.5688 19.4682 21.9902 18.4509 21.9902 17.39V7.39001C21.9902 6.32915 21.5688 5.31167 20.8186 4.56152C20.0685 3.81138 19.0511 3.39001 17.9902 3.39001H5.99023C4.92937 3.39001 3.91195 3.81138 3.1618 4.56152C2.41166 5.31167 1.99023 6.32915 1.99023 7.39001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                </label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} placeholder='Email' />
                            </div>
                            <div className={focused === 'password' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Iconly/Curved/Password"> <g id="Password"> <path id="Stroke 1" fillRule="evenodd" clipRule="evenodd" d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 3" d="M10.6918 12H17.0098V13.852" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 5" d="M14.182 13.852V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 7" fillRule="evenodd" clipRule="evenodd" d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g> </g> </g></svg>
                                </label>
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} placeholder='Password' />
                            </div>
                            <div className={focused === 'confirm-password' ? 'input-div focused' : 'input-div'}>
                                <label>
                                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Iconly/Curved/Password"> <g id="Password"> <path id="Stroke 1" fillRule="evenodd" clipRule="evenodd" d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 3" d="M10.6918 12H17.0098V13.852" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 5" d="M14.182 13.852V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path id="Stroke 7" fillRule="evenodd" clipRule="evenodd" d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g> </g> </g></svg>
                                </label>
                                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setFocused('confirm-password')} onBlur={() => setFocused('')} placeholder='Confirm Password' />
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Next Step'}
                            </button>
                        </form>
                    )}

                    {regStage === 1 && (
                        <div className="social-login" style={{ width: '100%', marginTop: '1rem' }}>
                            <div className="divider" style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '10px' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                            </div>
                            <button 
                                type="button" 
                                className="google-login-btn" 
                                onClick={handleGoogleClick}
                                disabled={isLoading || isGoogleProcessing}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                                Sign up with Google
                            </button>
                        </div>
                    )}

                    {regStage === 2 && (
                        <form onSubmit={handleStage2}>
                            <div className={focused === 'location' ? 'input-div focused' : 'input-div'}>
                                <label><MapPin size={20} /></label>
                                <input 
                                    type="text" 
                                    required 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)} 
                                    onFocus={() => setFocused('location')} 
                                    onBlur={() => setFocused('')} 
                                    placeholder='Search and select location' 
                                    list="location-options"
                                />
                                <datalist id="location-options">
                                    {locationOptions.map((opt) => (
                                        <option key={opt} value={opt} />
                                    ))}
                                </datalist>
                            </div>
                            <div className={focused === 'profession' ? 'input-div focused' : 'input-div'}>
                                <label><Briefcase size={20} /></label>
                                <input 
                                    type="text" 
                                    required 
                                    value={profession} 
                                    onChange={(e) => setProfession(e.target.value)} 
                                    onFocus={() => setFocused('profession')} 
                                    onBlur={() => setFocused('')} 
                                    placeholder='Search and select profession' 
                                    list="profession-options"
                                />
                                <datalist id="profession-options">
                                    {professionOptions.map((opt) => (
                                        <option key={opt} value={opt} />
                                    ))}
                                </datalist>
                            </div>
                            <div className={focused === 'experience' ? 'input-div focused' : 'input-div'}>
                                <label><TrendingUp size={20} /></label>
                                <select 
                                    required 
                                    value={experienceLevel} 
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    onFocus={() => setFocused('experience')}
                                    onBlur={() => setFocused('')}
                                    style={{ 
                                        width: '100%', 
                                        border: 'none', 
                                        outline: 'none', 
                                        background: 'transparent',
                                        fontSize: '0.95rem',
                                        color: experienceLevel ? '#333' : '#999',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled>Select Experience Level</option>
                                    <option value="Entry Level (0-1 years)">Entry Level (0-1 years)</option>
                                    <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                                    <option value="Intermediate (3-5 years)">Intermediate (3-5 years)</option>
                                    <option value="Senior (5+ years)">Senior (5+ years)</option>
                                    <option value="Lead/Managerial">Lead/Managerial</option>
                                </select>
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Next Step'}
                            </button>
                        </form>
                    )}

                    {regStage === 4 && (
                        <form onSubmit={handleStage4} style={{ width: '100%' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#555' }}>Choose your avatar:</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    {AVATAR_STYLES.map((style) => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => setAvatarStyle(style)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '999px',
                                                border: `1px solid ${avatarStyle === style ? '#ff8c00' : '#ddd'}`,
                                                background: avatarStyle === style ? '#fff3e0' : '#fff',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                                    {AVATAR_VARIANTS.map((variant) => {
                                        const src = buildAvatarUrl(avatarStyle, `${fullName || email || 'SkillMatchUser'}-${variant}`);
                                        const active = avatarVariant === variant;
                                        return (
                                            <button
                                                key={variant}
                                                type="button"
                                                onClick={() => setAvatarVariant(variant)}
                                                style={{
                                                    border: active ? '2px solid #ff8c00' : '1px solid #ddd',
                                                    borderRadius: '12px',
                                                    padding: '2px',
                                                    background: '#fff',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <img src={src} alt={`Avatar ${variant}`} style={{ width: '100%', display: 'block' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="skills-grid">
                                {diverseSkills.map((skill, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => toggleSkill(skill.title)}
                                        className={`skill-pill ${skills.includes(skill.title) ? 'selected' : ''}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            borderRadius: '25px',
                                            border: '1.5px solid #eee',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            background: skills.includes(skill.title) ? '#ff8c0020' : 'white',
                                            borderColor: skills.includes(skill.title) ? '#ff8c00' : '#eee',
                                            color: skills.includes(skill.title) ? '#ff8c00' : '#333',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <span style={{ marginRight: '8px' }}>{skill.icon}</span>
                                        {skill.title}
                                    </div>
                                ))}
                            </div>

                            <div className="manual-skill-input" style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#555' }}>Don't see your skill? Add it manually:</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div className="input-div" style={{ flex: 1, marginBottom: 0 }}>
                                        <label><Plus size={18} /></label>
                                        <input 
                                            type="text" 
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addManualSkill())}
                                            placeholder="Type a skill..."
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={addManualSkill}
                                        style={{
                                            padding: '0 15px',
                                            borderRadius: '8px',
                                            border: '1px solid #ff8c00',
                                            background: 'transparent',
                                            color: '#ff8c00',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {skills.length > 0 && (
                                <div className="selected-skills-summary" style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Selected ({skills.length}):</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {skills.map(s => (
                                            <span key={s} style={{ 
                                                background: '#ff8c00', 
                                                color: 'white', 
                                                padding: '4px 10px', 
                                                borderRadius: '15px', 
                                                fontSize: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {s} <X size={12} onClick={() => toggleSkill(s)} style={{ cursor: 'pointer' }} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="login-button" 
                                disabled={isLoading || skills.length === 0}
                            >
                                {isLoading ? <Loader size="small" /> : 'Finish Selection'}
                            </button>
                        </form>
                    )}

                    {regStage === 5 && (
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
                                        inputMode="numeric"
                                        pattern="\d*"
                                    />
                                ))}
                            </div>
                            <div className="resend-container">
                                <p>Didn't get the code? <span onClick={handleResendCode}>Resend Code</span></p>
                            </div>
                            <button type="submit" className="login-button" disabled={isLoading}>
                                {isLoading ? <Loader size="small" /> : 'Verify Account'}
                            </button>
                        </form>
                    )}

                    <div className="signup-link" style={{ marginTop: '2rem' }}>
                        {regStage > 1 && (
                            <p style={{ marginBottom: '10px' }}>
                                Not you? <span onClick={() => {
                                    localStorage.removeItem('regUserId');
                                    localStorage.removeItem('regStage');
                                    localStorage.removeItem('regEmail');
                                    localStorage.removeItem('regAuthProvider');
                                    setRegStage(1);
                                    setUserId(null);
                                    setEmail('');
                                    setIsGoogleOnboarding(false);
                                }}>Start over</span>
                            </p>
                        )}
                        <p>Already have an account? <span onClick={() => setHasAccount(true)}>Sign In</span></p>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    )
}
