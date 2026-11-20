import bcrypt from 'bcryptjs';
import { userRepository } from '@/repositories/user.repository';
import { signToken, TokenPayload } from '@/lib/auth';

export class AuthService {
    async login(email: string, password: string): Promise<{ token: string; user: TokenPayload }> {
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            throw new Error('Email dan password wajib diisi.');
        }

        const user = await userRepository.findByEmail(normalizedEmail);
        if (!user) {
            throw new Error('Kredensial tidak valid.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Kredensial tidak valid.');
        }

        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        const token = await signToken(tokenPayload);

        return {
            token,
            user: tokenPayload,
        };
    }

    async getCurrentUser(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Pengguna tidak ditemukan.');
        }
        return user;
    }
}

export const authService = new AuthService();