import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import { AmazonPayCustomerStrategy, DefaultCustomerStrategy, CustomerStrategy } from './strategies';
import { CheckoutClient, CheckoutStore } from '../checkout';
import { PaymentMethod, PaymentMethodActionCreator } from '../payment';
import { Registry } from '../common/registry';
import { RemoteCheckoutRequestSender } from '../remote-checkout';
import createSignInCustomerService from '../customer/create-sign-in-customer-service';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const signInCustomerService = createSignInCustomerService(store, client);

    registry.register('amazon', () =>
        new AmazonPayCustomerStrategy(
            store,
            signInCustomerService,
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutRequestSender(createRequestSender()),
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('default', () =>
        new DefaultCustomerStrategy(store, signInCustomerService)
    );

    return registry;
}
