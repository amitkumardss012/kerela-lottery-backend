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

  // Generate and create tickets
  const tickets = [];
  for (let i = 0; i < totalTickets; i++) {
    const ticketNumber = await GenerateUniqueTicketNumber(lottery_id);
    tickets.push({
      buyer_id: buyer.id,
      lottery_id,
      ticket_package_id,
      ticket_number: ticketNumber || "",
      transaction_id: transaction_id || "",
      updatedAt: new Date(),
    });
  }

  await prisma.ticket.createMany({
    data: tickets,
  });

  return SuccessResponse(res, "Lottery bought successfully", {
    buyer,
    tickets,
    ticket_package: ticket_package.name,
  }, statusCode.Created);
});

export const getAllBuyers = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const [buyers, totalBuyers] = await Promise.all([
    prisma.buyer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        lottery: true,
        ticketpackage: true,
      },
    }),
    prisma.buyer.count(),
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
        }
      }
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
  });

  return SuccessResponse(res, "Buyer status updated successfully", updatedBuyer, statusCode.OK);
});
