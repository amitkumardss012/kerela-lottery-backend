import { Request } from "express";
import { asyncHandler } from "../middlewares";
import { LotteryService } from "../services";
import { statusCode } from "../types/types";
import { ErrorResponse, SuccessResponse } from "../utils/response.util";
import { LotteryValidator } from "../validators";
import { ENV, uploadToCloudinary } from "../../config";
import cloudinary from "../../config/cloudinary";

export const createLottery = asyncHandler(async (req, res, next) => {
  const validatedData = LotteryValidator.parse(req.body);
  const imageFile = req.file as Express.Multer.File;

  let imagePayload = null;
  if (imageFile) {
    const folder = ENV.cloud_folder ? `${ENV.cloud_folder}/lotteries` : "kerela_lottery/lotteries";
    const result = await uploadToCloudinary(imageFile.buffer, folder);
    imagePayload = result; // { public_id, secure_url }
  }

  const lottery = await LotteryService.create({
    ...validatedData,
    image: imagePayload,
  });

  return SuccessResponse(
    res,
    "Lottery created successfully",
    lottery,
    statusCode.Created
  );
});

export const updateLottery = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  const existingLottery = await LotteryService.getById(id);
  if (!existingLottery) {
    return next(new ErrorResponse("Lottery not found", statusCode.Not_Found));
  }

  const validatedData = LotteryValidator.partial().parse(req.body);
  const imageFile = req.file as Express.Multer.File;

  let newImagePayload = undefined;
  if (imageFile) {
    // Delete existing image from Cloudinary if available
    if (existingLottery.image) {
      const oldImage = existingLottery.image as { public_id?: string };
      if (oldImage?.public_id) {
        try {
          await cloudinary.uploader.destroy(oldImage.public_id);
        } catch (error) {
          console.error("Failed to delete old image from Cloudinary:", error);
        }
      }
    }

    const folder = ENV.cloud_folder ? `${ENV.cloud_folder}/lotteries` : "lotteries";
    const result = await uploadToCloudinary(imageFile.buffer, folder);
    newImagePayload = result;
  }

  const updateData: any = {
    ...validatedData,
  };

  if (newImagePayload !== undefined) {
    updateData.image = newImagePayload;
  }

  const lottery = await LotteryService.update(id, updateData);

  return SuccessResponse(
    res,
    "Lottery updated successfully",
    lottery
  );
});

export const getActiveLottery = asyncHandler(async (req, res, next) => {
  const lottery = await LotteryService.getAllActive();
  return SuccessResponse(
    res,
    "Lottery fetched successfully",
    lottery
  );
});

export const getAllLotteries = asyncHandler(async (req, res, next) => {
  const lotteries = await LotteryService.getAll();
  return SuccessResponse(
    res,
    "Lotteries fetched successfully",
    lotteries
  );
});

export const getLotteryById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  const lottery = await LotteryService.getById(id);
  // if (!lottery) {
  //   return next(new ErrorResponse("Lottery not found", statusCode.Not_Found));
  // }

  return SuccessResponse(
    res,
    "Lottery fetched successfully",
    lottery
  );
});

export const deleteLottery = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
  }

  const existingLottery = await LotteryService.getById(id);
  if (!existingLottery) {
    return next(new ErrorResponse("Lottery not found", statusCode.Not_Found));
  }

  // Delete image from Cloudinary if exists
  if (existingLottery.image) {
    const oldImage = existingLottery.image as { public_id?: string };
    if (oldImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(oldImage.public_id);
      } catch (error) {
        console.error("Failed to delete image from Cloudinary on delete:", error);
      }
    }
  }

  await LotteryService.delete(id);

  return SuccessResponse(
    res,
    "Lottery deleted successfully",
    { id }
  );
});
