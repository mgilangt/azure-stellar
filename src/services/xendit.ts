import Xendit from 'xendit-node'

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
})

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
    invoice_url: string
    status: string
    amount: number
}

/**
 * Create a Xendit invoice with QRIS payment
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
    const invoiceService = new Invoice({})

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
        successRedirectURL: process.env.WEBHOOK_URL + '/success',
        failureRedirectURL: process.env.WEBHOOK_URL + '/failed',
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
