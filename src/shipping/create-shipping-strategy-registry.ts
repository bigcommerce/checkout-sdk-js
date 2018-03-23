import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutClient, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';
import { createRemoteCheckoutService } from '../remote-checkout';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import createUpdateShippingService from './create-update-shipping-service';
import { AmazonPayShippingStrategy, DefaultShippingStrategy, ShippingStrategy } from './strategies';

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
            new PaymentMethodActionCreator(client),
            remoteCheckoutService,
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('default', () =>
        new DefaultShippingStrategy(store, updateShippingService)
    );

    return registry;
}
