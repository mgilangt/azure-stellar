import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dummy data - konten digital netral
const dummyContents = [
    {
        name: 'Paket Desain Logo',
        price: 150000,
        description: '🎨 50 template logo premium format AI & PNG. Cocok untuk brand & bisnis.',
        files: [
            { name: 'Logo Pack - Minimalist.zip', mediaUrl: 'logo/minimalist.zip', fileType: 'document' },
            { name: 'Logo Pack - Vintage.zip', mediaUrl: 'logo/vintage.zip', fileType: 'document' },
            { name: 'Logo Pack - Modern.zip', mediaUrl: 'logo/modern.zip', fileType: 'document' },
            { name: 'Preview 1.jpg', mediaUrl: 'logo/preview-1.jpg', fileType: 'photo' },
            { name: 'Preview 2.jpg', mediaUrl: 'logo/preview-2.jpg', fileType: 'photo' },
        ],
    },
    {
        name: 'Video Tutorial Editing',
        price: 75000,
        description: '🎬 Tutorial lengkap editing video dengan Premiere Pro. 5 video HD.',
        files: [
            { name: '01 - Pengenalan Premiere.mp4', mediaUrl: 'editing/01-intro.mp4', fileType: 'video' },
            { name: '02 - Cut dan Transition.mp4', mediaUrl: 'editing/02-cut.mp4', fileType: 'video' },
            { name: '03 - Color Grading.mp4', mediaUrl: 'editing/03-color.mp4', fileType: 'video' },
            { name: '04 - Audio Editing.mp4', mediaUrl: 'editing/04-audio.mp4', fileType: 'video' },
            { name: '05 - Export Settings.mp4', mediaUrl: 'editing/05-export.mp4', fileType: 'video' },
        ],
    },
    {
        name: 'Preset Lightroom Mobile',
        price: 35000,
        description: '📸 20 preset Lightroom untuk foto feed Instagram. Support mobile & desktop.',
        files: [
            { name: 'Preset - Warm Tone.dng', mediaUrl: 'preset/warm-tone.dng', fileType: 'document' },
            { name: 'Preset - Cool Tone.dng', mediaUrl: 'preset/cool-tone.dng', fileType: 'document' },
            { name: 'Preset - Vintage.dng', mediaUrl: 'preset/vintage.dng', fileType: 'document' },
            { name: 'Preset - Moody.dng', mediaUrl: 'preset/moody.dng', fileType: 'document' },
            { name: 'Preset - Bright.dng', mediaUrl: 'preset/bright.dng', fileType: 'document' },
            { name: 'Tutorial Install.mp4', mediaUrl: 'preset/tutorial.mp4', fileType: 'video' },
            { name: 'Before After.jpg', mediaUrl: 'preset/before-after.jpg', fileType: 'photo' },
        ],
    },
    {
        name: 'Stock Footage Nature',
        price: 50000,
        description: '🌿 10 video stock footage alam Indonesia 4K. Bebas royalty.',
        files: [
            { name: 'Sunrise Mountain.mp4', mediaUrl: 'nature/sunrise.mp4', fileType: 'video' },
            { name: 'Waterfall.mp4', mediaUrl: 'nature/waterfall.mp4', fileType: 'video' },
            { name: 'Rice Field.mp4', mediaUrl: 'nature/rice-field.mp4', fileType: 'video' },
            { name: 'Beach Waves.mp4', mediaUrl: 'nature/beach.mp4', fileType: 'video' },
            { name: 'Forest Walk.mp4', mediaUrl: 'nature/forest.mp4', fileType: 'video' },
            { name: 'Sunset Timelapse.mp4', mediaUrl: 'nature/sunset.mp4', fileType: 'video' },
            { name: 'Rain Ambience.mp4', mediaUrl: 'nature/rain.mp4', fileType: 'video' },
            { name: 'Cloud Timelapse.mp4', mediaUrl: 'nature/cloud.mp4', fileType: 'video' },
            { name: 'River Stream.mp4', mediaUrl: 'nature/river.mp4', fileType: 'video' },
            { name: 'Birds Flying.mp4', mediaUrl: 'nature/birds.mp4', fileType: 'video' },
        ],
    },
    {
        name: 'Bundle Desain Sosmed',
        price: 100000,
        description: '📱 Template Canva untuk Instagram, TikTok, YouTube. 100+ template.',
        files: [
            { name: 'Instagram Story.zip', mediaUrl: 'sosmed/ig-story.zip', fileType: 'document' },
            { name: 'Instagram Feed.zip', mediaUrl: 'sosmed/ig-feed.zip', fileType: 'document' },
            { name: 'TikTok Thumbnail.zip', mediaUrl: 'sosmed/tiktok.zip', fileType: 'document' },
            { name: 'YouTube Thumbnail.zip', mediaUrl: 'sosmed/youtube.zip', fileType: 'document' },
            { name: 'Tutorial Canva.mp4', mediaUrl: 'sosmed/tutorial.mp4', fileType: 'video' },
            { name: 'Preview All.jpg', mediaUrl: 'sosmed/preview.jpg', fileType: 'photo' },
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
