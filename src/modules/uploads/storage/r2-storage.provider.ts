import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type {
  StorageProvider,
  UploadObjectParams,
} from './storage-provider.interface';

@Injectable()
export class R2StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly endpoint?: string;
  private readonly accessKeyId?: string;
  private readonly secretAccessKey?: string;
  private readonly bucket?: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config.get<string>('r2Endpoint');
    this.accessKeyId = this.config.get<string>('r2AccessKeyId');
    this.secretAccessKey = this.config.get<string>('r2SecretAccessKey');
    this.bucket = this.config.get<string>('r2Bucket');
    this.publicBaseUrl = this.config.get<string>('r2PublicBaseUrl');

    this.client = new S3Client({
      region: this.config.get<string>('r2Region', 'auto'),
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId ?? '',
        secretAccessKey: this.secretAccessKey ?? '',
      },
    });
  }

  async uploadObject(params: UploadObjectParams): Promise<void> {
    const { bucket } = this.getRequiredConfig();

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        CacheControl: params.cacheControl,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    const { bucket } = this.getRequiredConfig();

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  getPublicUrl(key: string): string {
    const { publicBaseUrl } = this.getRequiredConfig();

    return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }

  private getRequiredConfig(): {
    bucket: string;
    publicBaseUrl: string;
  } {
    if (
      !this.endpoint ||
      !this.accessKeyId ||
      !this.secretAccessKey ||
      !this.bucket ||
      !this.publicBaseUrl
    ) {
      throw new InternalServerErrorException({
        message: 'Cloudflare R2 upload storage is not configured',
        errorCode: 'UPLOAD_DRIVER_NOT_CONFIGURED',
      });
    }

    return {
      bucket: this.bucket,
      publicBaseUrl: this.publicBaseUrl,
    };
  }
}
