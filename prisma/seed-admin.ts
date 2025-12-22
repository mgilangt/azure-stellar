import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdmin() {
    console.log('👤 Seeding admin user...')

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@miniseri.com' },
        update: {
            password: hashedPassword,
            userType: 'ADMIN'
        },
        create: {
            nama: 'Administrator',
            email: 'admin@miniseri.com',
            password: hashedPassword,
            userType: 'ADMIN'
        }
    })

    console.log('✅ Admin user created/updated:', admin.id)
    console.log('')
    console.log('🔐 Admin Credentials:')
    console.log('   Email: admin@miniseri.com')
    console.log('   Password: admin123')
}

seedAdmin()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
