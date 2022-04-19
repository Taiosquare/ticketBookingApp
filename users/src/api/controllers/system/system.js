const { SystemFunctions } = require("../../functions/system/systemFunctions");

exports.getSignedURL = async (req, res) => {
    await SystemFunctions.uploadDocument(req, res);
};

exports.getSignedURLAuth = async (req, res) => {
    res.setHeader('access-token', req.token);

    await SystemFunctions.uploadDocument(req, res);
};