export interface IMailService {
  sendVerificationMail(
    to: string,
    username: string,
    link: string,
  ): Promise<void>;
}

export interface IMailer {
  sendMail(to: string, content: string): Promise<void>;
}

export class MailService implements IMailService {
  constructor(private readonly mailer: IMailer) {}
  async sendVerificationMail(to: string, username: string, link: string) {
    const content = this.generateVerificationContent(username, link);
    await this.mailer.sendMail(to, content);
  }

  generateVerificationContent(username: string, link: string) {
    return `
      <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
  </head>

  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;padding:32px;border-radius:8px;">

      <h2 style="margin:0 0 16px 0;color:#222;">
        Verify your email address
      </h2>

      <p style="font-size:15px;color:#555;line-height:1.6;">
        Hi, ${username}, Please verify your email address to activate your account.
      </p>

      <p style="font-size:15px;color:#555;line-height:1.6;">
        Click the button below to complete verification:
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${link}"
           style="background:#1a73e8;color:#ffffff;
                  padding:12px 24px;border-radius:6px;
                  text-decoration:none;display:inline-block;
                  font-size:15px;">
          Verify Email
        </a>
      </div>

      <p style="font-size:13px;color:#777;word-break:break-all;">
        If the button doesn’t work, use this link:<br />
        ${link}
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

      <p style="font-size:12px;color:#999;line-height:1.5;">
        This link will expire in an hour.<br />
        If you did not create this account, you can ignore this email.
      </p>

    </div>
  </body>
</html>
    `;
  }
}
