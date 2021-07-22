import { createFormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import { PaymentMethodActionCreator, PaymentMethodRequestSender } from '../payment';
import { AmazonPayScriptLoader } from '../payment/strategies/amazon-pay';
import { createAmazonPayV2PaymentProcessor } from '../payment/strategies/amazon-pay-v2';
import { BoltScriptLoader } from '../payment/strategies/bolt';
import { createBraintreeVisaCheckoutPaymentProcessor, BraintreeScriptLoader, BraintreeSDKCreator, VisaCheckoutScriptLoader } from '../payment/strategies/braintree';
import { ChasePayScriptLoader } from '../payment/strategies/chasepay';
import { createGooglePayPaymentProcessor, GooglePayAdyenV2Initializer, GooglePayAuthorizeNetInitializer, GooglePayBraintreeInitializer, GooglePayCheckoutcomInitializer, GooglePayCybersourceV2Initializer, GooglePayOrbitalInitializer, GooglePayStripeInitializer } from '../payment/strategies/googlepay';
import { MasterpassScriptLoader } from '../payment/strategies/masterpass';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../remote-checkout';
import { createSpamProtection, SpamProtectionActionCreator, SpamProtectionRequestSender } from '../spam-protection';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import CustomerActionCreator from './customer-action-creator';
import CustomerRequestSender from './customer-request-sender';
import CustomerStrategyActionCreator from './customer-strategy-action-creator';
import { CustomerStrategy } from './strategies';
import { AmazonPayCustomerStrategy } from './strategies/amazon';
import { AmazonPayV2CustomerStrategy } from './strategies/amazon-pay-v2';
import { BoltCustomerStrategy } from './strategies/bolt';
import { BraintreeVisaCheckoutCustomerStrategy } from './strategies/braintree';
import { ChasePayCustomerStrategy } from './strategies/chasepay';
import { DefaultCustomerStrategy } from './strategies/default';
import { GooglePayCustomerStrategy } from './strategies/googlepay';
import { MasterpassCustomerStrategy } from './strategies/masterpass';
import { SquareCustomerStrategy } from './strategies/square';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const scriptLoader = getScriptLoader();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender))
    );
    const formPoster = createFormPoster();
    const spamProtectionActionCreator = new SpamProtectionActionCreator(
        createSpamProtection(scriptLoader),
        new SpamProtectionRequestSender(requestSender)
    );
    const customerActionCreator = new CustomerActionCreator(
        new CustomerRequestSender(requestSender),
        checkoutActionCreator,
        spamProtectionActionCreator
    );
    const subscriptionActionCreator = new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender));
    const billingAddressActionCreator = new BillingAddressActionCreator(
        new BillingAddressRequestSender(requestSender),
        subscriptionActionCreator
    );
    const paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
    const remoteCheckoutRequestSender = new RemoteCheckoutRequestSender(requestSender);
    const remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(remoteCheckoutRequestSender);

    registry.register('googlepayadyenv2', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAdyenV2Initializer()
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('amazon', () =>
        new AmazonPayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            remoteCheckoutRequestSender,
            new AmazonPayScriptLoader(scriptLoader),
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('amazonpay', () =>
        new AmazonPayV2CustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            createAmazonPayV2PaymentProcessor(),
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('braintreevisacheckout', () =>
        new BraintreeVisaCheckoutCustomerStrategy(
            store,
            checkoutActionCreator,
            paymentMethodActionCreator,
            new CustomerStrategyActionCreator(registry),
            remoteCheckoutActionCreator,
            createBraintreeVisaCheckoutPaymentProcessor(scriptLoader, requestSender),
            new VisaCheckoutScriptLoader(scriptLoader),
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('bolt', () =>
        new BoltCustomerStrategy(
            store,
            new BoltScriptLoader(scriptLoader),
            paymentMethodActionCreator,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('chasepay', () =>
        new ChasePayCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new ChasePayScriptLoader(scriptLoader),
            requestSender,
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('squarev2', () =>
        new SquareCustomerStrategy(
            store,
            new RemoteCheckoutActionCreator(remoteCheckoutRequestSender),
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('masterpass', () =>
        new MasterpassCustomerStrategy(
            store,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            new MasterpassScriptLoader(scriptLoader),
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('googlepayauthorizenet', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayAuthorizeNetInitializer()
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('googlepaybraintree', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayBraintreeInitializer(
                    new BraintreeSDKCreator(
                        new BraintreeScriptLoader(scriptLoader)
                    )
                )
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('googlepaycheckoutcom', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayCheckoutcomInitializer(requestSender)
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('googlepaycybersourcev2', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayCybersourceV2Initializer()
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('googlepayorbital', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayOrbitalInitializer()
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('googlepaystripe', () =>
        new GooglePayCustomerStrategy(
            store,
            remoteCheckoutActionCreator,
            createGooglePayPaymentProcessor(
                store,
                new GooglePayStripeInitializer()
            ),
            formPoster,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    registry.register('default', () =>
        new DefaultCustomerStrategy(
            store,
            billingAddressActionCreator,
            customerActionCreator
        )
    );

    return registry;
}
