"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLeads = exports.deleteSubmission = exports.updateSubmissionStatus = exports.bulkDeleteLeads = exports.deleteLeadCustomer = exports.bulkAssignLeads = exports.bulkUpdateLeadStatus = exports.assignLeadSubAdmin = exports.updateLeadNotes = exports.getLeadStats = exports.updateLeadCustomerStatus = exports.getLeadCustomerById = exports.getAllLeadCustomers = exports.updateLeadTransaction = exports.upsertLead = void 0;
const middlewares_1 = require("../middlewares");
const lead_service_1 = require("../services/lead.service");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const lead_validator_1 = require("../validators/lead.validator");
/**
 * @desc Upsert Lead Customer details (Step 1 Form)
 * @route POST /api/v1/lead/upsert
 * @access Public (User-side)
 */
exports.upsertLead = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = lead_validator_1.UpsertLeadValidator.parse(req.body);
    const result = yield lead_service_1.LeadService.upsertLead(validatedData);
    return (0, response_util_1.SuccessResponse)(res, "Lead details captured successfully", result, types_1.statusCode.Created);
}));
/**
 * @desc Update Lead with Transaction ID (Step 2 Payment QR)
 * @route PATCH /api/v1/lead/transaction
 * @access Public (User-side)
 */
exports.updateLeadTransaction = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = lead_validator_1.UpdateLeadTransactionValidator.parse(req.body);
    const updatedSubmission = yield lead_service_1.LeadService.updateLeadTransaction(validatedData);
    if (!updatedSubmission) {
        return next(new utils_1.ErrorResponse("Lead submission record not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Lead transaction ID updated successfully", updatedSubmission, types_1.statusCode.OK);
}));
/**
 * @desc Get All Lead Customers ordered strictly by most recent submission (with filters & sub-admin protection)
 * @route GET /api/v1/lead/admin/all
 * @access Protected (Admin & Sub Admin)
 */
exports.getAllLeadCustomers = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = lead_validator_1.GetAllLeadsQueryValidator.parse(req.query);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.getAllLeadCustomers(query, adminUser);
    return (0, response_util_1.SuccessResponse)(res, "Lead customers fetched successfully", result, types_1.statusCode.OK);
}));
/**
 * @desc Get Lead Customer by ID with full details & submission history
 * @route GET /api/v1/lead/admin/:id
 * @access Protected (Admin & Sub Admin)
 */
exports.getLeadCustomerById = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid Lead Customer ID", types_1.statusCode.Bad_Request));
    }
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.getLeadCustomerById(id, adminUser);
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead customer not found", types_1.statusCode.Not_Found));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: You are not assigned to this lead", types_1.statusCode.Forbidden));
    }
    return (0, response_util_1.SuccessResponse)(res, "Lead customer fetched successfully", result.customer, types_1.statusCode.OK);
}));
/**
 * @desc Update Lead Customer Status manually by Admin / Sub-Admin
 * @route PATCH /api/v1/lead/admin/:id/status
 * @access Protected (Admin & Sub Admin)
 */
exports.updateLeadCustomerStatus = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid Lead Customer ID", types_1.statusCode.Bad_Request));
    }
    const validatedData = lead_validator_1.UpdateLeadStatusValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.updateLeadCustomerStatus(id, validatedData, adminUser);
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead customer not found", types_1.statusCode.Not_Found));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: You are not authorized to modify this lead", types_1.statusCode.Forbidden));
    }
    return (0, response_util_1.SuccessResponse)(res, "Lead customer status updated successfully", result.customer, types_1.statusCode.OK);
}));
/**
 * @desc Get Aggregated Lead CRM Analytics & KPIs
 * @route GET /api/v1/lead/admin/stats
 * @access Protected (Admin & Sub Admin)
 */
exports.getLeadStats = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const stats = yield lead_service_1.LeadService.getLeadStats(adminUser);
    return (0, response_util_1.SuccessResponse)(res, "Lead CRM statistics fetched successfully", stats, types_1.statusCode.OK);
}));
/**
 * @desc Update Internal CRM Notes for a lead
 * @route PATCH /api/v1/lead/admin/:id/notes
 * @access Protected (Admin & Sub Admin)
 */
exports.updateLeadNotes = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid Lead Customer ID", types_1.statusCode.Bad_Request));
    }
    const validatedData = lead_validator_1.UpdateLeadNotesValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.updateLeadNotes(id, validatedData, adminUser);
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead customer not found", types_1.statusCode.Not_Found));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: You are not authorized to modify this lead", types_1.statusCode.Forbidden));
    }
    return (0, response_util_1.SuccessResponse)(res, "Lead notes updated successfully", result.customer, types_1.statusCode.OK);
}));
/**
 * @desc Assign or Reassign Lead to Sub-Admin (Super Admin Only)
 * @route PATCH /api/v1/lead/admin/:id/assign
 * @access Protected (Super Admin Only)
 */
exports.assignLeadSubAdmin = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid Lead Customer ID", types_1.statusCode.Bad_Request));
    }
    const validatedData = lead_validator_1.AssignLeadValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.assignLeadSubAdmin(id, validatedData, adminUser);
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: Only super admins can assign leads", types_1.statusCode.Forbidden));
    }
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead customer not found", types_1.statusCode.Not_Found));
    }
    if (result.status === "sub_admin_not_found") {
        return next(new utils_1.ErrorResponse("Selected sub-admin does not exist", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Lead assigned to sub-admin successfully", result.customer, types_1.statusCode.OK);
}));
/**
 * @desc Bulk Update Status for multiple selected lead IDs
 * @route POST /api/v1/lead/admin/bulk-status
 * @access Protected (Admin & Sub Admin)
 */
exports.bulkUpdateLeadStatus = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = lead_validator_1.BulkUpdateLeadStatusValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.bulkUpdateLeadStatus(validatedData, adminUser);
    if (result.status === "limit_exceeded") {
        return next(new utils_1.ErrorResponse("Cannot process more than 25 leads in a single batch operation", types_1.statusCode.Bad_Request));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied", types_1.statusCode.Forbidden));
    }
    return (0, response_util_1.SuccessResponse)(res, `Successfully updated status for ${result.updatedCount} lead(s)`, { updatedCount: result.updatedCount }, types_1.statusCode.OK);
}));
/**
 * @desc Bulk Assign Leads to a Sub-Admin (Super Admin Only)
 * @route POST /api/v1/lead/admin/bulk-assign
 * @access Protected (Super Admin Only)
 */
exports.bulkAssignLeads = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = lead_validator_1.BulkAssignLeadValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.bulkAssignLeads(validatedData, adminUser);
    if (result.status === "limit_exceeded") {
        return next(new utils_1.ErrorResponse("Cannot process more than 25 leads in a single batch operation", types_1.statusCode.Bad_Request));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: Only super admins can assign leads", types_1.statusCode.Forbidden));
    }
    if (result.status === "sub_admin_not_found") {
        return next(new utils_1.ErrorResponse("Selected sub-admin does not exist", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, `Successfully assigned ${result.updatedCount} lead(s)`, { updatedCount: result.updatedCount }, types_1.statusCode.OK);
}));
/**
 * @desc Delete Single Lead Customer (Super Admin Only)
 * @route DELETE /api/v1/lead/admin/:id
 * @access Protected (Super Admin Only)
 */
exports.deleteLeadCustomer = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid Lead Customer ID", types_1.statusCode.Bad_Request));
    }
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.deleteLeadCustomer(id, adminUser);
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: Only super admins can delete leads", types_1.statusCode.Forbidden));
    }
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead customer not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Lead customer deleted successfully", null, types_1.statusCode.OK);
}));
/**
 * @desc Bulk Delete Lead Customers (Super Admin Only)
 * @route POST /api/v1/lead/admin/bulk-delete
 * @access Protected (Super Admin Only)
 */
exports.bulkDeleteLeads = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = lead_validator_1.BulkDeleteLeadsValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.bulkDeleteLeads(validatedData, adminUser);
    if (result.status === "limit_exceeded") {
        return next(new utils_1.ErrorResponse("Cannot process more than 25 leads in a single batch operation", types_1.statusCode.Bad_Request));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: Only super admins can delete leads", types_1.statusCode.Forbidden));
    }
    return (0, response_util_1.SuccessResponse)(res, `Successfully deleted ${result.deletedCount} lead record(s)`, { deletedCount: result.deletedCount }, types_1.statusCode.OK);
}));
/**
 * @desc Update single Submission Attempt Status
 * @route PATCH /api/v1/lead/admin/submission/:id/status
 * @access Protected (Admin & Sub Admin)
 */
exports.updateSubmissionStatus = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const submissionId = Number(req.params.id);
    if (!submissionId || isNaN(submissionId)) {
        return next(new utils_1.ErrorResponse("Invalid Submission ID", types_1.statusCode.Bad_Request));
    }
    const validatedData = lead_validator_1.UpdateSubmissionStatusValidator.parse(req.body);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.updateSubmissionStatus(submissionId, validatedData, adminUser);
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead submission record not found", types_1.statusCode.Not_Found));
    }
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: You are not authorized to modify this attempt", types_1.statusCode.Forbidden));
    }
    return (0, response_util_1.SuccessResponse)(res, "Submission attempt updated successfully", result.submission, types_1.statusCode.OK);
}));
/**
 * @desc Delete Single Submission Attempt (Super Admin Only)
 * @route DELETE /api/v1/lead/admin/submission/:id
 * @access Protected (Super Admin Only)
 */
exports.deleteSubmission = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const submissionId = Number(req.params.id);
    if (!submissionId || isNaN(submissionId)) {
        return next(new utils_1.ErrorResponse("Invalid Submission ID", types_1.statusCode.Bad_Request));
    }
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const result = yield lead_service_1.LeadService.deleteSubmission(submissionId, adminUser);
    if (result.status === "forbidden") {
        return next(new utils_1.ErrorResponse("Permission Denied: Only super admins can delete submission attempts", types_1.statusCode.Forbidden));
    }
    if (result.status === "not_found") {
        return next(new utils_1.ErrorResponse("Lead submission record not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Submission attempt deleted successfully", null, types_1.statusCode.OK);
}));
/**
 * @desc Export filtered leads dataset
 * @route GET /api/v1/lead/admin/export
 * @access Protected (Admin & Sub Admin)
 */
exports.exportLeads = (0, middlewares_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = lead_validator_1.GetAllLeadsQueryValidator.parse(req.query);
    const adminUser = req.admin;
    if (!adminUser) {
        return next(new utils_1.ErrorResponse("Unauthorized", types_1.statusCode.Unauthorized));
    }
    const exportData = yield lead_service_1.LeadService.exportLeads(query, adminUser);
    return (0, response_util_1.SuccessResponse)(res, `Exported ${exportData.length} lead records successfully`, exportData, types_1.statusCode.OK);
}));
