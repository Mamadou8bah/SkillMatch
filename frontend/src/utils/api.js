const BASE_URL = 'http://localhost:8080';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, { ...options, headers });
    
    // For 204 No Content
    if (response.status === 204) return null;
    
    const data = await response.json();
    return data;
};

export default BASE_URL;
