import React from 'react'

import '../styles/login.css'

import { Eye,EyeOff } from 'lucide-react'
import { useState } from 'react'
export const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const[confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')

    const [focused, setFocused] = useState('')

    const [hasAccount, setHasAccount] = useState(true)

    const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="login-page">
        <div className="back-button">
            <button><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/></svg></button>
        </div>
        {hasAccount ? (
            <div className="login-form">
                <p className="welcome-back">Welcome back 👋</p>
                <p className="welcome-subheading">We are happy to see you again. To use you account, you should log in first.</p>
                <form>
                    <div className={focused==='email'?'input-div focused':'input-div'}>
                        <label ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg></label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')} placeholder='Email'/>
                    </div>
                    <div className={focused==='password'?'input-div focused':'input-div'}>
                        <label ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg></label>
                    <input type={showPassword?'text':'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={()=>setFocused('')} placeholder='Password' />
                    {showPassword ? <EyeOff className='eye-icon' onClick={() => setShowPassword(false)}/> : <Eye className='eye-icon' onClick={() => setShowPassword(true)}/>}
                    </div>
                    <div className="forgot-password">
                        <a href="/">Forgot Password?</a>
                    </div>
                    <button type="submit" className="login-button">Log In</button>
                </form>
                <div className="other-options">
                    <div className="oo-header">
                        <div className="dash"></div>
                        <p>Or Sign in with</p>
                        <div className="dash"></div>
                    </div>
                    <div className="oo-buttons">
                        <button className="google-btn oo-button">
                           <svg viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></g></svg>
                            <span>Google</span>
                        </button>
                        <button className="facebook-btn oo-button">
                            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="16" cy="16" r="14" fill="url(#paint0_linear_87_7208)"></circle> <path d="M21.2137 20.2816L21.8356 16.3301H17.9452V13.767C17.9452 12.6857 18.4877 11.6311 20.2302 11.6311H22V8.26699C22 8.26699 20.3945 8 18.8603 8C15.6548 8 13.5617 9.89294 13.5617 13.3184V16.3301H10V20.2816H13.5617V29.8345C14.2767 29.944 15.0082 30 15.7534 30C16.4986 30 17.2302 29.944 17.9452 29.8345V20.2816H21.2137Z" fill="white"></path> <defs> <linearGradient id="paint0_linear_87_7208" x1="16" y1="2" x2="16" y2="29.917" gradientUnits="userSpaceOnUse"> <stop stop-color="#18ACFE"></stop> <stop offset="1" stop-color="#0163E0"></stop> </linearGradient> </defs> </g></svg>
                            <span>Facebook</span>
                        </button>
                    </div>
                <div className="signup-link">
                    <p>Don't have an account? <span onClick={() => setHasAccount(false)}>Sign Up</span></p>
                </div>
                </div>
            </div>
        ) : (
            <div className="signup-form">
               <p className="welcome-back">Create account</p>
               <p className="welcome-subheading">Please provide us with this information in order to create an account</p>
               <form >
                <div className={focused==='name'?'input-div focused': 'input-div'}>
                    <label><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#000000"></path> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#000000"></path> </g></svg></label>
                    <input type="text" required value={fullName} onChange={(e)=>setFullName(e.target.value)} onFocus={()=>setFocused('name')} onBlur={()=>setFocused('')} placeholder='FullName' />
                </div>
                 <div className={focused==='email'?'input-div focused':'input-div'}>
                        <label ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg></label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')} placeholder='Email'/>
                    </div>
                    <div className={focused==='password'?'input-div focused':'input-div'}>
                        <label ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg></label>
                    <input type={showPassword?'text':'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={()=>setFocused('')} placeholder='Password' />
                    {showPassword ? <EyeOff className='eye-icon' onClick={() => setShowPassword(false)}/> : <Eye className='eye-icon' onClick={() => setShowPassword(true)}/>}
                    </div>
                    <div className={focused==='confirm-password'?'input-div focused':'input-div'}>
                        <label ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg></label>
                    <input type={showPassword?'text':'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('confirm-password')} onBlur={()=>setFocused('')} placeholder='Comfirm Password' />
                    {showPassword ? <EyeOff className='eye-icon' onClick={() => setShowPassword(false)}/> : <Eye className='eye-icon' onClick={() => setShowPassword(true)}/>}
                    </div>
                    <button type="submit" className="login-button">Sign Up</button>
               </form>

               <div className="signup-link" style={{marginTop:'9rem'}}>
               <p>Already have an account? <span onClick={() => setHasAccount(true)}>Sign In</span></p>
               </div>
            </div>
        )}
    </div>
    )
}
