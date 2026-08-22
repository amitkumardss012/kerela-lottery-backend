"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const buyer = (0, express_1.Router)();
// Admin-only operations for collection
buyer.get("/all", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.BuyerController.getAllBuyers);
buyer.get("/search", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.BuyerController.searchBuyer);
// Public & Buyer operations
buyer.post("/buy", controllers_1.BuyerController.BuyLottery);
buyer.post("/send_ticket_details", controllers_1.BuyerController.send_ticket_details);
buyer.get("/:id", controllers_1.BuyerController.getBuyerById);
// Admin-only operations on specific buyer
buyer
    .route("/:id")
    .delete(auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.BuyerController.deleteBuyer)
    .post(auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.BuyerController.toggleBuyerStatus)
    .put(auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.BuyerController.updateBuyerStatus);
buyer.put("/:id/status", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, controllers_1.BuyerController.updateBuyerStatus);
exports.default = buyer;
