/// <reference path="../common/http-request/request-sender.d.ts" />
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutClient, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import ShippingAddressActionCreator from './shipping-address-action-creator';
import ShippingOptionActionCreator from './shipping-option-action-creator';
import { AmazonPayShippingStrategy, DefaultShippingStrategy, ShippingStrategy } from './strategies';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<ShippingStrategy> {
    const registry = new Registry<ShippingStrategy>();

    registry.register('amazon', () =>
        new AmazonPayShippingStrategy(
            store,
            new ShippingAddressActionCreator(client),
            new ShippingOptionActionCreator(client),
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutActionCreator(new RemoteCheckoutRequestSender(createRequestSender())),
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('default', () =>
        new DefaultShippingStrategy(
            store,
            new ShippingAddressActionCreator(client),
            new ShippingOptionActionCreator(client)
        )
    );

    return registry;
}
