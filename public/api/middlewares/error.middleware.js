"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const zod_1 = require("zod");
const types_1 = require("../types/types");
const validators_1 = require("../validators");
const errorMiddleware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    if (err.name === "CastError")
        err.message = "Invalid ID";
    if ("code" in err && err.code === "P2025") {
        err.message = "Item not found";
    }
    // handle Zod error
    if (err instanceof zod_1.ZodError) {
        const zodErr = (0, validators_1.zodError)(err);
        res.status(types_1.statusCode.Bad_Request).json({
            success: false,
            message: "Validation Error",
            errors: zodErr,
        });
    }
    else {
        // Final Error Response
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
};
exports.default = errorMiddleware;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
