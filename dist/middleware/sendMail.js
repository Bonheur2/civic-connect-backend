"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});
const sendEmail = async (to, subject, body) => {
    try {
        if (typeof to !== 'string') {
            throw new Error(`Invalid recipient email: ${JSON.stringify(to)}`);
        }
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: to.trim().toLowerCase(), // normalize the email
            subject,
            html: body,
        };
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    }
    catch (emailErr) {
        console.warn('❌ Failed to send email:', emailErr instanceof Error ? emailErr.message : 'Unknown error');
    }
};
exports.sendEmail = sendEmail;
