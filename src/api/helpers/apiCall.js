const fetch = require("node-fetch");

const authFetchApi = async (
    url,
    method = "",
    header,
    body = {}
) => {
    let params = {
        body: JSON.stringify(body),
        method: method,
        headers: {
            Authorization: `Bearer ${header}`,
            "Content-Type": "application/json",
        },
    };
    let apiCall = await fetch(url, params);
    let response = await apiCall.json();
    return response;
};

const getFetchApi = async (
    url,
    method = "",
    header
) => {
    let params = {
        method: method,
        headers: {
            Authorization: `Bearer ${header}`,
            "Content-Type": "application/json",
        },
    };
    let apiCall = await fetch(url, params);
    let response = await apiCall.json();
    return response;
};

module.exports.apiCall = { authFetchApi, getFetchApi }
