import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type {
  StorageProvider,
  UploadObjectParams,
} from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  async uploadObject(params: UploadObjectParams): Promise<void> {
    const filePath = join(process.cwd(), 'uploads', params.key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, params.body);
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await unlink(join(process.cwd(), 'uploads', key));
    } catch {
      // Missing local files should not break cleanup flows.
    }
  }

  getPublicUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
