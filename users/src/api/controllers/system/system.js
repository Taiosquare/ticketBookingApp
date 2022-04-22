const { SystemFunctions } = require("../../functions/system/systemFunctions");

exports.getSignedURL = async (req, res) => {
    await SystemFunctions.getSignedURL(req, res);
};

exports.getSignedURLAuth = async (req, res) => {
    res.setHeader('access-token', req.token);

    await SystemFunctions.getSignedURL(req, res);
};