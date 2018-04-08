/// <reference path="../common/form-poster/index.d.ts" />
import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
import { CheckoutClient, CheckoutStore } from '../checkout';
import { createPlaceOrderService, OrderActionCreator } from '../order';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { createAfterpayScriptLoader } from '../remote-checkout/methods/afterpay';
import { AmazonPayScriptLoader } from '../remote-checkout/methods/amazon-pay';
import { KlarnaScriptLoader } from '../remote-checkout/methods/klarna';
import { WepayRiskClient } from '../remote-checkout/methods/wepay';

import PaymentMethodActionCreator from './payment-method-action-creator';
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
    const registry = new PaymentStrategyRegistry(store.getState().checkout.getConfig());
    const placeOrderService = createPlaceOrderService(store, client, paymentClient);
    const scriptLoader = getScriptLoader();
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const orderActionCreator = new OrderActionCreator(client);
    const paymentMethodActionCreator = new PaymentMethodActionCreator(client);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
        new RemoteCheckoutRequestSender(createRequestSender())
    );

    registry.register('afterpay', () =>
        new AfterpayPaymentStrategy(
            store,
            placeOrderService,
            new CartActionCreator(client),
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            createAfterpayScriptLoader()
        )
    );

    registry.register('amazon', () =>
        new AmazonPayPaymentStrategy(
            store,
            placeOrderService,
            new BillingAddressActionCreator(client),
            remoteCheckoutActionCreator,
            new AmazonPayScriptLoader(scriptLoader)
        )
    );

    registry.register('creditcard', () =>
        new CreditCardPaymentStrategy(store, placeOrderService)
    );

    registry.register('klarna', () =>
        new KlarnaPaymentStrategy(
            store,
            placeOrderService,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new KlarnaScriptLoader(scriptLoader)
        )
    );

    registry.register('legacy', () =>
        new LegacyPaymentStrategy(store, placeOrderService)
    );

    registry.register('offline', () =>
        new OfflinePaymentStrategy(store, placeOrderService)
    );

    registry.register('offsite', () =>
        new OffsitePaymentStrategy(store, placeOrderService, orderActionCreator)
    );

    registry.register('paypal', () =>
        new PaypalProPaymentStrategy(store, placeOrderService)
    );

    registry.register('paypalexpress', () =>
        new PaypalExpressPaymentStrategy(store, placeOrderService, orderActionCreator, scriptLoader)
    );

    registry.register('paypalexpresscredit', () =>
        new PaypalExpressPaymentStrategy(store, placeOrderService, orderActionCreator, scriptLoader)
    );

    registry.register('sagepay', () =>
        new SagePayPaymentStrategy(store, placeOrderService, orderActionCreator, createFormPoster())
    );

    registry.register('squarev2', () =>
        new SquarePaymentStrategy(store, placeOrderService, new SquareScriptLoader(scriptLoader))
    );

    registry.register('nopaymentdatarequired', () =>
        new NoPaymentDataRequiredPaymentStrategy(store, placeOrderService)
    );

    registry.register('braintree', () =>
        new BraintreeCreditCardPaymentStrategy(
            store,
            placeOrderService,
            paymentMethodActionCreator,
            braintreePaymentProcessor
        )
    );

    registry.register('braintreepaypal', () =>
        new BraintreePaypalPaymentStrategy(
            store,
            placeOrderService,
            paymentMethodActionCreator,
            braintreePaymentProcessor
        )
    );

    registry.register('braintreepaypalcredit', () =>
        new BraintreePaypalPaymentStrategy(
            store,
            placeOrderService,
            paymentMethodActionCreator,
            braintreePaymentProcessor,
            true
        )
    );

    registry.register('wepay', () =>
        new WepayPaymentStrategy(store, placeOrderService, new WepayRiskClient(scriptLoader))
    );

    return registry;
}
