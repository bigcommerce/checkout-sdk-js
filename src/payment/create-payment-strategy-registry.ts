import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator } from '../billing';
import { CheckoutActionCreator, CheckoutClient, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { OrderActionCreator } from '../order';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';

import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentRequestSender from './payment-request-sender';
import PaymentStrategyActionCreator from './payment-strategy-action-creator';
import PaymentStrategyRegistry from './payment-strategy-registry';
import {
    AfterpayPaymentStrategy,
    AmazonPayPaymentStrategy,
    BraintreeCreditCardPaymentStrategy,
    BraintreePaypalPaymentStrategy,
    BraintreeVisaCheckoutPaymentStrategy,
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
import { AfterpayScriptLoader } from './strategies/afterpay';
import { AmazonPayScriptLoader } from './strategies/amazon-pay';
import { createBraintreePaymentProcessor, createBraintreeVisaCheckoutPaymentProcessor, VisaCheckoutScriptLoader } from './strategies/braintree';
import { KlarnaScriptLoader } from './strategies/klarna';
import { SquareScriptLoader } from './strategies/square';
import { WepayRiskClient } from './strategies/wepay';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    client: CheckoutClient,
    paymentClient: any
) {
    const registry = new PaymentStrategyRegistry(store, { defaultToken: 'creditcard' });
    const scriptLoader = getScriptLoader();
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const requestSender = createRequestSender();

    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const orderActionCreator = new OrderActionCreator(client, checkoutValidator);
    const paymentActionCreator = new PaymentActionCreator(
        new PaymentRequestSender(paymentClient),
        orderActionCreator
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(client);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
        new RemoteCheckoutRequestSender(createRequestSender())
    );
    const configRequestSender = new ConfigRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(configRequestSender);

    registry.register('afterpay', () =>
        new AfterpayPaymentStrategy(
            store,
            checkoutValidator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new AfterpayScriptLoader(scriptLoader)
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
            new SquareScriptLoader(scriptLoader),
            requestSender,
            createFormPoster()
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

    registry.register('braintreevisacheckout', () =>
        new BraintreeVisaCheckoutPaymentStrategy(
            store,
            new CheckoutActionCreator(checkoutRequestSender, configActionCreator),
            paymentMethodActionCreator,
            new PaymentStrategyActionCreator(registry, orderActionCreator),
            paymentActionCreator,
            orderActionCreator,
            createBraintreeVisaCheckoutPaymentProcessor(scriptLoader),
            new VisaCheckoutScriptLoader(scriptLoader)
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
