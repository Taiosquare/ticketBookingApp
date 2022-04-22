const { SystemFunctions } = require("../../functions/system/systemFunctions");

exports.getSignedURL = async (req, res) => {
    await SystemFunctions.getSignedURL(req, res);
};

exports.getSignedURLAuth = async (req, res) => {
    res.setHeader('access-token', req.token);

    await SystemFunctions.getSignedURL(req, res);
};

exports.getHomePageEvents = async (req, res) => {
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const products = await EventFunctions.getHomePageEvents();

        return RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { products: products }), res
        );
    } catch (error) {
        console.log({ error }); 

        RouteResponse.internalServerError(
            StandardResponse.serverError("Error fetching Products, please try again."), res
        );
    }
};

exports.getAllBanks = async (req, res) => {
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const getAllBanks = await SystemManager.getAllBanks();  

        if (getAllBanks.status == false) {
            if (getAllBanks.serverError == true) {
                throw getAllBanks.error;
            }
            
            return RouteResponse.badRequest(getAllBanks, res);
        } 
            
        RouteResponse.OkMessage(getAllBanks, res);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("An error occurred while fetching the banks, please try again."), res
        );
    }
};