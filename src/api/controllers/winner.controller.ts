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
  const search = ((req.query.search as string) || (req.query.query as string) || "").trim();
  const lottery_id = req.query.lottery_id as string;
  const claimed = req.query.claimed as string;

  const where: any = {};

  if (search) {
    where.OR = [
      { ticket_number: { contains: search } },
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { state: { contains: search } },
    ];
  }

  if (lottery_id && lottery_id !== "all") {
    const parsedLotteryId = Number(lottery_id);
    if (!isNaN(parsedLotteryId)) {
      where.lottery_id = parsedLotteryId;
    }
  }

  if (claimed && claimed !== "all") {
    if (claimed === "claimed" || claimed === "true") {
      where.claimed = true;
    } else if (claimed === "pending" || claimed === "false") {
      where.claimed = false;
    }
  }

  const [winners, total] = await Promise.all([
    WinnerService.getAllWinners(page, limit, where),
    prisma.winner.count({ where }),
  ]);

  const totalPage = Math.ceil(total / limit) || 1;

  return SuccessResponse(res, "Winners fetched successfully", {
    winners: winners || [],
    currentPage: page,
    totalPage,
    totalWinners: total,
    count: winners ? winners.length : 0,
    hasNextPage: page < totalPage,
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

