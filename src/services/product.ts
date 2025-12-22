import { prisma } from '../lib/prisma.js'
import { getSignedFileUrl } from '../lib/spaces.js'

/**
 * Get all available contents/products
 */
export async function getAllContents() {
    return prisma.content.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

/**
 * Get content by ID with files
 */
export async function getContentById(id: number) {
    return prisma.content.findUnique({
        where: { id },
        include: { files: true },
    })
}

/**
 * Get content files with signed URLs
 */
export async function getContentFilesWithUrls(contentId: number) {
    const content = await prisma.content.findUnique({
        where: { id: contentId },
        include: { files: true },
    })

    if (!content) return null

    // Generate signed URLs for each file
    const filesWithUrls = await Promise.all(
        content.files.map(async (file) => {
            // Extract key from the media URL
            // mediaUrl format: "folder/filename.mp4" (relative path in bucket)
            const signedUrl = await getSignedFileUrl(file.mediaUrl)

            return {
                ...file,
                signedUrl,
            }
        })
    )

    return {
        ...content,
        files: filesWithUrls,
    }
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}
