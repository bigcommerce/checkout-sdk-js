import { createRequestSender } from '@bigcommerce/request-sender';

import { BillingAddressActionCreator } from '../billing';
import { ConfigActionCreator } from '../config';
import {
    CouponActionCreator,
    CouponRequestSender,
    GiftCertificateActionCreator,
    GiftCertificateRequestSender
} from '../coupon';
import { createCustomerStrategyRegistry, CustomerStrategyActionCreator } from '../customer';
import { CountryActionCreator } from '../geography';
import { OrderActionCreator } from '../order';
import { createPaymentClient, createPaymentStrategyRegistry, PaymentMethodActionCreator, PaymentStrategyActionCreator } from '../payment';
import { InstrumentActionCreator, InstrumentRequestSender } from '../payment/instrument';
import { createShippingStrategyRegistry, ShippingCountryActionCreator, ShippingStrategyActionCreator } from '../shipping';
import ConsignmentActionCreator from '../shipping/consignment-action-creator';

import CheckoutActionCreator from './checkout-action-creator';
import CheckoutRequestSender from './checkout-request-sender';
import CheckoutService from './checkout-service';
import CheckoutValidator from './checkout-validator';
import createCheckoutClient from './create-checkout-client';
import createCheckoutStore from './create-checkout-store';

export default function createCheckoutService(options: CheckoutServiceOptions = {}): CheckoutService {
    const client = createCheckoutClient({ locale: options.locale });
    const store = createCheckoutStore({}, { shouldWarnMutation: options.shouldWarnMutation });
    const paymentClient = createPaymentClient(store);
    const requestSender = createRequestSender();

    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const couponRequestSender = new CouponRequestSender(requestSender);
    const giftCertificateRequestSender = new GiftCertificateRequestSender(requestSender);
    const orderActionCreator = new OrderActionCreator(client, checkoutValidator);

    return new CheckoutService(
        store,
        new BillingAddressActionCreator(client),
        new CheckoutActionCreator(checkoutRequestSender),
        new ConfigActionCreator(client),
        new ConsignmentActionCreator(client, checkoutRequestSender),
        new CountryActionCreator(client),
        new CouponActionCreator(couponRequestSender),
        new CustomerStrategyActionCreator(createCustomerStrategyRegistry(store, client)),
        new GiftCertificateActionCreator(giftCertificateRequestSender),
        new InstrumentActionCreator(new InstrumentRequestSender(paymentClient, requestSender)),
        orderActionCreator,
        new PaymentMethodActionCreator(client),
        new PaymentStrategyActionCreator(
            createPaymentStrategyRegistry(store, client, paymentClient),
            orderActionCreator
        ),
        new ShippingCountryActionCreator(client),
        new ShippingStrategyActionCreator(createShippingStrategyRegistry(store, client))
    );
}

export interface CheckoutServiceOptions {
    locale?: string;
    shouldWarnMutation?: boolean;
}
