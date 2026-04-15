import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { MenuItem } from '../models';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

const BUCKET = process.env.AWS_S3_BUCKET || 'table-order-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class FileService {
  // 비동기 이미지 업로드 — 즉시 임시 URL 반환 후 백그라운드 S3 업로드
  async uploadImage(
    file: Express.Multer.File,
    storeId: string,
    menuItemId?: string,
  ): Promise<string> {
    // 파일 검증
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new Error('허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('파일 크기가 5MB를 초과합니다.');
    }

    const ext = path.extname(file.originalname) || this.getExtension(file.mimetype);
    const key = `menus/${storeId}/${uuidv4()}${ext}`;
    const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${key}`;

    // 백그라운드 S3 업로드
    setImmediate(async () => {
      try {
        const fileBuffer = fs.readFileSync(file.path);

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: file.mimetype,
          }),
        );

        // 메뉴 아이템 imageUrl 업데이트
        if (menuItemId) {
          await MenuItem.update({ imageUrl }, { where: { id: menuItemId } });
        }

        // 임시 파일 삭제
        fs.unlinkSync(file.path);

        logger.info('S3 이미지 업로드 완료', { key, menuItemId });
      } catch (error) {
        logger.error('S3 이미지 업로드 실패', { key, error });
        // 재시도 1회
        try {
          const fileBuffer = fs.readFileSync(file.path);
          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET,
              Key: key,
              Body: fileBuffer,
              ContentType: file.mimetype,
            }),
          );
          if (menuItemId) {
            await MenuItem.update({ imageUrl }, { where: { id: menuItemId } });
          }
          fs.unlinkSync(file.path);
          logger.info('S3 이미지 업로드 재시도 성공', { key });
        } catch (retryError) {
          logger.error('S3 이미지 업로드 재시도 실패', { key, retryError });
        }
      }
    });

    return imageUrl;
  }

  // 이미지 삭제
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1); // 앞의 '/' 제거

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: key,
        }),
      );

      logger.info('S3 이미지 삭제 완료', { key });
    } catch (error) {
      logger.error('S3 이미지 삭제 실패', { imageUrl, error });
    }
  }

  private getExtension(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[mimetype] || '.jpg';
  }
}

export default new FileService();
