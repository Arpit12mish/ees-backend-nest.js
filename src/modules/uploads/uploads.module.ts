import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { R2StorageProvider } from './storage/r2-storage.provider';
import { AwsS3StorageProvider } from './storage/aws-s3-storage.provider';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    LocalStorageProvider,
    R2StorageProvider,
    AwsS3StorageProvider,
  ],
})
export class UploadsModule {}
