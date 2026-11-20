import { reportRepository } from '@/repositories/report.repository';
import { ShiftType } from '@prisma/client';

export class ReportService {
  async getDailyShiftReport(dateString?: string, shift?: ShiftType, machineId?: string) {
    const targetDate = dateString ? new Date(dateString) : new Date();

    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const logs = await reportRepository.getLogs(startDate, endDate, shift, machineId);

    // Hitung ringkasan agregasi
    const totalOutput = logs.reduce((acc, curr) => acc + curr.outputCount, 0);
    const avgTemperature =
      logs.length > 0
        ? parseFloat((logs.reduce((acc, curr) => acc + curr.temperature, 0) / logs.length).toFixed(1))
        : 0;

    const statusCounts = logs.reduce((acc: Record<string, number>, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return {
      filter: {
        date: startDate.toISOString().split('T')[0],
        shift: shift || 'ALL',
        machineId: machineId || 'ALL',
      },
      summary: {
        totalRecords: logs.length,
        totalOutput,
        avgTemperature,
        statusCounts,
      },
      logs,
    };
  }
}

export const reportService = new ReportService();