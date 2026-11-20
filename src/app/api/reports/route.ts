import { NextResponse } from 'next/server';
import { reportService } from '@/services/report.service';
import { ShiftType } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || undefined;
        const shift = (searchParams.get('shift') as ShiftType) || undefined;
        const machineId = searchParams.get('machineId') || undefined;

        const report = await reportService.getDailyShiftReport(date, shift, machineId);
        return NextResponse.json({ success: true, data: report });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Gagal memuat laporan produksi.' },
            { status: 500 }
        );
    }
}