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
export class AwsS3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly region: string;
  private readonly accessKeyId?: string;
  private readonly secretAccessKey?: string;
  private readonly bucket?: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>('awsS3Region', 'us-east-1');
    this.accessKeyId = this.config.get<string>('awsS3AccessKeyId');
    this.secretAccessKey = this.config.get<string>('awsS3SecretAccessKey');
    this.bucket = this.config.get<string>('awsS3Bucket');
    this.publicBaseUrl = this.config.get<string>('awsS3PublicBaseUrl');

    this.client = new S3Client({
      region: this.region,
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
    const { bucket, publicBaseUrl } = this.getRequiredConfig();

    if (publicBaseUrl) {
      return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private getRequiredConfig(): {
    bucket: string;
    publicBaseUrl?: string;
  } {
    if (!this.accessKeyId || !this.secretAccessKey || !this.bucket) {
      throw new InternalServerErrorException({
        message: 'AWS S3 upload storage is not configured',
        errorCode: 'UPLOAD_DRIVER_NOT_CONFIGURED',
      });
    }

    return {
      bucket: this.bucket,
      publicBaseUrl: this.publicBaseUrl,
    };
  }
}
