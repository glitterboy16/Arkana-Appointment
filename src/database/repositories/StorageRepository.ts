export interface StorageRepository {
    uploadFile(bucketName: string, filePath: string, file: File): Promise<{ data?: { publicUrl: string }; error?: any }>;
    getPublicUrl(bucketName: string, filePath: string): Promise<{ data: { publicUrl: string } }>
    removeImage(bucketName: string, filePath: string): Promise<{ error?: any }>;
}