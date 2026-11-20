import { prisma } from '@/lib/prisma';
import { Machine, MachineType, MachineStatus } from '@prisma/client';

export interface CreateMachineInput {
  code: string;
  name: string;
  type: MachineType;
  status?: MachineStatus;
  temperature?: number;
  outputPerMinute?: number;
  operatorName: string;
}

export interface UpdateMachineInput {
  name?: string;
  type?: MachineType;
  status?: MachineStatus;
  temperature?: number;
  outputPerMinute?: number;
  operatorName?: string;
}

export class MachineRepository {
  async findAll(): Promise<Machine[]> {
    return prisma.machine.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<Machine | null> {
    return prisma.machine.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Machine | null> {
    return prisma.machine.findUnique({
      where: { code },
    });
  }

  async create(data: CreateMachineInput): Promise<Machine> {
    return prisma.machine.create({
      data,
    });
  }

  async update(id: string, data: UpdateMachineInput): Promise<Machine> {
    return prisma.machine.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Machine> {
    return prisma.machine.delete({
      where: { id },
    });
  }
}

export const machineRepository = new MachineRepository();