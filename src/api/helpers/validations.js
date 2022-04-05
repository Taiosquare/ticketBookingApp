const { GeneralFunctions } = require("../functions/generalFunctions"),
    { StandardResponse } = require("./standardResponse"),
    { validationResult } = require("express-validator");

const payloadValidation = async (request) => {
    const errors = validationResult(request);

    if (errors.isEmpty()) {
        return StandardResponse.successMessage();
    }

    return StandardResponse.validationError(
        await GeneralFunctions.validationErrorCheck(errors)
    );
}

const userVerification = async (request, userRole) => {
    if (request.user.role == userRole) {
        return StandardResponse.successMessage();
    }
        
    return StandardResponse.validationError("Invalid User Role");
}

exports.Validations = { payloadValidation, userVerification }