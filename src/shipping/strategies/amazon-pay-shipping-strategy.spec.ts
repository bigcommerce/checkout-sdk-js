/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments-widgets.d.ts" />
import 'rxjs/add/observable/of';

import { createAction } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable } from 'rxjs/Observable';

import { CheckoutStore, createCheckoutClient, createCheckoutStore } from '../../checkout';
import { getCheckoutMeta } from '../../checkout/checkouts.mock';
import { NotInitializedError } from '../../common/error/errors';
import { getRemoteCustomer } from '../../customer/internal-customers.mock';
import { PaymentMethodActionCreator } from '../../payment';
import { LOAD_PAYMENT_METHOD_SUCCEEDED } from '../../payment/payment-method-action-types';
import { getAmazonPay } from '../../payment/payment-methods.mock';
import { createRemoteCheckoutService, RemoteCheckoutService } from '../../remote-checkout';
import { RemoteCheckoutAccountInvalidError, RemoteCheckoutSessionError, RemoteCheckoutShippingError } from '../../remote-checkout/errors';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { getRemoteCheckoutState } from '../../remote-checkout/remote-checkout.mock';
import createUpdateShippingService from '../../shipping/create-update-shipping-service';
import { getShippingAddress } from '../internal-shipping-addresses.mock';
import { getFlatRateOption } from '../internal-shipping-options.mock';
import UpdateShippingService from '../update-shipping-service';
import AmazonPayShippingStrategy from './amazon-pay-shipping-strategy';

describe('AmazonPayShippingStrategy', () => {
    let addressBookSpy: jest.Mock;
    let container: HTMLDivElement;
    let hostWindow: OffAmazonPayments.HostWindow;
    let updateShippingService: UpdateShippingService;
    let orderReference: OffAmazonPayments.Widgets.OrderReference;
    let store: CheckoutStore;
    let scriptLoader: AmazonPayScriptLoader;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let remoteCheckoutService: RemoteCheckoutService;

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
        addressBookSpy = jest.fn();
        container = document.createElement('div');
        hostWindow = window;
        store = createCheckoutStore({
            customer: {
                data: getRemoteCustomer(),
            },
            remoteCheckout: getRemoteCheckoutState(),
        });
        remoteCheckoutService = createRemoteCheckoutService(store, createCheckoutClient());
        updateShippingService = createUpdateShippingService(store, createCheckoutClient());
        paymentMethodActionCreator = new PaymentMethodActionCreator(createCheckoutClient());
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
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });

        expect(scriptLoader.loadWidget).not.toHaveBeenCalledWith(paymentMethod);
    });

    it('only initializes widget once until deinitialization', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });
        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });

        expect(addressBookSpy).toHaveBeenCalledTimes(1);

        await strategy.deinitialize();
        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });

        expect(addressBookSpy).toHaveBeenCalledTimes(2);
    });

    it('rejects with error if initialization fails', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = { ...getAmazonPay(), config: {} };

        try {
            await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('rejects with error if initialization fails because of invalid container', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        try {
            await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('synchronizes checkout address when selecting new address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });

        jest.spyOn(remoteCheckoutService, 'synchronizeShippingAddress')
            .mockReturnValue(Promise.resolve(store.getState()));

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('addressSelect'));

        expect(remoteCheckoutService.synchronizeShippingAddress)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });
    });

    it('sets order reference id when order reference gets created', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutService, 'setCheckoutMeta');

        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('orderReferenceCreate'));

        expect(remoteCheckoutService.setCheckoutMeta)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });
    });

    it('passes error to callback when address book encounters error', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const element = document.getElementById('addressBook');

        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id, onError });

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutSessionError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'InvalidAccountStatus' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutAccountInvalidError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'InvalidOrderReferenceId' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutShippingError));
    });

    it('passes error to callback if unable to synchronize address data', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const error = new Error();

        await strategy.initialize({ container: 'addressBook', methodId: paymentMethod.id, onError });

        jest.spyOn(remoteCheckoutService, 'synchronizeShippingAddress')
            .mockReturnValue(Promise.reject(error));

        document.getElementById('addressBook')
            .dispatchEvent(new CustomEvent('addressSelect'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(onError).toHaveBeenCalledWith(error);
    });

    it('does nothing if trying to directly update address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);

        jest.spyOn(updateShippingService, 'updateAddress');

        const output = await strategy.updateAddress(getShippingAddress());

        expect(updateShippingService.updateAddress).not.toHaveBeenCalled();
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, paymentMethodActionCreator, remoteCheckoutService, scriptLoader);
        const address = getShippingAddress();
        const method = getFlatRateOption();
        const options = {};

        jest.spyOn(updateShippingService, 'selectOption')
            .mockReturnValue(Promise.resolve(store.getState()));

        const output = await strategy.selectOption(address.id, method.id, options);

        expect(output).toEqual(store.getState());
        expect(updateShippingService.selectOption).toHaveBeenCalledWith(address.id, method.id, options);
    });
});
