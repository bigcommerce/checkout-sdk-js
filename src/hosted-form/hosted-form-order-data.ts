import { Checkout } from '../checkout';
import { Config } from '../config';
import { Order, OrderMeta } from '../order';
import { AdditionalAction, HostedCreditCardInstrument, HostedVaultedInstrument, PaymentInstrumentMeta, PaymentMethod, PaymentMethodMeta } from '../payment';

export default interface HostedFormOrderData {
    additionalAction?: AdditionalAction;
    authToken: string;
    checkout?: Checkout;
    config?: Config;
    order?: Order;
    orderMeta?: OrderMeta;
    payment?: (HostedCreditCardInstrument | HostedVaultedInstrument) & PaymentInstrumentMeta;
    paymentMethod?: PaymentMethod;
    paymentMethodMeta?: PaymentMethodMeta;
}
