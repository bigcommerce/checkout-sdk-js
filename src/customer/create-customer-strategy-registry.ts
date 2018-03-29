import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import { AmazonPayCustomerStrategy, DefaultCustomerStrategy, CustomerStrategy } from './strategies';
import { CheckoutClient, CheckoutStore } from '../checkout';
import { PaymentMethod, PaymentMethodActionCreator } from '../payment';
import { Registry } from '../common/registry';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import CustomerActionCreator from './customer-action-creator';

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
