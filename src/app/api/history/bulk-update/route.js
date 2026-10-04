import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logAuditAction } from "@/lib/audit";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { uploadId, field, value } = await req.json();

    if (!uploadId || !field || value === undefined) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), { status: 400 });
    }

    // Define allowed fields to prevent SQL injection or tampering
    const allowedFields = ["batch", "department"];
    if (!allowedFields.includes(field)) {
      return new Response(JSON.stringify({ error: "Invalid field to update" }), { status: 400 });
    }

    const uploadHistory = await prisma.uploadHistory.findUnique({
      where: { id: uploadId }
    });

    if (!uploadHistory) {
      return new Response(JSON.stringify({ error: "Upload history not found" }), { status: 404 });
    }

    if (!uploadHistory.studentIds) {
      return new Response(JSON.stringify({ error: "No students associated with this upload" }), { status: 400 });
    }

    const studentIds = JSON.parse(uploadHistory.studentIds);

    if (!studentIds || studentIds.length === 0) {
      return new Response(JSON.stringify({ error: "No students associated with this upload" }), { status: 400 });
    }

    const updateData = {};
    updateData[field] = value;

    const result = await prisma.student.updateMany({
      where: {
        id: { in: studentIds }
      },
      data: updateData
    });

    // Log the audit action safely
    const userId = session?.user?.id || "SYSTEM";
    await logAuditAction(
      userId,
      "BULK_UPDATE_FROM_UPLOAD",
      `Bulk updated ${result.count} students from upload ${uploadHistory.filename}. Set ${field} to ${value}.`
    );

    return new Response(JSON.stringify({ success: true, count: result.count }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process bulk update' }), { status: 500 });
  }
}
