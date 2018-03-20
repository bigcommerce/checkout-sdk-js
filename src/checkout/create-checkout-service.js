import { createRequestSender } from '@bigcommerce/request-sender';
import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
import { CheckoutService } from '../checkout';
import { ConfigActionCreator } from '../config';
import { CountryActionCreator } from '../geography';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { OrderActionCreator } from '../order';
import { createPaymentStrategyRegistry, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../payment';
import { InstrumentActionCreator, InstrumentRequestSender } from '../payment/instrument';
import { QuoteActionCreator } from '../quote';
import { createShippingStrategyRegistry, ShippingCountryActionCreator, ShippingOptionActionCreator, ShippingStrategyActionCreator } from '../shipping';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';

/**
 * @param {Object} [options]
 * @param {Config} [options.config]
 * @param {CheckoutClient} [options.client]
 * @param {string} [options.locale]
 * @return {CheckoutService}
 */
export default function createCheckoutService(options = {}) {
    const client = options.client || createCheckoutClient({ locale: options.locale });
    const store = createCheckoutStore(createInitialState({ config: options.config }), { shouldWarnMutation: options.shouldWarnMutation });
    const paymentClient = createPaymentClient({ host: options.config && options.config.bigpayBaseUrl });
    const instrumentRequestSender = new InstrumentRequestSender(paymentClient, createRequestSender());

    return new CheckoutService(
        store,
        new BillingAddressActionCreator(client),
        new CartActionCreator(client),
        new ConfigActionCreator(client),
        new CountryActionCreator(client),
        new CouponActionCreator(client),
        new CustomerStrategyActionCreator(createCustomerStrategyRegistry(store, client)),
        new GiftCertificateActionCreator(client),
        new InstrumentActionCreator(instrumentRequestSender),
        new OrderActionCreator(client),
        new PaymentMethodActionCreator(client),
        new PaymentStrategyActionCreator(createPaymentStrategyRegistry(store, client, paymentClient)),
        new QuoteActionCreator(client),
        new ShippingCountryActionCreator(client),
        new ShippingOptionActionCreator(client),
        new ShippingStrategyActionCreator(createShippingStrategyRegistry(store, client))
    );
}

/**
 * @private
 * @param {Object} options
 * @return {CheckoutState}
 */
function createInitialState(options) {
    return {
        config: {
            data: options.config,
        },
    };
}
