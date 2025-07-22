import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import { randomUUID } from 'node:crypto';

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL; // Ensure no trailing '/'
const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const sql = neon(process.env.DATABASE_URL!);

// 1. Generate Presigned URL for Upload
export async function generatePresignedUrl(body: {
  fileName: string;
  contentType: string;
}) {
  try {
    const { fileName, contentType } = body;
    if (!fileName || !contentType)
      throw new Error('fileName and contentType required');

    const objectKey = `${randomUUID()}-${fileName}`;
    const publicFileUrl = R2_PUBLIC_BASE_URL
      ? `${R2_PUBLIC_BASE_URL}/${objectKey}`
      : null;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: objectKey,
      ContentType: contentType,
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return { success: true, presignedUrl, objectKey, publicFileUrl };
  } catch (error) {
    console.error('Presign Error:', error);
    return { success: false, error: 'Failed to prepare upload' };
  }
}

// 2. Save Metadata after Client Upload Confirmation
export async function saveMetadata(body: {
  objectKey: string;
  publicFileUrl: string;
  userId: string;
}) {
  try {
    const { objectKey, publicFileUrl } = body;
    const { userId } = body;
    if (!objectKey) throw new Error('objectKey required');

    const finalFileUrl =
      publicFileUrl ||
      (R2_PUBLIC_BASE_URL
        ? `${R2_PUBLIC_BASE_URL}/${objectKey}`
        : 'URL not available');

    await sql`
          INSERT INTO r2_files (object_key, file_url, user_id)
          VALUES (${objectKey}, ${finalFileUrl}, ${userId})
        `;
    console.log(`Metadata saved for R2 object: ${objectKey}`);
    return { success: true, fileUrl: finalFileUrl };
  } catch (error) {
    console.error('Metadata Save Error:', error);
    return { success: false, error: 'Failed to save metadata' };
  }
}

// 3. Upload file directly from buffer and save metadata
export async function uploadFile(file: {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  userId: string;
}) {
  try {
    const { buffer, mimetype, originalname, userId } = file;
    if (!buffer || !mimetype || !originalname) {
      throw new Error('File buffer, mimetype, and originalname are required');
    }

    const objectKey = `${randomUUID()}-${originalname}`;
    const fileUrl = R2_PUBLIC_BASE_URL
      ? `${R2_PUBLIC_BASE_URL}/${objectKey}`
      : 'URL not available';

    // Upload the file directly to R2
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: objectKey,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    // Save metadata to database
    await sql`
      INSERT INTO r2_files (object_key, file_url, user_id)
      VALUES (${objectKey}, ${fileUrl}, ${userId})
    `;

    console.log(`File uploaded to R2 and metadata saved: ${objectKey}`);
    return { success: true, fileUrl, objectKey };
  } catch (error) {
    console.error('File Upload Error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}
