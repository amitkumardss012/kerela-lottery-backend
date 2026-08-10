import { asyncHandler } from "../middlewares";
import { ErrorResponse } from "../utils";
import { statusCode } from "../types/types";
import { SuccessResponse } from "../utils/response.util";
import { PackageTicketService, TicketPackageService } from "../services";

export const generatePackageTickets = asyncHandler(async (req, res, next) => {
  const packageId = Number(req.params.id);
  if (!packageId || isNaN(packageId)) {
    return next(new ErrorResponse("Invalid package identifier", statusCode.Bad_Request));
  }

  const existingPackage = await TicketPackageService.getById(packageId);
  if (!existingPackage) {
    return next(new ErrorResponse("Ticket package not found", statusCode.Not_Found));
  }

  const { mode, count, ticket_numbers } = req.body;

  if (mode === "random") {
    const ticketCount = Number(count);
    if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 100) {
      return next(
        new ErrorResponse(
          "Ticket generation count must be a number between 1 and 100",
          statusCode.Bad_Request
        )
      );
    }

    try {
      const generated = await PackageTicketService.generateRandomTickets(
        packageId,
        ticketCount
      );
      return SuccessResponse(
        res,
        `Successfully generated ${generated.length} random tickets`,
        generated,
        statusCode.Created
      );
    } catch (err: any) {
      return next(new ErrorResponse(err.message || "Failed to generate tickets", statusCode.Bad_Request));
    }
  } else if (mode === "manual") {
    if (!Array.isArray(ticket_numbers) || ticket_numbers.length === 0) {
      return next(
        new ErrorResponse(
          "ticket_numbers must be a non-empty array of ticket numbers",
          statusCode.Bad_Request
        )
      );
    }

    try {
      const generated = await PackageTicketService.generateManualTickets(
        packageId,
        ticket_numbers
      );
      return SuccessResponse(
        res,
        `Successfully added ${generated.length} manual ticket(s)`,
        generated,
        statusCode.Created
      );
    } catch (err: any) {
      return next(new ErrorResponse(err.message || "Failed to add manual tickets", statusCode.Bad_Request));
    }
  } else {
    return next(
      new ErrorResponse(
        "Invalid generation mode. Supported modes are 'random' and 'manual'",
        statusCode.Bad_Request
      )
    );
  }
});

export const getPackageTickets = asyncHandler(async (req, res, next) => {
  const packageId = Number(req.params.id);
  if (!packageId || isNaN(packageId)) {
    return next(new ErrorResponse("Invalid package identifier", statusCode.Bad_Request));
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;

  let is_sold: boolean | undefined = undefined;
  if (req.query.is_sold === "true") is_sold = true;
  if (req.query.is_sold === "false") is_sold = false;

  const result = await PackageTicketService.getByPackageId(
    packageId,
    is_sold,
    page,
    limit
  );

  return SuccessResponse(res, "Package tickets fetched successfully", result);
});

export const getAvailablePackageTickets = asyncHandler(async (req, res, next) => {
  const packageId = Number(req.params.id);
  if (!packageId || isNaN(packageId)) {
    return next(new ErrorResponse("Invalid package identifier", statusCode.Bad_Request));
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const status = (req.query.status as "all" | "available" | "sold") || "all";

  const result = await PackageTicketService.getPublicTickets(packageId, page, limit, status);
  return SuccessResponse(res, "Package tickets fetched successfully", result);
});

export const deletePackageTicket = asyncHandler(async (req, res, next) => {
  const ticketId = Number(req.params.ticketId);
  if (!ticketId || isNaN(ticketId)) {
    return next(new ErrorResponse("Invalid ticket identifier", statusCode.Bad_Request));
  }

  try {
    const deleted = await PackageTicketService.deleteById(ticketId);
    return SuccessResponse(res, "Pre-generated ticket deleted successfully", deleted);
  } catch (err: any) {
    return next(new ErrorResponse(err.message || "Failed to delete ticket", statusCode.Bad_Request));
  }
});
