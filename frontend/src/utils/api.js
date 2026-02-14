const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://skillmatch-1-6nn0.onrender.com';

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return true;
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        if (!payload.exp) return false;
        const exp = payload.exp * 1000;
        return Date.now() > exp;
    } catch (e) {
        return true;
    }
};

export const redirectToLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('registrationStage');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/intro')) {
        window.location.href = '/login';
    }
};

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (token && isTokenExpired(token)) {
        redirectToLogin();
        throw new Error('Token expired');
    }

    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        redirectToLogin();
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Unauthorized');
    }
    
    if (response.status === 204) return null;
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    
    return data;
};

export default BASE_URL;
