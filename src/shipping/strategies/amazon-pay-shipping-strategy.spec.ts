import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { NotInitializedError } from '../../common/error/errors';
import { getRemoteCustomer } from '../../customer/internal-customers.mock';
import { PaymentMethodActionCreator } from '../../payment';
import { LOAD_PAYMENT_METHOD_SUCCEEDED } from '../../payment/payment-method-action-types';
import { getAmazonPay } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import {
    AmazonPayAddressBook,
    AmazonPayAddressBookOptions,
    AmazonPayOrderReference,
    AmazonPayScriptLoader,
    AmazonPayWindow,
} from '../../remote-checkout/methods/amazon-pay';
import { INITIALIZE_REMOTE_SHIPPING_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import { getRemoteCheckoutState, getRemoteCheckoutStateData } from '../../remote-checkout/remote-checkout.mock';
import ConsignmentActionCreator from '../consignment-action-creator';
import { ConsignmentActionTypes } from '../consignment-actions';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import { getShippingAddress } from '../shipping-addresses.mock';
import { ShippingStrategyActionType } from '../shipping-strategy-actions';

import AmazonPayShippingStrategy from './amazon-pay-shipping-strategy';

describe('AmazonPayShippingStrategy', () => {
    let consignmentActionCreator: ConsignmentActionCreator;
    let addressBookSpy: jest.Mock;
    let container: HTMLDivElement;
    let hostWindow: AmazonPayWindow;
    let orderReference: AmazonPayOrderReference;
    let store: CheckoutStore;
    let scriptLoader: AmazonPayScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;

    class MockAddressBook implements AmazonPayAddressBook {
        constructor(public options: AmazonPayAddressBookOptions) {
            addressBookSpy(options);

            options.onReady(orderReference);
        }

        bind(id: string) {
            const element = document.getElementById(id);

            element.addEventListener('addressSelect', () => {
                this.options.onAddressSelect(orderReference);
            });

            element.addEventListener('error', (event: CustomEvent) => {
                this.options.onError(Object.assign(new Error(), {
                    getErrorCode: () => event.detail.code,
                }));
            });

            element.addEventListener('orderReferenceCreate', () => {
                this.options.onOrderReferenceCreate(orderReference);
            });
        }
    }

    beforeEach(() => {
        consignmentActionCreator = new ConsignmentActionCreator(createCheckoutClient());
        addressBookSpy = jest.fn();
        container = document.createElement('div');
        hostWindow = window;
        store = createCheckoutStore({
            customer: {
                data: getRemoteCustomer(),
            },
            remoteCheckout: getRemoteCheckoutState(),
        });
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(new RemoteCheckoutRequestSender(createRequestSender()));
        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());

        orderReference = {
            getAmazonBillingAgreementId: () => '102e0feb-5c40-4609-9fe1-06a62bc78b14',
            getAmazonOrderReferenceId: () => getRemoteCheckoutStateData().amazon.referenceId,
        };

        container.setAttribute('id', 'addressBook');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((method, onReady) => {
            hostWindow.OffAmazonPayments = { Widgets: { AddressBook: MockAddressBook } } as any;

            onReady();

            return Promise.resolve();
        });

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.of(createAction(LOAD_PAYMENT_METHOD_SUCCEEDED, { paymentMethod: getAmazonPay() })));
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads widget script during initialization', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        expect(scriptLoader.loadWidget).not.toHaveBeenCalledWith(paymentMethod);
    });

    it('only initializes widget once until deinitialization', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });
        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        expect(addressBookSpy).toHaveBeenCalledTimes(1);

        await strategy.deinitialize();
        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        expect(addressBookSpy).toHaveBeenCalledTimes(2);
    });

    it('rejects with error if initialization fails', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = { ...getAmazonPay(), config: { merchantId: undefined } };

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockReturnValue(Observable.of(createAction(LOAD_PAYMENT_METHOD_SUCCEEDED, { paymentMethod })));

        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('rejects with error if initialization fails because of invalid container', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook123' } });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('synchronizes checkout address when selecting new address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();
        const initializeShippingAction = Observable.of(createAction(INITIALIZE_REMOTE_SHIPPING_REQUESTED));
        const updateAddressAction = Observable.of(createAction(ConsignmentActionTypes.CreateConsignmentsRequested));

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
            .mockReturnValue(initializeShippingAction);

        jest.spyOn(consignmentActionCreator, 'updateAddress')
            .mockReturnValue(updateAddressAction);

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('addressSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(remoteCheckoutActionCreator.initializeShipping)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getRemoteCheckoutStateData().amazon.referenceId,
            });

        expect(consignmentActionCreator.updateAddress)
            .toHaveBeenCalledWith(getShippingAddress());

        expect(store.dispatch).toHaveBeenCalledWith(initializeShippingAction);
        expect(store.dispatch).toHaveBeenCalledWith(updateAddressAction);
    });

    it('tracks strategy execution while synchronizing checkout address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
            .mockReturnValue(Observable.of(createAction(INITIALIZE_REMOTE_SHIPPING_REQUESTED)));

        jest.spyOn(consignmentActionCreator, 'updateAddress')
            .mockReturnValue(Observable.of(createAction(ConsignmentActionTypes.CreateConsignmentsRequested)));

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('addressSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId: paymentMethod.id }));
        expect(store.dispatch).toHaveBeenCalledWith(createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId: paymentMethod.id }));
    });

    it('sets order reference id when order reference gets created', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutActionCreator, 'updateCheckout');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('orderReferenceCreate'));

        expect(remoteCheckoutActionCreator.updateCheckout)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getRemoteCheckoutStateData().amazon.referenceId,
            });
    });

    it('passes error to callback when address book encounters error', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const element = document.getElementById('addressBook');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook', onError } });

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('passes error to callback if unable to synchronize address data', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const error = new Error();

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook', onError } });

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
            .mockReturnValue(Promise.reject(error));

        document.getElementById('addressBook')
            .dispatchEvent(new CustomEvent('addressSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(onError).toHaveBeenCalledWith(error);
    });

    it('selects shipping option', async () => {
        const strategy = new AmazonPayShippingStrategy(store, consignmentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const method = getFlatRateOption();
        const options = {};
        const action = Observable.of(createAction(ConsignmentActionTypes.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'selectShippingOption')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(method.id, options);

        expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(method.id, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
