import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() image?: Express.Multer.File) {
    if (!image) throw new BadRequestException('image file is required');
    const file = await this.uploadsService.uploadImage(image);
    return {
      id: file.id,
      url: `/uploads/image/${file.id}`,
      filename: file.filename,
    };
  }

  @Get('image/:id')
  async getImage(@Param('id') id: string, @Res() response: Response) {
    const metadata = await this.uploadsService.getImage(id);
    if (!metadata) {
      throw new BadRequestException('Image not found');
    }
    const contentType = (metadata.metadata as { contentType?: string } | undefined)?.contentType;
    response.setHeader('Content-Type', contentType || 'application/octet-stream');
    const stream = this.uploadsService.openDownloadStream(id);
    stream.pipe(response);
  }
}
