import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { R2StorageProvider } from './storage/r2-storage.provider';
import { AwsS3StorageProvider } from './storage/aws-s3-storage.provider';
import type { StorageProvider } from './storage/storage-provider.interface';
import { CACHE_HEADERS } from '../../common/constants/cache.constants';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const WEBP_MIME_TYPE = 'image/webp';

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const IMAGE_VARIANTS = {
  thumbnail: { suffix: 'thumb', width: 300 },
  card: { suffix: 'card', width: 600 },
  detail: { suffix: 'detail', width: 1200 },
  original: { suffix: 'original', width: 1600 },
} as const;

@Injectable()
export class UploadsService {
  constructor(
    private readonly config: ConfigService,
    private readonly localStorage: LocalStorageProvider,
    private readonly r2Storage: R2StorageProvider,
    private readonly awsS3Storage: AwsS3StorageProvider,
  ) {}

  async uploadImage(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        message: 'Image file is required',
        errorCode: 'IMAGE_FILE_REQUIRED',
      });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      throw new BadRequestException({
        message: 'Unsupported image file type',
        errorCode: 'INVALID_IMAGE_TYPE',
      });
    }

    const maxMb = this.config.get<number>('maxUploadSizeMb', 5);
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException({
        message: `Image size must be ${maxMb}MB or smaller`,
        errorCode: 'IMAGE_TOO_LARGE',
      });
    }

    const driver = this.config.get<string>('uploadDriver', 'local');
    const provider = this.getStorageProvider(driver);
    const uploadRoot = this.buildUploadRoot();
    const uuid = randomUUID();

    const variants = await this.generateAndUploadVariants(
      file.buffer,
      uploadRoot,
      uuid,
      provider,
    );

    const variantMap = Object.fromEntries(variants) as Record<
      keyof typeof IMAGE_VARIANTS,
      {
        key: string;
        url: string;
        width: number;
        height: number;
        size: number;
      }
    >;
    const detail = variantMap.detail;

    return {
      provider: driver,
      storageKey: detail.key,
      originalUrl: variantMap.original.url,
      thumbnailUrl: variantMap.thumbnail.url,
      cardUrl: variantMap.card.url,
      detailUrl: detail.url,
      width: detail.width,
      height: detail.height,
      mimeType: WEBP_MIME_TYPE,
      size: detail.size,
    };
  }

  async uploadVideo(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        message: 'Video file is required',
        errorCode: 'VIDEO_FILE_REQUIRED',
      });
    }

    if (!ALLOWED_VIDEO_TYPES.has(file.mimetype)) {
      throw new BadRequestException({
        message: 'Unsupported video file type',
        errorCode: 'INVALID_VIDEO_TYPE',
      });
    }

    const maxMb = this.config.get<number>('maxVideoUploadSizeMb', 30);
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException({
        message: `Video size must be ${maxMb}MB or smaller`,
        errorCode: 'VIDEO_TOO_LARGE',
      });
    }

    const driver = this.config.get<string>('uploadDriver', 'local');
    const provider = this.getStorageProvider(driver);
    const uploadRoot = this.buildUploadRoot('hero-reels');
    const uuid = randomUUID();
    const extension = file.mimetype === 'video/webm' ? 'webm' : 'mp4';
    const key = `${uploadRoot}/${uuid}.${extension}`;

    await provider.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
      cacheControl: CACHE_HEADERS.IMAGE_OBJECT,
    });

    return {
      provider: driver,
      storageKey: key,
      url: provider.getPublicUrl(key),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  private getStorageProvider(driver: string): StorageProvider {
    if (driver === 'local') return this.localStorage;
    if (driver === 'r2') return this.r2Storage;
    if (driver === 's3') return this.awsS3Storage;

    throw new BadRequestException({
      message: `Upload driver "${driver}" is not configured`,
      errorCode: 'UPLOAD_DRIVER_NOT_CONFIGURED',
    });
  }

  private buildUploadRoot(prefix: string = 'products') {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${prefix}/${year}/${month}`;
  }

  private async generateAndUploadVariants(
    buffer: Buffer,
    uploadRoot: string,
    uuid: string,
    provider: StorageProvider,
  ) {
    return Promise.all(
      Object.entries(IMAGE_VARIANTS).map(async ([name, variant]) => {
        const result = await this.createWebpVariant(buffer, variant.width);

        const key = `${uploadRoot}/${uuid}-${variant.suffix}.webp`;
        await provider.uploadObject({
          key,
          body: result.data,
          contentType: WEBP_MIME_TYPE,
          cacheControl: CACHE_HEADERS.IMAGE_OBJECT,
        });

        return [
          name,
          {
            key,
            url: provider.getPublicUrl(key),
            width: result.info.width,
            height: result.info.height,
            size: result.info.size,
          },
        ] as const;
      }),
    );
  }

  private async createWebpVariant(buffer: Buffer, width: number) {
    try {
      return await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new BadRequestException({
        message: 'Uploaded file is not a valid image',
        errorCode: 'INVALID_IMAGE_TYPE',
      });
    }
  }
}
