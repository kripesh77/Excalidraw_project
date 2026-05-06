import bcrypt from "bcrypt";

export interface IPasswordService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export class BcryptPasswordService implements IPasswordService {
  async hash(plain: string) {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
}
