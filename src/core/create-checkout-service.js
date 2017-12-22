import { createClient as createPaymentClient } from 'bigpay-client';
import { BillingAddressActionCreator } from './billing';
import { CartActionCreator } from './cart';
import { CheckoutService } from './checkout';
import { CountryActionCreator } from './geography';
import { CouponActionCreator, GiftCertificateActionCreator } from './coupon';
import { CustomerActionCreator } from './customer';
import { PlaceOrderService, OrderActionCreator } from './order';
import { PaymentActionCreator, PaymentMethodActionCreator, PaymentRequestSender } from './payment';
import { InstrumentActionCreator, InstrumentRequestSender } from './payment/instrument';
import { QuoteActionCreator } from './quote';
import { ShippingAddressActionCreator, ShippingCountryActionCreator, ShippingOptionActionCreator } from './shipping';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';
import createPaymentStrategyRegistry from './create-payment-strategy-registry';

/**
 * @param {Object} [options]
 * @param {Config} [options.config]
 * @param {CheckoutClient} [options.client]
 * @param {string} [options.locale]
 * @return {CheckoutService}
 */
export default function createCheckoutService(options = {}) {
    const client = options.client || createCheckoutClient({ locale: options.locale });
    const store = createCheckoutStore(createInitialState({ config: options.config }));
    const paymentClient = createPaymentClient({ host: options.config && options.config.bigpayBaseUrl });
    const paymentRequestSender = new PaymentRequestSender(paymentClient);
    const paymentActionCreator = new PaymentActionCreator(paymentRequestSender);
    const instrumentRequestSender = new InstrumentRequestSender(paymentClient);
    const orderActionCreator = new OrderActionCreator(client);
    const placeOrderService = new PlaceOrderService(store, orderActionCreator, paymentActionCreator);

    return new CheckoutService(
        store,
        createPaymentStrategyRegistry(store, placeOrderService),
        new BillingAddressActionCreator(client),
        new CartActionCreator(client),
        new CountryActionCreator(client),
        new CouponActionCreator(client),
        new CustomerActionCreator(client),
        new GiftCertificateActionCreator(client),
        new InstrumentActionCreator(instrumentRequestSender),
        orderActionCreator,
        new PaymentMethodActionCreator(client),
        new QuoteActionCreator(client),
        new ShippingAddressActionCreator(client),
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
