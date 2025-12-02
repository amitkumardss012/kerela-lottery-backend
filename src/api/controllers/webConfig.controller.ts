import { prisma } from "../../config";
import { asyncHandler } from "../middlewares";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";

export const updateWebConfig = asyncHandler(async (req, res, next) => {
    const { whatsAppNumber, phoneNumber, email } = req.body;

    if (!whatsAppNumber && !phoneNumber && !email) {
        return next(new ErrorResponse("At least one field is required", 400))
    }

    let webConfig = await prisma.webConfig.findFirst()

    if (webConfig) {
        webConfig = await prisma.webConfig.update({
            where: {
                id: webConfig.id
            },
            data: {
                whatsAppNumber,
                phoneNumber,
                email
            }
        })
    } else {
        webConfig = await prisma.webConfig.create({
            data: {
                whatsAppNumber,
                phoneNumber,
                email,
                updatedAt: new Date()
            }
        })
    }

    return SuccessResponse(res, "Web Config updated successfully", webConfig)
})

export const getWebConfig = asyncHandler(async (req, res, next) => {
    const webConfig = await prisma.webConfig.findFirst()
    return SuccessResponse(res, "Web Config fetched successfully", webConfig)
})
