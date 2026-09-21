import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SendEmailParams = {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey?: string;
  private readonly apiSecret?: string;
  private readonly fromEmail?: string;
  private readonly fromName: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('mailjetApiKey');
    this.apiSecret = this.config.get<string>('mailjetApiSecret');
    this.fromEmail = this.config.get<string>('mailjetFromEmail');
    this.fromName = this.config.get<string>(
      'mailjetFromName',
      'Enchanted Energy Store',
    );
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiSecret && this.fromEmail);
  }

  /**
   * Sends via Mailjet. Never throws — email delivery is best-effort and must
   * never block the request that triggered it (e.g. a contact form submit).
   * Returns true only on a confirmed Mailjet success response.
   */
  async send(params: SendEmailParams): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Email not sent (Mailjet not configured): "${params.subject}" to ${params.to}`,
      );
      return false;
    }

    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString(
        'base64',
      );

      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: this.fromEmail, Name: this.fromName },
              To: [{ Email: params.to, Name: params.toName ?? params.to }],
              ...(params.replyTo ? { ReplyTo: { Email: params.replyTo } } : {}),
              Subject: params.subject,
              TextPart: params.text,
              HTMLPart: params.html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.error(`Mailjet send failed (${response.status}): ${body}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Mailjet send threw an error', error as Error);
      return false;
    }
  }
}
