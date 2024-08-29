import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';

import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
} from '@bigcommerce/checkout-sdk/braintree-utils';

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
import { AmazonPayV2PaymentStrategy } from './strategies/amazon-pay-v2';
import { BarclaysPaymentStrategy } from './strategies/barclays';
import { BNZPaymentStrategy } from './strategies/bnz';
import {
    BraintreeCreditCardPaymentStrategy,
    BraintreeVenmoPaymentStrategy,
    BraintreeVisaCheckoutPaymentStrategy,
    createBraintreePaymentProcessor,
    createBraintreeVisaCheckoutPaymentProcessor,
    VisaCheckoutScriptLoader,
} from './strategies/braintree';
import {
    CardinalClient,
    CardinalScriptLoader,
    CardinalThreeDSecureFlowV2,
} from './strategies/cardinal';
import { CBAMPGSPaymentStrategy, CBAMPGSScriptLoader } from './strategies/cba-mpgs';
import { ConvergePaymentStrategy } from './strategies/converge';
import { MasterpassPaymentStrategy, MasterpassScriptLoader } from './strategies/masterpass';
import { MonerisPaymentStrategy } from './strategies/moneris';
import { OpyPaymentStrategy, OpyScriptLoader } from './strategies/opy';
import { PaypalExpressPaymentStrategy, PaypalScriptLoader } from './strategies/paypal';
import {
    createStepHandler,
    createSubStrategyRegistry,
    PaymentResumer,
    PPSDKStrategy,
} from './strategies/ppsdk';
import { QuadpayPaymentStrategy } from './strategies/quadpay';
import { SquarePaymentStrategy, SquareScriptLoader } from './strategies/square';
import { WepayPaymentStrategy, WepayRiskClient } from './strategies/wepay';

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
        PaymentStrategyType.BRAINTREE,
        () =>
            new BraintreeCreditCardPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                paymentMethodActionCreator,
                braintreePaymentProcessor,
                new BraintreeIntegrationService(
                    new BraintreeScriptLoader(getScriptLoader(), window),
                    window,
                ),
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

    return registry;
}
