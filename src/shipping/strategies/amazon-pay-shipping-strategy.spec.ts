/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs';

import { createCheckoutClient, createCheckoutStore, CheckoutStore } from '../../checkout';
import { getCheckoutMeta } from '../../checkout/checkouts.mock';
import { NotInitializedError } from '../../common/error/errors';
import { getRemoteCustomer } from '../../customer/internal-customers.mock';
import { PaymentMethodActionCreator } from '../../payment';
import { LOAD_PAYMENT_METHOD_SUCCEEDED } from '../../payment/payment-method-action-types';
import { getAmazonPay } from '../../payment/payment-methods.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { RemoteCheckoutAccountInvalidError, RemoteCheckoutSessionError, RemoteCheckoutShippingError } from '../../remote-checkout/errors';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { INITIALIZE_REMOTE_SHIPPING_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import { getRemoteCheckoutState } from '../../remote-checkout/remote-checkout.mock';
import { getShippingAddress } from '../internal-shipping-addresses.mock';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import ShippingAddressActionCreator from '../shipping-address-action-creator';
import { UPDATE_SHIPPING_ADDRESS_REQUESTED } from '../shipping-address-action-types';
import ShippingOptionActionCreator from '../shipping-option-action-creator';
import { SELECT_SHIPPING_OPTION_REQUESTED } from '../shipping-option-action-types';
import { ShippingStrategyActionType } from '../shipping-strategy-actions';

import AmazonPayShippingStrategy from './amazon-pay-shipping-strategy';

describe('AmazonPayShippingStrategy', () => {
    let addressActionCreator: ShippingAddressActionCreator;
    let addressBookSpy: jest.Mock;
    let container: HTMLDivElement;
    let hostWindow: OffAmazonPayments.HostWindow;
    let orderReference: OffAmazonPayments.Widgets.OrderReference;
    let store: CheckoutStore;
    let scriptLoader: AmazonPayScriptLoader;
    let optionActionCreator: ShippingOptionActionCreator;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;

    class AddressBook implements OffAmazonPayments.Widgets.AddressBook {
        constructor(public options: OffAmazonPayments.Widgets.AddressBookOptions) {
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
        addressActionCreator = new ShippingAddressActionCreator(createCheckoutClient());
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
        optionActionCreator = new ShippingOptionActionCreator(createCheckoutClient());
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());

        orderReference = {
            getAmazonBillingAgreementId: () => '102e0feb-5c40-4609-9fe1-06a62bc78b14',
            getAmazonOrderReferenceId: () => getCheckoutMeta().remoteCheckout.amazon.referenceId,
        };

        container.setAttribute('id', 'addressBook');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((method, onReady) => {
            hostWindow.OffAmazonPayments = { Widgets: { AddressBook } };

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
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        expect(scriptLoader.loadWidget).not.toHaveBeenCalledWith(paymentMethod);
    });

    it('only initializes widget once until deinitialization', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });
        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        expect(addressBookSpy).toHaveBeenCalledTimes(1);

        await strategy.deinitialize();
        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        expect(addressBookSpy).toHaveBeenCalledTimes(2);
    });

    it('rejects with error if initialization fails', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
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
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook123' } });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('synchronizes checkout address when selecting new address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();
        const initializeShippingAction = Observable.of(createAction(INITIALIZE_REMOTE_SHIPPING_REQUESTED));
        const updateAddressAction = Observable.of(createAction(UPDATE_SHIPPING_ADDRESS_REQUESTED));

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
            .mockReturnValue(initializeShippingAction);

        jest.spyOn(addressActionCreator, 'updateAddress')
            .mockReturnValue(updateAddressAction);

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('addressSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(remoteCheckoutActionCreator.initializeShipping)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });

        expect(addressActionCreator.updateAddress)
            .toHaveBeenCalledWith(getShippingAddress());

        expect(store.dispatch).toHaveBeenCalledWith(initializeShippingAction);
        expect(store.dispatch).toHaveBeenCalledWith(updateAddressAction);
    });

    it('tracks strategy execution while synchronizing checkout address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping')
            .mockReturnValue(Observable.of(createAction(INITIALIZE_REMOTE_SHIPPING_REQUESTED)));

        jest.spyOn(addressActionCreator, 'updateAddress')
            .mockReturnValue(Observable.of(createAction(UPDATE_SHIPPING_ADDRESS_REQUESTED)));

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('addressSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId: paymentMethod.id }));
        expect(store.dispatch).toHaveBeenCalledWith(createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId: paymentMethod.id }));
    });

    it('sets order reference id when order reference gets created', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutActionCreator, 'setCheckoutMeta');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook' } });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('orderReferenceCreate'));

        expect(remoteCheckoutActionCreator.setCheckoutMeta)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });
    });

    it('passes error to callback when address book encounters error', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const element = document.getElementById('addressBook');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'addressBook', onError } });

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutSessionError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'InvalidAccountStatus' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutAccountInvalidError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'InvalidOrderReferenceId' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutShippingError));
    });

    it('passes error to callback if unable to synchronize address data', async () => {
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
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
        const strategy = new AmazonPayShippingStrategy(store, addressActionCreator, optionActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, scriptLoader);
        const address = getShippingAddress();
        const method = getFlatRateOption();
        const options = {};
        const action = Observable.of(createAction(SELECT_SHIPPING_OPTION_REQUESTED));

        jest.spyOn(optionActionCreator, 'selectShippingOption')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(address.id, method.id, options);

        expect(optionActionCreator.selectShippingOption).toHaveBeenCalledWith(address.id, method.id, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
