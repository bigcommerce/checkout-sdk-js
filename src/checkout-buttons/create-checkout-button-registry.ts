import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { createPaymentClient, createPaymentStrategyRegistry } from '../payment';
// eslint-disable-next-line import/no-internal-modules
import PaymentActionCreator from '../payment/payment-action-creator';
// eslint-disable-next-line import/no-internal-modules
import PaymentRequestSender from '../payment/payment-request-sender';
// eslint-disable-next-line import/no-internal-modules
import PaymentRequestTransformer from '../payment/payment-request-transformer';
// eslint-disable-next-line import/no-internal-modules
import PaymentStrategyActionCreator from '../payment/payment-strategy-action-creator';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { createGooglePayPaymentProcessor, GooglePayAdyenV2Initializer, GooglePayAuthorizeNetInitializer, GooglePayBraintreeInitializer, GooglePayCheckoutcomInitializer, GooglePayCybersourceV2Initializer, GooglePayOrbitalInitializer, GooglePayStripeInitializer } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';
import { createPaypalCommercePaymentProcessor } from '../payment/strategies/paypal-commerce';
import { createSpamProtection,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender } from '../spam-protection';

import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import { BraintreePaypalButtonStrategy } from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';
import { MasterpassButtonStrategy } from './strategies/masterpass';
import { PaypalButtonStrategy } from './strategies/paypal';
// eslint-disable-next-line import/named
import { PaypalCommerceButtonStrategy } from './strategies/paypal-commerce';

export default function createCheckoutButtonRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
    formPoster: FormPoster,
    locale: string,
    host?: string
): Registry<CheckoutButtonStrategy, CheckoutButtonMethodType> {
    const registry = new Registry<CheckoutButtonStrategy, CheckoutButtonMethodType>();
    const scriptLoader = getScriptLoader();
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
    );
    const spamProtection = createSpamProtection(createScriptLoader());
    const paymentClient = createPaymentClient(store);
    const paymentRegistry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');
    const paypalCommercePaymentProcessor = createPaypalCommercePaymentProcessor(scriptLoader, requestSender);
    const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
    const paymentRequestTransformer = new PaymentRequestTransformer();
    const paymentRequestSender = new PaymentRequestSender(paymentClient);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const orderActionCreator = new OrderActionCreator(new OrderRequestSender(requestSender), checkoutValidator);
    const paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer, paymentHumanVerificationHandler);
    const paymentStrategyActionCreator = new PaymentStrategyActionCreator(
        paymentRegistry,
        orderActionCreator,
        new SpamProtectionActionCreator(spamProtection, new SpamProtectionRequestSender(requestSender))
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            formPoster,
            undefined,
            window
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            formPoster,
            true,
            window
        )
    );

    registry.register(CheckoutButtonMethodType.MASTERPASS, () =>
        new MasterpassButtonStrategy(
            store,
            checkoutActionCreator,
            new MasterpassScriptLoader(scriptLoader),
            locale
        ));

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_ADYENV2, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAdyenV2Initializer()
            )
        )
    );

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_AUTHORIZENET, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAuthorizeNetInitializer()
            )
        )
    );

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_BRAINTREE, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
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

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayCheckoutcomInitializer(requestSender)
            )
        )
    );

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_CYBERSOURCEV2, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayCybersourceV2Initializer()
            )
        )
    );

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_ORBITAL, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayOrbitalInitializer()
            )
        )
    );

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_STRIPE, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayStripeInitializer()
            )
        )
    );

    registry.register(CheckoutButtonMethodType.PAYPALEXPRESS, () =>
        new PaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new PaypalScriptLoader(scriptLoader),
            formPoster,
            host
        )
    );

    registry.register(CheckoutButtonMethodType.PAYPALCOMMERCE, () =>
        new PaypalCommerceButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalCommercePaymentProcessor,
            orderActionCreator,
            paymentActionCreator,
            paymentStrategyActionCreator
        )
    );

    registry.register(CheckoutButtonMethodType.AMAZON_PAY_V2, () =>
        new AmazonPayV2ButtonStrategy(
            store,
            checkoutActionCreator,
            createAmazonPayV2PaymentProcessor()
        )
    );

    return registry;
}
