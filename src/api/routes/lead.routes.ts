import { Router } from "express";
import {
  upsertLead,
  updateLeadTransaction,
  getAllLeadCustomers,
  getLeadCustomerById,
  updateLeadCustomerStatus,
  getLeadStats,
  updateLeadNotes,
  assignLeadSubAdmin,
  bulkUpdateLeadStatus,
  bulkAssignLeads,
  deleteLeadCustomer,
  bulkDeleteLeads,
  updateSubmissionStatus,
  deleteSubmission,
  exportLeads,
} from "../controllers/lead.controller";
import { authenticate, allowSubAdmin, isAdmin } from "../middlewares/auth.middleware";

const leadRoute = Router();

// ==========================================
// 1. User-Side Lead Intake & Tracking APIs
// ==========================================
leadRoute.post("/upsert", upsertLead);
leadRoute.patch("/transaction", updateLeadTransaction);

// ==========================================
// 2. Admin & Sub-Admin Discovery & Analytics
// ==========================================
leadRoute.get("/admin/stats", authenticate, allowSubAdmin, getLeadStats);
leadRoute.get("/admin/all", authenticate, allowSubAdmin, getAllLeadCustomers);
leadRoute.get("/admin/export", authenticate, allowSubAdmin, exportLeads);
leadRoute.get("/admin/:id", authenticate, allowSubAdmin, getLeadCustomerById);

// ==========================================
// 3. Lead Lifecycle & CRM Actions
// ==========================================
leadRoute.patch("/admin/:id/status", authenticate, allowSubAdmin, updateLeadCustomerStatus);
leadRoute.patch("/admin/:id/notes", authenticate, allowSubAdmin, updateLeadNotes);
leadRoute.patch("/admin/:id/assign", authenticate, isAdmin, assignLeadSubAdmin);
leadRoute.delete("/admin/:id", authenticate, isAdmin, deleteLeadCustomer);

// ==========================================
// 4. Bulk Operations
// ==========================================
leadRoute.post("/admin/bulk-status", authenticate, allowSubAdmin, bulkUpdateLeadStatus);
leadRoute.post("/admin/bulk-assign", authenticate, isAdmin, bulkAssignLeads);
leadRoute.post("/admin/bulk-delete", authenticate, isAdmin, bulkDeleteLeads);

// ==========================================
// 5. Submission Attempt Management
// ==========================================
leadRoute.patch("/admin/submission/:id/status", authenticate, allowSubAdmin, updateSubmissionStatus);
leadRoute.delete("/admin/submission/:id", authenticate, isAdmin, deleteSubmission);

export default leadRoute;
