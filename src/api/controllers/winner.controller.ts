import { Request } from "express";
import { asyncHandler } from "../middlewares";
import { LotteryService, WinnerService } from "../services";
import { statusCode } from "../types/types";
import { ErrorResponse, SuccessResponse } from "../utils/response.util";
import { WinnerType, WinnerValdator } from "../validators";
import { prisma } from "../../config";

export const createWinner = asyncHandler(async (req, res, next) => {
  const validatedData = WinnerValdator.parse(req.body);
  const lottery = await LotteryService.getById(Number(validatedData.lottery_id));
  if(!lottery)
    return next(new ErrorResponse("Lottery not found", statusCode.Not_Found))

  const existingWinner = await prisma.winner.findFirst({
    where: {
      OR: [
        {
          phone: {
            equals: validatedData.phone,
          },
        },
        {
          email: {
            equals: validatedData.email,
          },
        },
      ],
    },
  });
  if(existingWinner)
    return next(new ErrorResponse("Winner with the same email and phone already exists", statusCode.Conflict));

  const winner = await WinnerService.createWinner(validatedData);
  return SuccessResponse(
    res,
    "Winner created successfully",
    winner,
    statusCode.Created
  );
});

export const updateWinner = asyncHandler(
  async (req: Request<{ id: string }, {}, Partial<WinnerType>>, res, next) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
      return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));
    const validatedData = WinnerValdator.partial().parse(req.body);

    const winner = await WinnerService.updateWinnerById(id, validatedData);

    if (!winner)
      return next(new ErrorResponse("Winner not found", statusCode.Not_Found));
    return SuccessResponse(
      res,
      "Winner updated successfully",
      winner,
      statusCode.OK
    );
  }
);

export const deleteWinner = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid or missing ID", statusCode.Bad_Request));

  const winner = await WinnerService.deleteWinnerById(id);
  if (!winner)
    return next(new ErrorResponse("Winner not found", statusCode.Not_Found));
  return SuccessResponse(
    res,
    "Winner deleted successfully",
    winner,
    statusCode.OK
  );
});

export const getAllWinners = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const [winners, total] = await Promise.all([
    WinnerService.getAllWinners(page, limit),
    prisma.winner.count(),
  ]);
  
  if(page > Math.ceil(total / limit) && total > 0)
    return next(new ErrorResponse("Page not found", statusCode.Not_Found))

  if (!winners)
    return next(new ErrorResponse("No winners found", statusCode.Not_Found));

  return SuccessResponse(res, "Winners fetched successfully", {
    winners,
    currentPage: page,
    totalPage: Math.ceil(total / limit),
    totalWinners: total,
    count: winners.length,
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  });
});

export const getWinnerById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));

  const winner = await WinnerService.getWinnerById(id);
  if (!winner)
    return next(new ErrorResponse("Winner not found", statusCode.Not_Found));
  return SuccessResponse(
    res,
    "Winner fetched successfully",
    winner,
    statusCode.OK
  );
});

export const searchWinner = asyncHandler(async (req, res, next) => {
  const query = req.query.query as string;
  if (!query)
    return next(
      new ErrorResponse("Query is required", statusCode.Bad_Request)
    );


  const winner = await WinnerService.searchWinner(query);
  if (!winner)
    return next(new ErrorResponse("Winner not found", statusCode.Not_Found));
  return SuccessResponse(res, "Winner fetched successfully", winner);
});

export const markAsClaimed = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));

  const winner = await prisma.winner.findUnique({ where: { id } });
  if (!winner)
    return next(new ErrorResponse("Winner not found", statusCode.Not_Found));

  const newClaimStatus = !winner.claimed;
  const updatedWinner = await prisma.winner.update({ where: { id }, data: { claimed: newClaimStatus } });

  return SuccessResponse(
    res,
    `Winner ${updatedWinner.name} marked as ${newClaimStatus ? 'claimed' : 'pending'}`,
    updatedWinner,
    statusCode.OK
  );
});

export const getWinnerByLotteryId = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid id", statusCode.Bad_Request));

  const winner = await WinnerService.getWinnerByLottery(id);
  if (!winner)
    return next(new ErrorResponse("Winner not found", statusCode.Not_Found));
  return SuccessResponse(
    res,
    "Winner fetched successfully",
    winner,
    statusCode.OK
  );
});

