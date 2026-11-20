import { NextResponse } from 'next/server';
import { telemetryService } from '@/services/telemetry.service';
import { machineService } from '@/services/machine.service';

// GET: Mengambil status live terkini seluruh mesin
export async function GET() {
  try {
    const machines = await machineService.getAllMachines();
    const currentShift = telemetryService.determineCurrentShift();
    return NextResponse.json({
      success: true,
      shift: currentShift,
      timestamp: new Date(),
      data: machines,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat status live.' },
      { status: 500 }
    );
  }
}

// POST: Memicu 1 siklus pembaruan telemetri acak dan mencatat ke ProductionLog
export async function POST() {
  try {
    const result = await telemetryService.processTick();
    return NextResponse.json({
      success: true,
      message: 'Telemetri berhasil diperbarui.',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui telemetri.' },
      { status: 500 }
    );
  }
}