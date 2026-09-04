import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

// ฟังก์ชันสร้าง Storage แยกตามโฟลเดอร์ประเภทไฟล์
export function createDynamicMulterStorage(subFolder: string = 'general') {
  return diskStorage({
    destination: (req: Request, file, cb) => {
      // สามารถดึง folder จาก Query parameter เช่น ?folder=thumbnails หรือใช้ค่า default
      const folderParam = (req.query?.folder as string) || subFolder;
      const uploadPath = join(process.cwd(), 'uploads', folderParam);

      // สร้างโฟลเดอร์อัตโนมัติหากยังไม่มี
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // สุ่มชื่อไฟล์ใหม่ป้องกันชื่อซ้ำ: timestamp-random.ext
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `img-${uniqueSuffix}${ext}`);
    },
  });
}

// ฟังก์ชันกรองเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF)
export function imageFileFilter(
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
    return cb(
      new BadRequestException(
        'รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, webp, gif) เท่านั้น',
      ),
      false,
    );
  }
  cb(null, true);
}
