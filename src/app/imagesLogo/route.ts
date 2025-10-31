import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the logo file
    const logoPath = path.join(process.cwd(), 'public', 'Forvoy.png');

    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json(
        { error: 'Logo file not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(logoPath);

    // Return the image with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving logo:', error);
    return NextResponse.json(
      { error: 'Failed to load logo' },
      { status: 500 }
    );
  }
}