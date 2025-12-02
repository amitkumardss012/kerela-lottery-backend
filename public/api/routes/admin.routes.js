"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const admin = (0, express_1.Router)();
// 🔑 Authentication routes
admin.post("/login", controllers_1.AdminController.login); // 🔐 Handle admin login
admin.get("/logout", controllers_1.AdminController.logout); // 🚪 Handle admin logout
// 🛡️ Apply authentication and admin role middleware for protected routes
// admin.use(authenticate, isAdmin);
// 👤 Admin management routes
admin.post("/create", controllers_1.AdminController.createAdmin); // 📝 Create new admin
admin.get("/all", controllers_1.AdminController.AllAdmins); // 📋 Get list of all admins
// 🔍 Admin specific operations using ID
admin
    .route("/:id")
    .get(controllers_1.AdminController.getAdminById) // 🔎 Get admin by ID
    .delete(controllers_1.AdminController.deleteById); // 🗑️ Delete admin
exports.default = admin;
