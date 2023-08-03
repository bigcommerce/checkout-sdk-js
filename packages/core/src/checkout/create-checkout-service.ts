import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { ErrorActionCreator } from '../common/error';
import { getDefaultLogger } from '../common/log';
import { getEnvironment } from '../common/utility';
import { ConfigActionCreator, ConfigRequestSender, ConfigState, ConfigWindow } from '../config';
import {
    CouponActionCreator,
    CouponRequestSender,
    GiftCertificateActionCreator,
    GiftCertificateRequestSender,
} from '../coupon';
import {
    createCustomerStrategyRegistry,
    createCustomerStrategyRegistryV2,
    CustomerActionCreator,
    CustomerRequestSender,
    CustomerStrategyActionCreator,
} from '../customer';
import {
    createExtensionEventBroadcaster,
    ExtensionActionCreator,
    ExtensionMessenger,
    ExtensionRequestSender,
} from '../extension';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import * as defaultPaymentStrategyFactories from '../generated/payment-strategies';
import { CountryActionCreator, CountryRequestSender } from '../geography';
import { OrderActionCreator, OrderRequestSender } from '../order';
import {
    createPaymentClient,
    createPaymentStrategyRegistry,
    createPaymentStrategyRegistryV2,
    PaymentMethodActionCreator,
    PaymentMethodRequestSender,
    PaymentStrategyActionCreator,
} from '../payment';
import { createPaymentIntegrationService } from '../payment-integration';
import { InstrumentActionCreator, InstrumentRequestSender } from '../payment/instrument';
import {
    ConsignmentActionCreator,
    ConsignmentRequestSender,
    createShippingStrategyRegistry,
    PickupOptionActionCreator,
    PickupOptionRequestSender,
    ShippingCountryActionCreator,
    ShippingCountryRequestSender,
    ShippingStrategyActionCreator,
} from '../shipping';
import { SignInEmailActionCreator, SignInEmailRequestSender } from '../signin-email';
import {
    createSpamProtection,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../spam-protection';
import { StoreCreditActionCreator, StoreCreditRequestSender } from '../store-credit';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../subscription';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutRequestSender from './checkout-request-sender';
import CheckoutService from './checkout-service';
import CheckoutValidator from './checkout-validator';
import createCheckoutStore from './create-checkout-store';
import { createCheckoutSelectorsFactory } from './create-checkout-selectors';
import { createDataStoreProjection } from '../common/data-store';

/**
 * Creates an instance of `CheckoutService`.
 *
 * @remarks
 * ```js
 * const service = createCheckoutService();
 *
 * service.subscribe(state => {
 *     console.log(state);
 * });
 *
 * service.loadCheckout();
 * ```
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutService`.
 */
export default function createCheckoutService(options?: CheckoutServiceOptions): CheckoutService {
    if (document.location.protocol !== 'https:') {
        getDefaultLogger().warn(
            'The BigCommerce Checkout SDK should not be used on a non-HTTPS page',
        );
    }

    if (getEnvironment() !== 'production') {
        getDefaultLogger().warn(
            'Note that the development build is not optimized. To create a production build, set process.env.NODE_ENV to `production`.',
        );
    }

    const config: ConfigState = {
        meta: {
            externalSource: options && options.externalSource,
            host: options?.host,
            locale: options?.locale,
            variantIdentificationToken: (window as ConfigWindow).checkoutVariantIdentificationToken,
        },
        errors: {},
        statuses: {},
    };
    const { locale = '', shouldWarnMutation = true } = options || {};
    const requestSender = createRequestSender({ host: options && options.host });
    const store = createCheckoutStore({ config }, { shouldWarnMutation });
    const paymentClient = createPaymentClient(store);
    const orderRequestSender = new OrderRequestSender(requestSender);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(new ConfigRequestSender(requestSender));
    const spamProtection = createSpamProtection(createScriptLoader());
    const spamProtectionRequestSender = new SpamProtectionRequestSender(requestSender);
    const spamProtectionActionCreator = new SpamProtectionActionCreator(
        spamProtection,
        spamProtectionRequestSender,
    );
    const orderActionCreator = new OrderActionCreator(
        orderRequestSender,
        new CheckoutValidator(checkoutRequestSender),
    );
    const subscriptionsActionCreator = new SubscriptionsActionCreator(
        new SubscriptionsRequestSender(requestSender),
    );
    const formFieldsActionCreator = new FormFieldsActionCreator(
        new FormFieldsRequestSender(requestSender),
    );
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        configActionCreator,
        formFieldsActionCreator,
    );
    const paymentIntegrationService = createPaymentIntegrationService(store);
    const registryV2 = createPaymentStrategyRegistryV2(
        paymentIntegrationService,
        defaultPaymentStrategyFactories,
        { useFallback: true },
    );
    const customerRegistryV2 = createCustomerStrategyRegistryV2(paymentIntegrationService);
    const extensionActionCreator = new ExtensionActionCreator(
        new ExtensionRequestSender(requestSender),
    );
    const extensionMessenger = new ExtensionMessenger(store);
    const storeProjection = createDataStoreProjection(store, createCheckoutSelectorsFactory());

    return new CheckoutService(
        store,
        storeProjection,
        extensionMessenger,
        createExtensionEventBroadcaster(storeProjection, extensionMessenger),
        new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            subscriptionsActionCreator,
        ),
        checkoutActionCreator,
        configActionCreator,
        new CustomerActionCreator(
            new CustomerRequestSender(requestSender),
            checkoutActionCreator,
            spamProtectionActionCreator,
        ),
        new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            checkoutRequestSender,
        ),
        new CountryActionCreator(new CountryRequestSender(requestSender, { locale })),
        new CouponActionCreator(new CouponRequestSender(requestSender)),
        new CustomerStrategyActionCreator(
            createCustomerStrategyRegistry(store, requestSender, locale),
            customerRegistryV2,
        ),
        new ErrorActionCreator(),
        new GiftCertificateActionCreator(new GiftCertificateRequestSender(requestSender)),
        new InstrumentActionCreator(new InstrumentRequestSender(paymentClient, requestSender)),
        orderActionCreator,
        new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender)),
        new PaymentStrategyActionCreator(
            createPaymentStrategyRegistry(
                store,
                paymentClient,
                requestSender,
                spamProtection,
                locale,
            ),
            registryV2,
            orderActionCreator,
            spamProtectionActionCreator,
        ),
        new PickupOptionActionCreator(new PickupOptionRequestSender(requestSender)),
        new ShippingCountryActionCreator(
            new ShippingCountryRequestSender(requestSender, { locale }),
        ),
        new ShippingStrategyActionCreator(createShippingStrategyRegistry(store, requestSender)),
        new SignInEmailActionCreator(new SignInEmailRequestSender(requestSender)),
        spamProtectionActionCreator,
        new StoreCreditActionCreator(new StoreCreditRequestSender(requestSender)),
        subscriptionsActionCreator,
        formFieldsActionCreator,
        extensionActionCreator,
    );
}

export interface CheckoutServiceOptions {
    locale?: string;
    host?: string;
    shouldWarnMutation?: boolean;
    externalSource?: string;
}
