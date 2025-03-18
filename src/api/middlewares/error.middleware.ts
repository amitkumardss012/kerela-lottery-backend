import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { statusCode } from "../types/types";
import { zodError } from "../validators";
import { ErrorResponse } from "../utils";

const errorMiddleware = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") err.message = "Invalid ID";
  if ("code" in err && err.code === "P2025") {
    err.message = "Item not found";
  }

  // handle Zod error
  if (err instanceof ZodError) {
    const zodErr = zodError(err);
     res.status(statusCode.Bad_Request).json({
      success: false,
      message: "Validation Error",
      errors: zodErr,
    });
  }else {
    // Final Error Response
   res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
  }  
};


export default errorMiddleware;


type AsyncHandlerFunction<TReq extends Request> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  <TReq extends Request>(fn: AsyncHandlerFunction<TReq>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };



