import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const history = await prisma.uploadHistory.findMany({
      orderBy: {
        uploadDate: 'desc',
      },
      take: 100, // Limit to last 100 uploads
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
