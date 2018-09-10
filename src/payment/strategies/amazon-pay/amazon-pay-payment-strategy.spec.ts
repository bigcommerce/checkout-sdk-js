import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { Observable } from 'rxjs';

import { BillingAddressActionCreator } from '../../../billing';
import { BillingAddressActionType } from '../../../billing/billing-address-actions';
import { getBillingAddress, getBillingAddressState } from '../../../billing/billing-addresses.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, RequestError } from '../../../common/error/errors';
import { getErrorResponse } from '../../../common/http-request/responses.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType } from '../../../order';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import {
    INITIALIZE_REMOTE_BILLING_FAILED,
    INITIALIZE_REMOTE_BILLING_REQUESTED,
    INITIALIZE_REMOTE_PAYMENT_REQUESTED,
} from '../../../remote-checkout/remote-checkout-action-types';
import { getRemoteCheckoutState, getRemoteCheckoutStateData } from '../../../remote-checkout/remote-checkout.mock';
import { getConsignmentsState } from '../../../shipping/consignments.mock';
import PaymentMethod from '../../payment-method';
import { getAmazonPay, getPaymentMethodsState } from '../../payment-methods.mock';

import AmazonPayOrderReference from './amazon-pay-order-reference';
import AmazonPayPaymentStrategy from './amazon-pay-payment-strategy';
import AmazonPayScriptLoader from './amazon-pay-script-loader';
import AmazonPayWallet, { AmazonPayWalletOptions } from './amazon-pay-wallet';
import AmazonPayWindow from './amazon-pay-window';

describe('AmazonPayPaymentStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let client: CheckoutClient;
    let container: HTMLDivElement;
    let hostWindow: AmazonPayWindow;
    let initializeBillingAction: Observable<Action>;
    let initializePaymentAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let orderReference: AmazonPayOrderReference;
    let paymentMethod: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: AmazonPayScriptLoader;
    let submitOrderAction: Observable<Action>;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let strategy: AmazonPayPaymentStrategy;
    let updateAddressAction: Observable<Action>;
    let walletSpy: jest.Mock;

    class MockWallet implements AmazonPayWallet {
        constructor(public options: AmazonPayWalletOptions) {
            walletSpy(options);

            options.onReady(orderReference);
        }

        bind(id: string) {
            const element = document.getElementById(id);

            if (!element) {
                return;
            }

            element.addEventListener('paymentSelect', () => {
                this.options.onPaymentSelect(orderReference);
            });

            element.addEventListener('ready', () => {
                if (this.options.onReady) {
                    this.options.onReady(orderReference);
                }
            });

            element.addEventListener('error', event => {
                this.options.onError(Object.assign(new Error(), {
                    getErrorCode: () => (event as any).detail.code,
                }));
            });
        }
    }

    beforeEach(() => {
        container = document.createElement('div');
        client = createCheckoutClient(createRequestSender());
        state = getCheckoutStoreState();
        store = createCheckoutStore({
            ...state,
            billingAddress: {
                ...state.billingAddress,
                data: undefined,
            },
        });
        billingAddressActionCreator = new BillingAddressActionCreator(client);
        orderActionCreator = new OrderActionCreator(
            client,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );
        remoteCheckoutActionCreator = new RemoteCheckoutActionCreator(
            new RemoteCheckoutRequestSender(createRequestSender())
        );
        scriptLoader = new AmazonPayScriptLoader(createScriptLoader());
        strategy = new AmazonPayPaymentStrategy(
            store,
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );
        walletSpy = jest.fn();
        hostWindow = window;

        orderReference = {
            getAmazonBillingAgreementId: () => '102e0feb-5c40-4609-9fe1-06a62bc78b14',
            getAmazonOrderReferenceId: () => '511ed7ed-221c-418c-8286-f5102e49220b',
        };

        paymentMethod = getAmazonPay();
        initializeBillingAction = Observable.of(createAction(INITIALIZE_REMOTE_BILLING_REQUESTED));
        initializePaymentAction = Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        updateAddressAction = Observable.of(createAction(BillingAddressActionType.UpdateBillingAddressRequested));
        submitOrderAction = Observable.of(createAction(OrderActionType.SubmitOrderRequested));

        container.setAttribute('id', 'wallet');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((method, onReady) => {
            hostWindow.OffAmazonPayments = { Widgets: { Wallet: MockWallet } } as any;

            onReady();

            return Promise.resolve();
        });

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
            .mockReturnValue(initializePaymentAction);

        jest.spyOn(remoteCheckoutActionCreator, 'initializeBilling')
            .mockReturnValue(initializeBillingAction);

        jest.spyOn(billingAddressActionCreator, 'updateAddress')
            .mockReturnValue(updateAddressAction);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('loads widget script', async () => {
        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        expect(scriptLoader.loadWidget).toHaveBeenCalledWith(paymentMethod, expect.any(Function));
    });

    it('creates wallet widget with required properties', async () => {
        const { referenceId = '' } = getRemoteCheckoutStateData().amazon || {};
        const { merchantId } = paymentMethod.config;

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        expect(walletSpy).toHaveBeenCalledWith({
            amazonOrderReferenceId: referenceId,
            design: { designMode: 'responsive' },
            scope: 'payments:billing_address payments:shipping_address payments:widget profile',
            sellerId: merchantId,
            onError: expect.any(Function),
            onPaymentSelect: expect.any(Function),
            onReady: expect.any(Function),
        });
    });

    it('creates wallet widget with new order reference id if none is provided', async () => {
        const { merchantId } = paymentMethod.config;

        strategy = new AmazonPayPaymentStrategy(
            createCheckoutStore({ remoteCheckout: { data: {} }, paymentMethods: getPaymentMethodsState() }),
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        expect(walletSpy).toHaveBeenCalledWith({
            design: { designMode: 'responsive' },
            scope: 'payments:billing_address payments:shipping_address payments:widget profile',
            sellerId: merchantId,
            onError: expect.any(Function),
            onReady: expect.any(Function),
            onPaymentSelect: expect.any(Function),
        });
    });

    it('sets order reference id when order reference gets created', async () => {
        strategy = new AmazonPayPaymentStrategy(
            createCheckoutStore({ remoteCheckout: { data: {} }, paymentMethods: getPaymentMethodsState() }),
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        jest.spyOn(remoteCheckoutActionCreator, 'updateCheckout');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        const element = document.getElementById('wallet');

        if (element) {
            element.dispatchEvent(new CustomEvent('ready'));
        }

        expect(remoteCheckoutActionCreator.updateCheckout)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: '511ed7ed-221c-418c-8286-f5102e49220b',
            });
    });

    it('rejects with error if initialization fails', async () => {
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue({ ...paymentMethod, config: {} });

        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });
        } catch (error) {
            expect(error).toBeInstanceOf(MissingDataError);
        }
    });

    it('rejects with error if initialization fails because of invalid container', async () => {
        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'missingWallet' } });
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidArgumentError);
        }
    });

    it('passes error to callback when wallet widget encounters error', async () => {
        const onError = jest.fn();
        const element = document.getElementById('wallet');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet', onError } });

        if (element) {
            element.dispatchEvent(new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }));
        }

        expect(onError).toHaveBeenCalledWith(expect.any(Error));

        onError.mockReset();

        if (element) {
            element.dispatchEvent(new CustomEvent('error', { detail: { code: 'PeriodicAmountExceeded' } }));
        }

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('passes error to callback if unable to synchronize address data', async () => {
        const onError = jest.fn();
        const element = document.getElementById('wallet');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet', onError } });

        jest.spyOn(remoteCheckoutActionCreator, 'initializeBilling')
            .mockReturnValue(Observable.of(createErrorAction(INITIALIZE_REMOTE_BILLING_FAILED, new Error())));

        if (element) {
            element.dispatchEvent(new CustomEvent('paymentSelect'));
        }

        await new Promise(resolve => process.nextTick(resolve));

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('reinitializes payment method before submitting order', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: paymentMethod.id };
        const { referenceId = '' } = getRemoteCheckoutStateData().amazon || {};

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });
        await strategy.execute(payload, options);

        expect(remoteCheckoutActionCreator.initializePayment)
            .toHaveBeenCalledWith(payload.payment && payload.payment.methodId, { referenceId, useStoreCredit: false });

        expect(orderActionCreator.submitOrder)
            .toHaveBeenCalledWith({
                ...payload,
                payment: omit(payload.payment, 'paymentData'),
            }, options);

        expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('refreshes wallet when there is provider widget error', async () => {
        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(createErrorAction(OrderActionType.SubmitOrderFailed, getErrorResponse({ type: 'provider_widget_error' })));

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        walletSpy.mockReset();

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(walletSpy).toHaveBeenCalled();
        }
    });

    it('returns error response if order submission fails', async () => {
        const response = getErrorResponse();

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(createErrorAction(OrderActionType.SubmitOrderFailed, response));

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        try {
            await strategy.execute(getOrderRequestBody());
        } catch (error) {
            expect(error).toEqual(new RequestError(response));
        }
    });

    it('synchronizes billing address when selecting new payment method', async () => {
        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        const element = document.getElementById('wallet');

        if (element) {
            element.dispatchEvent(new CustomEvent('paymentSelect'));
        }

        await new Promise(resolve => process.nextTick(resolve));

        expect(remoteCheckoutActionCreator.initializeBilling)
            .toHaveBeenCalledWith(paymentMethod.id, expect.objectContaining({
                referenceId: '511ed7ed-221c-418c-8286-f5102e49220b',
            }));

        const { email, ...address } = getBillingAddress();

        expect(billingAddressActionCreator.updateAddress).toHaveBeenCalledWith(address);
        expect(store.dispatch).toHaveBeenCalledWith(initializeBillingAction);
        expect(store.dispatch).toHaveBeenCalledWith(updateAddressAction);
    });

    it('does not synchronize billing addresses if they are the same', async () => {
        store = createCheckoutStore({
            customer: getCustomerState(),
            billingAddress: getBillingAddressState(),
            consignments: getConsignmentsState(),
            paymentMethods: getPaymentMethodsState(),
            remoteCheckout: getRemoteCheckoutState(),
        });

        strategy = new AmazonPayPaymentStrategy(
            store,
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        const element = document.getElementById('wallet');

        if (element) {
            element.dispatchEvent(new CustomEvent('paymentSelect'));
        }

        await new Promise(resolve => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(initializeBillingAction);
        expect(store.dispatch).not.toHaveBeenCalledWith(updateAddressAction);
    });

    it('does not synchronize billing addresses if remote address is unavailable', async () => {
        store = createCheckoutStore({
            customer: getCustomerState(),
            billingAddress: getBillingAddressState(),
            consignments: getConsignmentsState(),
            paymentMethods: getPaymentMethodsState(),
            remoteCheckout: merge({}, getRemoteCheckoutState(), {
                data: { amazon: { billing: { address: undefined } } },
            }),
        });

        strategy = new AmazonPayPaymentStrategy(
            store,
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        const element = document.getElementById('wallet');

        if (element) {
            element.dispatchEvent(new CustomEvent('paymentSelect'));
        }

        await new Promise(resolve => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(initializeBillingAction);
        expect(store.dispatch).not.toHaveBeenCalledWith(updateAddressAction);
    });
});
