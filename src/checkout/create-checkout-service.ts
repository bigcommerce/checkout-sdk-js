import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressActionCreator } from '../billing';
import { getDefaultLogger } from '../common/log';
import { getEnvironment } from '../common/utility';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import {
    CouponActionCreator,
    CouponRequestSender,
    GiftCertificateActionCreator,
    GiftCertificateRequestSender,
} from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { CountryActionCreator } from '../geography';
import { OrderActionCreator } from '../order';
import {
    createPaymentClient,
    createPaymentStrategyRegistry,
    PaymentMethodActionCreator,
    PaymentStrategyActionCreator,
} from '../payment';
import { InstrumentActionCreator, InstrumentRequestSender } from '../payment/instrument';
import {
    createShippingStrategyRegistry,
    ConsignmentActionCreator,
    ConsignmentRequestSender,
    ShippingCountryActionCreator,
    ShippingStrategyActionCreator,
} from '../shipping';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutRequestSender from './checkout-request-sender';
import CheckoutService from './checkout-service';
import CheckoutValidator from './checkout-validator';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';

/**
 * Creates an instance of `CheckoutService`.
 *
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
        getDefaultLogger().warn('The BigCommerce Checkout SDK should not be used on a non-HTTPS page');
    }

    if (getEnvironment() !== 'production') {
        getDefaultLogger().warn('Note that the development build is not optimized. To create a production build, set process.env.NODE_ENV to `production`.');
    }

    const { locale = '', shouldWarnMutation = true } = options || {};
    const client = createCheckoutClient({ locale });
    const store = createCheckoutStore({}, { shouldWarnMutation });
    const paymentClient = createPaymentClient(store);
    const requestSender = createRequestSender();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const configRequestSender = new ConfigRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(configRequestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const orderActionCreator = new OrderActionCreator(client, new CheckoutValidator(checkoutRequestSender));

    return new CheckoutService(
        store,
        new BillingAddressActionCreator(client),
        new CheckoutActionCreator(checkoutRequestSender, configActionCreator),
        configActionCreator,
        new ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender),
        new CountryActionCreator(client),
        new CouponActionCreator(new CouponRequestSender(requestSender)),
        new CustomerStrategyActionCreator(createCustomerStrategyRegistry(store, client)),
        new GiftCertificateActionCreator(new GiftCertificateRequestSender(requestSender)),
        new InstrumentActionCreator(new InstrumentRequestSender(paymentClient, requestSender)),
        orderActionCreator,
        new PaymentMethodActionCreator(client),
        new PaymentStrategyActionCreator(
            createPaymentStrategyRegistry(store, client, paymentClient),
            orderActionCreator
        ),
        new ShippingCountryActionCreator(client),
        new ShippingStrategyActionCreator(createShippingStrategyRegistry(store, client))
    );
}

export interface CheckoutServiceOptions {
    locale?: string;
    shouldWarnMutation?: boolean;
}
