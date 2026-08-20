import { asyncHandler } from "../middlewares";
import { LeadService } from "../services/lead.service";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import {
  UpsertLeadValidator,
  UpdateLeadTransactionValidator,
  GetAllLeadsQueryValidator,
  UpdateLeadStatusValidator,
  UpdateLeadNotesValidator,
  AssignLeadValidator,
  BulkUpdateLeadStatusValidator,
  BulkAssignLeadValidator,
  BulkDeleteLeadsValidator,
  UpdateSubmissionStatusValidator,
} from "../validators/lead.validator";

/**
 * @desc Upsert Lead Customer details (Step 1 Form)
 * @route POST /api/v1/lead/upsert
 * @access Public (User-side)
 */
export const upsertLead = asyncHandler(async (req, res, next) => {
  const validatedData = UpsertLeadValidator.parse(req.body);

  const result = await LeadService.upsertLead(validatedData);

  return SuccessResponse(
    res,
    "Lead details captured successfully",
    result,
    statusCode.Created
  );
});

/**
 * @desc Update Lead with Transaction ID (Step 2 Payment QR)
 * @route PATCH /api/v1/lead/transaction
 * @access Public (User-side)
 */
export const updateLeadTransaction = asyncHandler(async (req, res, next) => {
  const validatedData = UpdateLeadTransactionValidator.parse(req.body);

  const updatedSubmission = await LeadService.updateLeadTransaction(validatedData);

  if (!updatedSubmission) {
    return next(new ErrorResponse("Lead submission record not found", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    "Lead transaction ID updated successfully",
    updatedSubmission,
    statusCode.OK
  );
});

/**
 * @desc Get All Lead Customers ordered strictly by most recent submission (with filters & sub-admin protection)
 * @route GET /api/v1/lead/admin/all
 * @access Protected (Admin & Sub Admin)
 */
export const getAllLeadCustomers = asyncHandler(async (req, res, next) => {
  const query = GetAllLeadsQueryValidator.parse(req.query);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.getAllLeadCustomers(query, adminUser);

  return SuccessResponse(
    res,
    "Lead customers fetched successfully",
    result,
    statusCode.OK
  );
});

/**
 * @desc Get Lead Customer by ID with full details & submission history
 * @route GET /api/v1/lead/admin/:id
 * @access Protected (Admin & Sub Admin)
 */
export const getLeadCustomerById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid Lead Customer ID", statusCode.Bad_Request));
  }

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.getLeadCustomerById(id, adminUser);

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead customer not found", statusCode.Not_Found));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: You are not assigned to this lead", statusCode.Forbidden));
  }

  return SuccessResponse(
    res,
    "Lead customer fetched successfully",
    result.customer,
    statusCode.OK
  );
});

/**
 * @desc Update Lead Customer Status manually by Admin / Sub-Admin
 * @route PATCH /api/v1/lead/admin/:id/status
 * @access Protected (Admin & Sub Admin)
 */
export const updateLeadCustomerStatus = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid Lead Customer ID", statusCode.Bad_Request));
  }

  const validatedData = UpdateLeadStatusValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.updateLeadCustomerStatus(id, validatedData, adminUser);

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead customer not found", statusCode.Not_Found));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: You are not authorized to modify this lead", statusCode.Forbidden));
  }

  return SuccessResponse(
    res,
    "Lead customer status updated successfully",
    result.customer,
    statusCode.OK
  );
});

/**
 * @desc Get Aggregated Lead CRM Analytics & KPIs
 * @route GET /api/v1/lead/admin/stats
 * @access Protected (Admin & Sub Admin)
 */
export const getLeadStats = asyncHandler(async (req, res, next) => {
  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const stats = await LeadService.getLeadStats(adminUser);

  return SuccessResponse(
    res,
    "Lead CRM statistics fetched successfully",
    stats,
    statusCode.OK
  );
});

/**
 * @desc Update Internal CRM Notes for a lead
 * @route PATCH /api/v1/lead/admin/:id/notes
 * @access Protected (Admin & Sub Admin)
 */
export const updateLeadNotes = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid Lead Customer ID", statusCode.Bad_Request));
  }

  const validatedData = UpdateLeadNotesValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.updateLeadNotes(id, validatedData, adminUser);

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead customer not found", statusCode.Not_Found));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: You are not authorized to modify this lead", statusCode.Forbidden));
  }

  return SuccessResponse(
    res,
    "Lead notes updated successfully",
    result.customer,
    statusCode.OK
  );
});

/**
 * @desc Assign or Reassign Lead to Sub-Admin (Super Admin Only)
 * @route PATCH /api/v1/lead/admin/:id/assign
 * @access Protected (Super Admin Only)
 */
export const assignLeadSubAdmin = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid Lead Customer ID", statusCode.Bad_Request));
  }

  const validatedData = AssignLeadValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.assignLeadSubAdmin(id, validatedData, adminUser);

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: Only super admins can assign leads", statusCode.Forbidden));
  }

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead customer not found", statusCode.Not_Found));
  }

  if (result.status === "sub_admin_not_found") {
    return next(new ErrorResponse("Selected sub-admin does not exist", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    "Lead assigned to sub-admin successfully",
    result.customer,
    statusCode.OK
  );
});

/**
 * @desc Bulk Update Status for multiple selected lead IDs
 * @route POST /api/v1/lead/admin/bulk-status
 * @access Protected (Admin & Sub Admin)
 */
export const bulkUpdateLeadStatus = asyncHandler(async (req, res, next) => {
  const validatedData = BulkUpdateLeadStatusValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.bulkUpdateLeadStatus(validatedData, adminUser);

  if (result.status === "limit_exceeded") {
    return next(new ErrorResponse("Cannot process more than 25 leads in a single batch operation", statusCode.Bad_Request));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied", statusCode.Forbidden));
  }

  return SuccessResponse(
    res,
    `Successfully updated status for ${result.updatedCount} lead(s)`,
    { updatedCount: result.updatedCount },
    statusCode.OK
  );
});

/**
 * @desc Bulk Assign Leads to a Sub-Admin (Super Admin Only)
 * @route POST /api/v1/lead/admin/bulk-assign
 * @access Protected (Super Admin Only)
 */
export const bulkAssignLeads = asyncHandler(async (req, res, next) => {
  const validatedData = BulkAssignLeadValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.bulkAssignLeads(validatedData, adminUser);

  if (result.status === "limit_exceeded") {
    return next(new ErrorResponse("Cannot process more than 25 leads in a single batch operation", statusCode.Bad_Request));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: Only super admins can assign leads", statusCode.Forbidden));
  }

  if (result.status === "sub_admin_not_found") {
    return next(new ErrorResponse("Selected sub-admin does not exist", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    `Successfully assigned ${result.updatedCount} lead(s)`,
    { updatedCount: result.updatedCount },
    statusCode.OK
  );
});

/**
 * @desc Delete Single Lead Customer (Super Admin Only)
 * @route DELETE /api/v1/lead/admin/:id
 * @access Protected (Super Admin Only)
 */
export const deleteLeadCustomer = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid Lead Customer ID", statusCode.Bad_Request));
  }

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.deleteLeadCustomer(id, adminUser);

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: Only super admins can delete leads", statusCode.Forbidden));
  }

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead customer not found", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    "Lead customer deleted successfully",
    null,
    statusCode.OK
  );
});

/**
 * @desc Bulk Delete Lead Customers (Super Admin Only)
 * @route POST /api/v1/lead/admin/bulk-delete
 * @access Protected (Super Admin Only)
 */
export const bulkDeleteLeads = asyncHandler(async (req, res, next) => {
  const validatedData = BulkDeleteLeadsValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.bulkDeleteLeads(validatedData, adminUser);

  if (result.status === "limit_exceeded") {
    return next(new ErrorResponse("Cannot process more than 25 leads in a single batch operation", statusCode.Bad_Request));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: Only super admins can delete leads", statusCode.Forbidden));
  }


  return SuccessResponse(
    res,
    `Successfully deleted ${result.deletedCount} lead record(s)`,
    { deletedCount: result.deletedCount },
    statusCode.OK
  );
});

/**
 * @desc Update single Submission Attempt Status
 * @route PATCH /api/v1/lead/admin/submission/:id/status
 * @access Protected (Admin & Sub Admin)
 */
export const updateSubmissionStatus = asyncHandler(async (req, res, next) => {
  const submissionId = Number(req.params.id);
  if (!submissionId || isNaN(submissionId)) {
    return next(new ErrorResponse("Invalid Submission ID", statusCode.Bad_Request));
  }

  const validatedData = UpdateSubmissionStatusValidator.parse(req.body);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.updateSubmissionStatus(submissionId, validatedData, adminUser);

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead submission record not found", statusCode.Not_Found));
  }

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: You are not authorized to modify this attempt", statusCode.Forbidden));
  }

  return SuccessResponse(
    res,
    "Submission attempt updated successfully",
    result.submission,
    statusCode.OK
  );
});

/**
 * @desc Delete Single Submission Attempt (Super Admin Only)
 * @route DELETE /api/v1/lead/admin/submission/:id
 * @access Protected (Super Admin Only)
 */
export const deleteSubmission = asyncHandler(async (req, res, next) => {
  const submissionId = Number(req.params.id);
  if (!submissionId || isNaN(submissionId)) {
    return next(new ErrorResponse("Invalid Submission ID", statusCode.Bad_Request));
  }

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const result = await LeadService.deleteSubmission(submissionId, adminUser);

  if (result.status === "forbidden") {
    return next(new ErrorResponse("Permission Denied: Only super admins can delete submission attempts", statusCode.Forbidden));
  }

  if (result.status === "not_found") {
    return next(new ErrorResponse("Lead submission record not found", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    "Submission attempt deleted successfully",
    null,
    statusCode.OK
  );
});

/**
 * @desc Export filtered leads dataset
 * @route GET /api/v1/lead/admin/export
 * @access Protected (Admin & Sub Admin)
 */
export const exportLeads = asyncHandler(async (req, res, next) => {
  const query = GetAllLeadsQueryValidator.parse(req.query);

  const adminUser = req.admin;
  if (!adminUser) {
    return next(new ErrorResponse("Unauthorized", statusCode.Unauthorized));
  }

  const exportData = await LeadService.exportLeads(query, adminUser);

  return SuccessResponse(
    res,
    `Exported ${exportData.length} lead records successfully`,
    exportData,
    statusCode.OK
  );
});
