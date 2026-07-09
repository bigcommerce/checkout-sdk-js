import { PaymentInstrument } from '../payment';

import { OrderExtraField } from './order-request-body';

export default interface InternalOrderRequestBody {
    cartId: string;
    payment?: InternalOrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
    externalSource?: string;
    shouldSaveInstrument?: boolean;
    poNumber?: string;
    additionalText?: string;
    orderExtraFields?: OrderExtraField[];
}

export interface InternalOrderPaymentRequestBody {
    name: string;
    gateway?: string;
    paymentData?: PaymentInstrument;
}
