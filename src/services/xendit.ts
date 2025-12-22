import Xendit from 'xendit-node'

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
})

// Get Invoice instance
const { Invoice } = xenditClient

interface CreateInvoiceParams {
    externalId: string
    amount: number
    description: string
    payerEmail?: string
    customerName?: string
}

interface InvoiceResponse {
    id: string
    external_id: string
    user_id: string
    status: string
    merchant_name: string
    amount: number
    expiry_date: string
    invoice_url: string
    created: string
    updated: string
}

/**
 * Create a Xendit invoice with QRIS payment
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
    const invoiceInstance = new Invoice({})

    const invoice = await invoiceInstance.createInvoice({
        data: {
            externalId: params.externalId,
            amount: params.amount,
            description: params.description,
            customer: params.customerName ? {
                givenNames: params.customerName,
            } : undefined,
            paymentMethods: ['QRIS'],
            invoiceDuration: 86400,
            currency: 'IDR',
            successRedirectUrl: process.env.WEBHOOK_URL + '/success',
            failureRedirectUrl: process.env.WEBHOOK_URL + '/failed',
        }
    })

    return {
        id: invoice.id || '',
        external_id: invoice.externalId || '',
        user_id: invoice.userId || '',
        status: invoice.status || '',
        merchant_name: invoice.merchantName || '',
        amount: invoice.amount || 0,
        expiry_date: invoice.expiryDate?.toString() || '',
        invoice_url: invoice.invoiceUrl || '',
        created: invoice.created?.toString() || '',
        updated: invoice.updated?.toString() || '',
    }
}

/**
 * Get invoice details by ID
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
    const invoiceInstance = new Invoice({})

    const invoice = await invoiceInstance.getInvoiceById({
        invoiceId: invoiceId
    })

    return {
        id: invoice.id || '',
        external_id: invoice.externalId || '',
        user_id: invoice.userId || '',
        status: invoice.status || '',
        merchant_name: invoice.merchantName || '',
        amount: invoice.amount || 0,
        expiry_date: invoice.expiryDate?.toString() || '',
        invoice_url: invoice.invoiceUrl || '',
        created: invoice.created?.toString() || '',
        updated: invoice.updated?.toString() || '',
    }
}

/**
 * Verify webhook callback token
 */
export function verifyWebhookToken(token: string): boolean {
    return token === process.env.XENDIT_WEBHOOK_TOKEN
}
