import { prisma } from "../../config";

class PackageTicketService {
  /**
   * Generate random tickets for a ticket package.
   * Capped at max 100 per request as required.
   */
  public static async generateRandomTickets(ticket_package_id: number, count: number) {
    if (count <= 0 || count > 100) {
      throw new Error("Count must be between 1 and 100");
    }

    const ticketPackage = await prisma.ticketpackage.findUnique({
      where: { id: ticket_package_id },
    });
    if (!ticketPackage) {
      throw new Error("Ticket package not found");
    }

    const lottery_id = ticketPackage.lottery_id ?? null;

    // Fetch all existing ticket numbers for this package to prevent duplicates
    const existingPackageTickets = await prisma.package_ticket.findMany({
      where: { ticket_package_id },
      select: { ticket_number: true },
    });
    const existingSet = new Set(existingPackageTickets.map((t) => t.ticket_number));

    const generatedTickets: {
      ticket_package_id: number;
      lottery_id: number | null;
      ticket_number: string;
      updatedAt: Date;
    }[] = [];

    let attempts = 0;
    const maxAttempts = count * 50;

    while (generatedTickets.length < count && attempts < maxAttempts) {
      attempts++;
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const ticketNumber = `KL${randomNum}`;

      if (!existingSet.has(ticketNumber)) {
        existingSet.add(ticketNumber);
        generatedTickets.push({
          ticket_package_id,
          lottery_id,
          ticket_number: ticketNumber,
          updatedAt: new Date(),
        });
      }
    }

    if (generatedTickets.length === 0) {
      throw new Error("Failed to generate unique ticket numbers");
    }

    await prisma.package_ticket.createMany({
      data: generatedTickets,
      skipDuplicates: true,
    });

    return generatedTickets;
  }

  /**
   * Manually generate tickets by providing custom ticket numbers.
   */
  public static async generateManualTickets(
    ticket_package_id: number,
    ticketNumbers: string[]
  ) {
    const ticketPackage = await prisma.ticketpackage.findUnique({
      where: { id: ticket_package_id },
    });
    if (!ticketPackage) {
      throw new Error("Ticket package not found");
    }

    const lottery_id = ticketPackage.lottery_id ?? null;

    // Clean and validate ticket numbers
    const cleanNumbers = Array.from(
      new Set(
        ticketNumbers
          .map((t) => t.trim().toUpperCase())
          .filter((t) => t.length >= 3)
      )
    );

    if (cleanNumbers.length === 0) {
      throw new Error("Please provide at least one valid ticket number");
    }

    // Check existing ticket numbers in DB for this package
    const existing = await prisma.package_ticket.findMany({
      where: {
        ticket_package_id,
        ticket_number: { in: cleanNumbers },
      },
      select: { ticket_number: true },
    });

    if (existing.length > 0) {
      const duplicates = existing.map((e) => e.ticket_number).join(", ");
      throw new Error(`The following ticket number(s) already exist for this package: ${duplicates}`);
    }

    const ticketsToCreate = cleanNumbers.map((num) => ({
      ticket_package_id,
      lottery_id,
      ticket_number: num,
      updatedAt: new Date(),
    }));

    await prisma.package_ticket.createMany({
      data: ticketsToCreate,
      skipDuplicates: true,
    });

    return ticketsToCreate;
  }

  /**
   * Get pre-generated tickets for a package (Admin query with status stats & pagination).
   */
  public static async getByPackageId(
    ticket_package_id: number,
    is_sold?: boolean,
    page: number = 1,
    limit: number = 100
  ) {
    const baseWhere = { ticket_package_id };
    const ticketsWhere: any = { ticket_package_id };

    if (typeof is_sold === "boolean") {
      ticketsWhere.is_sold = is_sold;
    }

    const [tickets, totalFilteredCount, totalCount, availableCount, soldCount] = await Promise.all([
      prisma.package_ticket.findMany({
        where: ticketsWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ is_sold: "asc" }, { createdAt: "desc" }],
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.package_ticket.count({ where: ticketsWhere }),
      prisma.package_ticket.count({ where: baseWhere }),
      prisma.package_ticket.count({
        where: { ticket_package_id, is_sold: false },
      }),
      prisma.package_ticket.count({
        where: { ticket_package_id, is_sold: true },
      }),
    ]);

    return {
      tickets,
      totalCount,
      availableCount,
      soldCount,
      totalFilteredCount,
      page,
      totalPages: Math.ceil(totalFilteredCount / limit) || 1,
      hasNextPage: page * limit < totalFilteredCount,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Get paginated pre-generated tickets (with optional status filter) for public user ticket view.
   */
  public static async getPublicTickets(
    ticket_package_id: number,
    page: number = 1,
    limit: number = 100,
    status?: "all" | "available" | "sold"
  ) {
    const baseWhere = { ticket_package_id };
    const ticketsWhere: any = { ticket_package_id };

    if (status === "available") {
      ticketsWhere.is_sold = false;
    } else if (status === "sold") {
      ticketsWhere.is_sold = true;
    }

    const [tickets, totalFilteredCount, totalCount, availableCount, soldCount] = await Promise.all([
      prisma.package_ticket.findMany({
        where: ticketsWhere,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          ticket_number: true,
          is_sold: true,
        },
        orderBy: [{ is_sold: "asc" }, { createdAt: "asc" }],
      }),
      prisma.package_ticket.count({ where: ticketsWhere }),
      prisma.package_ticket.count({ where: baseWhere }),
      prisma.package_ticket.count({
        where: { ticket_package_id, is_sold: false },
      }),
      prisma.package_ticket.count({
        where: { ticket_package_id, is_sold: true },
      }),
    ]);

    return {
      tickets,
      totalCount,
      availableCount,
      soldCount,
      totalFilteredCount,
      page,
      totalPages: Math.ceil(totalFilteredCount / limit) || 1,
      hasNextPage: page * limit < totalFilteredCount,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Delete an unsold pre-generated ticket.
   */
  public static async deleteById(id: number) {
    const ticket = await prisma.package_ticket.findUnique({
      where: { id },
    });
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    if (ticket.is_sold) {
      throw new Error("Cannot delete a ticket that has already been sold");
    }

    return prisma.package_ticket.delete({
      where: { id },
    });
  }
}

export default PackageTicketService;
