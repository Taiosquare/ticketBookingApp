const fetch = require("node-fetch");

const fetchApi = async (url, method = "", token, body = {}) => {
    const params = {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),    
    };

    const apiCall = await fetch(url, params);
    const response = await apiCall.json();
    
    return response;
};

const getFetchApi = async (url, method = "", token) => {
    const params = {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    const apiCall = await fetch(url, params);
    const response = await apiCall.json();
    
    return response;
};

module.exports.ApiCall = { fetchApi, getFetchApi }
