import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressActionCreator } from '../billing';
import { CartActionCreator } from '../cart';
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

import CheckoutClient from './checkout-client';
import CheckoutService from './checkout-service';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';

export default function createCheckoutService(options: CheckoutServiceOptions = {}): CheckoutService {
    const client = options.client || createCheckoutClient({ locale: options.locale });
    const store = createCheckoutStore({}, { shouldWarnMutation: options.shouldWarnMutation });
    const paymentClient = createPaymentClient(store);

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

export interface CheckoutServiceOptions {
    client?: CheckoutClient;
    locale?: string;
    shouldWarnMutation?: boolean;
}
