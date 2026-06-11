import { User } from "@repo/db";
import { IMailService } from "../../../infrastructure/mail/mail.service.js";
import { IEventBus } from "../../../events/eventBus.type.js";
import { AUTH_EVENTS } from "../events/auth.events.js";

export interface IRegisterAuthListeners {
  eventBus: IEventBus;
  mailService: IMailService;
  config: {
    BACKEND_URL: string;
  };
}

const { USER_REGISTERED } = AUTH_EVENTS;

export const createUserRegisteredListener =
  (mailService: IMailService, config: { BACKEND_URL: string }) =>
  async (user: User) => {
    const link = `${config.BACKEND_URL}/api/v1/auth/verify/${user.emailVerificationToken}`;
    await mailService.sendVerificationMail(user.email, user.username, link);
  };

export const registerAuthListeners = ({
  eventBus,
  mailService,
  config,
}: IRegisterAuthListeners) => {
  const listener = createUserRegisteredListener(mailService, config);
  eventBus.on(USER_REGISTERED, listener);
};
