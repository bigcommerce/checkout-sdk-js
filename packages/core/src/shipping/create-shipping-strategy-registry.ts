import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { AmazonPayScriptLoader } from '../payment/strategies/amazon-pay';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';

import ConsignmentActionCreator from './consignment-action-creator';
import ConsignmentRequestSender from './consignment-request-sender';
import ShippingStrategyActionCreator from './shipping-strategy-action-creator';
import { ShippingStrategy } from './strategies';
import { AmazonPayShippingStrategy } from './strategies/amazon';
import { AmazonPayV2ShippingStrategy } from './strategies/amazon-pay-v2';
import { DefaultShippingStrategy } from './strategies/default';

export default function createShippingStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender
): Registry<ShippingStrategy> {
    const registry = new Registry<ShippingStrategy>();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const consignmentActionCreator = new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender);

    registry.register('amazon', () =>
        new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
            new RemoteCheckoutActionCreator(
                new RemoteCheckoutRequestSender(requestSender),
                new CheckoutActionCreator(
                    new CheckoutRequestSender(requestSender),
                    new ConfigActionCreator(new ConfigRequestSender(requestSender)),
                    new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
                )),
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('amazonpay', () =>
        new AmazonPayV2ShippingStrategy(
            store,
            consignmentActionCreator,
            new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
            createAmazonPayV2PaymentProcessor(),
            new ShippingStrategyActionCreator(registry)
        )
    );

    registry.register('default', () =>
        new DefaultShippingStrategy(
            store,
            consignmentActionCreator
        )
    );

    return registry;
}
