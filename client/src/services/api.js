import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', 
});

// This intercepts every request before it leaves your React app
API.interceptors.request.use((req) => {
    // Check if the user is logged in
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
        // Parse the token and safely attach it to the headers
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo.token) {
            req.headers['Authorization'] = `Bearer ${parsedInfo.token}`;
        }
    }
    return req;
}, (error) => {
    return Promise.reject(error);
});

export default API;