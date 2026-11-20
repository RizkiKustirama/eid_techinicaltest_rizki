import { NextResponse } from 'next/server';
import { machineService } from '@/services/machine.service';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const machine = await machineService.getMachineById(id);
    return NextResponse.json({ success: true, data: machine });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Mesin tidak ditemukan.' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const machine = await machineService.updateMachine(id, body);
    return NextResponse.json({ success: true, data: machine });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui mesin.' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const machine = await machineService.deleteMachine(id);
    return NextResponse.json({
      success: true,
      message: `Mesin ${machine.code} berhasil dihapus.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus mesin.' },
      { status: 400 }
    );
  }
}