import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { validateAdminLogin, generateAdminToken, verifyAdminToken } from '../lib/admin'

export function createAdminRoutes() {
    const admin = new Hono()

    // Auth middleware
    const authMiddleware = async (c: any, next: () => Promise<void>) => {
        const authHeader = c.req.header('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const token = authHeader.substring(7)
        const payload = verifyAdminToken(token)

        if (!payload) {
            return c.json({ error: 'Invalid or expired token' }, 401)
        }

        c.set('admin', payload)
        await next()
    }

    // ============ AUTH ROUTES ============

    // Login
    admin.post('/login', async (c) => {
        try {
            const { email, password } = await c.req.json()

            if (!email || !password) {
                return c.json({ error: 'Email dan password wajib diisi' }, 400)
            }

            const result = await validateAdminLogin(email, password)

            if (!result.valid || !result.user) {
                return c.json({ error: 'Email atau password salah' }, 401)
            }

            const token = generateAdminToken(result.user)
            return c.json({
                token,
                message: 'Login berhasil',
                user: {
                    id: result.user.id,
                    nama: result.user.nama,
                    email: result.user.email
                }
            })
        } catch (error) {
            console.error('Login error:', error)
            return c.json({ error: 'Terjadi kesalahan' }, 500)
        }
    })

    // Verify token
    admin.get('/verify', authMiddleware, (c) => {
        const admin = c.get('admin')
        return c.json({ valid: true, admin })
    })

    // ============ STATS ROUTE ============

    admin.get('/stats', authMiddleware, async (c) => {
        try {
            const [usersCount, contentsCount, transactionsCount, revenue] = await Promise.all([
                prisma.user.count(),
                prisma.content.count(),
                prisma.transaction.count({ where: { status: 'PAID' } }),
                prisma.transaction.aggregate({
                    where: { status: 'PAID' },
                    _sum: { amount: true }
                })
            ])

            return c.json({
                users: usersCount,
                contents: contentsCount,
                transactions: transactionsCount,
                revenue: revenue._sum.amount || 0
            })
        } catch (error) {
            console.error('Stats error:', error)
            return c.json({ error: 'Gagal mengambil statistik' }, 500)
        }
    })

    // ============ CONTENT CRUD ============

    // List contents
    admin.get('/contents', authMiddleware, async (c) => {
        try {
            const contents = await prisma.content.findMany({
                include: {
                    _count: { select: { files: true, transactions: true } }
                },
                orderBy: { createdAt: 'desc' }
            })
            return c.json(contents)
        } catch (error) {
            console.error('Get contents error:', error)
            return c.json({ error: 'Gagal mengambil data content' }, 500)
        }
    })

    // Get single content
    admin.get('/contents/:id', authMiddleware, async (c) => {
        try {
            const id = parseInt(c.req.param('id'))
            const content = await prisma.content.findUnique({
                where: { id },
                include: { files: true }
            })

            if (!content) {
                return c.json({ error: 'Content tidak ditemukan' }, 404)
            }

            return c.json(content)
        } catch (error) {
            console.error('Get content error:', error)
            return c.json({ error: 'Gagal mengambil data content' }, 500)
        }
    })

    // Create content
    admin.post('/contents', authMiddleware, async (c) => {
        try {
            const data = await c.req.json()

            if (!data.name || !data.price) {
                return c.json({ error: 'Name dan price wajib diisi' }, 400)
            }

            const content = await prisma.content.create({
                data: {
                    name: data.name,
                    price: parseInt(data.price),
                    description: data.description || null,
                    type: data.type || 'FILE',
                    groupChatId: data.groupChatId || null,
                    inviteLink: data.inviteLink || null
                }
            })

            return c.json(content, 201)
        } catch (error) {
            console.error('Create content error:', error)
            return c.json({ error: 'Gagal membuat content' }, 500)
        }
    })

    // Update content
    admin.put('/contents/:id', authMiddleware, async (c) => {
        try {
            const id = parseInt(c.req.param('id'))
            const data = await c.req.json()

            const content = await prisma.content.update({
                where: { id },
                data: {
                    name: data.name,
                    price: data.price ? parseInt(data.price) : undefined,
                    description: data.description,
                    type: data.type,
                    groupChatId: data.groupChatId,
                    inviteLink: data.inviteLink
                }
            })

            return c.json(content)
        } catch (error) {
            console.error('Update content error:', error)
            return c.json({ error: 'Gagal mengupdate content' }, 500)
        }
    })

    // Delete content
    admin.delete('/contents/:id', authMiddleware, async (c) => {
        try {
            const id = parseInt(c.req.param('id'))

            await prisma.content.delete({ where: { id } })

            return c.json({ message: 'Content berhasil dihapus' })
        } catch (error) {
            console.error('Delete content error:', error)
            return c.json({ error: 'Gagal menghapus content' }, 500)
        }
    })

    // ============ CONTENT FILE CRUD ============

    // List files
    admin.get('/files', authMiddleware, async (c) => {
        try {
            const contentId = c.req.query('contentId')

            const where = contentId ? { contentId: parseInt(contentId) } : {}

            const files = await prisma.contentFile.findMany({
                where,
                include: { content: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' }
            })
            return c.json(files)
        } catch (error) {
            console.error('Get files error:', error)
            return c.json({ error: 'Gagal mengambil data file' }, 500)
        }
    })

    // Get single file
    admin.get('/files/:id', authMiddleware, async (c) => {
        try {
            const id = parseInt(c.req.param('id'))
            const file = await prisma.contentFile.findUnique({
                where: { id },
                include: { content: { select: { id: true, name: true } } }
            })

            if (!file) {
                return c.json({ error: 'File tidak ditemukan' }, 404)
            }

            return c.json(file)
        } catch (error) {
            console.error('Get file error:', error)
            return c.json({ error: 'Gagal mengambil data file' }, 500)
        }
    })

    // Create file
    admin.post('/files', authMiddleware, async (c) => {
        try {
            const data = await c.req.json()

            if (!data.contentId || !data.name || !data.mediaUrl || !data.fileType) {
                return c.json({ error: 'contentId, name, mediaUrl, dan fileType wajib diisi' }, 400)
            }

            const file = await prisma.contentFile.create({
                data: {
                    contentId: parseInt(data.contentId),
                    name: data.name,
                    mediaUrl: data.mediaUrl,
                    fileType: data.fileType
                }
            })

            return c.json(file, 201)
        } catch (error) {
            console.error('Create file error:', error)
            return c.json({ error: 'Gagal membuat file' }, 500)
        }
    })

    // Update file
    admin.put('/files/:id', authMiddleware, async (c) => {
        try {
            const id = parseInt(c.req.param('id'))
            const data = await c.req.json()

            const file = await prisma.contentFile.update({
                where: { id },
                data: {
                    contentId: data.contentId ? parseInt(data.contentId) : undefined,
                    name: data.name,
                    mediaUrl: data.mediaUrl,
                    fileType: data.fileType
                }
            })

            return c.json(file)
        } catch (error) {
            console.error('Update file error:', error)
            return c.json({ error: 'Gagal mengupdate file' }, 500)
        }
    })

    // Delete file
    admin.delete('/files/:id', authMiddleware, async (c) => {
        try {
            const id = parseInt(c.req.param('id'))

            await prisma.contentFile.delete({ where: { id } })

            return c.json({ message: 'File berhasil dihapus' })
        } catch (error) {
            console.error('Delete file error:', error)
            return c.json({ error: 'Gagal menghapus file' }, 500)
        }
    })

    return admin
}
