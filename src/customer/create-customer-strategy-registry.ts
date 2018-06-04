import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutClient, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';
import { createBraintreeVisaCheckoutPaymentProcessor, VisaCheckoutScriptLoader } from '../payment/strategies/braintree';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';

import { CustomerStrategyActionCreator } from '.';
import CustomerActionCreator from './customer-action-creator';
import {
    AmazonPayCustomerStrategy,
    BraintreeVisaCheckoutCustomerStrategy,
    CustomerStrategy,
    DefaultCustomerStrategy,
} from './strategies';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const requestSender = createRequestSender();
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);

    registry.register('amazon', () =>
        new AmazonPayCustomerStrategy(
            store,
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            remoteCheckoutRequestSender,
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('braintreevisacheckout', () =>
        new BraintreeVisaCheckoutCustomerStrategy(
            store,
            new CheckoutActionCreator(new CheckoutRequestSender(requestSender)),
            new PaymentMethodActionCreator(client),
            new CustomerStrategyActionCreator(registry),
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            createBraintreeVisaCheckoutPaymentProcessor(getScriptLoader()),
            new VisaCheckoutScriptLoader(getScriptLoader())
        )
    );

    registry.register('default', () =>
        new DefaultCustomerStrategy(
            store,
            new CustomerActionCreator(client)
        )
    );

    return registry;
}
