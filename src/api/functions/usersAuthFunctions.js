const { Admin } = require("../models/admin"),
    { Host } = require("../models/host"),
    { User } = require("../models/user"),
    { Account } = require("../models/account"),
    mongoose = require("mongoose"),
    argon2 = require("argon2"),
    crypto = require("crypto"),
    AuthFunctions = require("../functions/authFunctions"),
    GeneralFunctions = require("../functions/generalFunctions"),
    { validationResult } = require("express-validator");

module.exports.adminRegister = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        if (req.admin.superAdmin == false) {
            return res.status(400).json({
                error: "Only Super Admins can Add Administrators",
            });
        }

        let admin = await Admin.findOne({
            username: req.body.username,
            email: req.body.mail
        });

        if (admin) {
            return res.status(400).json({
                error: "E-Mail Address/Username already registered",
            });
        }

        const hashedPassword = await argon2.hash(req.body.password);
        const id = mongoose.Types.ObjectId();

        const access = await AuthFunctions.generateAuthToken(id);
        const refresh = await AuthFunctions.generateRefreshToken(id);

        const { username, firstname, lastname, email } = req.body;

        const token = await crypto.randomBytes(16).toString("hex");

        const savedObject = await Admin.create({
            _id: id,
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            approvedHosts: [],
            confirmationToken: token,
            confirmationTokenExpiration: Date.now() + 3600000
        });

        const baseURL = req.headers.baseurl;

        await GeneralFunctions.sendConfirmationMail(token, email, "Admin", "admin", firstname, baseURL);

        res.status(201).json({
            message: "Admin successfully added.",
            admin: {
                _id: savedObject._id,
                username: savedObject.username,
                email: savedObject.email,
            },
            tokens: {
                access: {
                    token: access,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refresh,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        res.status(400).json({
            error: "Admin could not be added, please try again.",
        });
    }
};

module.exports.adminLogin = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        const { username, password } = req.body;

        let admin = await Admin.findOne({ username: username });

        if (!admin) {
            return res.status(400).json({ error: "Invalid Username or Password" });
        }

        if (admin.accountSuspended == true) {
            return res.status(200).json({
                message:
                    "Your account has been suspended, please contact a super admin",
            });
        }

        if (!await argon2.verify(admin.password, password)) {
            return res.status(400).json({
                error: "Invalid Username or Password"
            });
        }

        const refreshToken = await AuthFunctions.generateRefreshToken(admin._id);
        const accessToken = await AuthFunctions.generateAuthToken(admin._id);

        admin.token = refreshToken;

        await admin.save();

        res.status(200).json({
            message: "Admin Login Successful",
            admin: {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
            },
            tokens: {
                access: {
                    token: accessToken,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refreshToken,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        res.status(400).json({
            error: "Login Process Failed, Please Try Again"
        });
    }
};

module.exports.hostRegister = async (req, res) => {
    try {
        const errors = validationResult(req);

        const { brandName, brandType, brandDescription, brandEmail, password,
            brandWebsite, brandPhoneNumber, brandProfilePicture, address } = req.body;

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let host = await Host.findOne({
            $or: [{ brandName: brandName },
            { email: brandEmail }]
        });

        if (host) {
            return res.status(400).json({
                error: "Service Provider already registered",
            });
        }

        const hashedPassword = await argon2.hash(password),
            id = mongoose.Types.ObjectId(),
            access = await AuthFunctions.generateAuthToken(id),
            refresh = await AuthFunctions.generateRefreshToken(id);

        const savedObject = await Host.create({
            _id: id,
            brandName: brandName,
            brandType: brandType,
            brandDescription: brandDescription,
            email: brandEmail,
            password: hashedPassword,
            brandWebsite: brandWebsite,
            brandPhoneNumber: brandPhoneNumber,
            brandProfilePicture: brandProfilePicture,
            address: address,
            events: []
        });

        await Account.create({
            _id: mongoose.Types.ObjectId(),
            accountName: "",
            accountNumber: "",
            bank: "",
            host: id,
            payments: []
        });

        const baseURL = req.headers.baseurl;

        const token = await crypto.randomBytes(16).toString("hex");

        await GeneralFunctions.sendConfirmationMail(token, brandEmail, "Host", "host", brandName, baseURL);

        res.status(201).json({
            message: "Host successfully registered.",
            host: {
                _id: savedObject._id,
                name: savedObject.brandName,
                email: savedObject.email,
            },
            tokens: {
                access: {
                    token: access,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refresh,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        res.status(400).json({
            error: "Host could not be registered, please try again.",
        });
    }
};

exports.hostLogin = async (req, res) => {
    try {
        const errors = validationResult(req);

        const { brandEmail, password } = req.body;

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let host = await Host.findOne({
            email: brandEmail,
        });

        if (!host) {
            return res.status(400).json({
                error: "Invalid Email or Password"
            });
        }

        if (!await argon2.verify(host.password, password)) {
            return res.status(400).json({
                error: "Invalid Email or Password"
            });
        }

        let refreshToken = await AuthFunctions.generateRefreshToken(host._id),
            accessToken = await AuthFunctions.generateAuthToken(host._id);

        host.token = refreshToken;

        await host.save();

        res.status(200).json({
            message: "Host Login Successful",
            host: {
                _id: host._id,
                name: host.brandName,
                email: host.brandEmail,
            },
            tokens: {
                access: {
                    token: accessToken,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refreshToken,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        res.status(400).json({ error: "Login Process Failed, Please Try Again" });
    }
};

exports.userRegister = async (req, res) => {
    try {
        const errors = validationResult(req);

        const { username, firstname, lastname, email, password } = req.body;

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let user = await User.findOne({
            $or: [{ username: username },
            { email: email }]
        });

        if (user) {
            return res.status(400).json({
                error: "User already registered",
            });
        }

        const hashedPassword = await argon2.hash(password),
            id = mongoose.Types.ObjectId(),
            access = await AuthFunctions.generateAuthToken(id),
            refresh = await AuthFunctions.generateRefreshToken(id);

        const savedObject = User.create({
            _id: id,
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            bookedEvents: [],
            payments: [],
            ratedEvents: []
        });

        const baseURL = req.headers.baseurl;

        const token = await crypto.randomBytes(16).toString("hex");

        await GeneralFunctions.sendConfirmationMail(token, email, "User", "user", firstname, baseURL);

        res.status(201).json({
            message: "User successfully registered.",
            user: {
                _id: savedObject._id,
                firstname: savedObject.firstname,
                lastname: savedObject.lastname,
                email: savedObject.email,
            },
            tokens: {
                access: {
                    token: access,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refresh,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        console.log(error);

        res.status(400).json({
            error: "User could not be registered, please try again.",
        });
    }
};

exports.userLogin = async (req, res) => {
    try {
        const errors = validationResult(req);

        const { email, password } = req.body;

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: await GeneralFunctions.validationErrorCheck(errors)
            });
        }

        let user = await User.findOne({
            email: email,
        });

        if (!user) {
            return res.status(400).json({
                error: "Invalid Email or Password"
            });
        }

        if (!await argon2.verify(user.password, password)) {
            return res.status(400).json({
                error: "Invalid Email or Password"
            });
        }

        let refreshToken = await AuthFunctions.generateRefreshToken(user._id),
            accessToken = await AuthFunctions.generateAuthToken(user._id);

        user.token = refreshToken;

        await user.save();

        res.status(200).json({
            message: "User Login Successful",
            user: {
                _id: user._id,
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
            },
            tokens: {
                access: {
                    token: accessToken,
                    expiresIn: "5m",
                },
                refresh: {
                    token: refreshToken,
                    expiresIn: "7d"
                }
            },
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Login Process Failed, Please Try Again" });
    }
};