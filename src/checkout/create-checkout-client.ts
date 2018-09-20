import { RequestSender } from '@bigcommerce/request-sender';

import { BillingAddressRequestSender } from '../billing';
import { CustomerRequestSender } from '../customer';
import { CountryRequestSender } from '../geography';
import { OrderRequestSender } from '../order';
import { ShippingCountryRequestSender } from '../shipping';

import CheckoutClient from './checkout-client';

export default function createCheckoutClient(
    requestSender: RequestSender,
    config: { locale?: string } = {}
): CheckoutClient {
    const countryRequestSender = new CountryRequestSender(requestSender, config);
    const customerRequestSender = new CustomerRequestSender(requestSender);
    const orderRequestSender = new OrderRequestSender(requestSender);
    const shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, config);

    return new CheckoutClient(
        countryRequestSender,
        customerRequestSender,
        orderRequestSender,
        shippingCountryRequestSender
    );
}
