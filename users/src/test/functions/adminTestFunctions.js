const request = require('supertest');
const { app } = require('../../app');

const approveUser = (userId, accessToken, refreshToken) => {
    const response = await request(app)
        .patch(`/admin/approveUser/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken);

    return response;
}

const setHostSuspensionStatus = (userId, body, accessToken, refreshToken) => {
    const response = await request(app)
        .patch(`/admin/suspendHost/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('refresh-token', refreshToken)
        .send(body);

    return response;
}

module.exports.AdminTestFunctions = {
    approveUser,
    setHostSuspensionStatus
}