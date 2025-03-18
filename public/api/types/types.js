"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction_status = exports.statusCode = void 0;
var statusCode;
(function (statusCode) {
    // status code start with 200
    statusCode[statusCode["OK"] = 200] = "OK";
    statusCode[statusCode["Created"] = 201] = "Created";
    statusCode[statusCode["No_Content"] = 204] = "No_Content";
    // status code start with 400
    statusCode[statusCode["Bad_Request"] = 400] = "Bad_Request";
    statusCode[statusCode["Unauthorized"] = 401] = "Unauthorized";
    statusCode[statusCode["Payment_Required"] = 402] = "Payment_Required";
    statusCode[statusCode["Forbidden"] = 403] = "Forbidden";
    statusCode[statusCode["Not_Found"] = 404] = "Not_Found";
    statusCode[statusCode["Conflict"] = 409] = "Conflict";
    // status code start with 500
    statusCode[statusCode["Internal_Server_Error"] = 500] = "Internal_Server_Error";
})(statusCode || (exports.statusCode = statusCode = {}));
var transaction_status;
(function (transaction_status) {
    transaction_status["Not_Varified"] = "not_verified";
    transaction_status["Verified"] = "verified";
    transaction_status["Failed"] = "failed";
    transaction_status["Success"] = "success";
    transaction_status["Refunded"] = "refunded";
    transaction_status["Rejected"] = "rejected";
})(transaction_status || (exports.transaction_status = transaction_status = {}));
