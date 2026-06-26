import { AddressExtraFieldValue } from '../form';
import { PaymentInstrument } from '../payment';

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
    invoiceComment?: string;
    orderExtraFields?: AddressExtraFieldValue[];
    poNumber?: string;
    referenceNumber?: string;
}
