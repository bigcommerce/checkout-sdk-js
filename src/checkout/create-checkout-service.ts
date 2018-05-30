import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
import { getDefaultLogger } from '../common/log';
import { getEnvironment } from '../common/utility';
import { ConfigActionCreator } from '../config';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
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
import { QuoteActionCreator } from '../quote';
import {
    createShippingStrategyRegistry,
    ShippingCountryActionCreator,
    ShippingOptionActionCreator,
    ShippingStrategyActionCreator,
} from '../shipping';

import CheckoutService from './checkout-service';
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

    return new CheckoutService(
        store,
        new BillingAddressActionCreator(client),
        new CartActionCreator(client),
        new ConfigActionCreator(client),
        new CountryActionCreator(client),
        new CouponActionCreator(client),
        new CustomerStrategyActionCreator(createCustomerStrategyRegistry(store, client)),
        new GiftCertificateActionCreator(client),
        new InstrumentActionCreator(new InstrumentRequestSender(paymentClient, createRequestSender())),
        new OrderActionCreator(client),
        new PaymentMethodActionCreator(client),
        new PaymentStrategyActionCreator(createPaymentStrategyRegistry(store, client, paymentClient)),
        new QuoteActionCreator(client),
        new ShippingCountryActionCreator(client),
        new ShippingOptionActionCreator(client),
        new ShippingStrategyActionCreator(createShippingStrategyRegistry(store, client))
    );
}

export interface CheckoutServiceOptions {
    locale?: string;
    shouldWarnMutation?: boolean;
}
