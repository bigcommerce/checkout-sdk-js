import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CartActionCreator, CartRequestSender } from '../cart';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';
import {
    createBraintreeVisaCheckoutPaymentProcessor,
    VisaCheckoutScriptLoader,
} from '../payment/strategies/braintree';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import {
    createSpamProtection,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../spam-protection';

import createCustomerStrategyRegistryV2 from './create-customer-strategy-registry-v2';
import CustomerActionCreator from './customer-action-creator';
import CustomerRequestSender from './customer-request-sender';
import CustomerStrategyActionCreator from './customer-strategy-action-creator';
import HeadlessCustomerActionCreator from './headless-customer/headless-customer-action-creator';
import { CustomerStrategy } from './strategies';
import { BraintreeVisaCheckoutCustomerStrategy } from './strategies/braintree';
import { DefaultCustomerStrategy } from './strategies/default';
import { MasterpassCustomerStrategy } from './strategies/masterpass';
import { SquareCustomerStrategy } from './strategies/square';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
    locale: string,
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
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
    const formPoster = createFormPoster();
    const paymentMethodActionCreator = new PaymentMethodActionCreator(
        new PaymentMethodRequestSender(requestSender),
    );
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
        remoteCheckoutRequestSender,
        checkoutActionCreator,
    );
    const spamProtectionActionCreator = new SpamProtectionActionCreator(
        createSpamProtection(scriptLoader),
        new SpamProtectionRequestSender(requestSender),
    );
    const customerActionCreator = new CustomerActionCreator(
        new CustomerRequestSender(requestSender),
        checkoutActionCreator,
        spamProtectionActionCreator,
    );

    const paymentIntegrationService = createPaymentIntegrationService(store);
    const customerRegistryV2 = createCustomerStrategyRegistryV2(paymentIntegrationService);

    registry.register(
        'braintreevisacheckout',
        () =>
            new BraintreeVisaCheckoutCustomerStrategy(
                store,
                checkoutActionCreator,
                paymentMethodActionCreator,
                new CustomerStrategyActionCreator(registry, customerRegistryV2),
                remoteCheckoutActionCreator,
                createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender),
                new VisaCheckoutScriptLoader(scriptLoader),
                formPoster,
            ),
    );

    registry.register(
        'squarev2',
        () =>
            new SquareCustomerStrategy(
                store,
                new RemoteCheckoutActionCreator(remoteCheckoutRequestSender, checkoutActionCreator),
            ),
    );

    registry.register(
        'masterpass',
        () =>
            new MasterpassCustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                new MasterpassScriptLoader(scriptLoader),
                locale,
            ),
    );

    registry.register('default', () => new DefaultCustomerStrategy(store, customerActionCreator));

    return registry;
}
