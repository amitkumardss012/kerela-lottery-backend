import { asyncHandler } from "../middlewares";
import { TicketPackageValidator } from "../validators";
import { ErrorResponse } from "../utils";
import { statusCode } from "../types/types";
import { SuccessResponse } from "../utils/response.util";
import TicketPackageService from "../services/ticketPackage.service";
import { ENV, uploadToCloudinary } from "../../config";
import cloudinary from "../../config/cloudinary";

export const createTicketPackage = asyncHandler(async (req, res, next) => {
  const validatedData = TicketPackageValidator.parse(req.body);

  const totalTickets = validatedData.number_of_tickets;
  const paid = validatedData.paid_tickets ?? 0;
  const free = validatedData.free_tickets ?? 0;

  if (totalTickets !== paid + free) {
    return next(
      new ErrorResponse(
        "Total tickets must equal paid tickets + free tickets.",
        statusCode.Bad_Request
      )
    );
  }

  // Handle bonus_perks if passed as JSON string
  let parsedBonusPerks = validatedData.bonus_perks;
  if (typeof parsedBonusPerks === "string" && parsedBonusPerks.trim() !== "") {
    try {
      parsedBonusPerks = JSON.parse(parsedBonusPerks);
    } catch {
      // Keep string if parsing fails
    }
  }

  // Handle Cloudinary image upload
  const imageFile = req.file as Express.Multer.File;
  let imagePayload = null;

  if (imageFile) {
    const folder = ENV.cloud_folder
      ? `${ENV.cloud_folder}/ticket_packages`
      : "ticket_packages";
    const result = await uploadToCloudinary(imageFile.buffer, folder);
    imagePayload = result;
  }

  const ticketPackage = await TicketPackageService.create({
    ...validatedData,
    bonus_perks: parsedBonusPerks,
    image: imagePayload,
  });

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

export const updateTicketPackage = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));

  const existingPackage = await TicketPackageService.getById(id);
  if (!existingPackage) {
    return next(
      new ErrorResponse("Ticket package not found", statusCode.Not_Found)
    );
  }

  const validatedData = TicketPackageValidator.partial().parse(req.body);

  const totalTickets = validatedData.number_of_tickets ?? existingPackage.number_of_tickets;
  const paid = validatedData.paid_tickets ?? existingPackage.paid_tickets;
  const free = validatedData.free_tickets ?? existingPackage.free_tickets ?? 0;

  if (totalTickets !== paid + free) {
    return next(
      new ErrorResponse(
        "Total tickets must equal paid tickets + free tickets.",
        statusCode.Bad_Request
      )
    );
  }

  // Handle bonus_perks string JSON parsing
  let parsedBonusPerks = validatedData.bonus_perks;
  if (typeof parsedBonusPerks === "string" && parsedBonusPerks.trim() !== "") {
    try {
      parsedBonusPerks = JSON.parse(parsedBonusPerks);
    } catch {
      // Keep string
    }
  }

  // Handle image update/upload
  const imageFile = req.file as Express.Multer.File;
  let newImagePayload = undefined;

  if (imageFile) {
    // Destroy old image from Cloudinary if available
    if (existingPackage.image) {
      const oldImg = existingPackage.image as { public_id?: string };
      if (oldImg?.public_id) {
        try {
          await cloudinary.uploader.destroy(oldImg.public_id);
        } catch (err) {
          console.error("Failed to delete old package image from Cloudinary:", err);
        }
      }
    }

    const folder = ENV.cloud_folder
      ? `${ENV.cloud_folder}/ticket_packages`
      : "ticket_packages";
    const result = await uploadToCloudinary(imageFile.buffer, folder);
    newImagePayload = result;
  }

  const updateData: any = {
    ...validatedData,
  };

  if (parsedBonusPerks !== undefined) {
    updateData.bonus_perks = parsedBonusPerks;
  }

  if (newImagePayload !== undefined) {
    updateData.image = newImagePayload;
  }

  const updatedPackage = await TicketPackageService.update(id, updateData);

  return SuccessResponse(
    res,
    "Ticket package updated successfully",
    updatedPackage
  );
});

export const deleteTicketPackage = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));

  const existingPackage = await TicketPackageService.getById(id);
  if (!existingPackage)
    return next(
      new ErrorResponse("Ticket package not found", statusCode.Not_Found)
    );

  // Delete image from Cloudinary if exists
  if (existingPackage.image) {
    const oldImg = existingPackage.image as { public_id?: string };
    if (oldImg?.public_id) {
      try {
        await cloudinary.uploader.destroy(oldImg.public_id);
      } catch (err) {
        console.error("Failed to delete package image from Cloudinary on delete:", err);
      }
    }
  }

  await TicketPackageService.deleteById(id);

  return SuccessResponse(res, "Ticket package deleted successfully", { id });
});

