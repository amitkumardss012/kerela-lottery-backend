import dotenv from "dotenv";

dotenv.config();

const ENV = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    FRONTEND_URL1: process.env.FRONTEND_URL1,


    // Cloudinary Credentials
    cloud_name: process.env.CLOUD_NAME, 
    cloud_api_key: process.env.CLOUD_API_KEY,  
    cloud_api_secret: process.env.CLOUD_API_SECRET,
    cloud_folder: process.env.CLOUD_FOLDER
}

export default ENV;
