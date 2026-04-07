import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');

// Helper function to get file stats safely
async function getFileStats(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function GET() {
  try {
    // Ensure media directory exists
    await fs.mkdir(MEDIA_DIR, { recursive: true });

    // Read all files in the media directory
    const files = await fs.readdir(MEDIA_DIR);

    // Get file information for each file
    const mediaItems = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(MEDIA_DIR, filename);
        const stats = await getFileStats(filePath);

        if (!stats || !stats.isFile()) return null;

        // Get file extension to determine type
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf',
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
        };

        return {
          id: filename, // Use filename as ID
          name: filename,
          url: `/media/${filename}`,
          type: ext.startsWith('.jpg') || ext.startsWith('.png') || ext.startsWith('.gif') || ext.startsWith('.webp') || ext.startsWith('.svg') ? 'image' : 'file',
          mime_type: mimeTypes[ext] || 'application/octet-stream',
          size: formatFileSize(stats.size),
          size_bytes: stats.size,
          created_at: stats.mtime.toISOString(),
          folder: 'media',
        };
      })
    );

    // Filter out null values and sort by creation date (newest first)
    const items = mediaItems
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('❌ Error reading media directory:', error);
    return NextResponse.json({ error: error.message || 'Failed to read media directory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure media directory exists
    await fs.mkdir(MEDIA_DIR, { recursive: true });

    // Generate unique filename if needed
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use original filename
    const filename = file.name;
    const filepath = path.join(MEDIA_DIR, filename);

    // Write file to disk
    await writeFile(filepath, buffer);

    // Get file stats
    const stats = await fs.stat(filepath);

    // Return the media item
    const item = {
      id: filename,
      name: filename,
      url: `/media/${filename}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      mime_type: file.type,
      size: formatFileSize(stats.size),
      size_bytes: stats.size,
      created_at: stats.mtime.toISOString(),
      folder: 'media',
    };

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}

