import { NextResponse } from 'next/server';
import { machineService } from '@/services/machine.service';

export async function GET() {
  try {
    const machines = await machineService.getAllMachines();
    return NextResponse.json({ success: true, data: machines });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil data mesin.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const machine = await machineService.createMachine(body);
    return NextResponse.json({ success: true, data: machine }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal membuat data mesin.' },
      { status: 400 }
    );
  }
}