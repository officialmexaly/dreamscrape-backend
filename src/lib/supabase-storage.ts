import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// File type validation
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface FileValidationError {
  message: string;
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): FileValidationError | null {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      message: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
      code: 'INVALID_TYPE',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      code: 'FILE_TOO_LARGE',
    };
  }

  return null;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string = 'booking-files',
  path?: string
): Promise<{ data: UploadResult | null; error: FileValidationError | null }> {
  // Validate file
  const validationError = validateFile(file);
  if (validationError) {
    return { data: null, error: validationError };
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        data: null,
        error: {
          message: uploadError.message || 'Failed to upload file',
          code: 'UPLOAD_FAILED',
        },
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      data: {
        url: urlData.publicUrl,
        path: filePath,
        fileName: file.name,
        size: file.size,
        contentType: file.type,
      },
      error: null,
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to upload file',
        code: 'UPLOAD_FAILED',
      },
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  bucket: string = 'booking-files',
  path?: string
): Promise<{ data: UploadResult[]; errors: FileValidationError[] }> {
  const uploadPromises = files.map(file => uploadFile(file, bucket, path));
  const results = await Promise.all(uploadPromises);

  const successfulUploads: UploadResult[] = [];
  const errors: FileValidationError[] = [];

  results.forEach(result => {
    if (result.data) {
      successfulUploads.push(result.data);
    }
    if (result.error) {
      errors.push(result.error);
    }
  });

  return { data: successfulUploads, errors };
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  path: string,
  bucket: string = 'booking-files'
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}
