import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { createAmazonPayV2PaymentProcessor } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { BraintreeScriptLoader } from '@bigcommerce/checkout-sdk/braintree-utils';

import { CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { BraintreeSDKCreator } from '../payment/strategies/braintree';
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

    const braintreeSdkCreator = new BraintreeSDKCreator(
        new BraintreeScriptLoader(scriptLoader, window),
    );
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

    return registry;
}
