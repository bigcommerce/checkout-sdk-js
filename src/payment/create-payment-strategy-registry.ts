/// <reference path="../common/form-poster/index.d.ts" />
import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
import { CheckoutClient, CheckoutStore } from '../checkout';
import { OrderActionCreator } from '../order';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { createAfterpayScriptLoader } from '../remote-checkout/methods/afterpay';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import { KlarnaScriptLoader } from '../remote-checkout/methods/klarna';
import { WepayRiskClient } from '../remote-checkout/methods/wepay';

import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentRequestSender from './payment-request-sender';
import PaymentStrategyRegistry from './payment-strategy-registry';
import {
    AfterpayPaymentStrategy,
    AmazonPayPaymentStrategy,
    BraintreeCreditCardPaymentStrategy,
    BraintreePaypalPaymentStrategy,
    CreditCardPaymentStrategy,
    KlarnaPaymentStrategy,
    LegacyPaymentStrategy,
    NoPaymentDataRequiredPaymentStrategy,
    OfflinePaymentStrategy,
    OffsitePaymentStrategy,
    PaypalExpressPaymentStrategy,
    PaypalProPaymentStrategy,
    SagePayPaymentStrategy,
    SquarePaymentStrategy,
    WepayPaymentStrategy,
} from './strategies';
import { createBraintreePaymentProcessor } from './strategies/braintree';
import { SquareScriptLoader } from './strategies/square';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient,
    paymentClient: any
) {
    const config = store.getState().checkout.getConfig();
    const registry = new PaymentStrategyRegistry({
        clientSidePaymentProviders: config && config.clientSidePaymentProviders,
        defaultToken: 'creditcard',
    });
    const scriptLoader = getScriptLoader();
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const orderActionCreator = new OrderActionCreator(client);
    const paymentActionCreator = new PaymentActionCreator(
        new PaymentRequestSender(paymentClient),
        new OrderActionCreator(client)
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(client);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
        new RemoteCheckoutRequestSender(createRequestSender())
    );

    registry.register('afterpay', () =>
        new AfterpayPaymentStrategy(
            store,
            new CartActionCreator(client),
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            createAfterpayScriptLoader()
        )
    );

    registry.register('amazon', () =>
        new AmazonPayPaymentStrategy(
            store,
            orderActionCreator,
            new BillingAddressActionCreator(client),
            remoteCheckoutActionCreator,
            new AmazonPayScriptLoader(scriptLoader)
        )
    );

    registry.register('creditcard', () =>
        new CreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register('klarna', () =>
        new KlarnaPaymentStrategy(
            store,
            orderActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new KlarnaScriptLoader(scriptLoader)
        )
    );

    registry.register('legacy', () =>
        new LegacyPaymentStrategy(
            store,
            orderActionCreator
        )
    );

    registry.register('offline', () =>
        new OfflinePaymentStrategy(
            store,
            orderActionCreator
        )
    );

    registry.register('offsite', () =>
        new OffsitePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register('paypal', () =>
        new PaypalProPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register('paypalexpress', () =>
        new PaypalExpressPaymentStrategy(
            store,
            orderActionCreator,
            scriptLoader
        )
    );

    registry.register('paypalexpresscredit', () =>
        new PaypalExpressPaymentStrategy(
            store,
            orderActionCreator,
            scriptLoader
        )
    );

    registry.register('sagepay', () =>
        new SagePayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            createFormPoster()
        )
    );

    registry.register('squarev2', () =>
        new SquarePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            new SquareScriptLoader(scriptLoader)
        )
    );

    registry.register('nopaymentdatarequired', () =>
        new NoPaymentDataRequiredPaymentStrategy(
            store,
            orderActionCreator
        )
    );

    registry.register('braintree', () =>
        new BraintreeCreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessor
        )
    );

    registry.register('braintreepaypal', () =>
        new BraintreePaypalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessor
        )
    );

    registry.register('braintreepaypalcredit', () =>
        new BraintreePaypalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessor,
            true
        )
    );

    registry.register('wepay', () =>
        new WepayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            new WepayRiskClient(scriptLoader)
        )
    );

    return registry;
}
