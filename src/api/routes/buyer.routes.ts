import { Router } from "express";
import { BuyerController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const buyer = Router();

buyer.post("/buy", BuyerController.BuyLottery);

buyer.use(authenticate, isAdmin);

buyer.get("/all", BuyerController.getAllBuyers);
buyer.get("/search", BuyerController.searchBuyer);

buyer
  .route("/:id")
  .get(BuyerController.getBuyerById)
  .delete(BuyerController.deleteBuyer)
  .post(BuyerController.toggleBuyerStatus);

export default buyer;
