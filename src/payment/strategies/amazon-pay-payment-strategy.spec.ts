/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />
import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { Observable } from 'rxjs';

import { BillingAddressActionCreator } from '../../billing';
import { UPDATE_BILLING_ADDRESS_REQUESTED } from '../../billing/billing-address-action-types';
import { getBillingAddress } from '../../billing/internal-billing-addresses.mock';
import { getCartResponseBody } from '../../cart/internal-carts.mock';
import { createCheckoutClient, createCheckoutStore, CheckoutClient, CheckoutStore } from '../../checkout';
import { getCheckoutMeta } from '../../checkout/checkouts.mock';
import { NotInitializedError, RequestError } from '../../common/error/errors';
import { getErrorResponse, getResponse } from '../../common/http-request/responses.mock';
import { getRemoteCustomer } from '../../customer/internal-customers.mock';
import { OrderActionCreator } from '../../order';
import { getOrderRequestBody } from '../../order/internal-orders.mock';
import { SUBMIT_ORDER_FAILED, SUBMIT_ORDER_REQUESTED } from '../../order/order-action-types';
import { getAmazonPay, getPaymentMethodsState } from '../../payment/payment-methods.mock';
import { getQuoteState } from '../../quote/internal-quotes.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { RemoteCheckoutPaymentError, RemoteCheckoutSessionError } from '../../remote-checkout/errors';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { INITIALIZE_REMOTE_BILLING_REQUESTED, INITIALIZE_REMOTE_PAYMENT_REQUESTED } from '../../remote-checkout/remote-checkout-action-types';
import { getRemoteCheckoutState } from '../../remote-checkout/remote-checkout.mock';
import PaymentMethod from '../payment-method';

import AmazonPayPaymentStrategy from './amazon-pay-payment-strategy';

describe('AmazonPayPaymentStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let client: CheckoutClient;
    let container: HTMLDivElement;
    let hostWindow: OffAmazonPayments.HostWindow;
    let initializeBillingAction: Observable<Action>;
    let initializePaymentAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let orderReference: OffAmazonPayments.Widgets.OrderReference;
    let paymentMethod: PaymentMethod;
    let remoteCheckoutActionCreator: RemoteCheckoutActionCreator;
    let scriptLoader: AmazonPayScriptLoader;
    let submitOrderAction: Observable<Action>;
    let store: CheckoutStore;
    let strategy: AmazonPayPaymentStrategy;
    let updateAddressAction: Observable<Action>;
    let walletSpy: jest.Mock;

    class Wallet implements OffAmazonPayments.Widgets.Wallet {
        constructor(public options: OffAmazonPayments.Widgets.WalletOptions) {
            walletSpy(options);

            options.onReady(orderReference);
        }

        bind(id: string) {
            const element = document.getElementById(id);

            element.addEventListener('paymentSelect', () => {
                this.options.onPaymentSelect(orderReference);
            });

            element.addEventListener('orderReferenceCreate', () => {
                this.options.onOrderReferenceCreate(orderReference);
            });

            element.addEventListener('error', (event: CustomEvent) => {
                this.options.onError(Object.assign(new Error(), {
                    getErrorCode: () => event.detail.code,
                }));
            });
        }
    }

    beforeEach(() => {
        container = document.createElement('div');
        client = createCheckoutClient();
        store = createCheckoutStore({
            customer: {
                data: getRemoteCustomer(),
            },
            paymentMethods: getPaymentMethodsState(),
            remoteCheckout: getRemoteCheckoutState(),
        });
        billingAddressActionCreator = new BillingAddressActionCreator(client);
        orderActionCreator = new OrderActionCreator(client);
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
            getAmazonOrderReferenceId: () => getCheckoutMeta().remoteCheckout.amazon.referenceId,
        };

        paymentMethod = getAmazonPay();
        initializeBillingAction = Observable.of(createAction(INITIALIZE_REMOTE_BILLING_REQUESTED));
        initializePaymentAction = Observable.of(createAction(INITIALIZE_REMOTE_PAYMENT_REQUESTED));
        updateAddressAction = Observable.of(createAction(UPDATE_BILLING_ADDRESS_REQUESTED));
        submitOrderAction = Observable.of(createAction(SUBMIT_ORDER_REQUESTED));

        container.setAttribute('id', 'wallet');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((method, onReady) => {
            hostWindow.OffAmazonPayments = { Widgets: { Wallet } };

            onReady();

            return Promise.resolve();
        });

        jest.spyOn(client, 'loadCart')
            .mockReturnValue(Promise.resolve(getResponse(getCartResponseBody())));

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
        const { referenceId } = getCheckoutMeta().remoteCheckout.amazon;
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
            createCheckoutStore({ remoteCheckout: {}, paymentMethods: getPaymentMethodsState() }),
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
            onOrderReferenceCreate: expect.any(Function),
            onPaymentSelect: expect.any(Function),
            onReady: expect.any(Function),
        });
    });

    it('sets order reference id when order reference gets created', async () => {
        strategy = new AmazonPayPaymentStrategy(
            createCheckoutStore({ remoteCheckout: {}, paymentMethods: getPaymentMethodsState() }),
            orderActionCreator,
            billingAddressActionCreator,
            remoteCheckoutActionCreator,
            scriptLoader
        );

        jest.spyOn(remoteCheckoutActionCreator, 'setCheckoutMeta');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });

        document.getElementById('wallet').dispatchEvent(new CustomEvent('orderReferenceCreate'));

        expect(remoteCheckoutActionCreator.setCheckoutMeta)
            .toHaveBeenCalledWith(paymentMethod.id, {
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            });
    });

    it('rejects with error if initialization fails', async () => {
        jest.spyOn(store.getState().checkout, 'getPaymentMethod')
            .mockReturnValue({ ...paymentMethod, config: {} });

        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('rejects with error if initialization fails because of invalid container', async () => {
        try {
            await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'missingWallet' } });
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });

    it('passes error to callback when wallet widget encounters error', async () => {
        const onError = jest.fn();
        const element = document.getElementById('wallet');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet', onError } });

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'BuyerSessionExpired' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutSessionError));

        element.dispatchEvent(new CustomEvent('error', { detail: { code: 'PeriodicAmountExceeded' } }));
        expect(onError).toHaveBeenCalledWith(expect.any(RemoteCheckoutPaymentError));
    });

    it('reinitializes payment method before submitting order', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: paymentMethod.id };
        const { referenceId } = getCheckoutMeta().remoteCheckout.amazon;

        jest.spyOn(store, 'dispatch');

        await strategy.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });
        await strategy.execute(payload, options);

        expect(remoteCheckoutActionCreator.initializePayment)
            .toHaveBeenCalledWith(payload.payment.name, { referenceId, useStoreCredit: false });

        expect(orderActionCreator.submitOrder)
            .toHaveBeenCalledWith({
                ...payload,
                payment: omit(payload.payment, 'paymentData'),
            }, true, options);

        expect(store.dispatch).toHaveBeenCalledWith(initializePaymentAction);
        expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
    });

    it('refreshes wallet when there is provider widget error', async () => {
        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(createErrorAction(SUBMIT_ORDER_FAILED, getErrorResponse({ type: 'provider_widget_error' })));

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
            .mockReturnValue(createErrorAction(SUBMIT_ORDER_FAILED, response));

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

        document.getElementById('wallet').dispatchEvent(new CustomEvent('paymentSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(remoteCheckoutActionCreator.initializeBilling)
            .toHaveBeenCalledWith(paymentMethod.id, expect.objectContaining({
                referenceId: getCheckoutMeta().remoteCheckout.amazon.referenceId,
            }));

        expect(billingAddressActionCreator.updateAddress)
            .toHaveBeenCalledWith(getBillingAddress());

        expect(store.dispatch).toHaveBeenCalledWith(initializeBillingAction);
        expect(store.dispatch).toHaveBeenCalledWith(updateAddressAction);
    });

    it('does not synchronize billing addresses if they are the same', async () => {
        store = createCheckoutStore({
            customer: {
                data: getRemoteCustomer(),
            },
            quote: getQuoteState(),
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

        document.getElementById('wallet').dispatchEvent(new CustomEvent('paymentSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(initializeBillingAction);
        expect(store.dispatch).not.toHaveBeenCalledWith(updateAddressAction);
    });

    it('does not synchronize billing addresses if remote address is unavailable', async () => {
        store = createCheckoutStore({
            customer: {
                data: getRemoteCustomer(),
            },
            quote: getQuoteState(),
            paymentMethods: getPaymentMethodsState(),
            remoteCheckout: {
                ...getRemoteCheckoutState(),
                data: {
                    billingAddress: undefined,
                },
            },
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

        document.getElementById('wallet').dispatchEvent(new CustomEvent('paymentSelect'));

        await new Promise(resolve => process.nextTick(resolve));

        expect(store.dispatch).toHaveBeenCalledWith(initializeBillingAction);
        expect(store.dispatch).not.toHaveBeenCalledWith(updateAddressAction);
    });
});
