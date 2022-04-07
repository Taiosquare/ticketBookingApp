const { User } = require("../../../models/user");
const { AdminManager } = require("../../../managers/user/admin/adminManager");
const { GeneralFunctions } = require("../functions/generalFunctions");
const mailer = require("../../services/mailer");

exports.approveHost = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        session.startTransaction();
        const opts = { session, new: true };

        const approveHost = await adminManager.approveHost(session, opts, req.params.hostId, req.user._id)
    
        if (approveHost.status == false) {
            throw approveHost.error;
        } 
            
        RouteResponse.OkMessage(approveHost, res);
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Host Approval Failed, please try again."), res
        );
    }
}

exports.suspendHost = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();
    
    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        session.startTransaction();
        const opts = { session, new: true };

        const { hostId } = req.params;
        
        await User.updateOne([
            {
                _id: hostId
            },
            {
                $set: {
                    accountSuspended: true
                }
            }
        ], opts);
        
        await session.commitTransaction();
        session.endSession();

        RouteResponse.OkMessage(
            StandardResponse.successMessage("Host Suspended Successfully."), res
        );
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Host Suspension Failed, please try again."), res
        );
    }
}

exports.getUser = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const { userId } = req.params;
    
        const user = await User.findById(userId)
            .select('-password -token -__v')
            .populate("bookedEvents.id", "title category location.address dates")
            .populate("ratedEvents.id", "title category location.address  rating.averageScore");

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { user: user }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("User not Found."), res
        );
    }
}

exports.getUsers = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const users = await User.find()
            .select("username firstname lastname email createdAt updatedAt");

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { users: users }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Users not Found."), res
        );
    }
}

exports.getHost = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const { hostId } = req.params;
    
        const host = await User.findById(hostId)
            .select('-password -token -__v')
            .populate("businessDetails.events", "title category location.address dates");

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { host: host }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Host not Found."), res
        );
    }
}

exports.getHosts = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const hosts = await Host.find()
            .select("businessDetails.name businessDetails.type businessDetails.email createdAt updatedAt");

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { hosts: hosts }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Hosts not Found."), res
        );
    }
}

exports.getEvents = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const getEvents = await adminManager.getEvents(req.query.page);
    
        if (getEvents.status == false) {
            throw getEvents.error;
        } 
            
        RouteResponse.OkMessage(getEvents, res);
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Events not Found."), res
        );
    }
}

exports.getAdministrator = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "superAdmin");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const { adminId } = req.params;

        const admin = await User.findById(adminId)
            .select('-password -__v -token');

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { admin: admin }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Admin Details could not be retrieved."), res
        );
    }
}

exports.getAdministrators = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const userVerification = await Validations.userVerification(req, "superAdmin");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const admins = await Admin.find()
            .select("username firstname lastname email createdAt updatedAt");

        RouteResponse.OkMessage(
            StandardResponse.successMessage(null, { admins: admins }), res
        );
    } catch (error) {
        console.log({ error });

        RouteResponse.internalServerError(
            StandardResponse.serverError("Admins not Found."), res
        );
    }
}

exports.suspendAdministrator = async (req, res) => {
    res.setHeader('access-token', req.token);
    const session = await startSession();

    try {
        const payloadValidation = await Validations.payloadValidation(req);

        if (payloadValidation.status == false) {
            return RouteResponse.validationError(payloadValidation, res);
        }

        const userVerification = await Validations.userVerification(req, "superAdmin");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        session.startTransaction();
        const opts = { session, new: true };

        const { adminId } = req.params;

        await User.updateOne([
            {
                _id: adminId
            },
            {
                $set: {
                    accountSuspended: true
                }
            }
        ], opts);

        await session.commitTransaction();
        session.endSession();

        RouteResponse.OkMessage(
            StandardResponse.successMessage("Admin Suspended Successfully."), res
        );
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Admin Suspension Failed, please try again."), res
        );
    }
}
