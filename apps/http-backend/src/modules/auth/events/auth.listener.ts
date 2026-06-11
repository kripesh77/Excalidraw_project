import { User } from "@repo/db";
import { IMailService } from "../../../infrastructure/mail/mail.service.js";
import { IEventBus } from "../../../events/eventBus.type.js";
import { AUTH_EVENTS } from "../events/auth.events.js";

export interface IRegisterAuthListeners {
  eventBus: IEventBus;
  mailService: IMailService;
  config: {
    FRONTEND_URL: string;
  };
}

const { USER_REGISTERED } = AUTH_EVENTS;

export const createUserRegisteredListener =
  (mailService: IMailService, config: { FRONTEND_URL: string }) =>
  async (user: User) => {
    const link = `${config.FRONTEND_URL}/api/verify?token=${user.emailVerificationToken}`;
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
