import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentMethodRequestSender, PaymentRequestSender, PaymentRequestTransformer } from '../payment';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { ApplePaySessionFactory } from '../payment/strategies/apple-pay';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { createGooglePayPaymentProcessor, GooglePayAdyenV2Initializer, GooglePayAdyenV3Initializer, GooglePayAuthorizeNetInitializer, GooglePayBraintreeInitializer, GooglePayCheckoutcomInitializer, GooglePayCybersourceV2Initializer, GooglePayOrbitalInitializer, GooglePayStripeInitializer, GooglePayStripeUPEInitializer } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';
import { PaypalCommerceRequestSender, PaypalCommerceScriptLoader } from '../payment/strategies/paypal-commerce';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../shipping';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import { ApplePayButtonStrategy } from './strategies/apple-pay';
import { BraintreePaypalButtonStrategy, BraintreePaypalCreditButtonStrategy, BraintreeVenmoButtonStrategy } from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';
import { MasterpassButtonStrategy } from './strategies/masterpass';
import { PaypalButtonStrategy } from './strategies/paypal';
import { PaypalCommerceAlternativeMethodsButtonStrategy, PaypalCommerceButtonStrategy, PaypalCommerceCreditButtonStrategy, PaypalCommerceInlineCheckoutButtonStrategy, PaypalCommerceVenmoButtonStrategy } from './strategies/paypal-commerce';

export default function createCheckoutButtonRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender,
    formPoster: FormPoster,
    locale: string,
    host?: string
): Registry<CheckoutButtonStrategy, CheckoutButtonMethodType> {
    const registry = new Registry<CheckoutButtonStrategy, CheckoutButtonMethodType>();
    const scriptLoader = getScriptLoader();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender, checkoutActionCreator);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const orderActionCreator = new OrderActionCreator(new OrderRequestSender(requestSender), checkoutValidator);
    const paymentRequestSender = new PaymentRequestSender(paymentClient);
    const paymentRequestTransformer = new PaymentRequestTransformer();
    const paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()));
    const paymentActionCreator = new PaymentActionCreator(paymentRequestSender, orderActionCreator, paymentRequestTransformer, paymentHumanVerificationHandler);
    const braintreeSdkCreator = new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader));
    const paypalScriptLoader = new PaypalCommerceScriptLoader(scriptLoader);
    const paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
    const subscriptionsRequestSender = new SubscriptionsRequestSender(requestSender);
    const subscriptionsActionCreator = new SubscriptionsActionCreator(subscriptionsRequestSender)
    const billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
    const billingAddressActionCreator = new BillingAddressActionCreator(billingAddressRequestSender, subscriptionsActionCreator);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const consignmentActionCreator = new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender);
    const cartRequestSender = new CartRequestSender(requestSender);

    registry.register(CheckoutButtonMethodType.APPLEPAY, () =>
        new ApplePayButtonStrategy(
            store,
            checkoutActionCreator,
            requestSender,
            paymentMethodActionCreator,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator,
            remoteCheckoutActionCreator,
            orderActionCreator,
            new ApplePaySessionFactory()
        )
    );

    registry.register(CheckoutButtonMethodType.AMAZON_PAY_V2, () =>
        new AmazonPayV2ButtonStrategy(
            store,
            checkoutActionCreator,
            createAmazonPayV2PaymentProcessor()
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            braintreeSdkCreator,
            formPoster,
            window
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT, () =>
        new BraintreePaypalCreditButtonStrategy(
            store,
            checkoutActionCreator,
            braintreeSdkCreator,
            formPoster,
            window
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_VENMO, () =>
        new BraintreeVenmoButtonStrategy(
            store,
            paymentMethodActionCreator,
            braintreeSdkCreator,
            formPoster
        )
    );

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

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_ADYENV3, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAdyenV3Initializer()
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
                new GooglePayBraintreeInitializer(braintreeSdkCreator)
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

    registry.register(CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE, () =>
        new GooglePayButtonStrategy(
            store,
            formPoster,
            checkoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayStripeUPEInitializer()
            )
        )
    );

    registry.register(CheckoutButtonMethodType.MASTERPASS, () =>
        new MasterpassButtonStrategy(
            store,
            checkoutActionCreator,
            new MasterpassScriptLoader(scriptLoader),
            locale
        ));

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
            cartRequestSender,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender
        )
    );

    registry.register(CheckoutButtonMethodType.PAYPALCOMMERCE_CREDIT, () =>
        new PaypalCommerceCreditButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender
        )
    );

    registry.register(CheckoutButtonMethodType.PAYPALCOMMERCE_APMS, () =>
        new PaypalCommerceAlternativeMethodsButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender
        )
    );

    registry.register(CheckoutButtonMethodType.PAYPALCOMMERCE_INLINE, () =>
        new PaypalCommerceInlineCheckoutButtonStrategy(
            store,
            checkoutActionCreator,
            paypalScriptLoader,
            paypalCommerceRequestSender,
            orderActionCreator,
            consignmentActionCreator,
            billingAddressActionCreator,
            paymentActionCreator
        )
    );

    registry.register(CheckoutButtonMethodType.PAYPALCOMMERCE_VENMO, () =>
        new PaypalCommerceVenmoButtonStrategy(
            store,
            checkoutActionCreator,
            formPoster,
            paypalScriptLoader,
            paypalCommerceRequestSender
        )
    );

    return registry;
}
