import { PaymentInstrument } from '../payment';
import { B2BExtraField } from '../payment/b2b-post-order-request-sender';

export default interface InternalOrderRequestBody {
    cartId: string;
    payment?: InternalOrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
    externalSource?: string;
    shouldSaveInstrument?: boolean;
    b2bMetadata?: InternalOrderB2BMetadata;
}

export interface InternalOrderPaymentRequestBody {
    name: string;
    gateway?: string;
    paymentData?: PaymentInstrument;
}

export interface InternalOrderB2BMetadata {
    // For invoice flow
    invoiceComment?: string;
    // For all B2B flows
    poNumber?: string;
    referenceNumber?: string;
    orderExtraFields?: B2BExtraField[];
}
