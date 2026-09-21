export interface UploadObjectParams {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}

export interface StorageProvider {
  uploadObject(params: UploadObjectParams): Promise<void>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
