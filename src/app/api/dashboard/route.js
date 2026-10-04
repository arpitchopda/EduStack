import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalStudents = await prisma.student.count();
    
    // Calculate average CGPA across latest semesters
    // Since it's SQLite, we'll fetch and calculate in JS for simplicity on small datasets.
    const allSemesters = await prisma.semester.findMany({
      select: { cgpa: true, studentId: true }
    });

    let avgCgpa = 0;
    if (allSemesters.length > 0) {
      const validCgpas = allSemesters.filter(s => s.cgpa !== null && s.cgpa > 0);
      const total = validCgpas.reduce((sum, s) => sum + s.cgpa, 0);
      avgCgpa = validCgpas.length > 0 ? total / validCgpas.length : 0;
    }

    const recentUploads = await prisma.uploadHistory.findMany({
      orderBy: { uploadDate: 'desc' },
      take: 5
    });

    return NextResponse.json({
      totalStudents,
      avgCgpa: avgCgpa.toFixed(2),
      recentUploads
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
