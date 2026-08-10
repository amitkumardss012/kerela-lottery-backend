import { Router } from "express";
import { PackageTicketController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const packageTicketRoutes = Router();

// Public route: Get available pre-generated tickets for user package checkout selection
packageTicketRoutes.get(
  "/:id/available-tickets",
  PackageTicketController.getAvailablePackageTickets
);

// Admin routes below require auth & admin privileges
packageTicketRoutes.use(authenticate, isAdmin);

// Generate pre-generated tickets for a package (random or manual)
packageTicketRoutes.post(
  "/:id/generate-tickets",
  PackageTicketController.generatePackageTickets
);

// Get pre-generated tickets list for a package (Admin)
packageTicketRoutes.get(
  "/:id/tickets",
  PackageTicketController.getPackageTickets
);

// Delete an unsold pre-generated ticket (Admin)
packageTicketRoutes.delete(
  "/tickets/:ticketId",
  PackageTicketController.deletePackageTicket
);

export default packageTicketRoutes;
