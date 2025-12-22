import Xendit from 'xendit-node'
import QRCode from 'qrcode'

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
})

const { Invoice, QrCode } = xenditClient

interface CreateInvoiceParams {
    externalId: string
    transactionId: number
    amount: number
    description: string
    payerEmail?: string
    customerName?: string
}

interface InvoiceResponse {
    id: string
    external_id: string
    invoice_url: string
    status: string
    amount: number
}

interface QRISResponse {
    id: string
    external_id: string
    qr_string: string
    status: string
    amount: number
}

/**
 * Create a Xendit QRIS payment (for direct QR in chat)
 */
export async function createQRIS(params: {
    externalId: string
    amount: number
    description?: string
}): Promise<QRISResponse> {
    const qrService = new QrCode({})

    const qr = await qrService.createCode({
        externalID: params.externalId,
        type: 'DYNAMIC' as unknown as 'DYNAMIC',
        callbackURL: process.env.WEBHOOK_URL + '/webhook/qris',
        amount: params.amount,
        currency: 'IDR',
    } as Parameters<typeof qrService.createCode>[0]) as Record<string, unknown>

    return {
        id: (qr.id as string) || '',
        external_id: (qr.external_id as string) || '',
        qr_string: (qr.qr_string as string) || '',
        status: (qr.status as string) || '',
        amount: params.amount,
    }
}

/**
 * Generate QR code image as buffer from QR string
 */
export async function generateQRImage(qrString: string): Promise<Buffer> {
    const buffer = await QRCode.toBuffer(qrString, {
        type: 'png',
        width: 400,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })
    return buffer
}

/**
 * Create a Xendit invoice with QRIS payment
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
    const invoiceService = new Invoice({})
    const baseUrl = process.env.WEBHOOK_URL || ''

    const invoice = await invoiceService.createInvoice({
        externalID: params.externalId,
        amount: params.amount,
        description: params.description,
        payerEmail: params.payerEmail,
        customer: params.customerName ? {
            givenNames: params.customerName,
        } : undefined,
        paymentMethods: ['QRIS'],
        invoiceDuration: 86400,
        currency: 'IDR',
        successRedirectURL: `${baseUrl}/payment/callback?transaction_id=${params.transactionId}&status=success`,
        failureRedirectURL: `${baseUrl}/payment/callback?transaction_id=${params.transactionId}&status=failed`,
    }) as Record<string, unknown>

    return {
        id: (invoice.id as string) || '',
        external_id: (invoice.external_id as string) || '',
        invoice_url: (invoice.invoice_url as string) || '',
        status: (invoice.status as string) || '',
        amount: (invoice.amount as number) || 0,
    }
}

/**
 * Get invoice details by ID
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
    const invoiceService = new Invoice({})

    const invoice = await invoiceService.getInvoice({
        invoiceID: invoiceId
    }) as Record<string, unknown>

    return {
        id: (invoice.id as string) || '',
        external_id: (invoice.external_id as string) || '',
        invoice_url: (invoice.invoice_url as string) || '',
        status: (invoice.status as string) || '',
        amount: (invoice.amount as number) || 0,
    }
}

/**
 * Verify webhook callback token
 */
export function verifyWebhookToken(token: string): boolean {
    return token === process.env.XENDIT_WEBHOOK_TOKEN
}
