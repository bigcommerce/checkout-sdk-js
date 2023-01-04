import { createAction } from '@bigcommerce/data-store';
import { noop } from 'lodash';

import {
    HostedFieldType,
    PaymentIntegrationSelectors,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BillingAddressActionCreator } from '../billing';
import { getBillingAddress } from '../billing/billing-addresses.mock';
import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../checkout';
import { DataStoreProjection } from '../common/data-store';
import { CustomerActionCreator } from '../customer';
import { HostedForm, HostedFormFactory } from '../hosted-form';
import { OrderActionCreator } from '../order';
import { getOrder } from '../order/orders.mock';
import PaymentActionCreator from '../payment/payment-action-creator';
import PaymentMethodActionCreator from '../payment/payment-method-action-creator';
import { getPayment } from '../payment/payments.mock';
import { ConsignmentActionCreator } from '../shipping';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import DefaultPaymentIntegrationService from './default-payment-integration-service';
import PaymentIntegrationStoreProjectionFactory from './payment-integration-store-projection-factory';

describe('DefaultPaymentIntegrationService', () => {
    let subject: PaymentIntegrationService;
    let hostedFormFactory: HostedFormFactory;
    let paymentIntegrationSelectors: PaymentIntegrationSelectors;
    let internalCheckoutSelectors: InternalCheckoutSelectors;
    let store: Pick<CheckoutStore, 'dispatch' | 'getState'>;
    let storeProjection: Pick<
        DataStoreProjection<PaymentIntegrationSelectors>,
        'getState' | 'subscribe' | 'getState'
    >;
    let storeProjectionFactory: Pick<PaymentIntegrationStoreProjectionFactory, 'create'>;
    let checkoutActionCreator: Pick<
        CheckoutActionCreator,
        'loadCurrentCheckout' | 'loadDefaultCheckout'
    >;
    let orderActionCreator: Pick<OrderActionCreator, 'submitOrder' | 'finalizeOrder'>;
    let billingAddressActionCreator: Pick<BillingAddressActionCreator, 'updateAddress'>;
    let consignmentActionCreator: Pick<
        ConsignmentActionCreator,
        'updateAddress' | 'selectShippingOption'
    >;
    let paymentMethodActionCreator: Pick<PaymentMethodActionCreator, 'loadPaymentMethod'>;
    let paymentActionCreator: Pick<
        PaymentActionCreator,
        'submitPayment' | 'initializeOffsitePayment'
    >;
    let customerActionCreator: Pick<CustomerActionCreator, 'signInCustomer' | 'signOutCustomer'>;

    beforeEach(() => {
        hostedFormFactory = new HostedFormFactory(store as CheckoutStore);
        paymentIntegrationSelectors = {} as PaymentIntegrationSelectors;

        internalCheckoutSelectors = {
            order: {
                getOrderOrThrow: () => getOrder(),
            },
        } as InternalCheckoutSelectors;

        store = {
            dispatch: jest.fn(async () => internalCheckoutSelectors),
            getState: jest.fn(() => internalCheckoutSelectors),
        };

        storeProjection = {
            subscribe: jest.fn(() => noop),
            getState: jest.fn(() => paymentIntegrationSelectors),
        };

        storeProjectionFactory = {
            create: jest.fn(() => storeProjection),
        };

        checkoutActionCreator = {
            loadCurrentCheckout: jest.fn(async () => () => createAction('LOAD_CHECKOUT')),
            loadDefaultCheckout: jest.fn(async () => () => createAction('LOAD_CHECKOUT')),
        };

        orderActionCreator = {
            submitOrder: jest.fn(async () => () => createAction('SUBMIT_ORDER')),
            finalizeOrder: jest.fn(async () => () => createAction('FINALIZE_ORDER')),
        };

        billingAddressActionCreator = {
            updateAddress: jest.fn(async () => () => createAction('UPDATE_BILLING_ADDRESS')),
        };

        consignmentActionCreator = {
            updateAddress: jest.fn(async () => () => createAction('UPDATE_CONSIGNMENT_ADDRESS')),
            selectShippingOption: jest.fn(async () => () => createAction('UPDATE_SHIPPING_OPTION')),
        };

        paymentMethodActionCreator = {
            loadPaymentMethod: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHOD')),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHOD')),
            initializeOffsitePayment: jest.fn(
                async () => () => createAction('INITIALIZE_OFFSITE_PAYMENT_REQUESTED'),
            ),
        };

        customerActionCreator = {
            signInCustomer: jest.fn(async () => () => createAction('SIGN_IN_CUSTOMER')),
            signOutCustomer: jest.fn(async () => () => createAction('SIGN_OUT_CUSTOMER')),
        };

        subject = new DefaultPaymentIntegrationService(
            store as CheckoutStore,
            storeProjectionFactory as PaymentIntegrationStoreProjectionFactory,
            checkoutActionCreator as CheckoutActionCreator,
            hostedFormFactory,
            orderActionCreator as OrderActionCreator,
            billingAddressActionCreator as BillingAddressActionCreator,
            consignmentActionCreator as ConsignmentActionCreator,
            paymentMethodActionCreator as PaymentMethodActionCreator,
            paymentActionCreator as PaymentActionCreator,
            customerActionCreator as CustomerActionCreator,
        );
    });

    describe('#loadCheckout', () => {
        it('loads current checkout', async () => {
            const output = await subject.loadCheckout();

            expect(checkoutActionCreator.loadCurrentCheckout).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                checkoutActionCreator.loadCurrentCheckout(),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#hostedForm', () => {
        it('creates hosted form', async () => {
            const output = await subject.createHostedForm('http://www.example.com', {
                fields: {
                    [HostedFieldType.CardCode]: { containerId: 'card-code' },
                    [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                    [HostedFieldType.CardName]: { containerId: 'card-name' },
                    [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                },
            });

            expect(output).toBeInstanceOf(HostedForm);
        });
    });

    describe('#loadDefaultCheckout', () => {
        it('loads current checkout', async () => {
            const output = await subject.loadDefaultCheckout();

            expect(checkoutActionCreator.loadDefaultCheckout).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                checkoutActionCreator.loadDefaultCheckout(),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#loadPaymentMethod', () => {
        it('loads payment method', async () => {
            const output = await subject.loadPaymentMethod('braintree');

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('braintree');
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentMethodActionCreator.loadPaymentMethod('braintree'),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#submitOrder', () => {
        it('submits order', async () => {
            const output = await subject.submitOrder();

            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(orderActionCreator.submitOrder());
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#submitPayment', () => {
        it('submit payment', async () => {
            const output = await subject.submitPayment(getPayment());

            expect(paymentActionCreator.submitPayment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentActionCreator.submitPayment(getPayment()),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#initializeOffsitePayment', () => {
        it('initializes offsite payment', async () => {
            const config = {
                methodId: 'test',
            };
            const output = await subject.initializeOffsitePayment(config);

            expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                paymentActionCreator.initializeOffsitePayment(config),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#finalizeOrder', () => {
        it('finalizes order', async () => {
            const output = await subject.finalizeOrder();

            expect(orderActionCreator.finalizeOrder).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(
                orderActionCreator.finalizeOrder(getOrder().orderId),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#updateBillingAddress', () => {
        it('update billing address', async () => {
            const output = await subject.updateBillingAddress(getBillingAddress());

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(
                getBillingAddress(),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                billingAddressActionCreator.updateAddress(getBillingAddress()),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#updateShippingAddress', () => {
        it('update shipping address', async () => {
            const output = await subject.updateShippingAddress(getShippingAddress());

            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(
                getShippingAddress(),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                consignmentActionCreator.updateAddress(getShippingAddress()),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#selectShippingOption', () => {
        it('select shipping option', async () => {
            const output = await subject.selectShippingOption('1', {});

            expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith('1', {});
            expect(store.dispatch).toHaveBeenCalledWith(
                consignmentActionCreator.selectShippingOption('1', {}),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#signInCustomer', () => {
        it('sign in customer', async () => {
            const credentials = { email: 'test@test.com', password: '123' };
            const output = await subject.signInCustomer(credentials, {});

            expect(customerActionCreator.signInCustomer).toHaveBeenCalledWith(credentials, {});
            expect(store.dispatch).toHaveBeenCalledWith(
                customerActionCreator.signInCustomer(credentials, {}),
            );
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#signOutCustomer', () => {
        it('sign out customer', async () => {
            const output = await subject.signOutCustomer({});

            expect(customerActionCreator.signOutCustomer).toHaveBeenCalledWith({});
            expect(store.dispatch).toHaveBeenCalledWith(customerActionCreator.signOutCustomer({}));
            expect(output).toEqual(paymentIntegrationSelectors);
        });
    });
});
