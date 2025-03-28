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

winner.use(authenticate);
winner.post("/create", allowSubAdmin, WinnerController.createWinner);
winner.get("/lottery/:id", isAdmin, WinnerController.getWinnerByLotteryId);

winner
  .route("/:id")
  .post(isAdmin, WinnerController.markAsClaimed)
  .put(WinnerController.updateWinner)
  .delete(isAdmin, WinnerController.deleteWinner);

export default winner;
