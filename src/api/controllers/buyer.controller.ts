import { prisma } from "../../config";
import { asyncHandler } from "../middlewares";
import { TicketPackageService } from "../services";
import { statusCode } from "../types/types";
import { ErrorResponse, GenerateUniqueTicketNumber } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { BuyerValidator } from "../validators";

export const BuyLottery = asyncHandler(async (req, res, next) => {
  const {
    name,
    phone,
    email,
    state,
    lottery_id,
    ticket_package_id,
    transaction_id,
    selected_tickets,
  } = BuyerValidator.parse(req.body);

  // Check if ticket package exists
  const ticket_package = await TicketPackageService.getById(ticket_package_id);
  if (!ticket_package) {
    return next(new ErrorResponse("Ticket package not found", statusCode.Not_Found));
  }

  // Check if a buyer with the same email and phone has already bought this lottery
  const existingBuyerSameLottery = await prisma.buyer.findFirst({
    where: {
      email,
      phone,
      lottery_id,
    },
  });
  if (existingBuyerSameLottery) {
    return next(
      new ErrorResponse(
        "You have already bought this lottery with this email and phone",
        statusCode.Bad_Request
      )
    );
  }

  // Check if the transaction_id is already used for any lottery
  if (transaction_id) {
    const existingBuyerWithTransaction = await prisma.buyer.findFirst({
      where: {
        transaction_id,
      },
    });
    if (existingBuyerWithTransaction) {
      return next(
        new ErrorResponse(
          "This transaction ID has already been used to buy a lottery",
          statusCode.Bad_Request
        )
      );
    }
  }

  // Calculate total tickets
  const totalTickets =
    ticket_package.number_of_tickets ||
    (ticket_package.paid_tickets ?? 0) + (ticket_package.free_tickets ?? 0) ||
    0;

  // Process ticket numbers
  const finalTicketNumbers: string[] = [];
  const pregeneratedTicketIdsToMarkSold: number[] = [];

  if (Array.isArray(selected_tickets) && selected_tickets.length > 0) {
    // User specifically selected tickets
    const cleanSelected = Array.from(new Set(selected_tickets.map((t) => t.trim().toUpperCase())));

    if (cleanSelected.length !== totalTickets) {
      return next(
        new ErrorResponse(
          `Please select exactly ${totalTickets} ticket number(s) for this package`,
          statusCode.Bad_Request
        )
      );
    }

    // Verify all selected tickets exist in package_ticket and are unsold
    const availablePreGen = await prisma.package_ticket.findMany({
      where: {
        ticket_package_id,
        ticket_number: { in: cleanSelected },
        is_sold: false,
      },
    });

    if (availablePreGen.length !== cleanSelected.length) {
      return next(
        new ErrorResponse(
          "Some of your selected tickets are no longer available. Please select different tickets.",
          statusCode.Bad_Request
        )
      );
    }

    cleanSelected.forEach((tNum) => {
      finalTicketNumbers.push(tNum);
    });
    availablePreGen.forEach((pt) => {
      pregeneratedTicketIdsToMarkSold.push(pt.id);
    });
  } else {
    // Auto assignment mode: Use available pre-generated tickets first, fallback to generation
    const availablePreGen = await prisma.package_ticket.findMany({
      where: {
        ticket_package_id,
        is_sold: false,
      },
      take: totalTickets,
      orderBy: { createdAt: "asc" },
    });

    for (const pt of availablePreGen) {
      finalTicketNumbers.push(pt.ticket_number);
      pregeneratedTicketIdsToMarkSold.push(pt.id);
    }

    // If pre-generated tickets are fewer than required, dynamically generate the remainder
    const remainingCount = totalTickets - finalTicketNumbers.length;
    for (let i = 0; i < remainingCount; i++) {
      const generatedNum = await GenerateUniqueTicketNumber(lottery_id);
      finalTicketNumbers.push(generatedNum || "");
    }
  }

  // Create the buyer
  const buyer = await prisma.buyer.create({
    data: {
      name,
      phone,
      email,
      state,
      lottery_id,
      ticket_package_id,
      transaction_id,
      updatedAt: new Date(),
    },
  });

  // Mark pre-generated tickets as sold
  if (pregeneratedTicketIdsToMarkSold.length > 0) {
    await prisma.package_ticket.updateMany({
      where: {
        id: { in: pregeneratedTicketIdsToMarkSold },
      },
      data: {
        is_sold: true,
        sold_at: new Date(),
        buyer_id: buyer.id,
        transaction_id: transaction_id || null,
        updatedAt: new Date(),
      },
    });
  }

  // Create tickets in primary ticket table for consistency & pdf generation
  const ticketsToInsert = finalTicketNumbers.map((ticketNum) => ({
    buyer_id: buyer.id,
    lottery_id,
    ticket_package_id,
    ticket_number: ticketNum,
    transaction_id: transaction_id || "",
    updatedAt: new Date(),
  }));

  await prisma.ticket.createMany({
    data: ticketsToInsert,
  });

  return SuccessResponse(res, "Lottery bought successfully", {
    buyer,
    tickets: ticketsToInsert,
    ticket_package: ticket_package.name,
  }, statusCode.Created);
});

export const getAllBuyers = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { startDate, endDate, exportMode } = req.query;
  console.log("getAllBuyers Query Params:", req.query);

  const where: any = {};

  if (startDate && typeof startDate === 'string' && startDate !== 'undefined') {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0); // Explicitly set to start of day
      where.createdAt = {
        gte: start,
      };
    }
  }

  if (endDate && typeof endDate === 'string' && endDate !== 'undefined') {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999); // Set to end of day
      where.createdAt = {
        ...where.createdAt, // Preserve gte if it exists
        lte: end,
      };
    }
  }

  console.log("getAllBuyers WHERE clause:", JSON.stringify(where, null, 2));

  const [buyers, totalBuyers] = await Promise.all([
    prisma.buyer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        lottery: true,
        ticketpackage: true,
        ticket: true,
        package_ticket: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.buyer.count({ where }),
  ]);

  if (page > Math.ceil(totalBuyers / limit) && totalBuyers > 0) {
    return next(new ErrorResponse("Page not found", statusCode.Not_Found));
  }

  return SuccessResponse(res, "Buyers fetched successfully", {
    buyers,
    currentPage: page,
    totalPages: Math.ceil(totalBuyers / limit),
    totalBuyers,
    count: buyers.length,
    hasNextPage: page * limit < totalBuyers,
    hasPrevPage: page > 1,
  });
});

export const getBuyerById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      lottery: true,
      ticketpackage: true,
      ticket: {
        where: {
          buyer_id: id,
        },
      },
      package_ticket: {
        where: {
          buyer_id: id,
        },
      },
    },
  });

  if (!buyer) {
    return next(new ErrorResponse("Buyer not found", statusCode.Not_Found));
  }

  // Fetch only tickets purchased by this buyer using transaction_id
  // const tickets = await prisma.ticket.findMany({
  //   where: {
  //     transaction_id: buyer.transaction_id ? { equals: buyer.transaction_id } : undefined,
  //   },
  // });

  return SuccessResponse(res, "Buyer fetched successfully", {
    buyer
  });
});


export const deleteBuyer = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  // Check if buyer exists
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) {
    return next(new ErrorResponse("Buyer not found", statusCode.Not_Found));
  }

  // Fetch tickets associated with this buyer's ticket package
  const tickets = await prisma.ticket.findMany({
    where: {
      ticket_package_id: buyer.ticket_package_id || undefined,
    },
  });

  // Delete associated tickets first (due to foreign key constraints)
  await prisma.ticket.deleteMany({
    where: {
      ticket_package_id: buyer.ticket_package_id || undefined,
    },
  });

  // Delete the buyer
  const deletedBuyer = await prisma.buyer.delete({
    where: { id },
  });

  return SuccessResponse(res, "Buyer deleted successfully", deletedBuyer);
});

export const searchBuyer = asyncHandler(async (req, res, next) => {
  const query = req.query.query as string;
  if (!query) {
    return next(new ErrorResponse("Query is required", statusCode.Bad_Request));
  }

  const buyers = await prisma.buyer.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
        { state: { contains: query } },
        { transaction_id: { contains: query } },
      ],
    },
    include: {
      lottery: true,
      ticketpackage: true,
    },
  });

  if (!buyers || buyers.length === 0) {
    return next(new ErrorResponse("Buyer not found", statusCode.Not_Found));
  }

  return SuccessResponse(res, "Buyer fetched successfully", buyers);
});

// New endpoint to update transaction_status
export const updateBuyerStatus = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  const { transaction_status } = req.body;

  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  if (!['not_verified', 'verified', 'failed', 'success', 'refunded', 'rejected'].includes(transaction_status)) {
    return next(new ErrorResponse("Invalid transaction status", statusCode.Bad_Request));
  }

  const buyer = await prisma.buyer.update({
    where: { id },
    data: { transaction_status },
    include: {
      lottery: true,
      ticketpackage: true,
      ticket: true,
    },
  });

  if (!buyer) {
    return next(new ErrorResponse("Buyer not found", statusCode.Not_Found));
  }

  return SuccessResponse(res, "Buyer status updated successfully", buyer, statusCode.OK);
});



export const toggleBuyerStatus = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  const buyer = await prisma.buyer.findUnique({
    where: { id },
  });

  if (!buyer) {
    return next(new ErrorResponse("Buyer not found", statusCode.Not_Found));
  }

  const updatedStatus = buyer.transaction_status === 'verified' ? 'not_verified' : 'verified';

  const updatedBuyer = await prisma.buyer.update({
    where: { id },
    data: { transaction_status: updatedStatus },
    include: {
      lottery: true,
      ticketpackage: true,
      ticket: {
        where: {
          buyer_id: id,
        },
      },
      package_ticket: {
        where: {
          buyer_id: id,
        },
      },
    },
  });

  return SuccessResponse(res, "Buyer status updated successfully", updatedBuyer, statusCode.OK);
});
