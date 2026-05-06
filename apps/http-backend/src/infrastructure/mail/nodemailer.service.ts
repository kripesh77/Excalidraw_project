import nodemailer from "nodemailer";
import { IMailer } from "./mail.service.js";
import { IMailConfig } from "../config/mail.config.js";

export class NodeMailerMailService implements IMailer {
  private transporter: nodemailer.Transporter;

  constructor(mailConfig: IMailConfig) {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password,
      },
    });
  }

  async sendMail(to: string, content: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject: "Email Verification",
        html: content,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error(
        `Failed to send email to ${to}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }
}
