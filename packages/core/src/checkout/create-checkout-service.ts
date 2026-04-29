import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { B2BTokenActionCreator, B2BTokenRequestSender } from '../b2b-token';
import { BillingAddressActionCreator, BillingAddressRequestSender } from '../billing';
import { createDataStoreProjection } from '../common/data-store';
import { ErrorActionCreator, ErrorLogger } from '../common/error';
import { ExperimentAwareRequestSender } from '../common/http-request';
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
    WorkerExtensionMessenger,
} from '../extension';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import * as customerStrategyFactories from '../generated/customer-strategies';
import * as paymentStrategyFactories from '../generated/payment-strategies';
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
import { createCheckoutSelectorsFactory } from './create-checkout-selectors';
import createCheckoutStore from './create-checkout-store';

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
            'Note that the development build is not optimized. To create a production build, set process\u200b.env.NODE_ENV to `production`.',
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
    const experimentRequestSender = new ExperimentAwareRequestSender(requestSender, {
        getBasePath: () => store.getState().config.getStoreConfig()?.links.baseUrl ?? undefined,
        getFeatures: () =>
            store.getState().config.getStoreConfig()?.checkoutSettings?.features ?? {},
    }) as unknown as RequestSender;
    const paymentClient = createPaymentClient(store);
    const orderRequestSender = new OrderRequestSender(experimentRequestSender);
    const checkoutRequestSender = new CheckoutRequestSender(experimentRequestSender);
    const configActionCreator = new ConfigActionCreator(new ConfigRequestSender(requestSender));
    const spamProtection = createSpamProtection(createScriptLoader());
    const spamProtectionRequestSender = new SpamProtectionRequestSender(experimentRequestSender);
    const spamProtectionActionCreator = new SpamProtectionActionCreator(
        spamProtection,
        spamProtectionRequestSender,
    );
    const orderActionCreator = new OrderActionCreator(
        orderRequestSender,
        new CheckoutValidator(checkoutRequestSender),
    );
    const subscriptionsActionCreator = new SubscriptionsActionCreator(
        new SubscriptionsRequestSender(experimentRequestSender),
    );
    const formFieldsActionCreator = new FormFieldsActionCreator(
        new FormFieldsRequestSender(experimentRequestSender),
    );
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        configActionCreator,
        formFieldsActionCreator,
    );
    const paymentIntegrationService = createPaymentIntegrationService(
        store,
        experimentRequestSender,
    );

    // NO_PAYMENT_DATA_REQUIRED must always be available regardless of build mode — it handles
    // free orders / full store credit checkouts and cannot be lazily loaded via integrations.
    const essentialPaymentStrategyFactories = {
        createNoPaymentStrategy: paymentStrategyFactories.createNoPaymentStrategy,
    };
    const registryV2 = createPaymentStrategyRegistryV2(
        paymentIntegrationService,
        process.env.ESSENTIAL_BUILD ? essentialPaymentStrategyFactories : paymentStrategyFactories,
        { useFallback: true },
    );
    const customerRegistryV2 = createCustomerStrategyRegistryV2(
        paymentIntegrationService,
        process.env.ESSENTIAL_BUILD ? {} : customerStrategyFactories,
    );
    const extensionActionCreator = new ExtensionActionCreator(
        new ExtensionRequestSender(experimentRequestSender),
    );
    const workerExtensionMessenger = new WorkerExtensionMessenger();
    const extensionMessenger = new ExtensionMessenger(store, workerExtensionMessenger);
    const storeProjection = createDataStoreProjection(store, createCheckoutSelectorsFactory());

    return new CheckoutService(
        store,
        storeProjection,
        extensionMessenger,
        createExtensionEventBroadcaster(storeProjection, extensionMessenger),
        new B2BTokenActionCreator(new B2BTokenRequestSender(requestSender)),
        new BillingAddressActionCreator(
            new BillingAddressRequestSender(experimentRequestSender),
            subscriptionsActionCreator,
        ),
        checkoutActionCreator,
        configActionCreator,
        new CustomerActionCreator(
            new CustomerRequestSender(experimentRequestSender),
            checkoutActionCreator,
            spamProtectionActionCreator,
        ),
        new ConsignmentActionCreator(
            new ConsignmentRequestSender(experimentRequestSender),
            checkoutRequestSender,
        ),
        new CountryActionCreator(new CountryRequestSender(experimentRequestSender, { locale })),
        new CouponActionCreator(new CouponRequestSender(experimentRequestSender)),
        new CustomerStrategyActionCreator(
            createCustomerStrategyRegistry(store, experimentRequestSender),
            customerRegistryV2,
            paymentIntegrationService,
        ),
        new ErrorActionCreator(),
        new GiftCertificateActionCreator(new GiftCertificateRequestSender(experimentRequestSender)),
        new InstrumentActionCreator(
            new InstrumentRequestSender(paymentClient, experimentRequestSender),
        ),
        orderActionCreator,
        new PaymentMethodActionCreator(new PaymentMethodRequestSender(experimentRequestSender)),
        new PaymentStrategyActionCreator(
            createPaymentStrategyRegistry(store, paymentClient, experimentRequestSender),
            registryV2,
            orderActionCreator,
            spamProtectionActionCreator,
            paymentIntegrationService,
        ),
        new PickupOptionActionCreator(new PickupOptionRequestSender(experimentRequestSender)),
        new ShippingCountryActionCreator(
            new ShippingCountryRequestSender(experimentRequestSender, { locale }),
            store,
        ),
        new ShippingStrategyActionCreator(
            createShippingStrategyRegistry(store, experimentRequestSender),
        ),
        new SignInEmailActionCreator(new SignInEmailRequestSender(experimentRequestSender)),
        spamProtectionActionCreator,
        new StoreCreditActionCreator(new StoreCreditRequestSender(experimentRequestSender)),
        subscriptionsActionCreator,
        formFieldsActionCreator,
        extensionActionCreator,
        workerExtensionMessenger,
    );
}

export interface CheckoutServiceOptions {
    locale?: string;
    host?: string;
    shouldWarnMutation?: boolean;
    externalSource?: string;
    errorLogger?: ErrorLogger;
}
