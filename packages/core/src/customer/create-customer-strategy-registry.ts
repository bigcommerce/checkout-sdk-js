import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
} from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { OrderActionCreator, OrderRequestSender } from '../order';
import {
    PaymentActionCreator,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentRequestSender,
    PaymentRequestTransformer,
} from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { ApplePaySessionFactory } from '../payment/strategies/apple-pay';
import { BoltScriptLoader } from '../payment/strategies/bolt';
import {
    BraintreeScriptLoader,
    BraintreeSDKCreator,
    createBraintreeVisaCheckoutPaymentProcessor,
    VisaCheckoutScriptLoader,
} from '../payment/strategies/braintree';
import { ChasePayScriptLoader } from '../payment/strategies/chasepay';
import {
    createGooglePayPaymentProcessor,
    GooglePayAdyenV2Initializer,
    GooglePayAdyenV3Initializer,
    GooglePayAuthorizeNetInitializer,
    GooglePayBNZInitializer,
    GooglePayBraintreeInitializer,
    GooglePayCheckoutcomInitializer,
    GooglePayCybersourceV2Initializer,
    GooglePayOrbitalInitializer,
    GooglePayStripeInitializer,
    GooglePayStripeUPEInitializer,
} from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { StripeScriptLoader } from '../payment/strategies/stripe-upe';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../shipping';
import {
    createSpamProtection,
    PaymentHumanVerificationHandler,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import createCustomerStrategyRegistryV2 from './create-customer-strategy-registry-v2';
import CustomerActionCreator from './customer-action-creator';
import CustomerRequestSender from './customer-request-sender';
import CustomerStrategyActionCreator from './customer-strategy-action-creator';
import { CustomerStrategy } from './strategies';
import { AmazonPayV2CustomerStrategy } from './strategies/amazon-pay-v2';
import { ApplePayCustomerStrategy } from './strategies/apple-pay';
import { BoltCustomerStrategy } from './strategies/bolt';
import {
    BraintreePaypalCreditCustomerStrategy,
    BraintreePaypalCustomerStrategy,
    BraintreeVenmoCustomerStrategy,
    BraintreeVisaCheckoutCustomerStrategy,
} from './strategies/braintree';
import { ChasePayCustomerStrategy } from './strategies/chasepay';
import { DefaultCustomerStrategy } from './strategies/default';
import { GooglePayCustomerStrategy } from './strategies/googlepay';
import { MasterpassCustomerStrategy } from './strategies/masterpass';
import { SquareCustomerStrategy } from './strategies/square';
import { StripeUPECustomerStrategy } from './strategies/stripe-upe';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    paymentClient: any,
    requestSender: RequestSender,
    locale: string,
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const scriptLoader = getScriptLoader();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
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
    const billingAddressActionCreator = new BillingAddressActionCreator(
        new BillingAddressRequestSender(requestSender),
        new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)),
    );
    const consignmentActionCreator = new ConsignmentActionCreator(
        new ConsignmentRequestSender(requestSender),
        new CheckoutRequestSender(requestSender),
    );
    const orderActionCreator = new OrderActionCreator(
        new OrderRequestSender(requestSender),
        new CheckoutValidator(checkoutRequestSender),
    );
    const paymentActionCreator = new PaymentActionCreator(
        new PaymentRequestSender(paymentClient),
        orderActionCreator,
        new PaymentRequestTransformer(),
        new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
    );

    const braintreeSDKCreator = new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader));
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const customerRegistryV2 = createCustomerStrategyRegistryV2(paymentIntegrationService);

    registry.register(
        'googlepayadyenv2',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAdyenV2Initializer()),
                formPoster,
            ),
    );

    registry.register(
        'googlepayadyenv3',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAdyenV3Initializer()),
                formPoster,
            ),
    );

    registry.register(
        'amazonpay',
        () =>
            new AmazonPayV2CustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                createAmazonPayV2PaymentProcessor(),
            ),
    );

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
        'braintreepaypal',
        () =>
            new BraintreePaypalCustomerStrategy(
                store,
                checkoutActionCreator,
                customerActionCreator,
                paymentMethodActionCreator,
                braintreeSDKCreator,
                formPoster,
                window,
            ),
    );

    registry.register(
        'braintreepaypalcredit',
        () =>
            new BraintreePaypalCreditCustomerStrategy(
                store,
                checkoutActionCreator,
                customerActionCreator,
                paymentMethodActionCreator,
                braintreeSDKCreator,
                formPoster,
                window,
            ),
    );

    registry.register(
        'braintreevenmo',
        () =>
            new BraintreeVenmoCustomerStrategy(
                store,
                customerActionCreator,
                paymentMethodActionCreator,
                braintreeSDKCreator,
                formPoster,
            ),
    );

    registry.register(
        'bolt',
        () =>
            new BoltCustomerStrategy(
                store,
                new BoltScriptLoader(scriptLoader),
                customerActionCreator,
                paymentMethodActionCreator,
            ),
    );

    registry.register(
        'chasepay',
        () =>
            new ChasePayCustomerStrategy(
                store,
                paymentMethodActionCreator,
                remoteCheckoutActionCreator,
                new ChasePayScriptLoader(scriptLoader),
                requestSender,
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

    registry.register(
        'googlepayauthorizenet',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayAuthorizeNetInitializer()),
                formPoster,
            ),
    );

    registry.register(
        'googlepaybnz',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayBNZInitializer()),
                formPoster,
            ),
    );

    registry.register(
        'googlepaybraintree',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(
                    store,
                    new GooglePayBraintreeInitializer(braintreeSDKCreator),
                ),
                formPoster,
            ),
    );

    registry.register(
        'googlepaycheckoutcom',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(
                    store,
                    new GooglePayCheckoutcomInitializer(requestSender),
                ),
                formPoster,
            ),
    );

    registry.register(
        'googlepaycybersourcev2',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayCybersourceV2Initializer()),
                formPoster,
            ),
    );

    registry.register(
        'googlepayorbital',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayOrbitalInitializer()),
                formPoster,
            ),
    );

    registry.register(
        'googlepaystripe',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayStripeInitializer()),
                formPoster,
            ),
    );

    registry.register(
        'googlepaystripeupe',
        () =>
            new GooglePayCustomerStrategy(
                store,
                remoteCheckoutActionCreator,
                createGooglePayPaymentProcessor(store, new GooglePayStripeUPEInitializer()),
                formPoster,
            ),
    );

    registry.register(
        'applepay',
        () =>
            new ApplePayCustomerStrategy(
                store,
                checkoutActionCreator,
                requestSender,
                paymentMethodActionCreator,
                consignmentActionCreator,
                billingAddressActionCreator,
                paymentActionCreator,
                remoteCheckoutActionCreator,
                orderActionCreator,
                new ApplePaySessionFactory(),
            ),
    );

    registry.register(
        'stripeupe',
        () =>
            new StripeUPECustomerStrategy(
                store,
                new StripeScriptLoader(scriptLoader),
                customerActionCreator,
                paymentMethodActionCreator,
                new ConsignmentActionCreator(
                    new ConsignmentRequestSender(requestSender),
                    new CheckoutRequestSender(requestSender),
                ),
            ),
    );

    registry.register('default', () => new DefaultCustomerStrategy(store, customerActionCreator));

    return registry;
}
