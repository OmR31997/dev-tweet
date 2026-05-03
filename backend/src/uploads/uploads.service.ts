import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class UploadsService {
  private readonly bucket: GridFSBucket;

  constructor(@InjectConnection() connection: Connection) {
    if (!connection.db) {
      throw new Error('MongoDB connection is not ready');
    }
    this.bucket = new GridFSBucket(connection.db, { bucketName: 'images' });
  }

  uploadImage(file: Express.Multer.File) {
    return new Promise<{ id: string; filename: string }>((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`;
      const stream = this.bucket.openUploadStream(filename, {
        metadata: { contentType: file.mimetype },
      });
      stream.end(file.buffer);
      stream.on('error', reject);
      stream.on('finish', () => {
        resolve({ id: stream.id.toString(), filename });
      });
    });
  }

  async getImage(id: string) {
    const files = await this.bucket.find({ _id: new ObjectId(id) }).toArray();
    return files[0] ?? null;
  }

  openDownloadStream(id: string) {
    return this.bucket.openDownloadStream(new ObjectId(id));
  }

  async deleteImage(id: string) {
    try {
      await this.bucket.delete(new ObjectId(id));
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }
}
