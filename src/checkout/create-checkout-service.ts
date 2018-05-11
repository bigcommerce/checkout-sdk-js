import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressActionCreator } from '../billing';
import { ConfigActionCreator } from '../config';
import { CouponActionCreator, GiftCertificateActionCreator } from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { CountryActionCreator } from '../geography';
import { OrderActionCreator } from '../order';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../payment';
import { InstrumentActionCreator, InstrumentRequestSender } from '../payment/instrument';
import { QuoteActionCreator } from '../quote';
import { createShippingStrategyRegistry, ShippingCountryActionCreator, ShippingStrategyActionCreator } from '../shipping';
import ConsignmentActionCreator from '../shipping/consignment-action-creator';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutClient from './checkout-client';
import CheckoutService from './checkout-service';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';

export default function createCheckoutService(options: CheckoutServiceOptions = {}): CheckoutService {
    const client = options.client || createCheckoutClient({ locale: options.locale });
    const store = createCheckoutStore({}, { shouldWarnMutation: options.shouldWarnMutation });
    const paymentClient = createPaymentClient(store);
    const requestSender = createRequestSender();

    return new CheckoutService(
        store,
        new BillingAddressActionCreator(client),
        new CheckoutActionCreator(client),
        new ConfigActionCreator(client),
        new ConsignmentActionCreator(client),
        new CountryActionCreator(client),
        new CouponActionCreator(client),
        new CustomerStrategyActionCreator(createCustomerStrategyRegistry(store, client)),
        new GiftCertificateActionCreator(client),
        new InstrumentActionCreator(new InstrumentRequestSender(paymentClient, requestSender)),
        new OrderActionCreator(client),
        new PaymentMethodActionCreator(client),
        new PaymentStrategyActionCreator(createPaymentStrategyRegistry(store, client, paymentClient)),
        new QuoteActionCreator(client),
        new ShippingCountryActionCreator(client),
        new ShippingStrategyActionCreator(createShippingStrategyRegistry(store, client))
    );
}

export interface CheckoutServiceOptions {
    client?: CheckoutClient;
    locale?: string;
    shouldWarnMutation?: boolean;
}
