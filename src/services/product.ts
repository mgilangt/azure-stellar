import { prisma } from '../lib/prisma'
import { getSignedFileUrl } from '../lib/spaces'

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
 * Get content files with URLs (supports both public URLs and DO Spaces paths)
 */
export async function getContentFilesWithUrls(contentId: number) {
    const content = await prisma.content.findUnique({
        where: { id: contentId },
        include: { files: true },
    })

    if (!content) return null

    // Generate URLs for each file
    const filesWithUrls = await Promise.all(
        content.files.map(async (file) => {
            let signedUrl: string

            // Check if mediaUrl is already a full URL (http/https)
            if (file.mediaUrl.startsWith('http://') || file.mediaUrl.startsWith('https://')) {
                // Use the URL directly
                signedUrl = file.mediaUrl
            } else {
                // Generate signed URL from DO Spaces
                signedUrl = await getSignedFileUrl(file.mediaUrl)
            }

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
