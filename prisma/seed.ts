import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create sample contents
    const content1 = await prisma.content.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Tutorial Video Premium',
            price: 50000,
            description: 'Video tutorial lengkap untuk pemula. Berisi 3 video berkualitas HD.',
            files: {
                create: [
                    {
                        name: 'Video 1 - Introduction.mp4',
                        mediaUrl: 'videos/tutorial-1.mp4',
                        fileType: 'video',
                    },
                    {
                        name: 'Video 2 - Advanced.mp4',
                        mediaUrl: 'videos/tutorial-2.mp4',
                        fileType: 'video',
                    },
                    {
                        name: 'Bonus - Cheatsheet.pdf',
                        mediaUrl: 'docs/cheatsheet.pdf',
                        fileType: 'document',
                    },
                ],
            },
        },
    })

    const content2 = await prisma.content.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Photo Pack Aesthetic',
            price: 25000,
            description: 'Koleksi 10 foto aesthetic berkualitas tinggi untuk konten sosial media.',
            files: {
                create: [
                    {
                        name: 'Photo 1.jpg',
                        mediaUrl: 'photos/aesthetic-1.jpg',
                        fileType: 'photo',
                    },
                    {
                        name: 'Photo 2.jpg',
                        mediaUrl: 'photos/aesthetic-2.jpg',
                        fileType: 'photo',
                    },
                ],
            },
        },
    })

    const content3 = await prisma.content.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: 'Exclusive Content Bundle',
            price: 100000,
            description: 'Bundle eksklusif berisi video, foto, dan dokumen premium.',
            files: {
                create: [
                    {
                        name: 'Exclusive Video.mp4',
                        mediaUrl: 'exclusive/video.mp4',
                        fileType: 'video',
                    },
                ],
            },
        },
    })

    console.log('✅ Created contents:', {
        content1: content1.name,
        content2: content2.name,
        content3: content3.name,
    })

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
