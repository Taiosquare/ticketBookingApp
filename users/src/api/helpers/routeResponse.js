
const OkMessage = (data, res) => {
    return res.status(200).json(data);
}

const OkMessage201 = (data, res) => {
    return res.status(201).json(data);
}

const badRequest = (data, res) => {
    return res.status(400).json(data);
}

const validationError = (data, res) => {
    return res.status(400).json(data);
}

const internalServerError = (data, res) => {
    return res.status(500).json(data);
}

exports.RouteResponse = { OkMessage, OkMessage201, badRequest, validationError, internalServerError };

