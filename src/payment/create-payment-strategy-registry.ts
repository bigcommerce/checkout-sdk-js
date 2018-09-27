import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import createRequestSender from '@bigcommerce/request-sender/lib/create-request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import ConsignmentActionCreator from '../shipping/consignment-action-creator';
import ConsignmentRequestSender from '../shipping/consignment-request-sender';

import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentMethodRequestSender from './payment-method-request-sender';
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
    GooglePayPaymentStrategy,
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
import BraintreeScriptLoader from './strategies/braintree/braintree-script-loader';
import BraintreeSDKCreator from './strategies/braintree/braintree-sdk-creator';
import { ChasePayPaymentStrategy, ChasePayScriptLoader } from './strategies/chasepay';
import { GooglePayScriptLoader } from './strategies/googlepay';
import GooglePayBraintreeInitializer from './strategies/googlepay/googlepay-braintree-initializer';
import { KlarnaScriptLoader } from './strategies/klarna';
import { PaypalScriptLoader } from './strategies/paypal';
import { SquareScriptLoader } from './strategies/square';
import { WepayRiskClient } from './strategies/wepay';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender
) {
    const registry = new PaymentStrategyRegistry(store, { defaultToken: 'creditcard' });
    const scriptLoader = getScriptLoader();
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader);
    const braintreeSdkCreator = new BraintreeSDKCreator(braintreeScriptLoader);

    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const orderActionCreator = new OrderActionCreator(
        new OrderRequestSender(requestSender),
        checkoutValidator
    );
    const paymentActionCreator = new PaymentActionCreator(
        new PaymentRequestSender(paymentClient),
        orderActionCreator
    );

    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
        new RemoteCheckoutRequestSender(requestSender)
    );
    const configRequestSender = new ConfigRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(configRequestSender);
    const checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
    const paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

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
            new BillingAddressActionCreator(
                new BillingAddressRequestSender(requestSender)
            ),
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
            new PaypalScriptLoader(scriptLoader)
        )
    );

    registry.register('paypalexpresscredit', () =>
        new PaypalExpressPaymentStrategy(
            store,
            orderActionCreator,
            new PaypalScriptLoader(scriptLoader)
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
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
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

    registry.register('braintreevisacheckout', () =>
        new BraintreeVisaCheckoutPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender),
            new VisaCheckoutScriptLoader(scriptLoader)
        )
    );

    registry.register('chasepay', () =>
        new ChasePayPaymentStrategy(
            store,
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
            new ChasePayScriptLoader(getScriptLoader()),
            new WepayRiskClient(scriptLoader))
    );

    registry.register('googlepay', () =>
        new GooglePayPaymentStrategy(
            store,
            new CheckoutActionCreator(
                checkoutRequestSender,
                new ConfigActionCreator(new ConfigRequestSender(requestSender))
            ),
            paymentMethodActionCreator,
            new PaymentStrategyActionCreator(registry, orderActionCreator),
            paymentActionCreator,
            orderActionCreator,
            new GooglePayScriptLoader(scriptLoader),
            new GooglePayBraintreeInitializer(braintreeSdkCreator),
            createRequestSender(),
            new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender)),
            new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender)
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
