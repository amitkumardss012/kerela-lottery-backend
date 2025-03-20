import { Router } from "express";
import { WinnerController } from "../controllers";
import {
  allowSubAdmin,
  authenticate,
  isAdmin,
} from "../middlewares/auth.middleware";

const winner = Router();

// Route to get all active lotteries (accessible to all Buyers)
winner.get("/all", WinnerController.getAllWinners);
winner.get("/search", WinnerController.searchWinner);
winner.get("/:id", WinnerController.getWinnerById);

winner.use(authenticate, allowSubAdmin);
winner.post("/create", WinnerController.createWinner);
winner.get("/lottery/:id", WinnerController.getWinnerByLotteryId);

winner
  .route("/:id")
  .post(WinnerController.markAsClaimed)
  .put(WinnerController.updateWinner)
  .delete(WinnerController.deleteWinner);

export default winner;
