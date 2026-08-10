"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const lottery = (0, express_1.Router)();
// 🎫 Route to get all active lotteries (accessible to all Buyers)
lottery.get("/all-active", controllers_1.LotteryController.getActiveLottery);
// 🛡️ Apply authentication and admin check for the rest of routes
lottery.use(auth_middleware_1.authenticate, auth_middleware_1.isAdmin);
// 🆕 Route to create a new lottery (Admin only)
lottery.post("/create", middlewares_1.multerUpload.single("image"), controllers_1.LotteryController.createLottery);
// 📋 Route to get all lotteries, including inactive ones (Admin only)
lottery.get("/all", controllers_1.LotteryController.getAllLotteries);
// 🎯 Routes for getting, updating, and deleting a lottery by ID (Admin only)
lottery
    .route("/:id")
    .get(controllers_1.LotteryController.getLotteryById) // 🔍 Get lottery details by ID
    .put(middlewares_1.multerUpload.single("image"), controllers_1.LotteryController.updateLottery) // ✏️ Update lottery details by ID
    .delete(controllers_1.LotteryController.deleteLottery); // 🗑️ Delete a lottery by ID
// 📤 Export the router to be used in the main application
exports.default = lottery;
