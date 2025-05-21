import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI as string;
export const AUTH_EMAIL = process.env.AUTH_EMAIL as string;
export const AUTH_PASS = process.env.AUTH_PASS as string;
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE as string;
export const CLOUD_NAME = process.env.CLOUD_NAME as string;
export const API_KEY = process.env.API_KEY as string;
export const API_SECRET = process.env.API_SECRET as string;
export const SECRET_KEY = process.env.SECRET_KEY as string;