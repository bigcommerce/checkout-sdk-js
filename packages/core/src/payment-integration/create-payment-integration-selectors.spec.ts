import { merge } from 'lodash';

import { PaymentIntegrationSelectors } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { createInternalCheckoutSelectors, InternalCheckoutSelectors } from '../checkout';
import { getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';

import createPaymentIntegrationSelectors from './create-payment-integration-selectors';

describe('createPaymentIntegrationSelectors', () => {
    describe('PaymentIntegrationSelectors', () => {
        let subject: PaymentIntegrationSelectors;
        let internalSelectors: InternalCheckoutSelectors;

        beforeEach(() => {
            internalSelectors = createInternalCheckoutSelectors(getCheckoutStoreStateWithOrder());
            subject = createPaymentIntegrationSelectors(internalSelectors);
        });

        it('returns copy of billing address', () => {
            const output = subject.getBillingAddress();

            expect(output).toEqual(internalSelectors.billingAddress.getBillingAddress());
            expect(output).not.toBe(internalSelectors.billingAddress.getBillingAddress());
        });

        it('throws if billing address is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    billingAddress: {
                        getBillingAddressOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getBillingAddressOrThrow()).toThrow();
        });

        it('returns copy of cart', () => {
            const output = subject.getCart();

            expect(output).toEqual(internalSelectors.cart.getCart());
            expect(output).not.toBe(internalSelectors.cart.getCart());
        });

        it('throws if cart is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    cart: {
                        getCartOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getCartOrThrow()).toThrow();
        });

        it('returns copy of checkout', () => {
            const output = subject.getCheckout();

            expect(output).toEqual(internalSelectors.checkout.getCheckout());
            expect(output).not.toBe(internalSelectors.checkout.getCheckout());
        });

        it('throws if checkout is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    checkout: {
                        getCheckoutOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getCheckoutOrThrow()).toThrow();
        });

        it('returns copy of config', () => {
            const output = subject.getStoreConfig();

            expect(output).toEqual(internalSelectors.config.getStoreConfig());
            expect(output).not.toBe(internalSelectors.config.getStoreConfig());
        });

        it('throws if config is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    config: {
                        getStoreConfigOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getStoreConfigOrThrow()).toThrow();
        });

        it('returns copy of consignments', () => {
            const output = subject.getConsignments();

            expect(output).toEqual(internalSelectors.consignments.getConsignments());
            expect(output).not.toBe(internalSelectors.consignments.getConsignments());
        });

        it('throws if consignments are missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    consignments: {
                        getConsignmentsOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getConsignmentsOrThrow()).toThrow();
        });

        it('returns copy of countries', () => {
            const output = subject.getCountries();

            expect(output).toEqual(internalSelectors.countries.getCountries());
            expect(output).not.toBe(internalSelectors.countries.getCountries());
        });

        it('returns copy of customer', () => {
            const output = subject.getCustomer();

            expect(output).toEqual(internalSelectors.customer.getCustomer());
            expect(output).not.toBe(internalSelectors.customer.getCustomer());
        });

        it('throws if customer is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    customer: {
                        getCustomerOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getCustomerOrThrow()).toThrow();
        });

        it('returns copy of card instrument', () => {
            const output = subject.getCardInstrument('123');

            expect(output).toEqual(internalSelectors.instruments.getCardInstrument('123'));
            expect(output).not.toBe(internalSelectors.instruments.getCardInstrument('123'));
        });

        it('throws if card instrument is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    instruments: {
                        getCardInstrumentOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getCardInstrumentOrThrow('123')).toThrow();
        });

        it('returns copy of order', () => {
            const output = subject.getOrder();

            expect(output).toEqual(internalSelectors.order.getOrder());
            expect(output).not.toBe(internalSelectors.order.getOrder());
        });

        it('throws if order is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    order: {
                        getOrderOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getOrderOrThrow()).toThrow();
        });

        it('returns payment token', () => {
            const output = subject.getPaymentToken();

            expect(output).toEqual(internalSelectors.payment.getPaymentToken());
        });

        it('throws if payment token is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    payment: {
                        getPaymentTokenOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getPaymentTokenOrThrow()).toThrow();
        });

        it('returns payment id', () => {
            const output = subject.getPaymentId();

            expect(output).toEqual(internalSelectors.payment.getPaymentId());
        });

        it('throws if payment id is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    payment: {
                        getPaymentIdOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getPaymentIdOrThrow()).toThrow();
        });

        it('returns payment status', () => {
            const output = subject.getPaymentStatus();

            expect(output).toEqual(internalSelectors.payment.getPaymentStatus());
        });

        it('throws if payment status is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    payment: {
                        getPaymentStatusOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getPaymentStatusOrThrow()).toThrow();
        });

        it('returns payment redirect URL', () => {
            const output = subject.getPaymentRedirectUrl();

            expect(output).toEqual(internalSelectors.payment.getPaymentRedirectUrl());
        });

        it('throws if payment redirect URL is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    payment: {
                        getPaymentRedirectUrlOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getPaymentRedirectUrlOrThrow()).toThrow();
        });

        it('returns copy of payment method', () => {
            const output = subject.getPaymentMethod('braintree');

            expect(output).toEqual(internalSelectors.paymentMethods.getPaymentMethod('braintree'));
            expect(output).not.toBe(internalSelectors.paymentMethods.getPaymentMethod('braintree'));
        });

        it('throws if payment method is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    paymentMethods: {
                        getPaymentMethodOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getPaymentMethodOrThrow('braintree')).toThrow();
        });

        it('returns copy of shipping address', () => {
            const output = subject.getShippingAddress();

            expect(output).toEqual(internalSelectors.shippingAddress.getShippingAddress());
            expect(output).not.toBe(internalSelectors.shippingAddress.getShippingAddress());
        });

        it('throws if shipping address is missing', () => {
            subject = createPaymentIntegrationSelectors(
                merge(internalSelectors, {
                    shippingAddress: {
                        getShippingAddressOrThrow: () => {
                            throw new Error();
                        },
                    },
                }),
            );

            expect(() => subject.getShippingAddressOrThrow()).toThrow();
        });

        it('returns is payment data required', () => {
            const output = subject.isPaymentDataRequired();

            expect(output).toEqual(internalSelectors.payment.isPaymentDataRequired());
        });

        it('returns is payment data initialized', () => {
            const output = subject.isPaymentMethodInitialized({ methodId: 'braintree' });

            expect(output).toEqual(
                internalSelectors.paymentStrategies.isInitialized({ methodId: 'braintree' }),
            );
        });
    });
});
