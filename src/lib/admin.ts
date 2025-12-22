import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'miniseri-admin-secret-key-change-in-production'

export interface AdminPayload {
    userId: number
    email: string
    nama: string
    role: 'admin'
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export async function validateAdminLogin(email: string, password: string): Promise<{ valid: boolean; user?: any }> {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
            userType: 'ADMIN'
        }
    })

    if (!user || !user.password) {
        return { valid: false }
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
        return { valid: false }
    }

    return { valid: true, user }
}

export function generateAdminToken(user: { id: number; email: string; nama: string }): string {
    const payload: AdminPayload = {
        userId: user.id,
        email: user.email!,
        nama: user.nama,
        role: 'admin'
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyAdminToken(token: string): AdminPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
        return decoded
    } catch {
        return null
    }
}
