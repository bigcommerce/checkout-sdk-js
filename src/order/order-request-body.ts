import { CreditCardInstrument, VaultedInstrument } from '../payment';

export default interface OrderRequestBody {
    payment?: OrderPaymentRequestBody;
    useStoreCredit?: boolean;
    customerMessage?: string;
}

export interface OrderPaymentRequestBody {
    methodId: string;
    gatewayId?: string;
    paymentData?: CreditCardInstrument | VaultedInstrument;
}
