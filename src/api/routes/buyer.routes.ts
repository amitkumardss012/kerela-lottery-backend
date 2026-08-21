import { Router } from "express";
import { BuyerController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const buyer = Router();

// Public & Buyer operations
buyer.post("/buy", BuyerController.BuyLottery);
buyer.post("/send_ticket_details", BuyerController.send_ticket_details);

// Admin-only operations
buyer.use(authenticate, isAdmin);

buyer.get("/all", BuyerController.getAllBuyers);
buyer.get("/search", BuyerController.searchBuyer);

buyer
  .route("/:id")
  .get(BuyerController.getBuyerById)
  .delete(BuyerController.deleteBuyer)
  .post(BuyerController.toggleBuyerStatus)
  .put(BuyerController.updateBuyerStatus);

buyer.put("/:id/status", BuyerController.updateBuyerStatus);

export default buyer;
