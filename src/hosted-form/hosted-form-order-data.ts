import { Checkout } from '../checkout';
import { Config } from '../config';
import { Order, OrderMeta } from '../order';
import { HostedCreditCardInstrument, HostedVaultedInstrument, PaymentInstrumentMeta, PaymentMethod, PaymentMethodMeta } from '../payment';

export default interface HostedFormOrderData {
    authToken: string;
    checkout?: Checkout;
    config?: Config;
    order?: Order;
    orderMeta?: OrderMeta;
    payment?: (HostedCreditCardInstrument | HostedVaultedInstrument) & PaymentInstrumentMeta;
    paymentMethod?: PaymentMethod;
    paymentMethodMeta?: PaymentMethodMeta;
}
