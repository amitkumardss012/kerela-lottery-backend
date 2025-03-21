import { asyncHandler } from "../middlewares";
import { TicketPackageType, TicketPackageValidator } from "../validators";
import { ErrorResponse } from "../utils";
import { statusCode } from "../types/types";
import { SuccessResponse } from "../utils/response.util";
import TicketPackageService from "../services/ticketPackage.service";
import { Request } from "express";

export const createTicketPackage = asyncHandler(async (req, res, next) => {
  const validatedData = TicketPackageValidator.parse(req.body);

  if(validatedData.number_of_tickets > 25) 
    return next(new ErrorResponse("Only 25 tickets are allowed", statusCode.Bad_Request))

  if(validatedData.number_of_tickets < (validatedData.paid_tickets ?? 0) + (validatedData.free_tickets ?? 0))
    return next(new ErrorResponse("Invalid number of tickets", statusCode.Bad_Request))

  if(validatedData.number_of_tickets != (validatedData.paid_tickets ?? 0) + (validatedData.free_tickets ?? 0))
    return next(new ErrorResponse("Total tickets must be equal to paid + free tickets.", statusCode.Bad_Request))

  const ticketPackage = await TicketPackageService.create(validatedData);

  return SuccessResponse(
    res,
    "Ticket package created successfully",
    ticketPackage,
    statusCode.Created
  );
});

export const getAllActiveTicketPackages = asyncHandler(async (req, res, next) => {
  const ticketPackages = await TicketPackageService.getAllActive();
  return SuccessResponse(
    res,
    "Ticket packages fetched successfully",
    ticketPackages
  );
});

export const getAllTicketPackages = asyncHandler(async (req, res, next) => {
  const ticketPackages = await TicketPackageService.getAll();
  return SuccessResponse(
    res,
    "Ticket packages fetched successfully",
    ticketPackages
  );
});

export const getTicketPackageById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));
  const ticketPackage = await TicketPackageService.getById(id);
  if (!ticketPackage)
    return next(
      new ErrorResponse("Ticket package not found", statusCode.Not_Found)
    );
  return SuccessResponse(
    res,
    "Ticket package fetched successfully",
    ticketPackage
  );
});

export const updateTicketPackage = asyncHandler(
  async (
    req: Request<{ id: string }, {}, Partial<TicketPackageType>>,
    res,
    next
  ) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
      return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));
    const validatedData = TicketPackageValidator.partial().parse(req.body);

    if((validatedData.number_of_tickets ?? 0) < (validatedData.paid_tickets ?? 0) + (validatedData.free_tickets ?? 0))
      return next(new ErrorResponse("Invalid number of tickets", statusCode.Bad_Request))

    const updateTicketPackage = await TicketPackageService.update(
      id,
      validatedData
    );
    if (!updateTicketPackage)
      return next(
        new ErrorResponse("Ticket package not found", statusCode.Not_Found)
      );

    return SuccessResponse(
      res,
      "Ticket package updated successfully",
      updateTicketPackage
    );
  }
);

export const deleteTicketPackage = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));

  const ticketPackage = await TicketPackageService.getById(id);
  if (!ticketPackage)
    return next(
      new ErrorResponse("Ticket package not found", statusCode.Not_Found)
    );

  const deletedPackage = await TicketPackageService.deleteById(id);
  if (!deletedPackage)
    return next(
      new ErrorResponse("Ticket package not found", statusCode.Not_Found)
    );

  return SuccessResponse(res, "Ticket package deleted successfully");
});
