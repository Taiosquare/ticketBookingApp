const request = require('supertest');
const { app, server } = require('../../app');

const createAdmin = async (user, accessToken, refreshToken) => {
    const response = await request(app)
        .post("/auth/createAdmin")
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken)
        .set('baseurl', 'http://localhost:5000')
        .send(user);

    return response;
}

const registerUser = async (userObject) => {
    const response = await request(app)
        .post("/auth/register")
        .set('baseurl', 'http://localhost:5000')
        .send(userObject);
    
    return response;
}

const loginUser = async (email, password) => {
    const response = await request(app)
        .post("/auth/login")
        .send({
            email: email,
            password: password
        });

    return response;
}

module.exports.AuthTestFunctions = {
    createAdmin,
    registerUser,
    loginUser,
}