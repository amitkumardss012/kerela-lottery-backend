import { Router } from "express";
import { asyncHandler, multerUpload } from "../middlewares";
import { ErrorResponse, SuccessResponse } from "../utils/response.util";
import { statusCode } from "../types/types";
import { ENV, prisma, uploadToCloudinary } from "../../config";
import cloudinary from "../../config/cloudinary";

const Qr = Router();

Qr.put(
  "/add",
  multerUpload.single("image"),
  asyncHandler(async (req, res, next) => {
    const phone = req.body.phone;
    const image = req.file as Express.Multer.File;

    if (!image && !phone) {
      return next(new ErrorResponse("Either phone or image is required", statusCode.Bad_Request));
    }

    if (image) {
      if (!image.mimetype.startsWith("image/")) {
        return next(new ErrorResponse("Only JPEG, PNG, and WEBP images are allowed", statusCode.Bad_Request));
      }
      if (image.size > 10 * 1024 * 1024) {
        return next(new ErrorResponse("File size must be less than 10MB", statusCode.Bad_Request));
      }
    }

    if (phone && phone.length !== 10) {
      return next(new ErrorResponse("Phone number must be exactly 10 digits", statusCode.Bad_Request));
    }

    try {
      // 🔹 Step 1: Find existing QR Code
      let qrCode = await prisma.qRCode.findFirst();
      let oldPublicId = null;

      if (qrCode?.image) {
        const existingImage = qrCode.image as { public_id: string };
        oldPublicId = existingImage.public_id;
      }

      let cloudinaryResult = null;
      if (image) {
        // 🔹 Step 2: Upload new image to Cloudinary
        cloudinaryResult = await uploadToCloudinary(image.buffer, ENV.cloud_folder!);
        if (!cloudinaryResult) {
          return next(new ErrorResponse("Failed to upload image to Cloudinary", statusCode.Internal_Server_Error));
        }
      }

      if (qrCode) {
        // 🔹 Step 3: Update the QR code in DB (Only update provided fields)
        const updateData: any = { updatedAt: new Date() };

        // Only update phone if provided
        if (phone) {
          updateData.phone = phone;
        }

        // Only update image if a new image was uploaded
        if (cloudinaryResult) {
          updateData.image = {
            public_id: cloudinaryResult.public_id,
            secure_url: cloudinaryResult.secure_url,
          };
        }

        qrCode = await prisma.qRCode.update({
          where: { id: qrCode.id },
          data: updateData,
        });

        // 🔹 Step 4: Delete old image from Cloudinary (Only if a new image was uploaded)
        if (oldPublicId && cloudinaryResult) {
          const deleteFromCloudinary = await cloudinary.uploader.destroy(oldPublicId);
          if (deleteFromCloudinary?.result !== "ok") {
            return next(new ErrorResponse("Failed to delete old image from Cloudinary", statusCode.Internal_Server_Error));
          }
        }
      } else {
        // 🔹 Step 5: If QR code doesn't exist, create a new one
        qrCode = await prisma.qRCode.create({
          data: {
            phone: phone || "", // Default to empty string if phone is not provided
            image: cloudinaryResult
              ? { public_id: cloudinaryResult.public_id, secure_url: cloudinaryResult.secure_url }
              : undefined,
            updatedAt: new Date(),
          },
        });
      }

      return SuccessResponse(res, "QR code updated successfully", qrCode);
    } catch (error) {
      return next(new ErrorResponse("Failed to add QR code", statusCode.Internal_Server_Error));
    }
  })
);

Qr.get(
  "/get",
  asyncHandler(async (req, res, next) => {
    try {
      const qrCode = await prisma.qRCode.findFirst();
      if (!qrCode) {
        return next(new ErrorResponse("QR code not found", statusCode.Not_Found));
      }
      return SuccessResponse(res, "QR code fetched successfully", qrCode);
    } catch (error) {
      return next(new ErrorResponse("Failed to fetch QR code", statusCode.Internal_Server_Error));
    }
  })
);

export default Qr;