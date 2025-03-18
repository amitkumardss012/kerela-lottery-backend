import { Router } from "express";
import { EnquiryController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const enquiry = Router();

enquiry.post("/create", EnquiryController.createEnquiry);

enquiry.use(authenticate, isAdmin);

enquiry.get("/all", EnquiryController.getAllEnquiries);
enquiry.get("/unread", EnquiryController.getUnreadEnquiries);
enquiry
  .route("/:id")
  .get(EnquiryController.getEnquiryById)
  .delete(EnquiryController.deleteEnquiry);

export default enquiry;
