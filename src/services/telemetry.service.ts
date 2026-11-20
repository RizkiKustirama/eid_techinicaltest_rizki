import { prisma } from '@/lib/prisma';
import { ShiftType, MachineStatus } from '@prisma/client';

export class TelemetryService {
  // Menentukan shift berjalan berdasarkan jam server lokal
  determineCurrentShift(date: Date = new Date()): ShiftType {
    const hour = date.getHours();
    if (hour >= 7 && hour < 15) {
      return ShiftType.Shift_1; // 07:00 - 15:00
    } else if (hour >= 15 && hour < 23) {
      return ShiftType.Shift_2; // 15:00 - 23:00
    } else {
      return ShiftType.Shift_3; // 23:00 - 07:00
    }
  }

  // Melakukan update berkala nilai telemetri dan menyimpan snapshot ke ProductionLog
  async processTick() {
    const machines = await prisma.machine.findMany();
    const currentShift = this.determineCurrentShift();
    const now = new Date();

    const updatedMachines = [];

    for (const machine of machines) {
      let nextStatus = machine.status;
      let nextTemp = machine.temperature;
      let nextOutput = machine.outputPerMinute;

      // Simulasi fluktuasi real-time jika mesin Running
      if (machine.status === MachineStatus.Running) {
        // Fluktuasi suhu antara -0.8C hingga +1.2C
        const tempDelta = (Math.random() * 2 - 0.8);
        nextTemp = parseFloat((machine.temperature + tempDelta).toFixed(1));

        // Batas suhu normal mesin 35C - 85C
        if (nextTemp < 35) nextTemp = 35.0;
        if (nextTemp > 90) {
          nextStatus = MachineStatus.Error; // Mesin otomatis overheat/error jika > 90C
        }

        // Fluktuasi output per menit
        const outputDelta = Math.floor(Math.random() * 5) - 2;
        nextOutput = Math.max(1, machine.outputPerMinute + outputDelta);
      } else if (machine.status === MachineStatus.Idle) {
        // Suhu perlahan mendingin saat idle
        nextTemp = parseFloat(Math.max(30.0, machine.temperature - 0.5).toFixed(1));
        nextOutput = 0;
      }

      // Update data realtime di tabel Machine
      const updated = await prisma.machine.update({
        where: { id: machine.id },
        data: {
          status: nextStatus,
          temperature: nextTemp,
          outputPerMinute: nextOutput,
        },
      });

      // Catat log produksi
      await prisma.productionLog.create({
        data: {
          machineId: machine.id,
          shift: currentShift,
          outputCount: nextOutput,
          temperature: nextTemp,
          status: nextStatus,
          operatorName: machine.operatorName,
          recordedAt: now,
        },
      });

      updatedMachines.push(updated);
    }

    return {
      shift: currentShift,
      timestamp: now,
      machines: updatedMachines,
    };
  }
}

export const telemetryService = new TelemetryService();