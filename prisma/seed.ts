import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dummy data dengan URL public (untuk testing)
// Menggunakan sample files dari internet yang bisa diakses langsung
const dummyContents = [
    {
        name: 'Sample Photo Pack',
        price: 25000,
        description: '📸 Koleksi foto sample untuk testing. 3 foto HD.',
        files: [
            {
                name: 'Nature 1.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Nature 2.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Nature 3.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1280',
                fileType: 'photo'
            },
        ],
    },
    {
        name: 'Sample Video Pack',
        price: 50000,
        description: '🎬 Koleksi video sample untuk testing. 2 video pendek.',
        files: [
            {
                name: 'Sample Video 1.mp4',
                mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
                fileType: 'video'
            },
            {
                name: 'Sample Video 2.mp4',
                mediaUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
                fileType: 'video'
            },
        ],
    },
    {
        name: 'Mixed Bundle',
        price: 75000,
        description: '📦 Bundle campuran foto dan video untuk testing.',
        files: [
            {
                name: 'City Photo.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Beach Photo.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Sample Video.mp4',
                mediaUrl: 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
                fileType: 'video'
            },
        ],
    },
    {
        name: 'Premium Photo Set',
        price: 100000,
        description: '✨ Set foto premium untuk testing. 5 foto berkualitas tinggi.',
        files: [
            {
                name: 'Mountain.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Ocean.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Forest.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Desert.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1280',
                fileType: 'photo'
            },
            {
                name: 'Waterfall.jpg',
                mediaUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1280',
                fileType: 'photo'
            },
        ],
    },
]

async function main() {
    console.log('🌱 Seeding database...')
    console.log('─'.repeat(50))

    for (const contentData of dummyContents) {
        // Delete existing content if exists (for re-run)
        const existingContent = await prisma.content.findFirst({
            where: { name: contentData.name },
        })

        if (existingContent) {
            await prisma.contentFile.deleteMany({
                where: { contentId: existingContent.id },
            })
            await prisma.content.delete({
                where: { id: existingContent.id },
            })
        }

        // Create new content with files
        const content = await prisma.content.create({
            data: {
                name: contentData.name,
                price: contentData.price,
                description: contentData.description,
                files: {
                    create: contentData.files,
                },
            },
            include: {
                files: true,
            },
        })

        console.log(`✅ ${content.name}`)
        console.log(`   💰 Rp ${content.price.toLocaleString('id-ID')}`)
        console.log(`   📁 ${content.files.length} files`)
        console.log('')
    }

    console.log('─'.repeat(50))
    console.log('🎉 Seeding completed!')
    console.log(`📦 Total: ${dummyContents.length} products`)
    console.log('')
    console.log('💡 Files menggunakan URL public (Unsplash & sample-videos.com)')
    console.log('   Bot akan langsung kirim dari URL tersebut.')
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
