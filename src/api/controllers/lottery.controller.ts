import { Request } from "express";
import { asyncHandler } from "../middlewares";
import { LotteryService } from "../services";
import { statusCode } from "../types/types";
import { ErrorResponse, SuccessResponse } from "../utils/response.util";
import { LotteryType, LotteryValidator } from "../validators";

export const createLottery = asyncHandler(async (req, res, next) => {
  const {name, result_time,result_date} = LotteryValidator.parse(req.body);
  const lottery = await LotteryService.create({name, result_time, result_date});
  return SuccessResponse(
    res,
    "Lottery created successfully",
    lottery,
    statusCode.Created
  );
});

export const updateLottery = asyncHandler(async (req: Request<{id: string},{}, Partial<LotteryType>>, res, next) => {
  const id = Number(req.params.id);
  if(!id || isNaN(id)) return next(new ErrorResponse("Invalid id", statusCode.Bad_Request))
    const validatedData = LotteryValidator.partial().parse(req.body);
    const lottery = await LotteryService.update(id, validatedData);
    if(!lottery) return next(new ErrorResponse("Lottery not found", statusCode.Not_Found))
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
  if(!id || isNaN(id)) return next(new ErrorResponse("Invalid id", statusCode.Bad_Request))
    const lottery = await LotteryService.getById(id);
  return SuccessResponse(
    res,
    "Lottery fetched successfully",
    lottery
  );
});


export const deleteLottery = asyncHandler(async (req, res, next) => {
  // Logic to delete a lottery
});