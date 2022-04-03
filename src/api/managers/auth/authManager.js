const { User } = require("../../models/user");
const { GeneralFunctions } = require("../../functions/generalFunctions");
const { AuthFunctions } = require("../../functions/auth/authFunctions");
const { StandardResponse } = require("../../helpers/standardResponse");
const mongoose = require("mongoose");
const config = require("../../../../config");

const createAdmin = async (session, opts, requestBody, baseurl) => {
    try {
        const { username, name, email, password, role } = requestBody;

        const hashedPassword = await AuthFunctions.hashPassword(password);

        const token = await GeneralFunctions.createToken();

        const savedObject = await User.create([
            {
                _id: mongoose.Types.ObjectId(),
                role: role,
                username: username,
                name: name,
                email: email,
                password: hashedPassword,
                accountStatus: { approved: true },
                confirmationToken: token,
                confirmationTokenExpiration: Date.now() + 3600000
            }
        ], opts);

        await GeneralFunctions.sendConfirmationMail(token, email, name.first, baseurl);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "Admin successfully added.",
            {
                user: {
                    _id: savedObject[0]._id,
                    username: savedObject[0].username,
                    firstname: savedObject[0].firstname,
                    lastname: savedObject[0].lastname,
                    email: savedObject[0].email,
                    role: savedObject[0].role,
                }
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

const createUser = async (session, opts, requestBody, baseurl) => {
    try {
        const { username, name, email, role, password, businessDetails, profilePicture } = requestBody;

        const hashedPassword = await AuthFunctions.hashPassword(password);

        const token = await GeneralFunctions.createToken();

        const userObject = {
            _id: mongoose.Types.ObjectId(),
            role: role,
            username: username,
            name: name,
            email: email,
            password: hashedPassword,
            profilePicture: profilePicture,
            businessDetails: businessDetails,
            confirmationToken: token,
            confirmationTokenExpiration: Date.now() + 3600000
        };

        if (role == "host") {
            userObject.rating = {
                averageScore: 0,
                numOfRatings: 0,
                ratings: [],
                raters: []
            }
        }

        const savedObject = await User.create([userObject], opts);

        await GeneralFunctions.sendConfirmationMail(token, email, name.first, baseurl);

        await session.commitTransaction();
        session.endSession();

        return StandardResponse.successMessage(
            "User successfully added.",
            {
                user: {
                    _id: savedObject[0]._id,
                    username: savedObject[0].username,
                    email: savedObject[0].email,
                    role: savedObject[0].role
                },
                emailConfirmationToken: token
            }
        );
    } catch (error) {
        return StandardResponse.serverError(error);
    }
}

module.exports.AuthManager = {
    createAdmin,
    createUser,
};