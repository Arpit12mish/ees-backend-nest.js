import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Tells the storefront's ISR cache a product changed, right after the write
// that changed it — fire-and-forget, same pattern as EmailService: never
// throws, never blocks or breaks the admin write it's called from. Without
// this, a publish only becomes visible after the frontend's own 5–10 min
// revalidate window naturally elapses.
@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get<string>('revalidateSecret'));
  }

  async revalidate(tags: string[]): Promise<boolean> {
    const secret = this.config.get<string>('revalidateSecret');
    if (!secret) {
      this.logger.warn('REVALIDATE_SECRET not set — skipping revalidation');
      return false;
    }
    if (tags.length === 0) return true;

    const frontendBaseUrl = this.config.get<string>(
      'frontendBaseUrl',
      'http://localhost:3000',
    );

    try {
      const response = await fetch(`${frontendBaseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tags }),
      });
      if (!response.ok) {
        this.logger.warn(
          `Revalidation request failed: ${response.status} ${response.statusText}`,
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.warn('Revalidation request errored', error as Error);
      return false;
    }
  }
}
