const request = require('supertest');
const { app } = require('../../app');
const { User } = require('../../api/models/user');

const getAdminObject = () => {
    const adminObject = {
        username: "Mole123",
        firstname: "Oaikhina",
        lastname: "Eromonsele",
        email: "eronoiak@gmail.com",
        password: "11720$GbesE",
        role: "admin"
    }

    return adminObject;
}

const getHostObject = () => {
    const hostObject = {
        username: "BashDot",
        firstname: "Oladotun",
        lastname: "Bashorun",
        email: "kutupa123@protonmail.com",
        password: "11720$GbesE",
        role: "host",
        position: "Sales Executive",
        businessDetails: {
            name: "Taiosquare Financials",
            email: "contact@taiosquare.com",
            type: "Educational",
            description: "We are committed to helping you learn how to make money online",
            website: "www.taiosquare.com",
            landline: "+2347049008888",
            address: "42, Georgious Cole Street, Lagos",
            documents: [
                {
                    name: "CAC",
                    link: "www.cac.com/taiosquare/reg"
                }
            ]
        }
    }

    return hostObject;
}

const getRegularUserObject = () => {
    const regularUserObject = {
        username: "Taiosquare",
        firstname: "Joshua",
        lastname: "Osaigbovo",
        email: "vikkyjoe5@gmail.com",
        password: "11720$GbesE",
        role: "regularUser"
    }

    return regularUserObject;
}

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

const deleteUser = async (email) => {
    await User.deleteOne({ email: email });
}

module.exports.AuthTestFunctions = {
    getAdminObject,
    getHostObject, 
    getRegularUserObject,
    createAdmin,
    registerUser,
    loginUser,
    deleteUser
}