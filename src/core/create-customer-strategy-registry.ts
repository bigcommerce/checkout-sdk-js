import { CheckoutClient, CheckoutStore } from './checkout';
import { DefaultCustomerStrategy, CustomerStrategy } from './customer/strategies';
import { SignInCustomerService } from './customer';
import { Registry } from './common/registry';
import { createScriptLoader } from './../script-loader';
import createSignInCustomerService from './create-sign-in-customer-service';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const signInCustomerService = createSignInCustomerService(store, client);

    registry.register('default', () =>
        new DefaultCustomerStrategy(store, signInCustomerService)
    );

    return registry;
}
