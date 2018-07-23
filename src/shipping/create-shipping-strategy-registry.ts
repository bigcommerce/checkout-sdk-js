import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutClient, CheckoutStore } from '../checkout';
import CheckoutRequestSender from '../checkout/checkout-request-sender';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator } from '../payment';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';

import { ConsignmentRequestSender } from '.';
import ConsignmentActionCreator from './consignment-action-creator';
import { AmazonPayShippingStrategy, DefaultShippingStrategy, ShippingStrategy } from './strategies';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<ShippingStrategy> {
    const requestSender = createRequestSender();
    const registry = new Registry<ShippingStrategy>();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);

    registry.register('amazon', () =>
        new AmazonPayShippingStrategy(
            store,
            new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender),
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutActionCreator(new RemoteCheckoutRequestSender(requestSender)),
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('default', () =>
        new DefaultShippingStrategy(
            store,
            new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender)
        )
    );

    return registry;
}
