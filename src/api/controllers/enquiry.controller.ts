import { prisma } from "../../config";
import { asyncHandler } from "../middlewares";
import EnquiryService from "../services/enquiry.service";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";
import { EnquiryValidator } from "../validators";

export const createEnquiry = asyncHandler(async (req, res, next) => {
  const validatedData = EnquiryValidator.parse(req.body);
  
  const enquiry = await EnquiryService.createEnquiry(validatedData);
  
  return SuccessResponse(
    res,
    "Enquiry created successfully",
    enquiry,
    statusCode.Created
  );
});

export const getAllEnquiries = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const date = req.query.date; // expecting date in 'YYYY-MM-DD' format

  // Build where condition for date filtering
  let whereCondition = {};
  if (date) {
    // Convert to start and end of the day
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);
    whereCondition = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };
  }

  const [enquiries, totalEnquiries] = await Promise.all([
    prisma.enquiry.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        state: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: [
        { isRead: "asc" },
        { createdAt: "desc" }
      ]
    }),
    prisma.enquiry.count({
      where: whereCondition
    })
  ]);

  if (page > Math.ceil(totalEnquiries / limit) && totalEnquiries > 0)
    return next(new ErrorResponse("Page not found", statusCode.Not_Found));

  if (!enquiries)
    return next(new ErrorResponse("Enquiries not found", statusCode.Not_Found));

  return SuccessResponse(
    res,
    "Enquiries fetched successfully",
    {
      enquiries,
      currentPage: page,
      totalPages: Math.ceil(totalEnquiries / limit),
      totalEnquiries,
      count: enquiries.length,
      hasNextPage: page * limit < totalEnquiries,
      hasPreviousPage: page > 1,
    }
  );
});


export const getEnquiryById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));
  
  const enquiry = await EnquiryService.getEnquiryById(id);
  if (!enquiry)
    return next(
      new ErrorResponse("Enquiry not found", statusCode.Not_Found)
    );
    if(!enquiry.isRead) {
      await EnquiryService.markEnquiryAsRead(id);
    }
  
  return SuccessResponse(
    res,
    "Enquiry fetched successfully",
    enquiry
  );
});


export const deleteEnquiry = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(new ErrorResponse("Invalid Id", statusCode.Bad_Request));
  
  const enquiry = await EnquiryService.getEnquiryById(id);
  if (!enquiry)
    return next(
  new ErrorResponse("Enquiry not found", statusCode.Not_Found)
);

const deletedEnquiry = await EnquiryService.deleteEnquiry(id);
if (!deletedEnquiry)
  return next(
new ErrorResponse("Enquiry not found", statusCode.Not_Found)
);

return SuccessResponse(res, "Enquiry deleted successfully");
});

export const getUnreadEnquiries = asyncHandler(async (req, res, next) => {
  const enquiries = await EnquiryService.getUnreadEnquiries();
  
  return SuccessResponse(
    res,
    "Unread enquiries fetched successfully",
    enquiries
  );
});