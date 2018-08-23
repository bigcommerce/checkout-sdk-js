import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { AmazonPayScriptLoader } from '../payment/strategies/amazon-pay';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';

import { ConsignmentRequestSender } from '.';
import ConsignmentActionCreator from './consignment-action-creator';
import { AmazonPayShippingStrategy, DefaultShippingStrategy, ShippingStrategy } from './strategies';

export default function createShippingStrategyRegistry(store: CheckoutStore): Registry<ShippingStrategy> {
    const requestSender = createRequestSender();
    const registry = new Registry<ShippingStrategy>();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);

    registry.register('amazon', () =>
        new AmazonPayShippingStrategy(
            store,
            new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender),
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
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
