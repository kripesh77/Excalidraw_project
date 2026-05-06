import dotenv from "dotenv";
dotenv.config();

export interface IMailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export class MailConfig implements IMailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;

  constructor() {
    this.host = process.env.SMTP_HOST!;
    this.port = parseInt(process.env.SMTP_PORT || "587");
    this.secure = process.env.SMTP_SECURE === "true";
    this.user = process.env.SMTP_USER!;
    this.password = process.env.SMTP_PASSWORD!;

    if (!this.host || !this.user || !this.password) {
      throw new Error(
        "SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables are required",
      );
    }
  }
}

// Export singleton instance
export const mailConfig = new MailConfig();
