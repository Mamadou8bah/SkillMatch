const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://skillmatch-1-6nn0.onrender.com';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, { ...options, headers });
    
    // Check for unauthorized access
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/intro')) {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }
    
    // For 204 No Content
    if (response.status === 204) return null;
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    
    return data;
};

export default BASE_URL;
