import { CreditCardInstrument, VaultedInstrument } from '../payment';

export default interface OrderRequestBody {
    payment?: OrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
}

export interface OrderPaymentRequestBody {
    name: string;
    paymentData?: CreditCardInstrument | VaultedInstrument;
    gateway?: string;
}
