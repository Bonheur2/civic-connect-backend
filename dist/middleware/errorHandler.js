"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlerMiddleware = void 0;
const ErrorHandlerMiddleware = (err, req, res, next) => {
    let errStatus = err.statusCode || 500;
    let errMessage = err.message || "Internal Server Error";
    if (err.name === 'ValidationError' && err.errors) {
        errMessage = Object.values(err.errors)
            .map(err => err.message)
            .join(',');
        errStatus = 400;
    }
    if (err.code && err.code === 11000 && err.keyValue) {
        errMessage = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
        errStatus = 400;
    }
    if (err.name === 'Cast Error' && err.value) {
        errMessage = `No item found with id: ${err.value}`;
        errStatus = 404;
    }
    console.log(errMessage);
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMessage,
        stack: process.env.NODE_ENV === "development" ? err.stack : {}
    });
};
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;
