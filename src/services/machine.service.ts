import { machineRepository, CreateMachineInput, UpdateMachineInput } from '@/repositories/machine.repository';
import { MachineType, MachineStatus } from '@prisma/client';

export class MachineService {
  async getAllMachines() {
    return machineRepository.findAll();
  }

  async getMachineById(id: string) {
    const machine = await machineRepository.findById(id);
    if (!machine) {
      throw new Error('Mesin tidak ditemukan.');
    }
    return machine;
  }

  async createMachine(data: CreateMachineInput) {
    if (!data.code || !data.name || !data.type || !data.operatorName) {
      throw new Error('Kode mesin, nama, tipe, dan nama operator wajib diisi.');
    }

    const existing = await machineRepository.findByCode(data.code.trim().toUpperCase());
    if (existing) {
      throw new Error(`Mesin dengan kode ${data.code} sudah terdaftar.`);
    }

    const validTypes = Object.values(MachineType);
    if (!validTypes.includes(data.type)) {
      throw new Error(`Tipe mesin harus salah satu dari: ${validTypes.join(', ')}`);
    }

    return machineRepository.create({
      ...data,
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      operatorName: data.operatorName.trim(),
      status: data.status || MachineStatus.Idle,
      temperature: data.temperature ?? 35.0,
      outputPerMinute: data.outputPerMinute ?? 0,
    });
  }

  async updateMachine(id: string, data: UpdateMachineInput) {
    await this.getMachineById(id);

    if (data.type) {
      const validTypes = Object.values(MachineType);
      if (!validTypes.includes(data.type)) {
        throw new Error(`Tipe mesin harus salah satu dari: ${validTypes.join(', ')}`);
      }
    }

    return machineRepository.update(id, data);
  }

  async deleteMachine(id: string) {
    await this.getMachineById(id);
    return machineRepository.delete(id);
  }
}

export const machineService = new MachineService();