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
exports.LeadService = void 0;
const config_1 = require("../../config");
class LeadService {
    /**
     * Industry-standard Lead Customer Upsert & Lead Submission logger.
     * Deduplicates customers strictly by phone number to prevent duplicate customer profiles on page refresh.
     */
    static upsertLead(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, phone, email, state, lottery_id, ticket_package_id, selected_tickets, lead_submission_id } = data;
            const now = new Date();
            // 1. Find or Create Lead Customer by Unique Phone Number
            let customer = yield config_1.prisma.lead_customer.findUnique({
                where: { phone },
            });
            if (customer) {
                // Update existing lead customer details, increment total submission attempts, and bump latest_submission_at
                customer = yield config_1.prisma.lead_customer.update({
                    where: { id: customer.id },
                    data: {
                        name,
                        email: email || customer.email,
                        state: state || customer.state,
                        total_submissions: { increment: 1 },
                        latest_submission_at: now,
                        updatedAt: now,
                    },
                });
            }
            else {
                // Create new lead customer profile
                customer = yield config_1.prisma.lead_customer.create({
                    data: {
                        phone,
                        name,
                        email,
                        state,
                        total_submissions: 1,
                        status: "NEW",
                        latest_submission_at: now,
                    },
                });
            }
            // 2. Manage Lead Submission Entry
            let submission = null;
            if (lead_submission_id) {
                // Check if existing submission belongs to this customer
                const existingSubmission = yield config_1.prisma.lead_submission.findFirst({
                    where: {
                        id: lead_submission_id,
                        lead_customer_id: customer.id,
                    },
                });
                if (existingSubmission) {
                    submission = yield config_1.prisma.lead_submission.update({
                        where: { id: existingSubmission.id },
                        data: {
                            lottery_id: lottery_id !== null && lottery_id !== void 0 ? lottery_id : existingSubmission.lottery_id,
                            ticket_package_id: ticket_package_id !== null && ticket_package_id !== void 0 ? ticket_package_id : existingSubmission.ticket_package_id,
                            selected_tickets: selected_tickets ? selected_tickets : existingSubmission.selected_tickets,
                            step_reached: 1,
                            status: "FORM_SUBMITTED",
                            updatedAt: now,
                        },
                    });
                }
            }
            if (!submission) {
                // Create new submission for this user flow session
                submission = yield config_1.prisma.lead_submission.create({
                    data: {
                        lead_customer_id: customer.id,
                        lottery_id: lottery_id || null,
                        ticket_package_id: ticket_package_id || null,
                        selected_tickets: selected_tickets ? selected_tickets : [],
                        step_reached: 1,
                        status: "FORM_SUBMITTED",
                    },
                });
            }
            return {
                lead_customer: customer,
                lead_submission: submission,
            };
        });
    }
    /**
     * Updates Lead Submission with user-entered Payment Transaction ID (Step 2).
     */
    static updateLeadTransaction(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lead_submission_id, phone, transaction_id } = data;
            const now = new Date();
            let submission = null;
            if (lead_submission_id && lead_submission_id > 0) {
                submission = yield config_1.prisma.lead_submission.findUnique({
                    where: { id: lead_submission_id },
                    include: { lead_customer: true },
                });
            }
            if (!submission || (phone && submission.lead_customer.phone !== phone)) {
                // Fallback: search for active submission by phone number
                const customer = yield config_1.prisma.lead_customer.findUnique({
                    where: { phone },
                    include: {
                        submissions: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                    },
                });
                if (customer && customer.submissions.length > 0) {
                    submission = yield config_1.prisma.lead_submission.findUnique({
                        where: { id: customer.submissions[0].id },
                        include: { lead_customer: true },
                    });
                }
                else if (customer) {
                    // Customer exists but has no submission yet -> create one
                    submission = yield config_1.prisma.lead_submission.create({
                        data: {
                            lead_customer_id: customer.id,
                            step_reached: 2,
                            status: "TRANSACTION_ENTERED",
                            transaction_id,
                            createdAt: now,
                            updatedAt: now,
                        },
                        include: { lead_customer: true },
                    });
                }
            }
            if (!submission) {
                return null;
            }
            // Update submission transaction ID, step reached, and status
            const updatedSubmission = yield config_1.prisma.lead_submission.update({
                where: { id: submission.id },
                data: {
                    transaction_id,
                    step_reached: 2,
                    status: "TRANSACTION_ENTERED",
                    updatedAt: now,
                },
            });
            // Update customer latest_submission_at
            yield config_1.prisma.lead_customer.update({
                where: { id: submission.lead_customer_id },
                data: {
                    latest_submission_at: now,
                    updatedAt: now,
                },
            });
            return updatedSubmission;
        });
    }
    /**
     * Protected Admin Service: Fetch All Lead Customers ordered strictly by MOST RECENT submission.
     * If user is sub_admin, filters ONLY for leads assigned to that sub_admin.
     */
    static getAllLeadCustomers(query, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;
            const where = {};
            // 1. Role-Based Access Control: Sub-admins only see their assigned leads
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                where.assigned_sub_admin_id = adminId;
            }
            else if (query.assigned_sub_admin_id) {
                where.assigned_sub_admin_id = query.assigned_sub_admin_id;
            }
            // 2. Search Filter (Name or Phone)
            if (query.search && query.search.trim() !== "") {
                const searchClean = query.search.trim();
                where.OR = [
                    { name: { contains: searchClean } },
                    { phone: { contains: searchClean } },
                ];
            }
            // 3. Customer Lead Status Filter
            if (query.lead_status && query.lead_status.trim() !== "") {
                where.status = query.lead_status;
            }
            // 4. Date Range Filter on latest submission timestamp
            if (query.startDate || query.endDate) {
                where.latest_submission_at = {};
                if (query.startDate) {
                    const start = new Date(query.startDate);
                    start.setHours(0, 0, 0, 0);
                    where.latest_submission_at.gte = start;
                }
                if (query.endDate) {
                    const end = new Date(query.endDate);
                    end.setHours(23, 59, 59, 999);
                    where.latest_submission_at.lte = end;
                }
            }
            // 5. Submission Filters (Package, Lottery, or Submission Status)
            const submissionWhere = {};
            if (query.ticket_package_id) {
                submissionWhere.ticket_package_id = query.ticket_package_id;
            }
            if (query.lottery_id) {
                submissionWhere.lottery_id = query.lottery_id;
            }
            if (query.lead_submission_status) {
                submissionWhere.status = query.lead_submission_status;
            }
            if (Object.keys(submissionWhere).length > 0) {
                where.submissions = {
                    some: submissionWhere,
                };
            }
            // Execute queries
            const [totalLeads, leads] = yield Promise.all([
                config_1.prisma.lead_customer.count({ where }),
                config_1.prisma.lead_customer.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        latest_submission_at: "desc",
                    },
                    select: {
                        id: true,
                        phone: true,
                        name: true,
                        email: true,
                        state: true,
                        city: true,
                        total_submissions: true,
                        status: true,
                        notes: true,
                        latest_submission_at: true,
                        assigned_sub_admin_id: true,
                        assigned_sub_admin: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                        submissions: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                            select: {
                                id: true,
                                step_reached: true,
                                status: true,
                                transaction_id: true,
                                selected_tickets: true,
                                createdAt: true,
                                lottery: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                                ticketpackage: {
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);
            return {
                leads,
                totalLeads,
                totalPages: Math.ceil(totalLeads / limit) || 1,
                currentPage: page,
                limit,
            };
        });
    }
    /**
     * Protected Admin Service: Fetch Single Lead Customer by ID with 360° History.
     */
    static getLeadCustomerById(id, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield config_1.prisma.lead_customer.findUnique({
                where: { id },
                include: {
                    assigned_sub_admin: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    submissions: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            lottery: {
                                select: {
                                    id: true,
                                    name: true,
                                    result_date: true,
                                    result_time: true,
                                },
                            },
                            ticketpackage: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    paid_tickets: true,
                                    free_tickets: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!customer) {
                return { status: "not_found", customer: null };
            }
            // Role Security: Only role 'admin' or the specifically assigned 'sub_admin' can access
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                if (!customer.assigned_sub_admin_id || customer.assigned_sub_admin_id !== adminId) {
                    return { status: "forbidden", customer: null };
                }
            }
            else if (adminUser.role !== "admin") {
                return { status: "forbidden", customer: null };
            }
            return { status: "success", customer };
        });
    }
    /**
     * Protected Admin Service: Manually update Lead Customer status, notes, or assigned sub-admin.
     */
    static updateLeadCustomerStatus(id, data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield config_1.prisma.lead_customer.findUnique({
                where: { id },
            });
            if (!customer) {
                return { status: "not_found", customer: null };
            }
            // Role Security: Only role 'admin' or the specifically assigned 'sub_admin' can modify
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                if (!customer.assigned_sub_admin_id || customer.assigned_sub_admin_id !== adminId) {
                    return { status: "forbidden", customer: null };
                }
            }
            else if (adminUser.role !== "admin") {
                return { status: "forbidden", customer: null };
            }
            const updatePayload = {
                status: data.status,
                updatedAt: new Date(),
            };
            if (data.notes !== undefined) {
                updatePayload.notes = data.notes;
            }
            if (data.assigned_sub_admin_id !== undefined && adminUser.role === "admin") {
                updatePayload.assigned_sub_admin = data.assigned_sub_admin_id
                    ? { connect: { id: data.assigned_sub_admin_id } }
                    : { disconnect: true };
            }
            const updatedCustomer = yield config_1.prisma.lead_customer.update({
                where: { id },
                data: updatePayload,
                include: {
                    assigned_sub_admin: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
            return { status: "success", customer: updatedCustomer };
        });
    }
    /**
     * Protected Admin Service: Aggregated Lead CRM Analytics & KPIs.
     */
    static getLeadStats(adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                where.assigned_sub_admin_id = adminId;
            }
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const [totalLeads, newLeads, contactedLeads, paymentPendingLeads, verifiedLeads, convertedLeads, rejectedLeads, lostLeads, newTodayLeads,] = yield Promise.all([
                config_1.prisma.lead_customer.count({ where }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "NEW" }) }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "CONTACTED" }) }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "PAYMENT_PENDING" }) }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "VERIFIED" }) }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "CONVERTED" }) }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "REJECTED" }) }),
                config_1.prisma.lead_customer.count({ where: Object.assign(Object.assign({}, where), { status: "LOST" }) }),
                config_1.prisma.lead_customer.count({
                    where: Object.assign(Object.assign({}, where), { createdAt: { gte: todayStart } }),
                }),
            ]);
            const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";
            return {
                totalLeads,
                newLeads,
                contactedLeads,
                paymentPendingLeads,
                verifiedLeads,
                convertedLeads,
                rejectedLeads,
                lostLeads,
                newTodayLeads,
                conversionRate: parseFloat(conversionRate),
            };
        });
    }
    /**
     * Protected Admin Service: Update Internal CRM Notes.
     */
    static updateLeadNotes(id, data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield config_1.prisma.lead_customer.findUnique({
                where: { id },
            });
            if (!customer) {
                return { status: "not_found", customer: null };
            }
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                if (!customer.assigned_sub_admin_id || customer.assigned_sub_admin_id !== adminId) {
                    return { status: "forbidden", customer: null };
                }
            }
            else if (adminUser.role !== "admin") {
                return { status: "forbidden", customer: null };
            }
            const updatedCustomer = yield config_1.prisma.lead_customer.update({
                where: { id },
                data: {
                    notes: data.notes,
                    updatedAt: new Date(),
                },
            });
            return { status: "success", customer: updatedCustomer };
        });
    }
    /**
     * Protected Super Admin Service: Assign/Reassign Lead to Sub-Admin.
     */
    static assignLeadSubAdmin(id, data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUser.role !== "admin") {
                return { status: "forbidden", customer: null };
            }
            const customer = yield config_1.prisma.lead_customer.findUnique({
                where: { id },
            });
            if (!customer) {
                return { status: "not_found", customer: null };
            }
            if (data.assigned_sub_admin_id) {
                const subAdmin = yield config_1.prisma.admin.findUnique({
                    where: { id: data.assigned_sub_admin_id },
                });
                if (!subAdmin) {
                    return { status: "sub_admin_not_found", customer: null };
                }
            }
            const updatedCustomer = yield config_1.prisma.lead_customer.update({
                where: { id },
                data: {
                    assigned_sub_admin_id: data.assigned_sub_admin_id,
                    updatedAt: new Date(),
                },
                include: {
                    assigned_sub_admin: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });
            return { status: "success", customer: updatedCustomer };
        });
    }
    /**
     * Protected Admin Service: Bulk Update Status for multiple selected lead IDs (Max 25).
     */
    static bulkUpdateLeadStatus(data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.lead_ids.length > 25) {
                return { status: "limit_exceeded", updatedCount: 0 };
            }
            const where = {
                id: { in: data.lead_ids },
            };
            if (adminUser.role === "sub_admin") {
                where.assigned_sub_admin_id = Number(adminUser.id);
            }
            else if (adminUser.role !== "admin") {
                return { status: "forbidden", updatedCount: 0 };
            }
            const result = yield config_1.prisma.lead_customer.updateMany({
                where,
                data: {
                    status: data.status,
                    updatedAt: new Date(),
                },
            });
            return { status: "success", updatedCount: result.count };
        });
    }
    /**
     * Protected Super Admin Service: Bulk Assign multiple leads to a sub-admin (Max 25).
     */
    static bulkAssignLeads(data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUser.role !== "admin") {
                return { status: "forbidden", updatedCount: 0 };
            }
            if (data.lead_ids.length > 25) {
                return { status: "limit_exceeded", updatedCount: 0 };
            }
            if (data.assigned_sub_admin_id) {
                const subAdmin = yield config_1.prisma.admin.findUnique({
                    where: { id: data.assigned_sub_admin_id },
                });
                if (!subAdmin) {
                    return { status: "sub_admin_not_found", updatedCount: 0 };
                }
            }
            const result = yield config_1.prisma.lead_customer.updateMany({
                where: {
                    id: { in: data.lead_ids },
                },
                data: {
                    assigned_sub_admin_id: data.assigned_sub_admin_id,
                    updatedAt: new Date(),
                },
            });
            return { status: "success", updatedCount: result.count };
        });
    }
    /**
     * Protected Super Admin Service: Delete Single Lead Customer.
     */
    static deleteLeadCustomer(id, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUser.role !== "admin") {
                return { status: "forbidden" };
            }
            const customer = yield config_1.prisma.lead_customer.findUnique({
                where: { id },
            });
            if (!customer) {
                return { status: "not_found" };
            }
            yield config_1.prisma.lead_customer.delete({
                where: { id },
            });
            return { status: "success" };
        });
    }
    /**
     * Protected Super Admin Service: Bulk Delete Lead Customers (Max 25).
     */
    static bulkDeleteLeads(data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUser.role !== "admin") {
                return { status: "forbidden", deletedCount: 0 };
            }
            if (data.lead_ids.length > 25) {
                return { status: "limit_exceeded", deletedCount: 0 };
            }
            const result = yield config_1.prisma.lead_customer.deleteMany({
                where: {
                    id: { in: data.lead_ids },
                },
            });
            return { status: "success", deletedCount: result.count };
        });
    }
    /**
     * Protected Admin Service: Update single Submission Attempt Status.
     */
    static updateSubmissionStatus(submissionId, data, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const submission = yield config_1.prisma.lead_submission.findUnique({
                where: { id: submissionId },
                include: { lead_customer: true },
            });
            if (!submission) {
                return { status: "not_found", submission: null };
            }
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                if (!submission.lead_customer.assigned_sub_admin_id || submission.lead_customer.assigned_sub_admin_id !== adminId) {
                    return { status: "forbidden", submission: null };
                }
            }
            else if (adminUser.role !== "admin") {
                return { status: "forbidden", submission: null };
            }
            const updatedSubmission = yield config_1.prisma.lead_submission.update({
                where: { id: submissionId },
                data: {
                    status: (_a = data.status) !== null && _a !== void 0 ? _a : submission.status,
                    transaction_id: data.transaction_id !== undefined ? data.transaction_id : submission.transaction_id,
                    step_reached: (_b = data.step_reached) !== null && _b !== void 0 ? _b : submission.step_reached,
                    updatedAt: new Date(),
                },
            });
            return { status: "success", submission: updatedSubmission };
        });
    }
    /**
     * Protected Super Admin Service: Delete Single Submission Attempt.
     */
    static deleteSubmission(submissionId, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adminUser.role !== "admin") {
                return { status: "forbidden" };
            }
            const submission = yield config_1.prisma.lead_submission.findUnique({
                where: { id: submissionId },
            });
            if (!submission) {
                return { status: "not_found" };
            }
            yield config_1.prisma.lead_submission.delete({
                where: { id: submissionId },
            });
            return { status: "success" };
        });
    }
    /**
     * Protected Admin Service: Export filtered leads dataset.
     */
    static exportLeads(query, adminUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            const adminId = Number(adminUser.id);
            if (adminUser.role === "sub_admin") {
                where.assigned_sub_admin_id = adminId;
            }
            else if (query.assigned_sub_admin_id) {
                where.assigned_sub_admin_id = query.assigned_sub_admin_id;
            }
            if (query.search && query.search.trim() !== "") {
                const searchClean = query.search.trim();
                where.OR = [
                    { name: { contains: searchClean } },
                    { phone: { contains: searchClean } },
                ];
            }
            if (query.lead_status && query.lead_status.trim() !== "") {
                where.status = query.lead_status;
            }
            if (query.startDate || query.endDate) {
                where.latest_submission_at = {};
                if (query.startDate) {
                    const start = new Date(query.startDate);
                    start.setHours(0, 0, 0, 0);
                    where.latest_submission_at.gte = start;
                }
                if (query.endDate) {
                    const end = new Date(query.endDate);
                    end.setHours(23, 59, 59, 999);
                    where.latest_submission_at.lte = end;
                }
            }
            const leads = yield config_1.prisma.lead_customer.findMany({
                where,
                orderBy: { latest_submission_at: "desc" },
                take: 10000,
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    state: true,
                    city: true,
                    status: true,
                    total_submissions: true,
                    notes: true,
                    latest_submission_at: true,
                    createdAt: true,
                    assigned_sub_admin: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    submissions: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            step_reached: true,
                            status: true,
                            transaction_id: true,
                            selected_tickets: true,
                            lottery: { select: { name: true } },
                            ticketpackage: { select: { name: true, price: true } },
                        },
                    },
                },
            });
            return leads.map((lead) => {
                var _a;
                const latestSub = lead.submissions[0];
                const selectedTickets = latestSub === null || latestSub === void 0 ? void 0 : latestSub.selected_tickets;
                return {
                    id: lead.id,
                    name: lead.name,
                    phone: lead.phone,
                    email: lead.email || "",
                    state: lead.state || "",
                    city: lead.city || "",
                    status: lead.status,
                    total_submissions: lead.total_submissions,
                    notes: lead.notes || "",
                    assigned_sub_admin: lead.assigned_sub_admin ? `${lead.assigned_sub_admin.name} (${lead.assigned_sub_admin.email})` : "Unassigned",
                    latest_submission_date: lead.latest_submission_at.toISOString(),
                    created_at: lead.createdAt.toISOString(),
                    latest_package: (latestSub === null || latestSub === void 0 ? void 0 : latestSub.ticketpackage) ? `${latestSub.ticketpackage.name} (₹${latestSub.ticketpackage.price})` : "N/A",
                    latest_lottery: ((_a = latestSub === null || latestSub === void 0 ? void 0 : latestSub.lottery) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
                    latest_transaction_id: (latestSub === null || latestSub === void 0 ? void 0 : latestSub.transaction_id) || "N/A",
                    latest_submission_status: (latestSub === null || latestSub === void 0 ? void 0 : latestSub.status) || "N/A",
                    tickets_count: Array.isArray(selectedTickets) ? selectedTickets.length : 0,
                    tickets_list: Array.isArray(selectedTickets) ? selectedTickets.join(", ") : "",
                };
            });
        });
    }
}
exports.LeadService = LeadService;
exports.default = LeadService;
