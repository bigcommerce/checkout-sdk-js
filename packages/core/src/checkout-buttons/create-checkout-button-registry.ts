import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';

import { CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../payment/strategies/braintree';
import {
    createGooglePayPaymentProcessor,
    GooglePayAdyenV2Initializer,
    GooglePayAdyenV3Initializer,
    // GooglePayAuthorizeNetInitializer,
    // GooglePayBNZInitializer,
    // GooglePayCheckoutcomInitializer,
    // GooglePayCybersourceV2Initializer,
    // GooglePayOrbitalInitializer,
    // GooglePayStripeInitializer,
    // GooglePayStripeUPEInitializer,
    GooglePayWorldpayAccessInitializer,
} from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
import { AmazonPayV2ButtonStrategy } from './strategies/amazon-pay-v2';
import AmazonPayV2RequestSender from './strategies/amazon-pay-v2/amazon-pay-v2-request-sender';
import {
    BraintreePaypalButtonStrategy,
    BraintreePaypalCreditButtonStrategy,
    BraintreeVenmoButtonStrategy,
} from './strategies/braintree';
import { GooglePayButtonStrategy } from './strategies/googlepay';
import { MasterpassButtonStrategy } from './strategies/masterpass';
import { PaypalButtonStrategy } from './strategies/paypal';

export default function createCheckoutButtonRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
    formPoster: FormPoster,
    locale: string,
    host?: string,
): Registry<CheckoutButtonStrategy, CheckoutButtonMethodType> {
    const registry = new Registry<CheckoutButtonStrategy, CheckoutButtonMethodType>();
    const scriptLoader = getScriptLoader();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(
        new PaymentMethodRequestSender(requestSender),
    );

    const braintreeSdkCreator = new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader));
    const cartRequestSender = new CartRequestSender(requestSender);
    const amazonPayV2RequestSender = new AmazonPayV2RequestSender(requestSender);

    registry.register(
        CheckoutButtonMethodType.AMAZON_PAY_V2,
        () =>
            new AmazonPayV2ButtonStrategy(
                store,
                checkoutActionCreator,
                createAmazonPayV2PaymentProcessor(),
                cartRequestSender,
                amazonPayV2RequestSender,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.BRAINTREE_PAYPAL,
        () =>
            new BraintreePaypalButtonStrategy(
                store,
                checkoutActionCreator,
                cartRequestSender,
                braintreeSdkCreator,
                formPoster,
                window,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.BRAINTREE_PAYPAL_CREDIT,
        () =>
            new BraintreePaypalCreditButtonStrategy(
                store,
                checkoutActionCreator,
                cartRequestSender,
                braintreeSdkCreator,
                formPoster,
                window,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.BRAINTREE_VENMO,
        () =>
            new BraintreeVenmoButtonStrategy(
                store,
                paymentMethodActionCreator,
                cartRequestSender,
                braintreeSdkCreator,
                formPoster,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.GOOGLEPAY_ADYENV2,
        () =>
            new GooglePayButtonStrategy(
                store,
                formPoster,
                checkoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAdyenV2Initializer()),
                cartRequestSender,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.GOOGLEPAY_ADYENV3,
        () =>
            new GooglePayButtonStrategy(
                store,
                formPoster,
                checkoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAdyenV3Initializer()),
                cartRequestSender,
            ),
    );
    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_AUTHORIZENET,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(store, new GooglePayAuthorizeNetInitializer()),
    //             cartRequestSender,
    //         ),
    // );

    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_BNZ,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(store, new GooglePayBNZInitializer()),
    //             cartRequestSender,
    //         ),
    // );

    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_CHECKOUTCOM,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(
    //                 store,
    //                 new GooglePayCheckoutcomInitializer(requestSender),
    //             ),
    //             cartRequestSender,
    //         ),
    // );

    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_CYBERSOURCEV2,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(store, new GooglePayCybersourceV2Initializer()),
    //             cartRequestSender,
    //         ),
    // );

    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_ORBITAL,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(store, new GooglePayOrbitalInitializer()),
    //             cartRequestSender,
    //         ),
    // );

    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_STRIPE,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(store, new GooglePayStripeInitializer()),
    //             cartRequestSender,
    //         ),
    // );

    // registry.register(
    //     CheckoutButtonMethodType.GOOGLEPAY_STRIPEUPE,
    //     () =>
    //         new GooglePayButtonStrategy(
    //             store,
    //             formPoster,
    //             checkoutActionCreator,
    //             createGooglePayPaymentProcessor(store, new GooglePayStripeUPEInitializer()),
    //             cartRequestSender,
    //         ),
    // );

    registry.register(
        CheckoutButtonMethodType.MASTERPASS,
        () =>
            new MasterpassButtonStrategy(
                store,
                checkoutActionCreator,
                new MasterpassScriptLoader(scriptLoader),
                locale,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.PAYPALEXPRESS,
        () =>
            new PaypalButtonStrategy(
                store,
                checkoutActionCreator,
                new PaypalScriptLoader(scriptLoader),
                formPoster,
                host,
            ),
    );

    registry.register(
        CheckoutButtonMethodType.GOOGLEPAY_WORLDPAYACCESS,
        () =>
            new GooglePayButtonStrategy(
                store,
                formPoster,
                checkoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayWorldpayAccessInitializer()),
                cartRequestSender,
            ),
    );

    return registry;
}
