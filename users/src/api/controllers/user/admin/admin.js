const { User } = require("../../../models/user");
const { AdminManager } = require("../../../managers/user/admin/adminManager");
const { RouteResponse } = require("../../../helpers/routeResponse");
const { StandardResponse } = require("../../../helpers/standardResponse");
const { Validations } = require("../../../helpers/validations");
const { startSession } = require("mongoose");

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

        const approveHost = await AdminManager.approveHost(session, opts, req.params.hostId);
    
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

exports.setHostSuspensionStatus = async (req, res) => {
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
        const { status } = req.body;
        
        await User.updateOne(
            {
                _id: hostId
            },
            [
                {
                    $set: {
                        accountSuspended: status
                    }
                }
            ],
            opts
        );
        
        await session.commitTransaction();
        session.endSession();

        RouteResponse.OkMessage(
            StandardResponse.successMessage("Host Suspension Status Successfully set."), res
        );
    } catch (error) {
        console.log({ error });

        await session.abortTransaction();
        session.endSession();

        RouteResponse.internalServerError(
            StandardResponse.serverError("Host Suspension Status Failed to set, please try again."), res
        );
    }
}

exports.viewRegularUser = async (req, res) => {
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
            .populate("bookedEvents.event", "title category location.address dates")
            .populate("ratedEvents.event", "title category location.address rating.averageScore");

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

exports.viewRegularUsers = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const users = await User.find({ role: "regularUser" })
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

exports.viewHost = async (req, res) => {
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

exports.viewHosts = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        if ((req.user.role != "admin") && (req.user.role != "superAdmin")) {
            return RouteResponse.validationError(
                StandardResponse.validationError("Invalid User Role"), res
            );
        } 

        const hosts = await User.find({ role: "host" })
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

exports.viewEvents = async (req, res) => {
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

        const getEvents = await AdminManager.getEvents(req.query.page);
    
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

exports.viewAdministrator = async (req, res) => {
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

exports.viewAdministrators = async (req, res) => {
    res.setHeader('access-token', req.token);

    try {
        const userVerification = await Validations.userVerification(req, "superAdmin");

        if (userVerification.status == false) {
            return RouteResponse.validationError(userVerification, res);
        }

        const admins = await User.find({ role: "admin" })
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

        await User.updateOne(
            {
                _id: adminId
            },
            [
                {
                    $set: {
                        accountSuspended: true
                    }
                }
            ],
            opts
        );

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
