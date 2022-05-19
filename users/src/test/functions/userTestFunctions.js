const request = require('supertest');
const { app, server } = require('../../app');
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

const getRegularUsers = async (accessToken, refreshToken) => {
    const response = await request(app)
        .get('/admin/viewRegularUsers')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const getRegularUser = async (userId, accessToken, refreshToken) => {
    const response = await request(app)
        .get(`/admin/viewRegularUser/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const getAdmins = async (accessToken, refreshToken) => {
    const response = await request(app)
        .get('/admin/viewAdmins')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const getAdmin = async (adminId, accessToken, refreshToken) => {
    const response = await request(app)
        .get(`/admin/viewAdmin/${adminId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const getHosts = async (accessToken, refreshToken) => {
    const response = await request(app)
        .get('/admin/viewHosts')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const getHost = async (hostId, accessToken, refreshToken) => {
    const response = await request(app)
        .get(`/admin/viewHost/${hostId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const deleteUser = async (email) => {
    await User.deleteOne({ email: email });
}

module.exports.UserTestFunctions = {
    getAdminObject,
    getHostObject,
    getRegularUserObject,
    getRegularUsers,
    getRegularUser,
    getAdmins,
    getAdmin,
    getHosts,
    getHost,
    deleteUser
}