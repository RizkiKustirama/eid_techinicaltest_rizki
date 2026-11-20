import { PrismaClient, MachineType, MachineStatus, ShiftType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log(' Memulai proses seeding database...');

    // 1. Bersihkan data lama jika ada
    await prisma.productionLog.deleteMany();
    await prisma.machine.deleteMany();
    await prisma.user.deleteMany();

    // 2. Buat Demo User (Supervisor / Admin)
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
        data: {
            name: 'Rizki Supervisor',
            email: 'admin@electrindo.id',
            password: hashedPassword,
            role: 'supervisor',
        },
    });
    console.log(` User dibuat: ${user.email} (Password: password123)`);

    // 3. Buat Mesin Awal (CNC, Milling, Press, Assembly)
    const machinesData = [
        {
            code: 'CNC-01',
            name: 'CNC High Speed Machining 1',
            type: MachineType.CNC,
            status: MachineStatus.Running,
            temperature: 42.5,
            outputPerMinute: 12,
            operatorName: 'Budi Santoso',
        },
        {
            code: 'MIL-01',
            name: 'Vertical Milling Precision 2',
            type: MachineType.Milling,
            status: MachineStatus.Running,
            temperature: 47.8,
            outputPerMinute: 15,
            operatorName: 'Agus Pratama',
        },
        {
            code: 'PRS-01',
            name: 'Heavy Hydraulic Press 50T',
            type: MachineType.Press,
            status: MachineStatus.Idle,
            temperature: 32.0,
            outputPerMinute: 0,
            operatorName: 'Hendra Wijaya',
        },
        {
            code: 'ASM-01',
            name: 'Automated Robotic Assembly Line',
            type: MachineType.Assembly,
            status: MachineStatus.Running,
            temperature: 38.4,
            outputPerMinute: 22,
            operatorName: 'Siti Rahmawati',
        },
    ];

    const createdMachines = [];
    for (const m of machinesData) {
        const created = await prisma.machine.create({ data: m });
        createdMachines.push(created);
        console.log(` Mesin dibuat: [${created.code}] ${created.name}`);
    }

    // 4. Generate Sample Log Produksi 3 Shift (Hari Ini & Kemarin)
    console.log(' Membuat data dummy production log untuk 3 shift...');
    const shifts: { shift: ShiftType; hourOffset: number }[] = [
        { shift: ShiftType.Shift_1, hourOffset: 8 },  // 08:00
        { shift: ShiftType.Shift_2, hourOffset: 16 }, // 16:00
        { shift: ShiftType.Shift_3, hourOffset: 23 }, // 23:00
    ];

    const daysBack = [1, 0]; // Kemarin dan Hari ini

    for (const day of daysBack) {
        for (const s of shifts) {
            for (const machine of createdMachines) {
                const recordDate = new Date();
                recordDate.setDate(recordDate.getDate() - day);
                recordDate.setHours(s.hourOffset, 0, 0, 0);

                // Simulasi output wajar per shift
                const isRunning = machine.status !== MachineStatus.Maintenance;
                const baseOutput = isRunning ? (machine.outputPerMinute > 0 ? machine.outputPerMinute * 400 : 2500) : 0;
                const randomFactor = Math.floor(Math.random() * 200) - 100;
                const totalOutput = Math.max(0, baseOutput + randomFactor);

                await prisma.productionLog.create({
                    data: {
                        machineId: machine.id,
                        shift: s.shift,
                        outputCount: totalOutput,
                        temperature: machine.temperature + (Math.random() * 4 - 2),
                        status: isRunning ? MachineStatus.Running : MachineStatus.Idle,
                        operatorName: machine.operatorName,
                        recordedAt: recordDate,
                    },
                });
            }
        }
    }

    console.log(' Seeding database selesai!');
}

main()
    .catch((e) => {
        console.error(' Terjadi error saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });