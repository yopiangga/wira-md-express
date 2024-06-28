import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const APP_PORT = process.env.APP_PORT;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;

export const mailTransporter = nodemailer.createTransport({
    // port: SMTP_PORT,
    host: SMTP_HOST,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    secure: true,
  });