import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        semesters: {
          orderBy: { semester: 'asc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: `Student ${id} deleted successfully.` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
