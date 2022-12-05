import { createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of } from 'rxjs';

import { ConsignmentRequestSender } from '../..';
import {
    CheckoutActionCreator,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutStoreState,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { ConfigActionCreator, ConfigRequestSender } from '../../../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../../../form';
import {
    PaymentMethodActionCreator,
    PaymentMethodActionType,
    PaymentMethodRequestSender,
} from '../../../payment';
import { getAmazonPay } from '../../../payment/payment-methods.mock';
import {
    AmazonPayAddressBook,
    AmazonPayAddressBookOptions,
    AmazonPayOrderReference,
    AmazonPayScriptLoader,
    AmazonPayWindow,
} from '../../../payment/strategies/amazon-pay';
import {
    RemoteCheckoutActionCreator,
    RemoteCheckoutActionType,
    RemoteCheckoutRequestSender,
} from '../../../remote-checkout';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ConsignmentActionType } from '../../consignment-actions';
import { getFlatRateOption } from '../../internal-shipping-options.mock';
import {
    getShippingAddress,
    getShippingAddressWithCustomFields,
} from '../../shipping-addresses.mock';
import { ShippingStrategyActionType } from '../../shipping-strategy-actions';

import AmazonPayShippingStrategy from './amazon-pay-shipping-strategy';

describe('AmazonPayShippingStrategy', () => {
    let consignmentActionCreator: ConsignmentActionCreator;
    let addressBookSpy: jest.Mock;
    let container: HTMLDivElement;
    let hostWindow: AmazonPayWindow;
    let orderReference: AmazonPayOrderReference;
    let requestSender: RequestSender;
    let state: CheckoutStoreState;
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

            if (!element) {
                return;
            }

            element.addEventListener('addressSelect', () => {
                this.options.onAddressSelect(orderReference);
            });

            element.addEventListener('error', (event) => {
                this.options.onError(
                    Object.assign(new Error(), {
                        getErrorCode: () => (event as any).detail.code,
                    }),
                );
            });

            element.addEventListener('ready', () => {
                this.options.onReady(orderReference);
            });
        }
    }

    beforeEach(() => {
        requestSender = createRequestSender();
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            new CheckoutRequestSender(requestSender),
        );
        addressBookSpy = jest.fn();
        container = document.createElement('div');
        hostWindow = window;
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(requestSender),
            new CheckoutActionCreator(
                new CheckoutRequestSender(requestSender),
                new ConfigActionCreator(new ConfigRequestSender(requestSender)),
                new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
            ),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());

        orderReference = {
            getAmazonBillingAgreementId: () => '102e0feb-5c40-4609-9fe1-06a62bc78b14',
            getAmazonOrderReferenceId: () => '511ed7ed-221c-418c-8286-f5102e49220b',
        };

        container.setAttribute('id', 'addressBook');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((_, onReady) => {
            hostWindow.OffAmazonPayments = { Widgets: { AddressBook: MockAddressBook } } as any;

            onReady();

            return Promise.resolve();
        });

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, getAmazonPay())),
        );
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads widget script during initialization', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();

        await strategy.initialize({
            methodId: paymentMethod.id,
            amazon: { container: 'addressBook' },
        });

        expect(scriptLoader.loadWidget).not.toHaveBeenCalledWith(paymentMethod);
    });

    it('rejects with error if initialization fails', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = { ...getAmazonPay(), config: { merchantId: undefined } };

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            of(createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethod)),
        );

        try {
            await strategy.initialize({
                methodId: paymentMethod.id,
                amazon: { container: 'addressBook' },
            });
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('rejects with error if initialization fails because of invalid container', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();

        try {
            await strategy.initialize({
                methodId: paymentMethod.id,
                amazon: { container: 'addressBook123' },
            });
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidArgumentError);
        }
    });

    it('synchronizes checkout address when selecting new address', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();
        const initializeShippingAction = of(
            createAction(RemoteCheckoutActionType.InitializeRemoteShippingRequested),
        );
        const updateAddressAction = of(
            createAction(ConsignmentActionType.CreateConsignmentsRequested),
        );

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping').mockReturnValue(
            initializeShippingAction,
        );

        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(updateAddressAction);

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({
            methodId: paymentMethod.id,
            amazon: { container: 'addressBook' },
        });

        const element = document.getElementById('addressBook');

        if (element) {
            element.dispatchEvent(new CustomEvent('addressSelect'));
        }

        await new Promise((resolve) => process.nextTick(resolve));

        expect(remoteCheckoutActionCreator.initializeShipping).toHaveBeenCalledWith(
            paymentMethod.id,
            {
                referenceId: '511ed7ed-221c-418c-8286-f5102e49220b',
            },
        );

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(
            omit(getShippingAddress(), 'shouldSaveAddress'),
        );

        expect(store.dispatch).toHaveBeenCalledWith(initializeShippingAction);
        expect(store.dispatch).toHaveBeenCalledWith(updateAddressAction);
    });

    it('tracks strategy execution while synchronizing checkout address', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping').mockReturnValue(
            of(createAction(RemoteCheckoutActionType.InitializeRemoteShippingRequested)),
        );

        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(
            of(createAction(ConsignmentActionType.CreateConsignmentsRequested)),
        );

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({
            methodId: paymentMethod.id,
            amazon: { container: 'addressBook' },
        });

        const element = document.getElementById('addressBook');

        if (element) {
            element.dispatchEvent(new CustomEvent('addressSelect'));
        }

        await new Promise((resolve) => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(
            createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, {
                methodId: paymentMethod.id,
            }),
        );
        expect(store.dispatch).toHaveBeenCalledWith(
            createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, {
                methodId: paymentMethod.id,
            }),
        );
    });

    it('sets order reference id when order reference gets created', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();

        jest.spyOn(remoteCheckoutActionCreator, 'updateCheckout');

        await strategy.initialize({
            methodId: paymentMethod.id,
            amazon: { container: 'addressBook' },
        });

        const element = document.getElementById('addressBook');

        if (element) {
            element.dispatchEvent(new CustomEvent('ready'));
        }

        expect(remoteCheckoutActionCreator.updateCheckout).toHaveBeenCalledWith(paymentMethod.id, {
            referenceId: '511ed7ed-221c-418c-8286-f5102e49220b',
        });
    });

    it('passes error to callback when address book encounters error', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const element = document.getElementById('addressBook');

        await strategy.initialize({
            methodId: paymentMethod.id,
            amazon: { container: 'addressBook', onError },
        });

        if (element) {
            element.dispatchEvent(
                new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }),
            );
        }

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('passes error to callback if unable to synchronize address data', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const paymentMethod = getAmazonPay();
        const onError = jest.fn();
        const error = new Error();

        await strategy.initialize({
            methodId: paymentMethod.id,
            amazon: { container: 'addressBook', onError },
        });

        jest.spyOn(remoteCheckoutActionCreator, 'initializeShipping').mockReturnValue(
            Promise.reject(error),
        );

        const element = document.getElementById('addressBook');

        if (element) {
            element.dispatchEvent(new CustomEvent('addressSelect'));
        }

        await new Promise((resolve) => process.nextTick(resolve));

        expect(onError).toHaveBeenCalledWith(error);
    });

    it('selects shipping option', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const method = getFlatRateOption();
        const options = {};
        const action = of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(method.id, options);

        expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
            method.id,
            options,
        );
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('updates address with provided custom fields and existing address', async () => {
        const strategy = new AmazonPayShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader,
        );
        const options = {};
        const amazonShippingAddress = getShippingAddress();
        const address = getShippingAddressWithCustomFields();
        const action = of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(
            {
                ...amazonShippingAddress,
                customFields: address.customFields,
            },
            options,
        );
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
