import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';

import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentMethodRequestSender from './payment-method-request-sender';
import PaymentRequestSender from './payment-request-sender';
import PaymentStrategyActionCreator from './payment-strategy-action-creator';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { AfterpayPaymentStrategy, AfterpayScriptLoader } from './strategies/afterpay';
import { AmazonPayPaymentStrategy, AmazonPayScriptLoader } from './strategies/amazon-pay';
import {
    createBraintreePaymentProcessor,
    createBraintreeVisaCheckoutPaymentProcessor,
    BraintreeCreditCardPaymentStrategy,
    BraintreePaypalPaymentStrategy,
    BraintreeScriptLoader,
    BraintreeSDKCreator,
    BraintreeVisaCheckoutPaymentStrategy,
    VisaCheckoutScriptLoader
} from './strategies/braintree';
import { ChasePayPaymentStrategy, ChasePayScriptLoader } from './strategies/chasepay';
import { CreditCardPaymentStrategy } from './strategies/credit-card';
import {
    createGooglePayPaymentProcessor,
    GooglePayBraintreeInitializer,
    GooglePayPaymentStrategy,
    GooglePayStripeInitializer
} from './strategies/googlepay';
import { KlarnaPaymentStrategy, KlarnaScriptLoader } from './strategies/klarna';
import { LegacyPaymentStrategy } from './strategies/legacy';
import { MasterpassPaymentStrategy, MasterpassScriptLoader } from './strategies/masterpass';
import { NoPaymentDataRequiredPaymentStrategy } from './strategies/no-payment';
import { OfflinePaymentStrategy } from './strategies/offline';
import { OffsitePaymentStrategy } from './strategies/offsite';
import { PaypalExpressPaymentStrategy, PaypalProPaymentStrategy, PaypalScriptLoader } from './strategies/paypal';
import { SagePayPaymentStrategy } from './strategies/sage-pay';
import { SquarePaymentStrategy, SquareScriptLoader } from './strategies/square';
import { WepayPaymentStrategy, WepayRiskClient } from './strategies/wepay';
import { ZipPaymentStrategy, ZipScriptLoader } from './strategies/zip';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender
) {
    const registry = new PaymentStrategyRegistry(store, { defaultToken: PaymentStrategyType.CREDIT_CARD });
    const scriptLoader = getScriptLoader();
    const billingAddressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender));
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const orderActionCreator = new OrderActionCreator(new OrderRequestSender(requestSender), checkoutValidator);
    const paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator);
    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(new RemoteCheckoutRequestSender(requestSender));
    const configActionCreator = new ConfigActionCreator(new ConfigRequestSender(requestSender));
    const checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
    const paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator);

    registry.register(PaymentStrategyType.AFTERPAY, () =>
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

    registry.register(PaymentStrategyType.AMAZON, () =>
        new AmazonPayPaymentStrategy(
            store,
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            new AmazonPayScriptLoader(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.CREDIT_CARD, () =>
        new CreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register(PaymentStrategyType.KLARNA, () =>
        new KlarnaPaymentStrategy(
            store,
            orderActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new KlarnaScriptLoader(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.LEGACY, () =>
        new LegacyPaymentStrategy(
            store,
            orderActionCreator
        )
    );

    registry.register(PaymentStrategyType.OFFLINE, () =>
        new OfflinePaymentStrategy(
            store,
            orderActionCreator
        )
    );

    registry.register(PaymentStrategyType.OFFSITE, () =>
        new OffsitePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register(PaymentStrategyType.PAYPAL, () =>
        new PaypalProPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register(PaymentStrategyType.PAYPAL_EXPRESS, () =>
        new PaypalExpressPaymentStrategy(
            store,
            orderActionCreator,
            new PaypalScriptLoader(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.PAYPAL_EXPRESS_CREDIT, () =>
        new PaypalExpressPaymentStrategy(
            store,
            orderActionCreator,
            new PaypalScriptLoader(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.SAGE_PAY, () =>
        new SagePayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            createFormPoster()
        )
    );

    registry.register(PaymentStrategyType.SQUARE, () =>
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

    registry.register(PaymentStrategyType.NO_PAYMENT_DATA_REQUIRED, () =>
        new NoPaymentDataRequiredPaymentStrategy(
            store,
            orderActionCreator
        )
    );

    registry.register(PaymentStrategyType.BRAINTREE, () =>
        new BraintreeCreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessor
        )
    );

    registry.register(PaymentStrategyType.BRAINTREE_PAYPAL, () =>
        new BraintreePaypalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessor
        )
    );

    registry.register(PaymentStrategyType.BRAINTREE_PAYPAL_CREDIT, () =>
        new BraintreePaypalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            braintreePaymentProcessor,
            true
        )
    );

    registry.register(PaymentStrategyType.BRAINTREE_VISA_CHECKOUT, () =>
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

    registry.register(PaymentStrategyType.CHASE_PAY, () =>
        new ChasePayPaymentStrategy(
            store,
            checkoutActionCreator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            requestSender,
            new ChasePayScriptLoader(scriptLoader),
            new WepayRiskClient(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.BRAINTREE_GOOGLE_PAY, () =>
        new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayBraintreeInitializer(
                    new BraintreeSDKCreator(
                        new BraintreeScriptLoader(scriptLoader)
                    )
                )
            )
        )
    );

    registry.register(PaymentStrategyType.WE_PAY, () =>
        new WepayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            new WepayRiskClient(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.MASTERPASS, () =>
        new MasterpassPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            new MasterpassScriptLoader(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.STRIPE_GOOGLE_PAY, () =>
        new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayStripeInitializer()
            )
        )
    );

    registry.register(PaymentStrategyType.ZIP, () =>
        new ZipPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            new ZipScriptLoader(scriptLoader)
        )
    );

    return registry;
}
