import {
    Checkout,
    Config,
    HostedCreditCardInstrument,
    HostedVaultedInstrument,
    Order,
    OrderMeta,
    PaymentAdditionalAction,
    PaymentInstrumentMeta,
    PaymentMethod,
    PaymentMethodMeta,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface HostedFormOrderData {
    additionalAction?: PaymentAdditionalAction;
    authToken: string;
    checkout?: Checkout;
    config?: Config;
    order?: Order;
    orderMeta?: OrderMeta;
    payment?: (HostedCreditCardInstrument | HostedVaultedInstrument) & PaymentInstrumentMeta;
    paymentMethod?: PaymentMethod;
    paymentMethodMeta?: PaymentMethodMeta;
}
