import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { CheckoutSelectors } from '../../checkout';
import { createScriptLoader } from '../../../script-loader';
import { DataStore } from '../../../data-store';
import { RemoteCheckoutAccountInvalidError, RemoteCheckoutSessionError, RemoteCheckoutShippingError } from '../../remote-checkout/errors';
import { RemoteCheckoutService } from '../../remote-checkout';
import { getAmazonPay } from '../../payment/payment-methods.mock';
import { getCheckoutMeta } from '../../checkout/checkout.mock';
import { getFlatRateOption } from '../shipping-options.mock';
import { getShippingAddress } from '../shipping-address.mock';
import AmazonPayShippingStrategy from './amazon-pay-shipping-strategy';
import UpdateShippingService from '../update-shipping-service';
import createCheckoutClient from '../../create-checkout-client';
import createCheckoutStore from '../../create-checkout-store';
import createUpdateShippingService from '../../create-update-shipping-service';
import createRemoteCheckoutService from '../../create-remote-checkout-service';

describe('AmazonPayShippingStrategy', () => {
    let addressBookSpy: jest.Mock;
    let container: HTMLDivElement;
    let updateShippingService: UpdateShippingService;
    let store: DataStore<CheckoutSelectors>;
    let scriptLoader: AmazonPayScriptLoader;
    let remoteCheckoutService: RemoteCheckoutService;

    class AddressBook implements OffAmazonPayments.Widgets.AddressBook {
        constructor(public options: OffAmazonPayments.Widgets.AddressBookOptions) {
            addressBookSpy(options);
        }

        bind(id: string) {
            const element = document.getElementById(id);

            element.addEventListener('addressSelect', () => {
                this.options.onAddressSelect({
                    getAmazonBillingAgreementId: () => '102e0feb-5c40-4609-9fe1-06a62bc78b14',
                });
            });

            element.addEventListener('error', (event: CustomEvent) => {
                this.options.onError(Object.assign(new Error(), {
                    getErrorCode: () => event.detail.code,
                }));
            });

            element.addEventListener('orderReferenceCreate', () => {
                this.options.onOrderReferenceCreate({
                    getAmazonOrderReferenceId: () => getCheckoutMeta().remoteCheckout.amazon.referenceId,
                });
            });
        }
    }

    beforeEach(() => {
        addressBookSpy = jest.fn();
        container = document.createElement('div');
        store = createCheckoutStore();
        remoteCheckoutService = createRemoteCheckoutService(store, createCheckoutClient());
        updateShippingService = createUpdateShippingService(store, createCheckoutClient());
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());

        container.setAttribute('id', 'addressBook');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation(() => {
            (window as any).OffAmazonPayments = { Widgets: { AddressBook } };
            (window as any).onAmazonPaymentsReady();

            return Promise.resolve();
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads widget script', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({
            container: 'addressBook',
            paymentMethod,
        });

        expect(scriptLoader.loadWidget).toHaveBeenCalledWith(paymentMethod);
    });

    it('only initializes widget once until deinitialization', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        await strategy.initialize({ container: 'addressBook', paymentMethod });
        await strategy.initialize({ container: 'addressBook', paymentMethod });

        expect(addressBookSpy).toHaveBeenCalledTimes(1);

        await strategy.deinitialize();
        await strategy.initialize({ container: 'addressBook', paymentMethod });

        expect(addressBookSpy).toHaveBeenCalledTimes(2);
    });

    it('synchronizes checkout address when selecting new address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutService, 'synchronizeShippingAddress')
            .mockReturnValue(Promise.resolve(store.getState()));

        jest.spyOn(store.getState().checkout, 'getCheckoutMeta')
            .mockReturnValue(getCheckoutMeta());

        await strategy.initialize({
            container: 'addressBook',
            paymentMethod,
        });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('addressSelect'));

        expect(remoteCheckoutService.synchronizeShippingAddress)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });
    });

    it('sets order reference id when order reference gets created', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutService, 'setCheckoutMeta');

        await strategy.initialize({
            container: 'addressBook',
            paymentMethod,
        });

        document.getElementById('addressBook').dispatchEvent(new CustomEvent('orderReferenceCreate'));

        expect(remoteCheckoutService.setCheckoutMeta)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });
    });

    it('passes error to callback when address book encounters error', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const element = document.getElementById('addressBook');

        await strategy.initialize({
            container: 'addressBook',
            onError,
            paymentMethod,
        });

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutSessionError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'InvalidAccountStatus' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutAccountInvalidError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'InvalidOrderReferenceId' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutShippingError));
    });

    it('does nothing if trying to directly update address', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);

        jest.spyOn(updateShippingService, 'updateAddress');

        const output = await strategy.updateAddress(getShippingAddress());

        expect(updateShippingService.updateAddress).not.toHaveBeenCalled();
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const strategy = new AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, scriptLoader);
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
