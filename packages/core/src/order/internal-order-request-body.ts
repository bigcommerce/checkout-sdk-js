import { PaymentInstrument } from '../payment';

import { OrderExtraFieldValue } from './order-request-body';

export default interface InternalOrderRequestBody {
    cartId: string;
    payment?: InternalOrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
    externalSource?: string;
    shouldSaveInstrument?: boolean;
    poNumber?: string;
    additionalText?: string;
    orderExtraFields?: OrderExtraFieldValue[];
}

export interface InternalOrderPaymentRequestBody {
    name: string;
    gateway?: string;
    paymentData?: PaymentInstrument;
}
