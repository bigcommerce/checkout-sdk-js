import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import { createGooglePayPaymentProcessor, GooglePayAdyenV2Initializer, GooglePayAuthorizeNetInitializer, GooglePayBraintreeInitializer, GooglePayCheckoutcomInitializer, GooglePayStripeInitializer } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';
import { createPaypalCommercePaymentProcessor } from '../payment/strategies/paypal-commerce';

import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import { BraintreePaypalButtonStrategy } from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';
import { MasterpassButtonStrategy } from './strategies/masterpass';
import { PaypalButtonStrategy } from './strategies/paypal';
import { PaypalCommerceButtonStrategy } from './strategies/paypal-commerce';

export default function createCheckoutButtonRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
    formPoster: FormPoster,
    host?: string
): Registry<CheckoutButtonStrategy, CheckoutButtonMethodType> {
    const registry = new Registry<CheckoutButtonStrategy, CheckoutButtonMethodType>();
    const scriptLoader = getScriptLoader();
    const checkoutActionCreator = new CheckoutActionCreator(
        new CheckoutRequestSender(requestSender),
        new ConfigActionCreator(new ConfigRequestSender(requestSender))
    );
    const paypalCommercePaymentProcessor = createPaypalCommercePaymentProcessor(scriptLoader, requestSender);

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            formPoster
        )
    );

    registry.register(CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT, () =>
        new BraintreePaypalButtonStrategy(
            store,
            checkoutActionCreator,
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
            new PaypalScriptLoader(scriptLoader),
            formPoster,
            true
        )
    );

    registry.register(CheckoutButtonMethodType.MASTERPASS, () =>
        new MasterpassButtonStrategy(
            store,
            checkoutActionCreator,
            new MasterpassScriptLoader(scriptLoader)
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
            paypalCommercePaymentProcessor
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
