"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const env_1 = __importDefault(require("./env"));
cloudinary_1.v2.config({
    cloud_name: env_1.default.cloud_name,
    api_key: env_1.default.cloud_api_key,
    api_secret: env_1.default.cloud_api_secret,
});
exports.default = cloudinary_1.v2;
const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
            if (error) {
                return reject(new Error("Failed to upload image to Cloudinary: " + error.message));
            }
            if (!(result === null || result === void 0 ? void 0 : result.secure_url) || !result.public_id) {
                return reject(new Error("Failed to retrieve public_id or URL from Cloudinary response"));
            }
            resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
            });
        });
        // console.log(uploadStream.map((r) => console.log(r)));
        // Create a readable stream from the file buffer and pipe it to the upload stream
        const stream = stream_1.Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
