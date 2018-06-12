import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressRequestSender } from '../billing';
import { ConfigRequestSender } from '../config';
import { CustomerRequestSender } from '../customer';
import { CountryRequestSender } from '../geography';
import { OrderRequestSender } from '../order';
import { PaymentMethodRequestSender } from '../payment';
import { QuoteRequestSender } from '../quote';
import { ConsignmentRequestSender, ShippingCountryRequestSender } from '../shipping';

import CheckoutClient from './checkout-client';

export default function createCheckoutClient(config: { locale?: string } = {}): CheckoutClient {
    const requestSender = createRequestSender();

    const billingAddressRequestSender = new BillingAddressRequestSender(requestSender);
    const configRequestSender = new ConfigRequestSender(requestSender);
    const consignmentRequestSender = new ConsignmentRequestSender(requestSender);
    const countryRequestSender = new CountryRequestSender(requestSender, config);
    const customerRequestSender = new CustomerRequestSender(requestSender);
    const orderRequestSender = new OrderRequestSender(requestSender);
    const paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
    const quoteRequestSender = new QuoteRequestSender(requestSender);
    const shippingCountryRequestSender = new ShippingCountryRequestSender(requestSender, config);

    return new CheckoutClient(
        billingAddressRequestSender,
        configRequestSender,
        consignmentRequestSender,
        countryRequestSender,
        customerRequestSender,
        orderRequestSender,
        paymentMethodRequestSender,
        quoteRequestSender,
        shippingCountryRequestSender
    );
}
