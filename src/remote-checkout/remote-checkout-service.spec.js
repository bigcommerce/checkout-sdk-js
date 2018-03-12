import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';
import { BillingAddressActionCreator } from '../billing';
import { createCheckoutClient, createCheckoutStore } from '../checkout';
import { RemoteCheckoutSynchronizationError } from './errors';
import { ShippingAddressActionCreator } from '../shipping';
import { getBillingAddress } from '../billing/internal-billing-addresses.mock';
import { getShippingAddress } from '../shipping/internal-shipping-addresses.mock';
import * as actionTypes from './remote-checkout-action-types';
import * as billingActionTypes from '../billing/billing-address-action-types';
import * as shippingActionTypes from '../shipping/shipping-address-action-types';
import RemoteCheckoutActionCreator from './remote-checkout-action-creator';
import RemoteCheckoutRequestSender from './remote-checkout-request-sender';
import RemoteCheckoutService from './remote-checkout-service';

describe('RemoteCheckoutService', () => {
    let service;
    let store;
    let billingAddressActionCreator;
    let shippingAddressActionCreator;
    let remoteCheckoutActionCreator;

    beforeEach(() => {
        store = createCheckoutStore();
        billingAddressActionCreator = new BillingAddressActionCreator(createCheckoutClient());
        shippingAddressActionCreator = new ShippingAddressActionCreator(createCheckoutClient());
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );

        service = new RemoteCheckoutService(
            store,
            billingAddressActionCreator,
            shippingAddressActionCreator,
            remoteCheckoutActionCreator
        );
    });

    it('dispatches action to initialize billing', async () => {
        const action$ = Observable.of(createAction(actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED));

        jest.spyOn(store, 'dispatch');
        jest.spyOn(remoteCheckoutActionCreator, 'initializeBilling')
            .mockReturnValue(action$);

        const state = await service.initializeBilling('amazon');

        expect(state).toBe(store.getState());
        expect(store.dispatch).toHaveBeenCalledWith(action$);
    });

    it('dispatches action to initialize shipping', async () => {
        const action$ = Observable.of(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED));

        jest.spyOn(store, 'dispatch');
        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
            .mockReturnValue(action$);

        const state = await service.initializeShipping('amazon');

        expect(state).toBe(store.getState());
        expect(store.dispatch).toHaveBeenCalledWith(action$);
    });

    it('dispatches action to initialize payment', async () => {
        const action$ = Observable.of(createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED));

        jest.spyOn(store, 'dispatch');
        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(action$);

        const state = await service.initializePayment('amazon');

        expect(state).toBe(store.getState());
        expect(store.dispatch).toHaveBeenCalledWith(action$);
    });

    it('dispatches action to set meta', async () => {
        const action = createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED);

        jest.spyOn(store, 'dispatch');
        jest.spyOn(remoteCheckoutActionCreator, 'setCheckoutMeta')
            .mockReturnValue(action);

        const state = await service.setCheckoutMeta('amazon', {});

        expect(state).toBe(store.getState());
        expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    describe('#synchronizeBillingAddress()', () => {
        let updateAction$;
        let initializeAction$;

        beforeEach(() => {
            updateAction$ = Observable.of(createAction(billingActionTypes.UPDATE_BILLING_ADDRESS_REQUESTED));
            initializeAction$ = Observable.of(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED));

            jest.spyOn(store, 'dispatch');

            jest.spyOn(billingAddressActionCreator, 'updateAddress')
                .mockReturnValue(updateAction$);

            jest.spyOn(remoteCheckoutActionCreator, 'initializeBilling')
                .mockReturnValue(initializeAction$);
        });

        it('synchronizes billing addresses if they are different', async () => {
            jest.spyOn(store, 'getState')
                .mockReturnValue({
                    checkout: {
                        getCheckoutMeta: () => ({
                            remoteCheckout: {
                                billingAddress: getBillingAddress(),
                            },
                        }),
                        getBillingAddress: () => ({
                            ...getBillingAddress(),
                            city: 'Foobar',
                        }),
                    },
                });

            const state = await service.synchronizeBillingAddress('amazon');

            expect(state).toBe(store.getState());
            expect(store.dispatch).toHaveBeenCalledWith(initializeAction$);
            expect(store.dispatch).toHaveBeenCalledWith(updateAction$);
        });

        it('does not synchronize billing addresses if they are the same', async () => {
            jest.spyOn(store, 'getState')
                .mockReturnValue({
                    checkout: {
                        getCheckoutMeta: () => ({
                            remoteCheckout: {
                                billingAddress: getBillingAddress(),
                            },
                        }),
                        getBillingAddress: () => getBillingAddress(),
                    },
                });

            await service.synchronizeBillingAddress('amazon');

            expect(store.dispatch).toHaveBeenCalledWith(initializeAction$);
            expect(store.dispatch).not.toHaveBeenCalledWith(updateAction$);
        });

        it('does not synchronize billing addresses if remote address is unavailable', async () => {
            jest.spyOn(store, 'getState')
                .mockReturnValue({
                    checkout: {
                        getCheckoutMeta: () => ({
                            remoteCheckout: { billingAddress: false },
                        }),
                        getBillingAddress: () => getBillingAddress(),
                    },
                });

            try {
                await service.synchronizeBillingAddress('amazon');
            } catch (error) {
                expect(store.dispatch).toHaveBeenCalledWith(initializeAction$);
                expect(store.dispatch).not.toHaveBeenCalledWith(updateAction$);
                expect(error).toBeInstanceOf(RemoteCheckoutSynchronizationError);
            }
        });
    });

    describe('#synchronizeShippingAddress()', () => {
        let updateAction$;
        let initializeAction$;

        beforeEach(() => {
            updateAction$ = Observable.of(createAction(shippingActionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED));
            initializeAction$ = Observable.of(createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED));

            jest.spyOn(store, 'dispatch');

            jest.spyOn(shippingAddressActionCreator, 'updateAddress')
                .mockReturnValue(updateAction$);

            jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
                .mockReturnValue(initializeAction$);
        });

        it('synchronizes shipping addresses if they are different', async () => {
            jest.spyOn(store, 'getState')
                .mockReturnValue({
                    checkout: {
                        getCheckoutMeta: () => ({
                            remoteCheckout: {
                                shippingAddress: getShippingAddress(),
                            },
                        }),
                        getShippingAddress: () => ({
                            ...getShippingAddress(),
                            city: 'Foobar',
                        }),
                    },
                });

            const state = await service.synchronizeShippingAddress('amazon');

            expect(state).toBe(store.getState());
            expect(store.dispatch).toHaveBeenCalledWith(initializeAction$);
            expect(store.dispatch).toHaveBeenCalledWith(updateAction$);
        });

        it('does not synchronize shipping addresses if they are the same', async () => {
            jest.spyOn(store, 'getState')
                .mockReturnValue({
                    checkout: {
                        getCheckoutMeta: () => ({
                            remoteCheckout: {
                                shippingAddress: getShippingAddress(),
                            },
                        }),
                        getShippingAddress: () => getShippingAddress(),
                    },
                });

            await service.synchronizeShippingAddress('amazon');

            expect(store.dispatch).toHaveBeenCalledWith(initializeAction$);
            expect(store.dispatch).not.toHaveBeenCalledWith(updateAction$);
        });

        it('does not synchronize shipping addresses if remote address is unavailable', async () => {
            jest.spyOn(store, 'getState')
                .mockReturnValue({
                    checkout: {
                        getCheckoutMeta: () => ({
                            remoteCheckout: { shippingAddress: false },
                        }),
                        getShippingAddress: () => getShippingAddress(),
                    },
                });

            try {
                await service.synchronizeShippingAddress('amazon');
            } catch (error) {
                expect(store.dispatch).toHaveBeenCalledWith(initializeAction$);
                expect(store.dispatch).not.toHaveBeenCalledWith(updateAction$);
                expect(error).toBeInstanceOf(RemoteCheckoutSynchronizationError);
            }
        });
    });
});
