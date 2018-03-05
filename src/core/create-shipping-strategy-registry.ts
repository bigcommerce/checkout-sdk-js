import { createScriptLoader } from '@bigcommerce/script-loader';
import { AmazonPayScriptLoader } from './remote-checkout/methods/amazon-pay';
import { AmazonPayShippingStrategy, DefaultShippingStrategy, ShippingStrategy } from './shipping/strategies';
import { CheckoutClient, CheckoutStore } from './checkout';
import { Registry } from './common/registry';
import { UpdateShippingService } from './shipping';
import createUpdateShippingService from './shipping/create-update-shipping-service';
import createRemoteCheckoutService from './create-remote-checkout-service';

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
