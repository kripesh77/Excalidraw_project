import { mailConfig } from "../../infrastructure/config/mail.config.js";
import { MailService } from "./mail.service.js";
import { NodeMailerMailService } from "./nodemailer.service.js";

// Creating transporter instance
const nodemailer = new NodeMailerMailService(mailConfig);

// Creating mail service with mailer
const mailService = new MailService(nodemailer);

export { mailService };
