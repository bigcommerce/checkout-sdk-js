import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutClient, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigRequestSender } from '../config';
import ConfigActionCreator from '../config/config-action-creator';
import { PaymentMethodActionCreator } from '../payment';
import { createBraintreeVisaCheckoutPaymentProcessor, VisaCheckoutScriptLoader } from '../payment/strategies/braintree';
import { ChasePayScriptLoader } from '../payment/strategies/chasepay';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';

import { CustomerRequestSender, CustomerStrategyActionCreator } from '.';
import CustomerActionCreator from './customer-action-creator';
import {
    AmazonPayCustomerStrategy,
    BraintreeVisaCheckoutCustomerStrategy,
    ChasePayCustomerStrategy,
    CustomerStrategy,
    DefaultCustomerStrategy,
} from './strategies';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const requestSender = createRequestSender();
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const configRequestSender = new ConfigRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(configRequestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        configActionCreator
    );

    registry.register('amazon', () =>
        new AmazonPayCustomerStrategy(
            store,
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            remoteCheckoutRequestSender,
            new AmazonPayScriptLoader(getScriptLoader())
        )
    );

    registry.register('braintreevisacheckout', () =>
        new BraintreeVisaCheckoutCustomerStrategy(
            store,
            checkoutActionCreator,
            new PaymentMethodActionCreator(client),
            new CustomerStrategyActionCreator(registry),
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            createBraintreeVisaCheckoutPaymentProcessor(getScriptLoader()),
            new VisaCheckoutScriptLoader(getScriptLoader())
        )
    );

    registry.register('chasepay', () =>
        new ChasePayCustomerStrategy(
            store,
            new PaymentMethodActionCreator(client),
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            new ChasePayScriptLoader(getScriptLoader()),
            requestSender,
            createFormPoster()
        )
    );

    registry.register('default', () =>
        new DefaultCustomerStrategy(
            store,
            new CustomerActionCreator(
                new CustomerRequestSender(requestSender),
                checkoutActionCreator
            )
        )
    );

    return registry;
}
