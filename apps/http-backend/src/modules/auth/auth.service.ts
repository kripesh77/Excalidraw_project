import { ITokenService } from "@repo/auth-utils";
import { IAuthService } from "./auth.types.js";
import { IPasswordService } from "../../infrastructure/security/password.service.js";
import { SignInDto, SignUpDto } from "@repo/validators/auth";
import { IUserService } from "../user/user.types.js";
import { AUTH_EVENTS } from "./events/auth.events.js";
import { IEventBus } from "../../events/eventBus.type.js";
import { IVerificationTokenService } from "../../infrastructure/security/verification-token.service.js";
import { AppError } from "../../utils/appError.js";
import { User } from "@repo/db";

export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: ITokenService,
    private readonly bcryptPasswordService: IPasswordService,
    private readonly userService: IUserService,
    private readonly eventBus: IEventBus,
    private readonly verificationTokenService: IVerificationTokenService,
  ) {}
  async signup(signUpDto: SignUpDto) {
    const hashedPassword = await this.bcryptPasswordService.hash(
      signUpDto.password,
    );

    const { rawToken, hashedToken, expiresAt } =
      this.verificationTokenService.generate();

    const user = await this.userService.create({
      ...signUpDto,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
    });

    const { password: _, refreshToken: __, ...safeUser } = user;

    this.eventBus.emit(AUTH_EVENTS.USER_REGISTERED, {
      ...safeUser,
      emailVerificationToken: rawToken,
    });

    return { user: safeUser };
  }

  async verify(id: string) {
    const emailVerificationHashedToken =
      this.verificationTokenService.hashToken(id);
    const user = await this.userService.findByVerificationTokenAndUpdate(
      emailVerificationHashedToken,
    );
    if (!user) {
      return null;
    }
    const accessToken = await this.jwtService.signAccessTokenAsync({
      sub: user.id,
    });
    const refreshToken = await this.jwtService.signRefreshTokenAsync({
      sub: user.id,
    });

    const hashedRefreshToken =
      this.verificationTokenService.hashToken(refreshToken);

    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);
    return { user, accessToken, refreshToken };
  }

  async signin(signInDto: SignInDto) {
    const user = await this.userService.findByEmailWithPassword(
      signInDto.email,
    );
    if (!user) throw new AppError("User doesn't exist", 404);
    const correctPassword = await this.bcryptPasswordService.compare(
      signInDto.password,
      user.password,
    );
    if (!correctPassword) {
      throw new AppError("Incorrect password", 401);
    }
    if (user.isEmailVerified === false) {
      throw new AppError("Please verify your email first", 400);
    }
    const { password: _, refreshToken: __, ...safeUser } = user;
    const accessToken = await this.jwtService.signAccessTokenAsync({
      sub: user.id,
    });
    const refreshToken = await this.jwtService.signRefreshTokenAsync({
      sub: user.id,
    });

    const hashedRefreshToken =
      this.verificationTokenService.hashToken(refreshToken);

    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return { user: safeUser, accessToken, refreshToken };
  }

  async refresh(user: User) {
    const accessToken = await this.jwtService.signAccessTokenAsync({
      sub: user.id,
    });

    return accessToken;
  }
}
