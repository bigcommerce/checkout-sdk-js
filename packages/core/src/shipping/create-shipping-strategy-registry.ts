import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { StripeScriptLoader } from '../payment/strategies/stripe-upe';

import ConsignmentActionCreator from './consignment-action-creator';
import ConsignmentRequestSender from './consignment-request-sender';
import createShippingStrategyRegistryV2 from './create-shipping-strategy-registry-v2';
import ShippingStrategyActionCreator from './shipping-strategy-action-creator';
import { ShippingStrategy } from './strategies';
import { AmazonPayV2ShippingStrategy } from './strategies/amazon-pay-v2';
import { DefaultShippingStrategy } from './strategies/default';
import { StripeUPEShippingStrategy } from './strategies/stripe-upe';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
): Registry<ShippingStrategy> {
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const registry = new Registry<ShippingStrategy>();
    const registryV2 = createShippingStrategyRegistryV2(paymentIntegrationService);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const consignmentActionCreator = new ConsignmentActionCreator(
        consignmentRequestSender,
        checkoutRequestSender,
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(
        new PaymentMethodRequestSender(requestSender),
    );
    const scriptLoader = getScriptLoader();

    registry.register(
        'amazonpay',
        () =>
            new AmazonPayV2ShippingStrategy(
                store,
                consignmentActionCreator,
                new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
                createAmazonPayV2PaymentProcessor(),
                new ShippingStrategyActionCreator(registry, registryV2),
            ),
    );

    registry.register(
        'stripeupe',
        () =>
            new StripeUPEShippingStrategy(
                store,
                new StripeScriptLoader(scriptLoader),
                consignmentActionCreator,
                paymentMethodActionCreator,
            ),
    );

    registry.register(
        'default',
        () => new DefaultShippingStrategy(store, consignmentActionCreator),
    );

    return registry;
}
