import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACES_REGION || 'sgp1',
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY || '',
        secretAccessKey: process.env.DO_SPACES_SECRET || '',
    },
    forcePathStyle: false,
})

/**
 * Get a signed URL for a file in DO Spaces
 * URL expires in 1 hour by default
 */
export async function getSignedFileUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
    })

    return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Get the public URL for a file (if bucket is public)
 */
export function getPublicUrl(key: string): string {
    const endpoint = process.env.DO_SPACES_ENDPOINT || ''
    const bucket = process.env.DO_SPACES_BUCKET || ''

    // Convert endpoint to CDN URL format
    // https://sgp1.digitaloceanspaces.com -> https://bucket.sgp1.digitaloceanspaces.com
    const cdnUrl = endpoint.replace('https://', `https://${bucket}.`)

    return `${cdnUrl}/${key}`
}

export { s3Client }
