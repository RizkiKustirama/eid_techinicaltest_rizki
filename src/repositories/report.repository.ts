import { prisma } from '@/lib/prisma';
import { ShiftType } from '@prisma/client';

export class ReportRepository {
  async getLogs(startDate: Date, endDate: Date, shift?: ShiftType, machineId?: string) {
    return prisma.productionLog.findMany({
      where: {
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(shift ? { shift } : {}),
        ...(machineId ? { machineId } : {}),
      },
      include: {
        machine: {
          select: {
            code: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });
  }
}

export const reportRepository = new ReportRepository();