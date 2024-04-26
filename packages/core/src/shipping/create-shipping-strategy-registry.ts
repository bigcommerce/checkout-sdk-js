import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    createPayPalCommerceFastlaneUtils,
    createPayPalCommerceSdk,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { PaymentProviderCustomerActionCreator } from '../payment-provider-customer';
import { StripeScriptLoader } from '../payment/strategies/stripe-upe';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import ConsignmentActionCreator from './consignment-action-creator';
import ConsignmentRequestSender from './consignment-request-sender';
import ShippingStrategyActionCreator from './shipping-strategy-action-creator';
import { ShippingStrategy } from './strategies';
import { AmazonPayV2ShippingStrategy } from './strategies/amazon-pay-v2';
import { BraintreeFastlaneShippingStrategy } from './strategies/braintree';
import { DefaultShippingStrategy } from './strategies/default';
import { PayPalCommerceFastlaneShippingStrategy } from './strategies/paypal-commerce';
import { StripeUPEShippingStrategy } from './strategies/stripe-upe';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
): Registry<ShippingStrategy> {
    const registry = new Registry<ShippingStrategy>();
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
    const subscriptionsActionCreator = new SubscriptionsActionCreator(
        new SubscriptionsRequestSender(requestSender),
    );
    const billingAddressActionCreator = new BillingAddressActionCreator(
        new BillingAddressRequestSender(requestSender),
        subscriptionsActionCreator,
    );
    const braintreeHostWindow: BraintreeHostWindow = window;

    registry.register(
        'amazonpay',
        () =>
            new AmazonPayV2ShippingStrategy(
                store,
                consignmentActionCreator,
                new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
                createAmazonPayV2PaymentProcessor(),
                new ShippingStrategyActionCreator(registry),
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
        'braintreeacceleratedcheckout',
        () =>
            new BraintreeFastlaneShippingStrategy(
                store,
                billingAddressActionCreator,
                consignmentActionCreator,
                paymentMethodActionCreator,
                new PaymentProviderCustomerActionCreator(),
                new BraintreeIntegrationService(
                    new BraintreeScriptLoader(getScriptLoader(), braintreeHostWindow),
                    braintreeHostWindow,
                ),
            ),
    );

    registry.register(
        'paypalcommerceacceleratedcheckout',
        () =>
            new PayPalCommerceFastlaneShippingStrategy(
                store,
                billingAddressActionCreator,
                consignmentActionCreator,
                paymentMethodActionCreator,
                new PaymentProviderCustomerActionCreator(),
                createPayPalCommerceSdk(),
                createPayPalCommerceFastlaneUtils(),
            ),
    );

    registry.register(
        'default',
        () => new DefaultShippingStrategy(store, consignmentActionCreator),
    );

    return registry;
}
