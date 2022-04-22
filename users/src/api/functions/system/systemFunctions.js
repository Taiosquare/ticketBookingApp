const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../../config');
const { RouteResponse } = require("../../helpers/routeResponse");
const { StandardResponse } = require("../../helpers/standardResponse");

const getSignedURL = (req, res) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: config.S3_ACCESS_KEY,
            secretAccessKey: config.S3_SECRET_KEY
        });

        const signedURL = s3.getSignedUrl('putObject', {
            Bucket: config.S3_BUCKET,
            ContentType: 'image/jpeg',
            Key: req.body.fileName
        });

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { signedURL: signedURL }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Signed URL could not be retrieved"), res
        );
    }
}

module.exports.SystemFunctions = {
    getSignedURL
} 