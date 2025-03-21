"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const buyer = (0, express_1.Router)();
buyer.post("/buy", controllers_1.BuyerController.BuyLottery);
buyer.use(auth_middleware_1.authenticate, auth_middleware_1.isAdmin);
buyer.get("/all", controllers_1.BuyerController.getAllBuyers);
buyer.get("/search", controllers_1.BuyerController.searchBuyer);
buyer
    .route("/:id")
    .get(controllers_1.BuyerController.getBuyerById)
    .delete(controllers_1.BuyerController.deleteBuyer)
    .post(controllers_1.BuyerController.toggleBuyerStatus);
exports.default = buyer;
