import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media');

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const oldFilename = id;
    const newFilename = body.name || oldFilename;

    const oldPath = path.join(MEDIA_DIR, oldFilename);
    const newPath = path.join(MEDIA_DIR, newFilename);

    // Check if old file exists
    try {
      await fs.access(oldPath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // If renaming, move the file
    if (oldFilename !== newFilename) {
      await fs.rename(oldPath, newPath);
    }

    // Get updated file stats
    const stats = await fs.stat(newPath);

    const item = {
      id: newFilename,
      name: newFilename,
      url: `/media/${newFilename}`,
      type: body.type || 'image',
      mime_type: body.mime_type || null,
      size: formatFileSize(stats.size),
      size_bytes: stats.size,
      created_at: stats.mtime.toISOString(),
      folder: 'media',
    };

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error('❌ Error updating media:', error);
    return NextResponse.json({ error: error.message || 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const filename = id;
    const filepath = path.join(MEDIA_DIR, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete the file
    await fs.unlink(filepath);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error deleting media:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}

