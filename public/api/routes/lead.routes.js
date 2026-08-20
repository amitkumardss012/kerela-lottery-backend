"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_controller_1 = require("../controllers/lead.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const leadRoute = (0, express_1.Router)();
// ==========================================
// 1. User-Side Lead Intake & Tracking APIs
// ==========================================
leadRoute.post("/upsert", lead_controller_1.upsertLead);
leadRoute.patch("/transaction", lead_controller_1.updateLeadTransaction);
// ==========================================
// 2. Admin & Sub-Admin Discovery & Analytics
// ==========================================
leadRoute.get("/admin/stats", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.getLeadStats);
leadRoute.get("/admin/all", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.getAllLeadCustomers);
leadRoute.get("/admin/export", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.exportLeads);
leadRoute.get("/admin/:id", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.getLeadCustomerById);
// ==========================================
// 3. Lead Lifecycle & CRM Actions
// ==========================================
leadRoute.patch("/admin/:id/status", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.updateLeadCustomerStatus);
leadRoute.patch("/admin/:id/notes", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.updateLeadNotes);
leadRoute.patch("/admin/:id/assign", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, lead_controller_1.assignLeadSubAdmin);
leadRoute.delete("/admin/:id", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, lead_controller_1.deleteLeadCustomer);
// ==========================================
// 4. Bulk Operations
// ==========================================
leadRoute.post("/admin/bulk-status", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.bulkUpdateLeadStatus);
leadRoute.post("/admin/bulk-assign", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, lead_controller_1.bulkAssignLeads);
leadRoute.post("/admin/bulk-delete", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, lead_controller_1.bulkDeleteLeads);
// ==========================================
// 5. Submission Attempt Management
// ==========================================
leadRoute.patch("/admin/submission/:id/status", auth_middleware_1.authenticate, auth_middleware_1.allowSubAdmin, lead_controller_1.updateSubmissionStatus);
leadRoute.delete("/admin/submission/:id", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, lead_controller_1.deleteSubmission);
exports.default = leadRoute;
