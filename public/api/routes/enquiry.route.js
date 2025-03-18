"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const enquiry = (0, express_1.Router)();
enquiry.post("/create", controllers_1.EnquiryController.createEnquiry);
enquiry.use(auth_middleware_1.authenticate, auth_middleware_1.isAdmin);
enquiry.get("/all", controllers_1.EnquiryController.getAllEnquiries);
enquiry.get("/unread", controllers_1.EnquiryController.getUnreadEnquiries);
enquiry
    .route("/:id")
    .get(controllers_1.EnquiryController.getEnquiryById)
    .delete(controllers_1.EnquiryController.deleteEnquiry);
exports.default = enquiry;
