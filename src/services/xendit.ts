import Xendit from 'xendit-node'

const xendit = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || '',
})

const { Invoice } = xendit

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
    merchant_profile_picture_url: string
    amount: number
    expiry_date: string
    invoice_url: string
    available_banks: Array<{
        bank_code: string
        collection_type: string
        bank_account_number: string
        transfer_amount: number
        bank_branch: string
        account_holder_name: string
    }>
    available_ewallets: Array<{
        ewallet_type: string
    }>
    available_qr_codes: Array<{
        qr_code_type: string
    }>
    should_exclude_credit_card: boolean
    should_send_email: boolean
    created: string
    updated: string
}

/**
 * Create a Xendit invoice with QRIS payment
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
    const invoice = await Invoice.createInvoice({
        externalID: params.externalId,
        amount: params.amount,
        description: params.description,
        payerEmail: params.payerEmail,
        customer: params.customerName ? {
            givenNames: params.customerName,
        } : undefined,
        // Enable QRIS payment
        paymentMethods: ['QRIS'],
        // Invoice expires in 24 hours
        invoiceDuration: 86400,
        currency: 'IDR',
        successRedirectURL: process.env.WEBHOOK_URL + '/success',
        failureRedirectURL: process.env.WEBHOOK_URL + '/failed',
    })

    return invoice as InvoiceResponse
}

/**
 * Get invoice details by ID
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
    const invoice = await Invoice.getInvoice({ invoiceID: invoiceId })
    return invoice as InvoiceResponse
}

/**
 * Verify webhook callback token
 */
export function verifyWebhookToken(token: string): boolean {
    return token === process.env.XENDIT_WEBHOOK_TOKEN
}
