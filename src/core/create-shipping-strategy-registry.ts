import { CheckoutClient, CheckoutStore } from './checkout';
import { DefaultShippingStrategy } from './shipping/strategies';
import { Registry } from './common/registry';
import { ShippingStrategy } from './shipping/strategies';
import { UpdateShippingService } from './shipping';
import { createScriptLoader } from './../script-loader';
import createUpdateShippingService from './create-update-shipping-service';
import createRemoteCheckoutService from './create-remote-checkout-service';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<ShippingStrategy> {
    const registry = new Registry<ShippingStrategy>();
    const updateShippingService = createUpdateShippingService(store, client);
    const remoteCheckoutService = createRemoteCheckoutService(store, client);

    registry.register('default', () =>
        new DefaultShippingStrategy(store, updateShippingService)
    );

    return registry;
}
