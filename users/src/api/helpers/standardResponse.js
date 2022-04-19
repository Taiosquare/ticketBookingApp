const successMessage = (message = "success", data = null) => {
    const sendData = {
        status: true,
        message: message,
        data: data
    }

    return sendData;
}

const errorMessage = (error = "Your request cannot be proccessed at this time. Please try again later") => {
    const sendData = {
        status: false,
        error: error,
        data: null
    }

    return sendData;
}

const validationError = (errors) => {
    const sendData = {
        status: false,
        errors: errors,
        data: null
    }

    return sendData;
}

const serverError = (error = "Dear customer, we tried processing your request. However, there seems to be a connectivity issue. We advise you try again shortly.") => {
    const sendData = {
        status: false,
        error: error,
        data: null,
        serverError: true
    }

    return sendData;
}

const tokenError = (message = "Dear customer, your session has expired. Please login again to proceed") => {
    const sendData = {
        status: false,
        message: message,
        data: null
    }

    return sendData;
}

exports.StandardResponse = { successMessage, errorMessage, validationError, serverError, tokenError };