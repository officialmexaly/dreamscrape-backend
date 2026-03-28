import { NextRequest, NextResponse } from 'next/server';
import { uploadFiles } from '@/src/lib/supabase-storage';
import { rateLimitMiddleware } from '@/src/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, 'upload');
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const path = formData.get('path') as string | undefined;

    // Validate that files exist
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Filter out non-file values (formData.getAll might include empty strings)
    const validFiles = files.filter(file => file instanceof File && file.size > 0);

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files provided' },
        { status: 400 }
      );
    }

    // Upload files
    const { data: uploadedFiles, errors } = await uploadFiles(
      validFiles,
      'booking-files',
      path
    );

    // Return results
    return NextResponse.json({
      files: uploadedFiles,
      errors: errors,
      success: uploadedFiles.length > 0,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
