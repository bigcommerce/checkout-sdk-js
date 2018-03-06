import { createScriptLoader } from '@bigcommerce/script-loader';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import { AmazonPayShippingStrategy, DefaultShippingStrategy, ShippingStrategy } from './strategies';
import { CheckoutClient, CheckoutStore } from '../checkout';
import { createRemoteCheckoutService } from '../remote-checkout';
import { Registry } from '../common/registry';
import createUpdateShippingService from './create-update-shipping-service';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<ShippingStrategy> {
    const registry = new Registry<ShippingStrategy>();
    const updateShippingService = createUpdateShippingService(store, client);
    const remoteCheckoutService = createRemoteCheckoutService(store, client);

    registry.register('amazon', () =>
        new AmazonPayShippingStrategy(
            store,
            updateShippingService,
            remoteCheckoutService,
            new AmazonPayScriptLoader(createScriptLoader())
        )
    );

    registry.register('default', () =>
        new DefaultShippingStrategy(store, updateShippingService)
    );

    return registry;
}
