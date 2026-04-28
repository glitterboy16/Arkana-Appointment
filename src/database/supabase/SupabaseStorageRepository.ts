import type { StorageRepository } from "../repositories/StorageRepository";

export class SupabaseStorageRepository implements StorageRepository {
  async getPublicUrl(_bucketName: string, _filePath: string): Promise<{ data: { publicUrl: string } }> {
    return { data: { publicUrl: '' } };
  }

  async uploadFile(_bucketName: string, _filePath: string, _file: File) {
    return { error: { message: 'Supabase no configurado' } };
  }

  async removeImage(_bucketName: string, _filePath: string) {
    return { error: null };
  }
}
