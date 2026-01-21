export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
}

export const STORAGE_SERVICE = "STORAGE_SERVICE";
