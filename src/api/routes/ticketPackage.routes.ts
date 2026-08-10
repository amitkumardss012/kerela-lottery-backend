import { Router } from "express";
import { TicketPackageController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";
import { multerUpload } from "../middlewares";

const ticketPackage = Router();

// 🎟️ Route to get all active ticket-packages (accessible to all Buyers)
ticketPackage.get(
  "/all-active",
  TicketPackageController.getAllActiveTicketPackages
);

// 🛡️ Apply authentication and admin authorization middleware to all routes
ticketPackage.use(authenticate, isAdmin);

// 📦 Route to create a new ticket package
ticketPackage.post(
  "/create",
  multerUpload.single("image"),
  TicketPackageController.createTicketPackage
);

// 📋 Get all ticket packages (including inactive ones)
ticketPackage.get("/all", TicketPackageController.getAllTicketPackages);

// 🎯 Routes for operations on specific ticket package by ID
ticketPackage
  .route("/:id")
  // 🔍 Get ticket package by ID
  .get(TicketPackageController.getTicketPackageById)
  // ✏️ Update ticket package by ID
  .put(multerUpload.single("image"), TicketPackageController.updateTicketPackage)
  // 🗑️ Delete ticket package by ID
  .delete(TicketPackageController.deleteTicketPackage);

// 📤 Export the router
export default ticketPackage;

