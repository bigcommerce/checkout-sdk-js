import { createRequestSender } from '@bigcommerce/request-sender';
import { BillingAddressRequestSender } from '../billing';
import { CartRequestSender } from '../cart';
import { ConfigRequestSender } from '../config';
import { CountryRequestSender } from '../geography';
import { CouponRequestSender, GiftCertificateRequestSender } from '../coupon';
import { CustomerRequestSender } from '../customer';
import { PaymentMethodRequestSender } from '../payment';
import { OrderRequestSender } from '../order';
import { QuoteRequestSender } from '../quote';
import { ShippingAddressRequestSender, ShippingCountryRequestSender, ShippingOptionRequestSender } from '../shipping';
import CheckoutClient from './checkout-client';
import CheckoutRequestSender from './checkout-request-sender';

/**
 * @param {Object} [config={}]
 * @param {string} [config.locale]
 * @return {CheckoutClient}
 */
export default function createCheckoutClient(config = {}) {
    const requestSender = createRequestSender();
    const cartRequestSender = new CartRequestSender(requestSender);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const configRequestSender = new ConfigRequestSender(requestSender);
    const couponRequestSender = new CouponRequestSender(requestSender);
    const countryRequestSender = new CountryRequestSender(requestSender, config);
    const customerRequestSender = new CustomerRequestSender(requestSender);
    const giftCertificateRequestSender = new GiftCertificateRequestSender(requestSender);
    const orderRequestSender = new OrderRequestSender(requestSender);
    const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    const quoteRequestSender = new QuoteRequestSender(requestSender);
    const shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, config);
    const shippingOptionRequestSender = new ShippingOptionRequestSender(requestSender);
    const billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
    const shippingAddressRequestSender = new ShippingAddressRequestSender(requestSender);

    return new CheckoutClient(
        billingAddressRequestSender,
        cartRequestSender,
        checkoutRequestSender,
        configRequestSender,
        countryRequestSender,
        couponRequestSender,
        customerRequestSender,
        giftCertificateRequestSender,
        orderRequestSender,
        paymentMethodRequestSender,
        quoteRequestSender,
        shippingAddressRequestSender,
        shippingCountryRequestSender,
        shippingOptionRequestSender,
    );
}
