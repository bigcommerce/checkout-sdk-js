import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressRequestSender } from '../billing';
import { CustomerRequestSender } from '../customer';
import { CountryRequestSender } from '../geography';
import { OrderRequestSender } from '../order';
import { PaymentMethodRequestSender } from '../payment';
import { ShippingCountryRequestSender } from '../shipping';

import CheckoutClient from './checkout-client';

export default function createCheckoutClient(config: { locale?: string } = {}): CheckoutClient {
    const requestSender = createRequestSender();

    const billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
    const countryRequestSender = new CountryRequestSender(requestSender, config);
    const customerRequestSender = new CustomerRequestSender(requestSender);
    const orderRequestSender = new OrderRequestSender(requestSender);
    const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    const shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, config);

    return new CheckoutClient(
        billingAddressRequestSender,
        countryRequestSender,
        customerRequestSender,
        orderRequestSender,
        paymentMethodRequestSender,
        shippingCountryRequestSender
    );
}
