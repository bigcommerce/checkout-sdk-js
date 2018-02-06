import { createRequestSender } from '@bigcommerce/request-sender';
import { createClient as createPaymentClient } from 'bigpay-client';
import { BillingAddressActionCreator } from './billing';
import { CartActionCreator } from './cart';
import { CheckoutService } from './checkout';
import { CountryActionCreator } from './geography';
import { CouponActionCreator, GiftCertificateActionCreator } from './coupon';
import { CustomerActionCreator } from './customer';
import { OrderActionCreator } from './order';
import { PaymentMethodActionCreator } from './payment';
import { InstrumentActionCreator, InstrumentRequestSender } from './payment/instrument';
import { QuoteActionCreator } from './quote';
import { ShippingCountryActionCreator, ShippingOptionActionCreator } from './shipping';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';
import createPlaceOrderService from './create-place-order-service';
import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import createShippingStrategyRegistry from './create-shipping-strategy-registry';

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
        createPaymentStrategyRegistry(store, createPlaceOrderService(store, client, paymentClient)),
        createShippingStrategyRegistry(store, client),
        new BillingAddressActionCreator(client),
        new CartActionCreator(client),
        new CountryActionCreator(client),
        new CouponActionCreator(client),
        new CustomerActionCreator(client),
        new GiftCertificateActionCreator(client),
        new InstrumentActionCreator(instrumentRequestSender),
        new OrderActionCreator(client),
        new PaymentMethodActionCreator(client),
        new QuoteActionCreator(client),
        new ShippingCountryActionCreator(client),
        new ShippingOptionActionCreator(client)
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
