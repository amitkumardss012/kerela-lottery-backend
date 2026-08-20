import { Prisma } from "@prisma/client";
import { prisma } from "../../config";
import {
  UpsertLeadType,
  UpdateLeadTransactionType,
  GetAllLeadsQueryType,
  UpdateLeadStatusType,
  UpdateLeadNotesType,
  AssignLeadType,
  BulkUpdateLeadStatusType,
  BulkAssignLeadType,
  BulkDeleteLeadsType,
  UpdateSubmissionStatusType,
} from "../validators/lead.validator";

export class LeadService {
  /**
   * Industry-standard Lead Customer Upsert & Lead Submission logger.
   * Deduplicates customers strictly by phone number to prevent duplicate customer profiles on page refresh.
   */
  public static async upsertLead(data: UpsertLeadType) {
    const { name, phone, email, state, lottery_id, ticket_package_id, selected_tickets, lead_submission_id } = data;
    const now = new Date();

    // 1. Find or Create Lead Customer by Unique Phone Number
    let customer = await prisma.lead_customer.findUnique({
      where: { phone },
    });

    if (customer) {
      // Update existing lead customer details, increment total submission attempts, and bump latest_submission_at
      customer = await prisma.lead_customer.update({
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
    } else {
      // Create new lead customer profile
      customer = await prisma.lead_customer.create({
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
      const existingSubmission = await prisma.lead_submission.findFirst({
        where: {
          id: lead_submission_id,
          lead_customer_id: customer.id,
        },
      });

      if (existingSubmission) {
        submission = await prisma.lead_submission.update({
          where: { id: existingSubmission.id },
          data: {
            lottery_id: lottery_id ?? existingSubmission.lottery_id,
            ticket_package_id: ticket_package_id ?? existingSubmission.ticket_package_id,
            selected_tickets: selected_tickets ? selected_tickets : (existingSubmission.selected_tickets as any),
            step_reached: 1,
            status: "FORM_SUBMITTED",
            updatedAt: now,
          },
        });
      }
    }

    if (!submission) {
      // Create new submission for this user flow session
      submission = await prisma.lead_submission.create({
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
  }

  /**
   * Updates Lead Submission with user-entered Payment Transaction ID (Step 2).
   */
  public static async updateLeadTransaction(data: UpdateLeadTransactionType) {
    const { lead_submission_id, phone, transaction_id } = data;
    const now = new Date();

    let submission = null;

    if (lead_submission_id && lead_submission_id > 0) {
      submission = await prisma.lead_submission.findUnique({
        where: { id: lead_submission_id },
        include: { lead_customer: true },
      });
    }

    if (!submission || (phone && submission.lead_customer.phone !== phone)) {
      // Fallback: search for active submission by phone number
      const customer = await prisma.lead_customer.findUnique({
        where: { phone },
        include: {
          submissions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (customer && customer.submissions.length > 0) {
        submission = await prisma.lead_submission.findUnique({
          where: { id: customer.submissions[0].id },
          include: { lead_customer: true },
        });
      } else if (customer) {
        // Customer exists but has no submission yet -> create one
        submission = await prisma.lead_submission.create({
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
    const updatedSubmission = await prisma.lead_submission.update({
      where: { id: submission.id },
      data: {
        transaction_id,
        step_reached: 2,
        status: "TRANSACTION_ENTERED",
        updatedAt: now,
      },
    });

    // Update customer latest_submission_at
    await prisma.lead_customer.update({
      where: { id: submission.lead_customer_id },
      data: {
        latest_submission_at: now,
        updatedAt: now,
      },
    });

    return updatedSubmission;
  }

  /**
   * Protected Admin Service: Fetch All Lead Customers ordered strictly by MOST RECENT submission.
   * If user is sub_admin, filters ONLY for leads assigned to that sub_admin.
   */
  public static async getAllLeadCustomers(query: GetAllLeadsQueryType, adminUser: { id: string | number; role: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.lead_customerWhereInput = {};

    // 1. Role-Based Access Control: Sub-admins only see their assigned leads
    const adminId = Number(adminUser.id);
    if (adminUser.role === "sub_admin") {
      where.assigned_sub_admin_id = adminId;
    } else if (query.assigned_sub_admin_id) {
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
      where.status = query.lead_status as any;
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
    const submissionWhere: Prisma.lead_submissionWhereInput = {};
    if (query.ticket_package_id) {
      submissionWhere.ticket_package_id = query.ticket_package_id;
    }
    if (query.lottery_id) {
      submissionWhere.lottery_id = query.lottery_id;
    }
    if (query.lead_submission_status) {
      submissionWhere.status = query.lead_submission_status as any;
    }

    if (Object.keys(submissionWhere).length > 0) {
      where.submissions = {
        some: submissionWhere,
      };
    }

    // Execute queries
    const [totalLeads, leads] = await Promise.all([
      prisma.lead_customer.count({ where }),
      prisma.lead_customer.findMany({
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
  }

  /**
   * Protected Admin Service: Fetch Single Lead Customer by ID with 360° History.
   */
  public static async getLeadCustomerById(id: number, adminUser: { id: string | number; role: string }) {
    const customer = await prisma.lead_customer.findUnique({
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
    } else if (adminUser.role !== "admin") {
      return { status: "forbidden", customer: null };
    }

    return { status: "success", customer };
  }

  /**
   * Protected Admin Service: Manually update Lead Customer status, notes, or assigned sub-admin.
   */
  public static async updateLeadCustomerStatus(
    id: number,
    data: UpdateLeadStatusType,
    adminUser: { id: string | number; role: string }
  ) {
    const customer = await prisma.lead_customer.findUnique({
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
    } else if (adminUser.role !== "admin") {
      return { status: "forbidden", customer: null };
    }

    const updatePayload: Prisma.lead_customerUpdateInput = {
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

    const updatedCustomer = await prisma.lead_customer.update({
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
  }

  /**
   * Protected Admin Service: Aggregated Lead CRM Analytics & KPIs.
   */
  public static async getLeadStats(adminUser: { id: string | number; role: string }) {
    const where: Prisma.lead_customerWhereInput = {};
    const adminId = Number(adminUser.id);

    if (adminUser.role === "sub_admin") {
      where.assigned_sub_admin_id = adminId;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      paymentPendingLeads,
      verifiedLeads,
      convertedLeads,
      rejectedLeads,
      lostLeads,
      newTodayLeads,
    ] = await Promise.all([
      prisma.lead_customer.count({ where }),
      prisma.lead_customer.count({ where: { ...where, status: "NEW" } }),
      prisma.lead_customer.count({ where: { ...where, status: "CONTACTED" } }),
      prisma.lead_customer.count({ where: { ...where, status: "PAYMENT_PENDING" } }),
      prisma.lead_customer.count({ where: { ...where, status: "VERIFIED" } }),
      prisma.lead_customer.count({ where: { ...where, status: "CONVERTED" } }),
      prisma.lead_customer.count({ where: { ...where, status: "REJECTED" } }),
      prisma.lead_customer.count({ where: { ...where, status: "LOST" } }),
      prisma.lead_customer.count({
        where: {
          ...where,
          createdAt: { gte: todayStart },
        },
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
  }

  /**
   * Protected Admin Service: Update Internal CRM Notes.
   */
  public static async updateLeadNotes(
    id: number,
    data: UpdateLeadNotesType,
    adminUser: { id: string | number; role: string }
  ) {
    const customer = await prisma.lead_customer.findUnique({
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
    } else if (adminUser.role !== "admin") {
      return { status: "forbidden", customer: null };
    }

    const updatedCustomer = await prisma.lead_customer.update({
      where: { id },
      data: {
        notes: data.notes,
        updatedAt: new Date(),
      },
    });

    return { status: "success", customer: updatedCustomer };
  }

  /**
   * Protected Super Admin Service: Assign/Reassign Lead to Sub-Admin.
   */
  public static async assignLeadSubAdmin(
    id: number,
    data: AssignLeadType,
    adminUser: { id: string | number; role: string }
  ) {
    if (adminUser.role !== "admin") {
      return { status: "forbidden", customer: null };
    }

    const customer = await prisma.lead_customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return { status: "not_found", customer: null };
    }

    if (data.assigned_sub_admin_id) {
      const subAdmin = await prisma.admin.findUnique({
        where: { id: data.assigned_sub_admin_id },
      });
      if (!subAdmin) {
        return { status: "sub_admin_not_found", customer: null };
      }
    }

    const updatedCustomer = await prisma.lead_customer.update({
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
  }

  /**
   * Protected Admin Service: Bulk Update Status for multiple selected lead IDs (Max 25).
   */
  public static async bulkUpdateLeadStatus(
    data: BulkUpdateLeadStatusType,
    adminUser: { id: string | number; role: string }
  ) {
    if (data.lead_ids.length > 25) {
      return { status: "limit_exceeded", updatedCount: 0 };
    }

    const where: Prisma.lead_customerWhereInput = {
      id: { in: data.lead_ids },
    };

    if (adminUser.role === "sub_admin") {
      where.assigned_sub_admin_id = Number(adminUser.id);
    } else if (adminUser.role !== "admin") {
      return { status: "forbidden", updatedCount: 0 };
    }

    const result = await prisma.lead_customer.updateMany({
      where,
      data: {
        status: data.status,
        updatedAt: new Date(),
      },
    });

    return { status: "success", updatedCount: result.count };
  }

  /**
   * Protected Super Admin Service: Bulk Assign multiple leads to a sub-admin (Max 25).
   */
  public static async bulkAssignLeads(
    data: BulkAssignLeadType,
    adminUser: { id: string | number; role: string }
  ) {
    if (adminUser.role !== "admin") {
      return { status: "forbidden", updatedCount: 0 };
    }

    if (data.lead_ids.length > 25) {
      return { status: "limit_exceeded", updatedCount: 0 };
    }

    if (data.assigned_sub_admin_id) {
      const subAdmin = await prisma.admin.findUnique({
        where: { id: data.assigned_sub_admin_id },
      });
      if (!subAdmin) {
        return { status: "sub_admin_not_found", updatedCount: 0 };
      }
    }

    const result = await prisma.lead_customer.updateMany({
      where: {
        id: { in: data.lead_ids },
      },
      data: {
        assigned_sub_admin_id: data.assigned_sub_admin_id,
        updatedAt: new Date(),
      },
    });

    return { status: "success", updatedCount: result.count };
  }

  /**
   * Protected Super Admin Service: Delete Single Lead Customer.
   */
  public static async deleteLeadCustomer(id: number, adminUser: { id: string | number; role: string }) {
    if (adminUser.role !== "admin") {
      return { status: "forbidden" };
    }

    const customer = await prisma.lead_customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return { status: "not_found" };
    }

    await prisma.lead_customer.delete({
      where: { id },
    });

    return { status: "success" };
  }

  /**
   * Protected Super Admin Service: Bulk Delete Lead Customers (Max 25).
   */
  public static async bulkDeleteLeads(data: BulkDeleteLeadsType, adminUser: { id: string | number; role: string }) {
    if (adminUser.role !== "admin") {
      return { status: "forbidden", deletedCount: 0 };
    }

    if (data.lead_ids.length > 25) {
      return { status: "limit_exceeded", deletedCount: 0 };
    }

    const result = await prisma.lead_customer.deleteMany({
      where: {
        id: { in: data.lead_ids },
      },
    });

    return { status: "success", deletedCount: result.count };
  }


  /**
   * Protected Admin Service: Update single Submission Attempt Status.
   */
  public static async updateSubmissionStatus(
    submissionId: number,
    data: UpdateSubmissionStatusType,
    adminUser: { id: string | number; role: string }
  ) {
    const submission = await prisma.lead_submission.findUnique({
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
    } else if (adminUser.role !== "admin") {
      return { status: "forbidden", submission: null };
    }

    const updatedSubmission = await prisma.lead_submission.update({
      where: { id: submissionId },
      data: {
        status: data.status ?? submission.status,
        transaction_id: data.transaction_id !== undefined ? data.transaction_id : submission.transaction_id,
        step_reached: data.step_reached ?? submission.step_reached,
        updatedAt: new Date(),
      },
    });

    return { status: "success", submission: updatedSubmission };
  }

  /**
   * Protected Super Admin Service: Delete Single Submission Attempt.
   */
  public static async deleteSubmission(submissionId: number, adminUser: { id: string | number; role: string }) {
    if (adminUser.role !== "admin") {
      return { status: "forbidden" };
    }

    const submission = await prisma.lead_submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return { status: "not_found" };
    }

    await prisma.lead_submission.delete({
      where: { id: submissionId },
    });

    return { status: "success" };
  }

  /**
   * Protected Admin Service: Export filtered leads dataset.
   */
  public static async exportLeads(query: GetAllLeadsQueryType, adminUser: { id: string | number; role: string }) {
    const where: Prisma.lead_customerWhereInput = {};
    const adminId = Number(adminUser.id);

    if (adminUser.role === "sub_admin") {
      where.assigned_sub_admin_id = adminId;
    } else if (query.assigned_sub_admin_id) {
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
      where.status = query.lead_status as any;
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

    const leads = await prisma.lead_customer.findMany({
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
      const latestSub = lead.submissions[0];
      const selectedTickets = latestSub?.selected_tickets as string[] | undefined;

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
        latest_package: latestSub?.ticketpackage ? `${latestSub.ticketpackage.name} (₹${latestSub.ticketpackage.price})` : "N/A",
        latest_lottery: latestSub?.lottery?.name || "N/A",
        latest_transaction_id: latestSub?.transaction_id || "N/A",
        latest_submission_status: latestSub?.status || "N/A",
        tickets_count: Array.isArray(selectedTickets) ? selectedTickets.length : 0,
        tickets_list: Array.isArray(selectedTickets) ? selectedTickets.join(", ") : "",
      };
    });
  }
}

export default LeadService;
