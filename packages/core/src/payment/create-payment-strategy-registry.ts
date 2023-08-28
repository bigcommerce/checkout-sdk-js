import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import {
    createScriptLoader,
    getScriptLoader,
    getStylesheetLoader,
} from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
} from '../checkout';
import { BrowserStorage } from '../common/storage';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { HostedFormFactory } from '../hosted-form';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { createPaymentIntegrationService } from '../payment-integration';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import {
    createSpamProtection,
    GoogleRecaptcha,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../spam-protection';
import { StoreCreditActionCreator, StoreCreditRequestSender } from '../store-credit';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import createPaymentStrategyRegistryV2 from './create-payment-strategy-registry-v2';
import PaymentActionCreator from './payment-action-creator';
import PaymentMethodActionCreator from './payment-method-action-creator';
import PaymentMethodRequestSender from './payment-method-request-sender';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';
import PaymentStrategyActionCreator from './payment-strategy-action-creator';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import StorefrontPaymentRequestSender from './storefront-payment-request-sender';
import { AdyenV2ScriptLoader } from './strategies/adyenv2';
import { AdyenV3ScriptLoader } from './strategies/adyenv3';
import { AffirmPaymentStrategy, AffirmScriptLoader } from './strategies/affirm';
import { AfterpayPaymentStrategy, AfterpayScriptLoader } from './strategies/afterpay';
import {
    AmazonPayV2PaymentStrategy,
    createAmazonPayV2PaymentProcessor,
} from './strategies/amazon-pay-v2';
import { BarclaysPaymentStrategy } from './strategies/barclays';
import { BlueSnapV2PaymentStrategy } from './strategies/bluesnapv2';
import { BNZPaymentStrategy } from './strategies/bnz';
import {
    BraintreeCreditCardPaymentStrategy,
    BraintreePaypalPaymentStrategy,
    BraintreeScriptLoader,
    BraintreeSDKCreator,
    BraintreeVenmoPaymentStrategy,
    BraintreeVisaCheckoutPaymentStrategy,
    createBraintreePaymentProcessor,
    createBraintreeVisaCheckoutPaymentProcessor,
    VisaCheckoutScriptLoader,
} from './strategies/braintree';
import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlow,
    CardinalThreeDSecureFlowV2,
} from './strategies/cardinal';
import { CBAMPGSPaymentStrategy, CBAMPGSScriptLoader } from './strategies/cba-mpgs';
import { ChasePayPaymentStrategy, ChasePayScriptLoader } from './strategies/chasepay';
import {
    CheckoutcomAPMPaymentStrategy,
    CheckoutcomFawryPaymentStrategy,
    CheckoutcomiDealPaymentStrategy,
    CheckoutcomSEPAPaymentStrategy,
} from './strategies/checkoutcom-custom';
import { ClearpayPaymentStrategy, ClearpayScriptLoader } from './strategies/clearpay';
import { ConvergePaymentStrategy } from './strategies/converge';
import { CreditCardRedirectPaymentStrategy } from './strategies/credit-card-redirect';
import { CyberSourcePaymentStrategy } from './strategies/cybersource/index';
import { CyberSourceV2PaymentStrategy } from './strategies/cybersourcev2';
import { DigitalRiverPaymentStrategy, DigitalRiverScriptLoader } from './strategies/digitalriver';
import {
    createGooglePayPaymentProcessor,
    GooglePayAdyenV2Initializer,
    GooglePayAdyenV2PaymentProcessor,
    GooglePayAdyenV3Initializer,
    GooglePayAdyenV3PaymentProcessor,
    GooglePayAuthorizeNetInitializer,
    GooglePayBNZInitializer,
    GooglePayBraintreeInitializer,
    GooglePayCheckoutcomInitializer,
    GooglePayCheckoutcomPaymentProcessor,
    GooglePayCybersourceV2Initializer,
    GooglePayOrbitalInitializer,
    GooglePayPaymentStrategy,
    GooglePayStripeInitializer,
    GooglePayStripeUPEInitializer,
    GooglePayWorldpayAccessInitializer,
} from './strategies/googlepay';
import { HummPaymentStrategy } from './strategies/humm';
import { KlarnaPaymentStrategy, KlarnaScriptLoader } from './strategies/klarna';
import {
    KlarnaV2PaymentStrategy,
    KlarnaV2ScriptLoader,
    KlarnaV2TokenUpdater,
} from './strategies/klarnav2';
import { MasterpassPaymentStrategy, MasterpassScriptLoader } from './strategies/masterpass';
import { MonerisPaymentStrategy } from './strategies/moneris';
import { OpyPaymentStrategy, OpyScriptLoader } from './strategies/opy';
import {
    PaypalExpressPaymentStrategy,
    PaypalProPaymentStrategy,
    PaypalScriptLoader,
} from './strategies/paypal';
import {
    createStepHandler,
    createSubStrategyRegistry,
    PaymentResumer,
    PPSDKStrategy,
} from './strategies/ppsdk';
import { QuadpayPaymentStrategy } from './strategies/quadpay';
import { SagePayPaymentStrategy } from './strategies/sage-pay';
import { SquarePaymentStrategy, SquareScriptLoader } from './strategies/square';
import {
    StripeUPEPaymentStrategy,
    StripeScriptLoader as StripeUPEScriptLoader,
} from './strategies/stripe-upe';
import {
    StripeV3PaymentStrategy,
    StripeScriptLoader as StripeV3ScriptLoader,
} from './strategies/stripev3';
import { WepayPaymentStrategy, WepayRiskClient } from './strategies/wepay';
import { WorldpayaccessPaymetStrategy } from './strategies/worldpayaccess';
import { ZipPaymentStrategy } from './strategies/zip';

export default function createPaymentStrategyRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender,
    spamProtection: GoogleRecaptcha,
    locale: string,
) {
    const registry = new PaymentStrategyRegistry(store, {
        defaultToken: PaymentStrategyType.CREDIT_CARD,
    });
    const scriptLoader = getScriptLoader();
    const paymentRequestTransformer = new PaymentRequestTransformer();
    const paymentRequestSender = new PaymentRequestSender(paymentClient);
    const billingAddressActionCreator = new BillingAddressActionCreator(
        new BillingAddressRequestSender(requestSender),
        new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)),
    );
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const registryV2 = createPaymentStrategyRegistryV2(paymentIntegrationService);
    const braintreePaymentProcessor = createBraintreePaymentProcessor(scriptLoader);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const spamProtectionActionCreator = new SpamProtectionActionCreator(
        spamProtection,
        new SpamProtectionRequestSender(requestSender),
    );
    const orderActionCreator = new OrderActionCreator(
        new OrderRequestSender(requestSender),
        checkoutValidator,
    );
    const storeCreditActionCreator = new StoreCreditActionCreator(
        new StoreCreditRequestSender(requestSender),
    );
    const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(
        createSpamProtection(createScriptLoader()),
    );
    const paymentActionCreator = new PaymentActionCreator(
        paymentRequestSender,
        orderActionCreator,
        paymentRequestTransformer,
        paymentHumanVerificationHandler,
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(
        new PaymentMethodRequestSender(requestSender),
    );
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(new ConfigRequestSender(requestSender));
    const formFieldsActionCreator = new FormFieldsActionCreator(
        new FormFieldsRequestSender(requestSender),
    );
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        configActionCreator,
        formFieldsActionCreator,
    );
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
        remoteCheckoutRequestSender,
        checkoutActionCreator,
    );
    const paymentStrategyActionCreator = new PaymentStrategyActionCreator(
        registry,
        registryV2,
        orderActionCreator,
        spamProtectionActionCreator,
    );
    const formPoster = createFormPoster();
    const stepHandler = createStepHandler(formPoster, paymentHumanVerificationHandler);
    const hostedFormFactory = new HostedFormFactory(store);
    const storefrontPaymentRequestSender = new StorefrontPaymentRequestSender(requestSender);

    registry.register(
        PaymentStrategyType.ADYENV2_GOOGLEPAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAdyenV2Initializer()),
                new GooglePayAdyenV2PaymentProcessor(
                    store,
                    paymentActionCreator,
                    new AdyenV2ScriptLoader(scriptLoader, getStylesheetLoader()),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.ADYENV3_GOOGLEPAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAdyenV3Initializer()),
                new GooglePayAdyenV3PaymentProcessor(
                    store,
                    paymentActionCreator,
                    new AdyenV3ScriptLoader(scriptLoader, getStylesheetLoader()),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.AFFIRM,
        () =>
            new AffirmPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                new AffirmScriptLoader(),
            ),
    );

    registry.register(
        PaymentStrategyType.AFTERPAY,
        () =>
            new AfterpayPaymentStrategy(
                store,
                checkoutValidator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutRequestSender,
                storeCreditActionCreator,
                new AfterpayScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.AMAZONPAY,
        () =>
            new AmazonPayV2PaymentStrategy(
                store,
                paymentStrategyActionCreator,
                orderActionCreator,
                paymentActionCreator,
                createAmazonPayV2PaymentProcessor(),
            ),
    );

    registry.register(
        PaymentStrategyType.AUTHORIZENET_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAuthorizeNetInitializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.BARCLAYS,
        () =>
            new BarclaysPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new CardinalThreeDSecureFlowV2(
                    store,
                    paymentActionCreator,
                    new CardinalClient(new CardinalScriptLoader(scriptLoader)),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.BLUESNAPV2,
        () => new BlueSnapV2PaymentStrategy(store, orderActionCreator, paymentActionCreator),
    );

    registry.register(
        PaymentStrategyType.BRAINTREE,
        () =>
            new BraintreeCreditCardPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessor,
            ),
    );

    registry.register(
        PaymentStrategyType.BRAINTREE_GOOGLE_PAY,
        () =>
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
                        new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
                    ),
                ),
                undefined,
                new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            ),
    );

    registry.register(
        PaymentStrategyType.BRAINTREE_PAYPAL,
        () =>
            new BraintreePaypalPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessor,
            ),
    );

    registry.register(
        PaymentStrategyType.BRAINTREE_VENMO,
        () =>
            new BraintreeVenmoPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessor,
            ),
    );

    registry.register(
        PaymentStrategyType.BRAINTREE_PAYPAL_CREDIT,
        () =>
            new BraintreePaypalPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessor,
                true,
            ),
    );

    registry.register(
        PaymentStrategyType.BRAINTREE_VISA_CHECKOUT,
        () =>
            new BraintreeVisaCheckoutPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender),
                new VisaCheckoutScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.CBA_MPGS,
        () =>
            new CBAMPGSPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                paymentMethodActionCreator,
                new CBAMPGSScriptLoader(scriptLoader),
                locale,
            ),
    );

    registry.register(
        PaymentStrategyType.CONVERGE,
        () =>
            new ConvergePaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                formPoster,
            ),
    );

    registry.register(
        PaymentStrategyType.CLEARPAY,
        () =>
            new ClearpayPaymentStrategy(
                store,
                checkoutValidator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutRequestSender,
                storeCreditActionCreator,
                new ClearpayScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.CYBERSOURCE,
        () =>
            new CyberSourcePaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new CardinalThreeDSecureFlow(
                    store,
                    paymentActionCreator,
                    paymentMethodActionCreator,
                    new CardinalClient(new CardinalScriptLoader(scriptLoader)),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.CYBERSOURCEV2,
        () =>
            new CyberSourceV2PaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new CardinalThreeDSecureFlowV2(
                    store,
                    paymentActionCreator,
                    new CardinalClient(new CardinalScriptLoader(scriptLoader)),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.BNZ,
        () =>
            new BNZPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new CardinalThreeDSecureFlowV2(
                    store,
                    paymentActionCreator,
                    new CardinalClient(new CardinalScriptLoader(scriptLoader)),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.CYBERSOURCEV2_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayCybersourceV2Initializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.BNZ_GOOGLEPAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayBNZInitializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.CHECKOUTCOM,
        () =>
            new CreditCardRedirectPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                formPoster,
            ),
    );

    registry.register(
        PaymentStrategyType.CHECKOUTCOM_APM,
        () =>
            new CheckoutcomAPMPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
            ),
    );

    registry.register(
        PaymentStrategyType.CHECKOUTCOM_FAWRY,
        () =>
            new CheckoutcomFawryPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
            ),
    );

    registry.register(
        PaymentStrategyType.CHECKOUTCOM_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(
                    store,
                    new GooglePayCheckoutcomInitializer(requestSender),
                ),
                new GooglePayCheckoutcomPaymentProcessor(),
            ),
    );

    registry.register(
        PaymentStrategyType.CHECKOUTCOM_IDEAL,
        () =>
            new CheckoutcomiDealPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
            ),
    );

    registry.register(
        PaymentStrategyType.CHECKOUTCOM_SEPA,
        () =>
            new CheckoutcomSEPAPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
            ),
    );

    registry.register(
        PaymentStrategyType.CHASE_PAY,
        () =>
            new ChasePayPaymentStrategy(
                store,
                checkoutActionCreator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                requestSender,
                new ChasePayScriptLoader(scriptLoader),
                new WepayRiskClient(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.DIGITALRIVER,
        () =>
            new DigitalRiverPaymentStrategy(
                store,
                paymentMethodActionCreator,
                orderActionCreator,
                paymentActionCreator,
                storeCreditActionCreator,
                new DigitalRiverScriptLoader(scriptLoader, getStylesheetLoader()),
                billingAddressActionCreator,
            ),
    );

    registry.register(
        PaymentStrategyType.KLARNA,
        () =>
            new KlarnaPaymentStrategy(
                store,
                orderActionCreator,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                new KlarnaScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.KLARNAV2,
        () =>
            new KlarnaV2PaymentStrategy(
                store,
                orderActionCreator,
                remoteCheckoutActionCreator,
                new KlarnaV2ScriptLoader(scriptLoader),
                new KlarnaV2TokenUpdater(requestSender),
            ),
    );

    registry.register(
        PaymentStrategyType.HUMM,
        () =>
            new HummPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                formPoster,
                paymentMethodActionCreator,
            ),
    );

    registry.register(
        PaymentStrategyType.MASTERPASS,
        () =>
            new MasterpassPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                new MasterpassScriptLoader(scriptLoader),
                locale,
            ),
    );

    registry.register(
        PaymentStrategyType.MONERIS,
        () =>
            new MonerisPaymentStrategy(
                hostedFormFactory,
                store,
                orderActionCreator,
                paymentActionCreator,
                storeCreditActionCreator,
            ),
    );

    registry.register(
        PaymentStrategyType.OPY,
        () =>
            new OpyPaymentStrategy(
                store,
                orderActionCreator,
                paymentMethodActionCreator,
                storefrontPaymentRequestSender,
                paymentActionCreator,
                new OpyScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.ORBITAL_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayOrbitalInitializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.PAYPAL,
        () =>
            new PaypalProPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new CardinalThreeDSecureFlow(
                    store,
                    paymentActionCreator,
                    paymentMethodActionCreator,
                    new CardinalClient(new CardinalScriptLoader(scriptLoader)),
                ),
            ),
    );

    registry.register(
        PaymentStrategyType.PAYPAL_EXPRESS,
        () =>
            new PaypalExpressPaymentStrategy(
                store,
                orderActionCreator,
                new PaypalScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.PAYPAL_EXPRESS_CREDIT,
        () =>
            new PaypalExpressPaymentStrategy(
                store,
                orderActionCreator,
                new PaypalScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.PPSDK,
        () =>
            new PPSDKStrategy(
                store,
                orderActionCreator,
                createSubStrategyRegistry(
                    store,
                    orderActionCreator,
                    requestSender,
                    stepHandler,
                    hostedFormFactory,
                ),
                new PaymentResumer(requestSender, stepHandler),
                new BrowserStorage('PPSDK'),
            ),
    );

    registry.register(
        PaymentStrategyType.QUADPAY,
        () =>
            new QuadpayPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                storeCreditActionCreator,
                remoteCheckoutActionCreator,
                storefrontPaymentRequestSender,
            ),
    );

    registry.register(
        PaymentStrategyType.SAGE_PAY,
        () =>
            new SagePayPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                formPoster,
            ),
    );

    registry.register(
        PaymentStrategyType.SQUARE,
        () =>
            new SquarePaymentStrategy(
                store,
                checkoutActionCreator,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                requestSender,
                new SquareScriptLoader(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.STRIPE_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayStripeInitializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.STRIPE_UPE_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayStripeUPEInitializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.STRIPEV3,
        () =>
            new StripeV3PaymentStrategy(
                store,
                paymentMethodActionCreator,
                paymentActionCreator,
                orderActionCreator,
                new StripeV3ScriptLoader(scriptLoader),
                storeCreditActionCreator,
                hostedFormFactory,
                locale,
            ),
    );

    registry.register(
        PaymentStrategyType.STRIPE_UPE,
        () =>
            new StripeUPEPaymentStrategy(
                store,
                paymentMethodActionCreator,
                paymentActionCreator,
                orderActionCreator,
                new StripeUPEScriptLoader(scriptLoader),
                storeCreditActionCreator,
                billingAddressActionCreator,
            ),
    );

    registry.register(
        PaymentStrategyType.WE_PAY,
        () =>
            new WepayPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
                new WepayRiskClient(scriptLoader),
            ),
    );

    registry.register(
        PaymentStrategyType.WORLDPAYACCESS,
        () =>
            new WorldpayaccessPaymetStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                hostedFormFactory,
            ),
    );

    registry.register(
        PaymentStrategyType.WORLDPAYACCESS_GOOGLE_PAY,
        () =>
            new GooglePayPaymentStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                paymentStrategyActionCreator,
                paymentActionCreator,
                orderActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayWorldpayAccessInitializer()),
            ),
    );

    registry.register(
        PaymentStrategyType.ZIP,
        () =>
            new ZipPaymentStrategy(
                store,
                paymentMethodActionCreator,
                storeCreditActionCreator,
                remoteCheckoutActionCreator,
                orderActionCreator,
                storefrontPaymentRequestSender,
                paymentActionCreator,
            ),
    );

    return registry;
}
