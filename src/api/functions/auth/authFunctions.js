const config = require("../../../../config");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

const generateAuthToken = function (id) {
    const
        token = jwt.sign(
            {
                _id: id,
            },
            config.ACCESS_SECRET,
            {
                expiresIn: "5m",
            }
        ).toString();

    return token;
};

const generateRefreshToken = function (id) {
    const
        refresh = jwt.sign(
            {
                _id: id,
            },
            config.REFRESH_SECRET,
            {
                expiresIn: "7d",
            }
        ).toString();

    return refresh;
};

const refreshToken = async (token) => {
    let tok = '';

    try {
        const decodedToken = jwt.verify(token, config.REFRESH_SECRET);
        tok = await generateAuthToken(decodedToken._id);
    } catch (err) {
        if (err.message == "jwt expired") {
            tok = "expired";
        } else {
            tok = "error";
        }
    }

    return tok;
};

const decodeToken = async (token, secret, refresh) => {
    let decodedToken = {};

    try {
        decodedToken.token = jwt.verify(token, secret);

        const now = Date.now().valueOf() / 1000;

        if (typeof decodedToken.token.exp !== "undefined" && decodedToken.token.exp > now) {
            decodedToken.state = "active";
            decodedToken.newToken = token;
        }
    } catch (err) {
        if (err.message == "jwt expired") {
            let newToken = "";

            newToken = await refreshToken(refresh);

            if (newToken == "expired") {
                decodedToken.state = "expired";
            } else if (newToken == "error") {
                decodedToken.error = "Error Refreshing Token";
            } else {
                decodedToken.state = "active";
                decodedToken.token = jwt.verify(newToken, secret);
                decodedToken.newToken = newToken;
            }
        } else {
            decodedToken.error = "Error Decoding Token";
        }
    }

    return decodedToken;
}

const hashPassword = async (password) => {
    return await argon2.hash(password);
}

module.exports.AuthFunctions = {
    decodeToken,
    generateAuthToken,
    generateRefreshToken,
    hashPassword
} 
