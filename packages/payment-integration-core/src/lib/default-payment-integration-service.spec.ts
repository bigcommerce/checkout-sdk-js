import { getBillingAddress,
    getOrder,
    getPayment,
    getShippingAddress,
    BillingAddressActionCreator,
    CheckoutActionCreator,
    CheckoutStore,
    ConsignmentActionCreator,
    DataStoreProjection,
    InternalCheckoutSelectors,
    OrderActionCreator,
    PaymentActionCreator,
    PaymentMethodActionCreator } from '@bigcommerce/checkout-sdk/core';
import { createAction } from '@bigcommerce/data-store';
import { noop } from 'lodash';

import DefaultPaymentIntegrationService from './default-payment-integration-service';
import PaymentIntegrationService from './payment-integration-core';
import PaymentIntegrationSelectors from './payment-integration-selectors';
import PaymentIntegrationStoreProjectionFactory from './payment-integration-store-projection-factory';

describe('DefaultPaymentIntegrationService', () => {
    let subject: PaymentIntegrationService;
    let paymentIntegrationSelectors: PaymentIntegrationSelectors;
    let internalCheckoutSelectors: InternalCheckoutSelectors;
    let store: Pick<CheckoutStore, 'dispatch' | 'getState'>;
    let storeProjection: Pick<DataStoreProjection<PaymentIntegrationSelectors>, 'getState' | 'subscribe' | 'getState'>;
    let storeProjectionFactory: Pick<PaymentIntegrationStoreProjectionFactory, 'create'>;
    let checkoutActionCreator: Pick<CheckoutActionCreator, 'loadCurrentCheckout'>;
    let orderActionCreator: Pick<OrderActionCreator, 'submitOrder' | 'finalizeOrder'>;
    let billingAddressActionCreator: Pick<BillingAddressActionCreator, 'updateAddress'>;
    let consignmentActionCreator: Pick<ConsignmentActionCreator, 'updateAddress'>;
    let paymentMethodActionCreator: Pick<PaymentMethodActionCreator, 'loadPaymentMethod'>;
    let paymentActionCreator: Pick<PaymentActionCreator, 'submitPayment'>;

    beforeEach(() => {
        paymentIntegrationSelectors = {} as PaymentIntegrationSelectors;

        internalCheckoutSelectors = {
            order: {
                getOrderOrThrow: () => getOrder(),
            },
        } as InternalCheckoutSelectors;

        store = {
            dispatch: jest.fn(async () => await internalCheckoutSelectors),
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
        };

        paymentMethodActionCreator = {
            loadPaymentMethod: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHOD')),
        };

        paymentActionCreator = {
            submitPayment: jest.fn(async () => () => createAction('LOAD_PAYMENT_METHOD')),
        };

        subject = new DefaultPaymentIntegrationService(
            store as CheckoutStore,
            storeProjectionFactory as PaymentIntegrationStoreProjectionFactory,
            checkoutActionCreator as CheckoutActionCreator,
            orderActionCreator as OrderActionCreator,
            billingAddressActionCreator as BillingAddressActionCreator,
            consignmentActionCreator as ConsignmentActionCreator,
            paymentMethodActionCreator as PaymentMethodActionCreator,
            paymentActionCreator as PaymentActionCreator
        );
    });

    describe('#loadCheckout', () => {
        it('loads current checkout', async () => {
            const output = await subject.loadCheckout();

            expect(checkoutActionCreator.loadCurrentCheckout)
                .toHaveBeenCalled();
            expect(store.dispatch)
                .toHaveBeenCalledWith(checkoutActionCreator.loadCurrentCheckout());
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#loadPaymentMethod', () => {
        it('loads payment method', async () => {
            const output = await subject.loadPaymentMethod('braintree');

            expect(paymentMethodActionCreator.loadPaymentMethod)
                .toHaveBeenCalledWith('braintree');
            expect(store.dispatch)
                .toHaveBeenCalledWith(paymentMethodActionCreator.loadPaymentMethod('braintree'));
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#submitOrder', () => {
        it('submits order', async () => {
            const output = await subject.submitOrder();

            expect(orderActionCreator.submitOrder)
                .toHaveBeenCalled();
            expect(store.dispatch)
                .toHaveBeenCalledWith(orderActionCreator.submitOrder());
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#submitPayment', () => {
        it('submit payment', async () => {
            const output = await subject.submitPayment(getPayment());

            expect(paymentActionCreator.submitPayment)
                .toHaveBeenCalled();
            expect(store.dispatch)
                .toHaveBeenCalledWith(paymentActionCreator.submitPayment(getPayment()));
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#finalizeOrder', () => {
        it('finalizes order', async () => {
            const output = await subject.finalizeOrder();

            expect(orderActionCreator.finalizeOrder)
                .toHaveBeenCalled();
            expect(store.dispatch)
                .toHaveBeenCalledWith(orderActionCreator.finalizeOrder(getOrder().orderId));
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#updateBillingAddress', () => {
        it('update billing address', async () => {
            const output = await subject.updateBillingAddress(getBillingAddress());

            expect(billingAddressActionCreator.updateAddress)
                .toHaveBeenCalledWith(getBillingAddress());
            expect(store.dispatch)
                .toHaveBeenCalledWith(billingAddressActionCreator.updateAddress(getBillingAddress()));
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });

    describe('#updateShippingAddress', () => {
        it('update shipping address', async () => {
            const output = await subject.updateShippingAddress(getShippingAddress());

            expect(consignmentActionCreator.updateAddress)
                .toHaveBeenCalledWith(getShippingAddress());
            expect(store.dispatch)
                .toHaveBeenCalledWith(consignmentActionCreator.updateAddress(getShippingAddress()));
            expect(output)
                .toEqual(paymentIntegrationSelectors);
        });
    });
});
