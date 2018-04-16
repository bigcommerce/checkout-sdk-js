import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutClient, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';

import CustomerActionCreator from './customer-action-creator';
import { AmazonPayCustomerStrategy, CustomerStrategy, DefaultCustomerStrategy } from './strategies';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(createRequestSender());

    registry.register('amazon', () =>
        new AmazonPayCustomerStrategy(
            store,
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            remoteCheckoutRequestSender,
            new AmazonPayScriptLoader(getScriptLoader())
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
