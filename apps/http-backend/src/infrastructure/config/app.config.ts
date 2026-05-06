import dotenv from "dotenv";
dotenv.config();

export interface IAppConfig {
  backendUrl: string;
}

export class AppConfig implements IAppConfig {
  backendUrl: string;

  constructor() {
    this.backendUrl = process.env.BACKEND_URL!;

    if (!this.backendUrl) {
      throw new Error("BACKEND_URL environment variable is required");
    }
  }
}

// Export singleton instance
export const appConfig = new AppConfig();
