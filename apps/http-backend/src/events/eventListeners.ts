import {
  IRegisterAuthListeners,
  registerAuthListeners,
} from "../modules/auth/events/auth.listener.js";

export const registerEventListeners = ({
  eventBus,
  mailService,
  config,
}: IRegisterAuthListeners) => {
  registerAuthListeners({ eventBus, mailService, config });
};
