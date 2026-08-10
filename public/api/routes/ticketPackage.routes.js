"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const middlewares_1 = require("../middlewares");
const ticketPackage = (0, express_1.Router)();
// 🎟️ Route to get all active ticket-packages (accessible to all Buyers)
ticketPackage.get("/all-active", controllers_1.TicketPackageController.getAllActiveTicketPackages);
// 🛡️ Apply authentication and admin authorization middleware to all routes
ticketPackage.use(auth_middleware_1.authenticate, auth_middleware_1.isAdmin);
// 📦 Route to create a new ticket package
ticketPackage.post("/create", middlewares_1.multerUpload.single("image"), controllers_1.TicketPackageController.createTicketPackage);
// 📋 Get all ticket packages (including inactive ones)
ticketPackage.get("/all", controllers_1.TicketPackageController.getAllTicketPackages);
// 🎯 Routes for operations on specific ticket package by ID
ticketPackage
    .route("/:id")
    // 🔍 Get ticket package by ID
    .get(controllers_1.TicketPackageController.getTicketPackageById)
    // ✏️ Update ticket package by ID
    .put(middlewares_1.multerUpload.single("image"), controllers_1.TicketPackageController.updateTicketPackage)
    // 🗑️ Delete ticket package by ID
    .delete(controllers_1.TicketPackageController.deleteTicketPackage);
// 📤 Export the router
exports.default = ticketPackage;
