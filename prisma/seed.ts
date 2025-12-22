import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dummy data dengan URL public (untuk testing)
// Menggunakan sample files dari internet yang bisa diakses langsung
const dummyContents = [
    {
        name: 'Sample Photo Pack',
        price: 25000,
        description: '📸 Koleksi foto sample untuk testing. 3 foto HD.',
        type: 'FILE',
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
        type: 'FILE',
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
        name: 'Premium Group Access',
        price: 150000,
        description: '👥 Akses ke grup premium dengan konten eksklusif. Lifetime access!',
        type: 'GROUP',
        // Ganti dengan chat_id grup kamu (contoh: -1001234567890)
        // Atau masukkan invite link statis
        inviteLink: 'https://t.me/+exampleinvitelink', // Ganti dengan link asli
        files: [], // Tidak ada files untuk GROUP type
    },
    {
        name: 'VIP Channel Membership',
        price: 250000,
        description: '⭐ Membership VIP channel dengan update harian. Lifetime access!',
        type: 'GROUP',
        inviteLink: 'https://t.me/+exampleviplink', // Ganti dengan link asli
        files: [],
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
                type: contentData.type,
                inviteLink: 'inviteLink' in contentData ? contentData.inviteLink : null,
                files: {
                    create: contentData.files,
                },
            },
            include: {
                files: true,
            },
        })

        const typeBadge = contentData.type === 'GROUP' ? '👥' : '📁'
        console.log(`✅ ${typeBadge} ${content.name}`)
        console.log(`   💰 Rp ${content.price.toLocaleString('id-ID')}`)
        console.log(`   📦 Type: ${contentData.type}`)
        if (contentData.type === 'FILE') {
            console.log(`   📁 ${content.files.length} files`)
        }
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
