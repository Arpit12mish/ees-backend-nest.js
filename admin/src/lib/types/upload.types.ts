export type UploadImageResult = {
  provider: string;
  storageKey: string;
  originalUrl: string;
  thumbnailUrl: string;
  cardUrl: string;
  detailUrl: string;
  width: number;
  height: number;
  mimeType: string;
  size: number;
};
