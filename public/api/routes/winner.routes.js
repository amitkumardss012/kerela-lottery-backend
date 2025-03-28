"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const winner = (0, express_1.Router)();
// Route to get all active lotteries (accessible to all Buyers)
winner.get("/all", controllers_1.WinnerController.getAllWinners);
winner.get("/search", controllers_1.WinnerController.searchWinner);
winner.get("/:id", controllers_1.WinnerController.getWinnerById);
winner.use(auth_middleware_1.authenticate);
winner.post("/create", auth_middleware_1.allowSubAdmin, controllers_1.WinnerController.createWinner);
winner.get("/lottery/:id", auth_middleware_1.isAdmin, controllers_1.WinnerController.getWinnerByLotteryId);
winner
    .route("/:id")
    .post(auth_middleware_1.isAdmin, controllers_1.WinnerController.markAsClaimed)
    .put(controllers_1.WinnerController.updateWinner)
    .delete(auth_middleware_1.isAdmin, controllers_1.WinnerController.deleteWinner);
exports.default = winner;
