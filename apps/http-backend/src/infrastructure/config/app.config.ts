import dotenv from "dotenv";
dotenv.config();

export interface IAppConfig {
  backendUrl: string;
}

export class AppConfig implements IAppConfig {
  backendUrl: string;

  constructor() {
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

    if (!this.backendUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL environment variable is required",
      );
    }
  }
}

// Exporting singleton instance
export const appConfig = new AppConfig();
