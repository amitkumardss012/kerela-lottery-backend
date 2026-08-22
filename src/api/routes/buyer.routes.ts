import { Router } from "express";
import { BuyerController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const buyer = Router();

// Admin-only operations for collection
buyer.get("/all", authenticate, isAdmin, BuyerController.getAllBuyers);
buyer.get("/search", authenticate, isAdmin, BuyerController.searchBuyer);

// Public & Buyer operations
buyer.post("/buy", BuyerController.BuyLottery);
buyer.post("/send_ticket_details", BuyerController.send_ticket_details);
buyer.get("/:id", BuyerController.getBuyerById);

// Admin-only operations on specific buyer
buyer
  .route("/:id")
  .delete(authenticate, isAdmin, BuyerController.deleteBuyer)
  .post(authenticate, isAdmin, BuyerController.toggleBuyerStatus)
  .put(authenticate, isAdmin, BuyerController.updateBuyerStatus);

buyer.put("/:id/status", authenticate, isAdmin, BuyerController.updateBuyerStatus);

export default buyer;
