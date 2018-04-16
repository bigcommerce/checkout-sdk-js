import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressRequestSender } from '../billing';
import { CartRequestSender } from '../cart';
import { ConfigRequestSender } from '../config';
import { CouponRequestSender, GiftCertificateRequestSender } from '../coupon';
import { CustomerRequestSender } from '../customer';
import { CountryRequestSender } from '../geography';
import { OrderRequestSender } from '../order';
import { PaymentMethodRequestSender } from '../payment';
import { QuoteRequestSender } from '../quote';
import { ConsignmentRequestSender, ShippingCountryRequestSender, ShippingOptionRequestSender } from '../shipping';

import CheckoutClient from './checkout-client';
import CheckoutRequestSender from './checkout-request-sender';

export default function createCheckoutClient(config: { locale?: string } = {}): CheckoutClient {
    const requestSender = createRequestSender();

    const billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
    const cartRequestSender = new CartRequestSender(requestSender);
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const configRequestSender = new ConfigRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const countryRequestSender = new CountryRequestSender(requestSender, config);
    const couponRequestSender = new CouponRequestSender(requestSender);
    const customerRequestSender = new CustomerRequestSender(requestSender);
    const giftCertificateRequestSender = new GiftCertificateRequestSender(requestSender);
    const orderRequestSender = new OrderRequestSender(requestSender);
    const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    const quoteRequestSender = new QuoteRequestSender(requestSender);
    const shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, config);
    const shippingOptionRequestSender = new ShippingOptionRequestSender(requestSender);

    return new CheckoutClient(
        billingAddressRequestSender,
        cartRequestSender,
        checkoutRequestSender,
        configRequestSender,
        consignmentRequestSender,
        countryRequestSender,
        couponRequestSender,
        customerRequestSender,
        giftCertificateRequestSender,
        orderRequestSender,
        paymentMethodRequestSender,
        quoteRequestSender,
        shippingCountryRequestSender,
        shippingOptionRequestSender
    );
}
