const config = require("../../../config");
const { User } = require("../models/user");
const { AuthFunctions } = require("../functions/auth/authFunctions");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");

        if (!authHeader) {
            return res.status(400).json({
                error: "No Authentication Header"
            });
        }

        const token = authHeader.split(" ")[1];
        const refresh = req.headers['refresh-token'];
        let decodedToken = await AuthFunctions.decodeToken(token, config.ACCESS_SECRET, refresh);
        
        if (decodedToken.error) {
            return res.status(400).json({
                error: decodedToken.error
            });
        }

        if (decodedToken.state == "expired") {
            return res.status(400).json({
                error: "Token Expired, Login"
            });
        }

        if (decodedToken.state == "active") {
            try {
                const user = await User.findById(decodedToken.token._id);

                if (user.token == null) {
                    return res.status(400).json({
                        error: "Unauthenticated User, Login"
                    });
                } else if (user.accountSuspended == true) {
                    return res.status(400).json({
                        error: "Suspended User"
                    });
                } 

                req.user = user;
                req.token = decodedToken.newToken;

                next();
            } catch (error) {
                res.status(404).json({ error: "User not Found" });
            }
        }
    } catch (error) {
        res.status(400).json({ error: "Error Authenticating User" });
    }
}














// require("dotenv").config();

// const { Admin } = require("../models/admin"),
//     { Host } = require("../models/host"),
//     { User } = require("../models/user"),
//     AuthFunctions = require("../functions/auth/authFunctions");

// const userFunc = async (req, res, next, userType, Model) => {
//     try {
//         const authHeader = req.get("Authorization");

//         if (!authHeader) {
//             return res.status(400).json({
//                 error: "No Authentication Header"
//             });
//         }

//         const token = authHeader.split(" ")[1];
//         let decodedToken;
//         let refresh = req.headers['refresh-token'];

//         decodedToken = await AuthFunctions.decodeToken(token, process.env.ACCESS_SECRET, refresh);

//         if (decodedToken.error) {
//             res.status(400).json({ error: decodedToken.error });
//         } else if (decodedToken.state == "expired") {
//             res.status(400).json({ error: "Token Expired, Login" });
//         } else if (decodedToken.state == "active") {
//             try {
//                 const user = await Model.findById(decodedToken.token._id);

//                 if (user.token == undefined) {
//                     return res.status(400).json({
//                         error: `Unauthenticated ${userType}, Login`
//                     });
//                 }

//                 req.user = user;
//                 req.token = decodedToken.newToken;

//                 next();
//             } catch (error) {
//                 res.status(404).json({ error: `${userType} not Found` });
//             }
//         }
//     } catch (error) {
//         res.status(400).json({ error: "Error Authenticating Admin" });
//     }
// }

// const admin = async (req, res, next) => {
//     userFunc(req, res, next, "admin", Admin);
// };

// const host = async (req, res, next) => {
//     userFunc(req, res, next, "host", Host);
// };

// const user = async (req, res, next) => {
//     userFunc(req, res, next, "user", User);
// };

// module.exports.admin = admin;
// module.exports.host = host;
// module.exports.user = user;
