import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BraintreeScriptLoader } from '@bigcommerce/checkout-sdk/braintree-utils';

import { CartActionCreator, CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { CustomerRequestSender } from '../customer';
import HeadlessCustomerActionCreator from '../customer/headless-customer/headless-customer-action-creator';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { BraintreeSDKCreator } from '../payment/strategies/braintree';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { PaypalScriptLoader } from '../payment/strategies/paypal';

import { CheckoutButtonMethodType, CheckoutButtonStrategy } from './strategies';
import {
    BraintreePaypalButtonStrategy,
    BraintreePaypalCreditButtonStrategy,
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
    const cartRequestSender = new CartRequestSender(requestSender);

    const cartActionCreator = new CartActionCreator(cartRequestSender);

    const headlessCustomerActionCreator = new HeadlessCustomerActionCreator(
        new CustomerRequestSender(requestSender),
    );
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
        cartActionCreator,
        headlessCustomerActionCreator,
    );

    const braintreeSdkCreator = new BraintreeSDKCreator(
        new BraintreeScriptLoader(scriptLoader, window),
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
