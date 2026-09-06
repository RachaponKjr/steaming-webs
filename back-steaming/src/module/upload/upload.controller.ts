import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  createDynamicMulterStorage,
  imageFileFilter,
} from '../../common/utils/multer-storage.util';
import { UploadImageDto } from './dto/upload-image.dto';

@ApiTags('Uploads')
@Controller('upload')
export class UploadController {
  @Post('image')
  @ApiOperation({
    summary: 'อัปโหลดรูปภาพแบบแยกโฟลเดอร์',
    description:
      'สามารถระบุประเภทโฟลเดอร์ได้ผ่าน Query param ?folder=thumbnails หรือ ?folder=og',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'folder',
    required: false,
    enum: ['thumbnails', 'og', 'avatars', 'general'],
    description: 'เลือกโฟลเดอร์ปลายทาง',
  })
  @ApiBody({
    type: UploadImageDto,
  })
  @ApiResponse({
    status: 201,
    description: 'อัปโหลดสำเร็จ ส่ง URL กลับไปให้ใช้งาน',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDynamicMulterStorage(),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // จำกัดขนาด 5MB
      },
    }),
  )
  uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'general',
    @Req() req: Request,
  ) {
    console.log(file);
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์รูปภาพ');
    }

    // สร้าง Full URL สำหรับนำไปแสดงผลที่หน้าเว็บ
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${folder}/${file.filename}`;

    return {
      success: true,
      filename: file.filename,
      size: file.size,
      folder: folder,
      url: fileUrl,
    };
  }
}
