import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dummy data - fokus foto dan video
const dummyContents = [
    {
        name: 'Video Spicy Vol.1',
        price: 50000,
        description: '🔥 Koleksi video eksklusif vol.1. 5 video HD durasi 2-3 menit.',
        files: [
            { name: 'Video 01.mp4', mediaUrl: 'spicy-vol1/video-01.mp4', fileType: 'video' },
            { name: 'Video 02.mp4', mediaUrl: 'spicy-vol1/video-02.mp4', fileType: 'video' },
            { name: 'Video 03.mp4', mediaUrl: 'spicy-vol1/video-03.mp4', fileType: 'video' },
            { name: 'Video 04.mp4', mediaUrl: 'spicy-vol1/video-04.mp4', fileType: 'video' },
            { name: 'Video 05.mp4', mediaUrl: 'spicy-vol1/video-05.mp4', fileType: 'video' },
        ],
    },
    {
        name: 'Video Spicy Vol.2',
        price: 75000,
        description: '🔥🔥 Koleksi video eksklusif vol.2. 7 video HD durasi 3-5 menit.',
        files: [
            { name: 'Video 01.mp4', mediaUrl: 'spicy-vol2/video-01.mp4', fileType: 'video' },
            { name: 'Video 02.mp4', mediaUrl: 'spicy-vol2/video-02.mp4', fileType: 'video' },
            { name: 'Video 03.mp4', mediaUrl: 'spicy-vol2/video-03.mp4', fileType: 'video' },
            { name: 'Video 04.mp4', mediaUrl: 'spicy-vol2/video-04.mp4', fileType: 'video' },
            { name: 'Video 05.mp4', mediaUrl: 'spicy-vol2/video-05.mp4', fileType: 'video' },
            { name: 'Video 06.mp4', mediaUrl: 'spicy-vol2/video-06.mp4', fileType: 'video' },
            { name: 'Video 07.mp4', mediaUrl: 'spicy-vol2/video-07.mp4', fileType: 'video' },
        ],
    },
    {
        name: 'Foto Set - Lingerie',
        price: 35000,
        description: '📸 Set foto eksklusif lingerie. 15 foto HD.',
        files: [
            { name: 'Photo 01.jpg', mediaUrl: 'lingerie/photo-01.jpg', fileType: 'photo' },
            { name: 'Photo 02.jpg', mediaUrl: 'lingerie/photo-02.jpg', fileType: 'photo' },
            { name: 'Photo 03.jpg', mediaUrl: 'lingerie/photo-03.jpg', fileType: 'photo' },
            { name: 'Photo 04.jpg', mediaUrl: 'lingerie/photo-04.jpg', fileType: 'photo' },
            { name: 'Photo 05.jpg', mediaUrl: 'lingerie/photo-05.jpg', fileType: 'photo' },
            { name: 'Photo 06.jpg', mediaUrl: 'lingerie/photo-06.jpg', fileType: 'photo' },
            { name: 'Photo 07.jpg', mediaUrl: 'lingerie/photo-07.jpg', fileType: 'photo' },
            { name: 'Photo 08.jpg', mediaUrl: 'lingerie/photo-08.jpg', fileType: 'photo' },
            { name: 'Photo 09.jpg', mediaUrl: 'lingerie/photo-09.jpg', fileType: 'photo' },
            { name: 'Photo 10.jpg', mediaUrl: 'lingerie/photo-10.jpg', fileType: 'photo' },
            { name: 'Photo 11.jpg', mediaUrl: 'lingerie/photo-11.jpg', fileType: 'photo' },
            { name: 'Photo 12.jpg', mediaUrl: 'lingerie/photo-12.jpg', fileType: 'photo' },
            { name: 'Photo 13.jpg', mediaUrl: 'lingerie/photo-13.jpg', fileType: 'photo' },
            { name: 'Photo 14.jpg', mediaUrl: 'lingerie/photo-14.jpg', fileType: 'photo' },
            { name: 'Photo 15.jpg', mediaUrl: 'lingerie/photo-15.jpg', fileType: 'photo' },
        ],
    },
    {
        name: 'Foto Set - Bikini',
        price: 40000,
        description: '🏖️ Set foto eksklusif bikini. 20 foto HD outdoor.',
        files: [
            { name: 'Photo 01.jpg', mediaUrl: 'bikini/photo-01.jpg', fileType: 'photo' },
            { name: 'Photo 02.jpg', mediaUrl: 'bikini/photo-02.jpg', fileType: 'photo' },
            { name: 'Photo 03.jpg', mediaUrl: 'bikini/photo-03.jpg', fileType: 'photo' },
            { name: 'Photo 04.jpg', mediaUrl: 'bikini/photo-04.jpg', fileType: 'photo' },
            { name: 'Photo 05.jpg', mediaUrl: 'bikini/photo-05.jpg', fileType: 'photo' },
            { name: 'Photo 06.jpg', mediaUrl: 'bikini/photo-06.jpg', fileType: 'photo' },
            { name: 'Photo 07.jpg', mediaUrl: 'bikini/photo-07.jpg', fileType: 'photo' },
            { name: 'Photo 08.jpg', mediaUrl: 'bikini/photo-08.jpg', fileType: 'photo' },
            { name: 'Photo 09.jpg', mediaUrl: 'bikini/photo-09.jpg', fileType: 'photo' },
            { name: 'Photo 10.jpg', mediaUrl: 'bikini/photo-10.jpg', fileType: 'photo' },
            { name: 'Photo 11.jpg', mediaUrl: 'bikini/photo-11.jpg', fileType: 'photo' },
            { name: 'Photo 12.jpg', mediaUrl: 'bikini/photo-12.jpg', fileType: 'photo' },
            { name: 'Photo 13.jpg', mediaUrl: 'bikini/photo-13.jpg', fileType: 'photo' },
            { name: 'Photo 14.jpg', mediaUrl: 'bikini/photo-14.jpg', fileType: 'photo' },
            { name: 'Photo 15.jpg', mediaUrl: 'bikini/photo-15.jpg', fileType: 'photo' },
            { name: 'Photo 16.jpg', mediaUrl: 'bikini/photo-16.jpg', fileType: 'photo' },
            { name: 'Photo 17.jpg', mediaUrl: 'bikini/photo-17.jpg', fileType: 'photo' },
            { name: 'Photo 18.jpg', mediaUrl: 'bikini/photo-18.jpg', fileType: 'photo' },
            { name: 'Photo 19.jpg', mediaUrl: 'bikini/photo-19.jpg', fileType: 'photo' },
            { name: 'Photo 20.jpg', mediaUrl: 'bikini/photo-20.jpg', fileType: 'photo' },
        ],
    },
    {
        name: 'Bundle Premium - Foto + Video',
        price: 150000,
        description: '💎 Bundle lengkap foto dan video premium. Best value!',
        files: [
            { name: 'Premium Video 01.mp4', mediaUrl: 'premium/video-01.mp4', fileType: 'video' },
            { name: 'Premium Video 02.mp4', mediaUrl: 'premium/video-02.mp4', fileType: 'video' },
            { name: 'Premium Video 03.mp4', mediaUrl: 'premium/video-03.mp4', fileType: 'video' },
            { name: 'Premium Photo 01.jpg', mediaUrl: 'premium/photo-01.jpg', fileType: 'photo' },
            { name: 'Premium Photo 02.jpg', mediaUrl: 'premium/photo-02.jpg', fileType: 'photo' },
            { name: 'Premium Photo 03.jpg', mediaUrl: 'premium/photo-03.jpg', fileType: 'photo' },
            { name: 'Premium Photo 04.jpg', mediaUrl: 'premium/photo-04.jpg', fileType: 'photo' },
            { name: 'Premium Photo 05.jpg', mediaUrl: 'premium/photo-05.jpg', fileType: 'photo' },
            { name: 'Premium Photo 06.jpg', mediaUrl: 'premium/photo-06.jpg', fileType: 'photo' },
            { name: 'Premium Photo 07.jpg', mediaUrl: 'premium/photo-07.jpg', fileType: 'photo' },
            { name: 'Premium Photo 08.jpg', mediaUrl: 'premium/photo-08.jpg', fileType: 'photo' },
            { name: 'Premium Photo 09.jpg', mediaUrl: 'premium/photo-09.jpg', fileType: 'photo' },
            { name: 'Premium Photo 10.jpg', mediaUrl: 'premium/photo-10.jpg', fileType: 'photo' },
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
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
