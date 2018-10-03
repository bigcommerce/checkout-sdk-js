import { PaymentInstrument } from '../payment';

export default interface InternalOrderRequestBody {
    payment?: InternalOrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
    externalSource?: string;
}

export interface InternalOrderPaymentRequestBody {
    name: string;
    gateway?: string;
    paymentData?: PaymentInstrument;
}
