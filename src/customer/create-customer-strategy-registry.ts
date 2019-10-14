import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { AmazonPayScriptLoader } from '../payment/strategies/amazon-pay';
import { createBraintreeVisaCheckoutPaymentProcessor, BraintreeScriptLoader, BraintreeSDKCreator, VisaCheckoutScriptLoader } from '../payment/strategies/braintree';
import { ChasePayScriptLoader } from '../payment/strategies/chasepay';
import { createGooglePayPaymentProcessor, GooglePayBraintreeInitializer, GooglePayStripeInitializer } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';

import CustomerActionCreator from './customer-action-creator';
import CustomerRequestSender from './customer-request-sender';
import CustomerStrategyActionCreator from './customer-strategy-action-creator';
import { CustomerStrategy } from './strategies';
import { AmazonPayCustomerStrategy } from './strategies/amazon';
import { BraintreeVisaCheckoutCustomerStrategy } from './strategies/braintree';
import { ChasePayCustomerStrategy } from './strategies/chasepay';
import { DefaultCustomerStrategy } from './strategies/default';
import { GooglePayCustomerStrategy } from './strategies/googlepay';
import { MasterpassCustomerStrategy } from './strategies/masterpass';
import { SquareCustomerStrategy } from './strategies/square';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const scriptLoader = getScriptLoader();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender))
    );
    const formPoster = createFormPoster();
    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender);

    registry.register('amazon', () =>
        new AmazonPayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            remoteCheckoutRequestSender,
            new AmazonPayScriptLoader(scriptLoader)
        )
    );

    registry.register('braintreevisacheckout', () =>
        new BraintreeVisaCheckoutCustomerStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            new CustomerStrategyActionCreator(registry),
            remoteCheckoutActionCreator,
            createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender),
            new VisaCheckoutScriptLoader(scriptLoader)
        )
    );

    registry.register('chasepay', () =>
        new ChasePayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new ChasePayScriptLoader(scriptLoader),
            requestSender,
            formPoster
        )
    );

    registry.register('squarev2', () =>
        new SquareCustomerStrategy(
            store,
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender)
        )
    );

    registry.register('masterpass', () =>
        new MasterpassCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new MasterpassScriptLoader(scriptLoader)
        )
    );

    registry.register('googlepaybraintree', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayBraintreeInitializer(
                    new BraintreeSDKCreator(
                        new BraintreeScriptLoader(scriptLoader)
                    )
                )
            ),
            formPoster
        )
    );

    registry.register('googlepaystripe', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayStripeInitializer()
            ),
            formPoster
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
