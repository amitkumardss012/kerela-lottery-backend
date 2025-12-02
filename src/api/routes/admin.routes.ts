import { Router } from "express";
import { AdminController } from "../controllers";
import { authenticate, isAdmin } from "../middlewares/auth.middleware";

const admin = Router();

// 🔑 Authentication routes
admin.post("/login", AdminController.login); // 🔐 Handle admin login
admin.get("/logout", AdminController.logout); // 🚪 Handle admin logout

// 🛡️ Apply authentication and admin role middleware for protected routes
// admin.use(authenticate, isAdmin);

// 👤 Admin management routes
admin.post("/create", AdminController.createAdmin); // 📝 Create new admin
admin.get("/all", AdminController.AllAdmins); // 📋 Get list of all admins

// 🔍 Admin specific operations using ID
admin
  .route("/:id")
  .get(AdminController.getAdminById) // 🔎 Get admin by ID
  .delete(AdminController.deleteById); // 🗑️ Delete admin

export default admin;
