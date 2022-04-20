import { FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { CountryActionCreator, CountryRequestSender } from '../geography';
import { OrderActionCreator, OrderRequestSender } from '../order';
import { PaymentActionCreator,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentRequestTransformer } from '../payment';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { ApplePaySessionFactory } from '../payment/strategies/apple-pay';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { createGooglePayPaymentProcessor, GooglePayAdyenV2Initializer, GooglePayAdyenV3Initializer, GooglePayAuthorizeNetInitializer, GooglePayBraintreeInitializer, GooglePayCheckoutcomInitializer, GooglePayCybersourceV2Initializer, GooglePayOrbitalInitializer, GooglePayStripeInitializer, GooglePayStripeUPEInitializer } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';
import { createPaypalCommercePaymentProcessor } from '../payment/strategies/paypal-commerce';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../shipping';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import { ApplePayButtonStrategy } from './strategies/apple-pay';
import { BraintreePaypalButtonStrategy } from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';
import { MasterpassButtonStrategy } from './strategies/masterpass';
import { PaypalButtonStrategy } from './strategies/paypal';
import { PaypalCommerceButtonStrategy } from './strategies/paypal-commerce';

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
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
    );
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender, checkoutActionCreator);
    const paypalCommercePaymentProcessor = createPaypalCommercePaymentProcessor(scriptLoader, requestSender);
    const orderRequestSender = new OrderRequestSender(createRequestSender());
    const orderActionCreator = new OrderActionCreator(
        orderRequestSender,
        new CheckoutValidator(new CheckoutRequestSender(requestSender))
    );
    const countryActionCreator = new CountryActionCreator(new CountryRequestSender(requestSender, { locale }));
    const consignmentActionCreator = new ConsignmentActionCreator(new ConsignmentRequestSender(requestSender), new CheckoutRequestSender(requestSender));
    const billingAdressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender), new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)));
    const paymentActionCreator = new PaymentActionCreator(new PaymentRequestSender(paymentClient), orderActionCreator, new PaymentRequestTransformer(), new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())));

    registry.register(CheckoutButtonMethodType.APPLEPAY, () =>
        new ApplePayButtonStrategy(
            store,
            checkoutActionCreator,
            requestSender,
            paymentMethodActionCreator,
            consignmentActionCreator,
            new BillingAddressActionCreator(
                new BillingAddressRequestSender(requestSender),
                new SubscriptionsActionCreator(
                    new SubscriptionsRequestSender(requestSender)
                )
            ),
            new PaymentActionCreator(
                new PaymentRequestSender(paymentClient),
                new OrderActionCreator(
                    new OrderRequestSender(requestSender),
                    new CheckoutValidator(checkoutRequestSender)
                ),
                new PaymentRequestTransformer(),
                new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
            ),
            remoteCheckoutActionCreator,
            new OrderActionCreator(
                new OrderRequestSender(requestSender),
                new CheckoutValidator(checkoutRequestSender)
            ),
            new ApplePaySessionFactory()
        )
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
            countryActionCreator,
            consignmentActionCreator,
            billingAdressActionCreator,
            paymentActionCreator
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
