import { Router } from "express";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";
import { LotteryController } from "../controllers";
import { multerUpload } from "../middlewares";

const lottery = Router();

// 🎫 Route to get all active lotteries (accessible to all Buyers)
lottery.get("/all-active", LotteryController.getActiveLottery);

// 🛡️ Apply authentication and admin check for the rest of routes
lottery.use(authenticate, isAdmin);

// 🆕 Route to create a new lottery (Admin only)
lottery.post("/create", multerUpload.single("image"), LotteryController.createLottery);

// 📋 Route to get all lotteries, including inactive ones (Admin only)
lottery.get("/all", LotteryController.getAllLotteries);

// 🎯 Routes for getting, updating, and deleting a lottery by ID (Admin only)
lottery
  .route("/:id")
  .get(LotteryController.getLotteryById) // 🔍 Get lottery details by ID
  .put(multerUpload.single("image"), LotteryController.updateLottery) // ✏️ Update lottery details by ID
  .delete(LotteryController.deleteLottery); // 🗑️ Delete a lottery by ID

// 📤 Export the router to be used in the main application
export default lottery;

