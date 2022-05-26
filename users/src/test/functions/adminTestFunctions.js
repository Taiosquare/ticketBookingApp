const request = require('supertest');
const { app } = require('../../app');

const approveUser = async (userId, accessToken, refreshToken) => {
    const response = await request(app)
        .put(`/admin/approveHost/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const setHostSuspensionStatus = async (userId, body, accessToken, refreshToken) => {
    const response = await request(app)
        .put(`/admin/suspendHost/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken)
        .send(body);

    return response;
}

module.exports.AdminTestFunctions = {
    approveUser,
    setHostSuspensionStatus
}