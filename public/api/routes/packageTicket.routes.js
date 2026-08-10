"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const packageTicketRoutes = (0, express_1.Router)();
// Public route: Get available pre-generated tickets for user package checkout selection
packageTicketRoutes.get("/:id/available-tickets", controllers_1.PackageTicketController.getAvailablePackageTickets);
// Admin routes below require auth & admin privileges
packageTicketRoutes.use(auth_middleware_1.authenticate, auth_middleware_1.isAdmin);
// Generate pre-generated tickets for a package (random or manual)
packageTicketRoutes.post("/:id/generate-tickets", controllers_1.PackageTicketController.generatePackageTickets);
// Get pre-generated tickets list for a package (Admin)
packageTicketRoutes.get("/:id/tickets", controllers_1.PackageTicketController.getPackageTickets);
// Delete an unsold pre-generated ticket (Admin)
packageTicketRoutes.delete("/tickets/:ticketId", controllers_1.PackageTicketController.deletePackageTicket);
exports.default = packageTicketRoutes;
