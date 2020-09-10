import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { HostedFormFactory } from '../hosted-form';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { createSpamProtection, GoogleRecaptcha, PaymentHumanVerificationHandler, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../spam-protection';
import { StoreCreditActionCreator, StoreCreditRequestSender } from '../store-credit';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentMethodRequestSender from './payment-method-request-sender';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';
import PaymentStrategyActionCreator from './payment-strategy-action-creator';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { AdyenV2PaymentStrategy, AdyenV2ScriptLoader } from './strategies/adyenv2';
import { AffirmPaymentStrategy, AffirmScriptLoader } from './strategies/affirm';
import { AfterpayPaymentStrategy, AfterpayScriptLoader } from './strategies/afterpay';
import { AmazonPayPaymentStrategy, AmazonPayScriptLoader } from './strategies/amazon-pay';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentStrategy } from './strategies/amazon-pay-v2';
import { BlueSnapV2PaymentStrategy } from './strategies/bluesnapv2';
import { BoltPaymentStrategy, BoltScriptLoader } from './strategies/bolt';
import { createBraintreePaymentProcessor, createBraintreeVisaCheckoutPaymentProcessor, BraintreeCreditCardPaymentStrategy, BraintreePaypalPaymentStrategy, BraintreeScriptLoader, BraintreeSDKCreator, BraintreeVisaCheckoutPaymentStrategy, VisaCheckoutScriptLoader } from './strategies/braintree';
import { CardinalClient, CardinalScriptLoader, CardinalThreeDSecureFlow } from './strategies/cardinal';
import { ChasePayPaymentStrategy, ChasePayScriptLoader } from './strategies/chasepay';
import { ConvergePaymentStrategy } from './strategies/converge';
import { CreditCardPaymentStrategy } from './strategies/credit-card';
import { CreditCardRedirectPaymentStrategy } from './strategies/credit-card-redirect';
import { CyberSourcePaymentStrategy } from './strategies/cybersource/index';
import { ExternalPaymentStrategy } from './strategies/external';
import { createGooglePayPaymentProcessor, GooglePayAdyenV2Initializer, GooglePayAuthorizeNetInitializer, GooglePayBraintreeInitializer, GooglePayCheckoutcomInitializer, GooglePayPaymentStrategy, GooglePayStripeInitializer } from './strategies/googlepay';
import { KlarnaPaymentStrategy, KlarnaScriptLoader } from './strategies/klarna';
import { KlarnaV2PaymentStrategy, KlarnaV2ScriptLoader } from './strategies/klarnav2';
import { LegacyPaymentStrategy } from './strategies/legacy';
import { MasterpassPaymentStrategy, MasterpassScriptLoader } from './strategies/masterpass';
import { NoPaymentDataRequiredPaymentStrategy } from './strategies/no-payment';
import { OfflinePaymentStrategy } from './strategies/offline';
import { OffsitePaymentStrategy } from './strategies/offsite';
import { PaypalExpressPaymentStrategy, PaypalProPaymentStrategy, PaypalScriptLoader } from './strategies/paypal';
import { createPaypalCommercePaymentProcessor, PaypalCommerceCreditCardPaymentStrategy, PaypalCommerceHostedForm, PaypalCommercePaymentStrategy } from './strategies/paypal-commerce';
import { SagePayPaymentStrategy } from './strategies/sage-pay';
import { SquarePaymentStrategy, SquareScriptLoader } from './strategies/square';
import { StripeScriptLoader, StripeV3PaymentStrategy } from './strategies/stripev3';
import { WepayPaymentStrategy, WepayRiskClient } from './strategies/wepay';
import { ZipPaymentStrategy, ZipScriptLoader } from './strategies/zip';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender,
    spamProtection: GoogleRecaptcha,
    locale: string
) {
    const registry = new PaymentStrategyRegistry(store, { defaultToken: PaymentStrategyType.CREDIT_CARD });
    const scriptLoader = getScriptLoader();
    const paymentRequestTransformer = new PaymentRequestTransformer();
    const paymentRequestSender = new PaymentRequestSender(paymentClient);
    const billingAddressActionCreator = new BillingAddressActionCreator(
        new BillingAddressRequestSender(requestSender),
        new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender))
    );
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const spamProtectionActionCreator = new SpamProtectionActionCreator(spamProtection, new SpamProtectionRequestSender(requestSender));
    const orderActionCreator = new OrderActionCreator(new OrderRequestSender(requestSender), checkoutValidator);
    const storeCreditActionCreator = new StoreCreditActionCreator(new StoreCreditRequestSender(requestSender));
    const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
    const paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer, paymentHumanVerificationHandler);
    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(new RemoteCheckoutRequestSender(requestSender));
    const configActionCreator = new ConfigActionCreator(new ConfigRequestSender(requestSender));
    const checkoutActionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
    const paymentStrategyActionCreator = new PaymentStrategyActionCreator(registry, orderActionCreator, spamProtectionActionCreator);
    const formPoster = createFormPoster();
    const hostedFormFactory = new HostedFormFactory(store);
    const paypalCommercePaymentProcessor = createPaypalCommercePaymentProcessor(scriptLoader, requestSender);

    registry.register(PaymentStrategyType.ADYENV2, () =>
        new AdyenV2PaymentStrategy(
            store,
            paymentActionCreator,
            orderActionCreator,
            new AdyenV2ScriptLoader(scriptLoader, getStylesheetLoader()),
            locale
        )
    );

    registry.register(PaymentStrategyType.ADYENV2_GOOGLEPAY, () =>
        new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAdyenV2Initializer()
            )
        )
    );

    registry.register(PaymentStrategyType.AFFIRM, () =>
        new AffirmPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            new AffirmScriptLoader()
        )
    );

    registry.register(PaymentStrategyType.AFTERPAY, () =>
        new AfterpayPaymentStrategy(
            store,
            checkoutValidator,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
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

    registry.register(PaymentStrategyType.AUTHORIZENET_GOOGLE_PAY, () =>
        new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAuthorizeNetInitializer()
            )
        )
    );

    registry.register(PaymentStrategyType.AMAZONPAYV2, () =>
        new AmazonPayV2PaymentStrategy(
            store,
            paymentStrategyActionCreator,
            paymentMethodActionCreator,
            orderActionCreator,
            paymentActionCreator,
            createAmazonPayV2PaymentProcessor()
        )
    );

    registry.register(PaymentStrategyType.BLUESNAPV2, () =>
        new BlueSnapV2PaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register(PaymentStrategyType.CREDIT_CARD, () =>
        new CreditCardPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory
        )
    );

    registry.register(PaymentStrategyType.CHECKOUTCOM, () =>
        new CreditCardRedirectPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
            formPoster
        )
    );

    registry.register(PaymentStrategyType.CYBERSOURCE, () =>
        new CyberSourcePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
            new CardinalThreeDSecureFlow(
                store,
                paymentActionCreator,
                paymentMethodActionCreator,
                new CardinalClient(new CardinalScriptLoader(scriptLoader))
            )
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

    registry.register(PaymentStrategyType.KLARNAV2, () =>
        new KlarnaV2PaymentStrategy(
            store,
            orderActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new KlarnaV2ScriptLoader(scriptLoader)
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
            paymentActionCreator,
            hostedFormFactory,
            new CardinalThreeDSecureFlow(
                store,
                paymentActionCreator,
                paymentMethodActionCreator,
                new CardinalClient(new CardinalScriptLoader(scriptLoader))
            )
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

    registry.register(PaymentStrategyType.PAYPAL_COMMERCE_CREDIT_CARD, () =>
        new PaypalCommerceCreditCardPaymentStrategy(
            store,
            paymentMethodActionCreator,
            new PaypalCommerceHostedForm(paypalCommercePaymentProcessor),
            orderActionCreator,
            paymentActionCreator
        )
    );

    registry.register(PaymentStrategyType.PAYPAL_COMMERCE, () =>
        new PaypalCommercePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paypalCommercePaymentProcessor
        )
    );

    registry.register(PaymentStrategyType.PAYPAL_COMMERCE_CREDIT, () =>
        new PaypalCommercePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paypalCommercePaymentProcessor,
            true
        )
    );

    registry.register(PaymentStrategyType.SAGE_PAY, () =>
        new SagePayPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
            formPoster
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
            hostedFormFactory,
            new WepayRiskClient(scriptLoader)
        )
    );

    registry.register(PaymentStrategyType.MASTERPASS, () =>
        new MasterpassPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
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

    registry.register(PaymentStrategyType.CHECKOUTCOM_GOOGLE_PAY, () =>
        new GooglePayPaymentStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            paymentStrategyActionCreator,
            paymentActionCreator,
            orderActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayCheckoutcomInitializer(requestSender)
            )
        )
    );

    registry.register(PaymentStrategyType.ZIP, () =>
        new ZipPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            remoteCheckoutActionCreator,
            new ZipScriptLoader(scriptLoader),
            requestSender
        )
    );

    registry.register(PaymentStrategyType.CONVERGE, () =>
        new ConvergePaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            hostedFormFactory,
            formPoster
        )
    );

    registry.register(PaymentStrategyType.LAYBUY, () =>
        new ExternalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formPoster
        )
    );

    registry.register(PaymentStrategyType.SEZZLE, () =>
        new ExternalPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            formPoster
        )
    );

    registry.register(PaymentStrategyType.STRIPEV3, () =>
        new StripeV3PaymentStrategy(
            store,
            paymentMethodActionCreator,
            paymentActionCreator,
            orderActionCreator,
            new StripeScriptLoader(scriptLoader),
            storeCreditActionCreator,
            locale
        )
    );

    registry.register(PaymentStrategyType.BOLT, () =>
        new BoltPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            new BoltScriptLoader(scriptLoader)
        )
);

    return registry;
}
