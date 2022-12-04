import {
    PaymentStrategyFactory,
    toResolvableModule,
} from "@bigcommerce/checkout-sdk/payment-integration-api";

import NoPaymentDataRequiredPaymentStrategy from './no-payment-data-required-strategy';

const createNoPaymentStrategy: PaymentStrategyFactory<
    NoPaymentDataRequiredPaymentStrategy
    > = (paymentIntegrationService) => {

    return new NoPaymentDataRequiredPaymentStrategy(
        paymentIntegrationService,
    );
};

export default toResolvableModule(createNoPaymentStrategy, [
    { id: 'nopaymentdatarequired' },
]);
