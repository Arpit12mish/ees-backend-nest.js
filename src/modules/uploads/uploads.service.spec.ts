import { UploadsService } from './uploads.service';
import type { StorageProvider } from './storage/storage-provider.interface';

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

function createFile(overrides: Partial<Express.Multer.File> = {}) {
  return {
    buffer: TINY_PNG,
    mimetype: 'image/png',
    size: TINY_PNG.length,
    originalname: 'tiny.png',
    ...overrides,
  } as Express.Multer.File;
}

function createStorageProvider(baseUrl: string): jest.Mocked<StorageProvider> {
  return {
    uploadObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn((key: string) => `${baseUrl}/${key}`),
  };
}

function createConfig(driver: 'local' | 'r2' | 's3', maxUploadSizeMb = 5) {
  return {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      const values: Record<string, unknown> = {
        uploadDriver: driver,
        maxUploadSizeMb,
      };
      return values[key] ?? defaultValue;
    }),
  };
}

describe('UploadsService', () => {
  it('uses local storage when UPLOAD_DRIVER=local', async () => {
    const localStorage = createStorageProvider('/uploads');
    const r2Storage = createStorageProvider('https://images.example.com');
    const s3Storage = createStorageProvider('https://bucket.s3.amazonaws.com');
    const service = new UploadsService(
      createConfig('local') as never,
      localStorage,
      r2Storage as never,
      s3Storage as never,
    );

    const result = await service.uploadImage(createFile());

    expect(result.provider).toBe('local');
    expect(localStorage.uploadObject).toHaveBeenCalledTimes(4);
    expect(r2Storage.uploadObject).not.toHaveBeenCalled();
    expect(s3Storage.uploadObject).not.toHaveBeenCalled();
    expect(result.detailUrl).toMatch(/^\/uploads\/products\//);
  });

  it('uses R2 storage when UPLOAD_DRIVER=r2', async () => {
    const localStorage = createStorageProvider('/uploads');
    const r2Storage = createStorageProvider('https://images.example.com');
    const s3Storage = createStorageProvider('https://bucket.s3.amazonaws.com');
    const service = new UploadsService(
      createConfig('r2') as never,
      localStorage,
      r2Storage as never,
      s3Storage as never,
    );

    const result = await service.uploadImage(createFile());

    expect(result.provider).toBe('r2');
    expect(r2Storage.uploadObject).toHaveBeenCalledTimes(4);
    expect(localStorage.uploadObject).not.toHaveBeenCalled();
    expect(s3Storage.uploadObject).not.toHaveBeenCalled();
    expect(result.detailUrl).toMatch(
      /^https:\/\/images\.example\.com\/products\//,
    );
  });

  it('uses AWS S3 storage when UPLOAD_DRIVER=s3', async () => {
    const localStorage = createStorageProvider('/uploads');
    const r2Storage = createStorageProvider('https://images.example.com');
    const s3Storage = createStorageProvider('https://bucket.s3.amazonaws.com');
    const service = new UploadsService(
      createConfig('s3') as never,
      localStorage,
      r2Storage as never,
      s3Storage as never,
    );

    const result = await service.uploadImage(createFile());

    expect(result.provider).toBe('s3');
    expect(s3Storage.uploadObject).toHaveBeenCalledTimes(4);
    expect(localStorage.uploadObject).not.toHaveBeenCalled();
    expect(r2Storage.uploadObject).not.toHaveBeenCalled();
    expect(result.detailUrl).toMatch(
      /^https:\/\/bucket\.s3\.amazonaws\.com\/products\//,
    );
  });

  it('rejects missing, invalid, and oversized files', async () => {
    const service = new UploadsService(
      createConfig('local', 1) as never,
      createStorageProvider('/uploads'),
      createStorageProvider('https://images.example.com') as never,
      createStorageProvider('https://bucket.s3.amazonaws.com') as never,
    );

    await expect(service.uploadImage()).rejects.toMatchObject({
      response: expect.objectContaining({ errorCode: 'IMAGE_FILE_REQUIRED' }),
    });
    await expect(
      service.uploadImage(createFile({ mimetype: 'image/gif' })),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ errorCode: 'INVALID_IMAGE_TYPE' }),
    });
    await expect(
      service.uploadImage(createFile({ size: 2 * 1024 * 1024 })),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ errorCode: 'IMAGE_TOO_LARGE' }),
    });
  });
});
