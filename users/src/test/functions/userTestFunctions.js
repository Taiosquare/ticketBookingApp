const request = require('supertest');
const { app, server } = require('../../app');

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

const createUser = (user) => {
    const response = await request(app)
        .post("/auth/register")
        .set('baseurl', 'http://localhost:5000')
        .send(user);

    return response;
}

const approveUser = () => {
    
}

module.exports.UserTestFunctions = {
    getAdminObject,
    getHostObject,
    getRegularUserObject,
    createUser,
    approveUser, 
}