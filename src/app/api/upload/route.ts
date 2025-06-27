import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { stat, mkdir } from 'fs/promises';

// Helper function to check if directory exists, create if not
async function ensureDirExists(dirPath: string) {
  try {
    await stat(dirPath);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      await mkdir(dirPath, { recursive: true });
    } else {
      throw e;
    }
  }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Use a public directory to serve files
  const relativeUploadDir = 'uploads';
  const uploadDir = join(process.cwd(), 'public', relativeUploadDir);

  await ensureDirExists(uploadDir);

  // Create a unique filename
  const filename = `${Date.now()}-${file.name}`;
  const path = join(uploadDir, filename);

  await writeFile(path, buffer);
  console.log(`File uploaded to ${path}`);

  // Return the public URL
  const fileUrl = `/${relativeUploadDir}/${filename}`;

  return NextResponse.json({ success: true, url: fileUrl });
} 