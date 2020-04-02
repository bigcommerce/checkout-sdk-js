import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { merge, omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { BillingAddressActionCreator, BillingAddressActionType, BillingAddressRequestSender } from '../../../billing';
import { getBillingAddress, getBillingAddressState } from '../../../billing/billing-addresses.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutStoreState, CheckoutValidator } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, NotInitializedError, RequestError } from '../../../common/error/errors';
import { getErrorResponse } from '../../../common/http-request/responses.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { RemoteCheckoutActionCreator, RemoteCheckoutActionType, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { getRemoteCheckoutState, getRemoteCheckoutStateData } from '../../../remote-checkout/remote-checkout.mock';
import { getConsignmentsState } from '../../../shipping/consignments.mock';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import PaymentMethod from '../../payment-method';
import { getAmazonPay, getPaymentMethodsState } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';

import { AmazonPayAddressBookConstructor } from './amazon-pay-address-book';
import AmazonPayConfirmationFlow from './amazon-pay-confirmation-flow';
import { AmazonPayLoginButtonConstructor } from './amazon-pay-login-button';
import AmazonPayOrderReference from './amazon-pay-order-reference';
import AmazonPayPaymentStrategy from './amazon-pay-payment-strategy';
import AmazonPayScriptLoader from './amazon-pay-script-loader';
import AmazonPayWallet, { AmazonPayWalletOptions } from './amazon-pay-wallet';
import AmazonPayWindow, { OffAmazonPayments } from './amazon-pay-window';

describe('AmazonPayPaymentStrategy', () => {
    let billingAddressActionCreator: BillingAddressActionCreator;
    let container: HTMLDivElement;
    let hostWindow: AmazonPayWindow;
    let billingAddressRequestSender: BillingAddressRequestSender;
    let initializeBillingAction: Observable<Action>;
    let initializePaymentAction: Observable<Action>;
    let orderActionCreator: OrderActionCreator;
    let orderRequestSender: OrderRequestSender;
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
            options.onPaymentSelect(orderReference);
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
        orderRequestSender = new OrderRequestSender(createRequestSender());
        billingAddressRequestSender = new BillingAddressRequestSender(createRequestSender());
        state = getCheckoutStoreState();
        store = createCheckoutStore({
            ...state,
            billingAddress: {
                ...state.billingAddress,
                data: undefined,
            },
        });
        billingAddressActionCreator = new BillingAddressActionCreator(
            billingAddressRequestSender,
            new SubscriptionsActionCreator(new SubscriptionsRequestSender(createRequestSender()))
        );
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
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
        initializeBillingAction = of(createAction(RemoteCheckoutActionType.InitializeRemoteBillingRequested));
        initializePaymentAction = of(createAction(RemoteCheckoutActionType.InitializeRemotePaymentRequested));
        updateAddressAction = of(createAction(BillingAddressActionType.UpdateBillingAddressRequested));
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        container.setAttribute('id', 'wallet');
        document.body.appendChild(container);

        jest.spyOn(scriptLoader, 'loadWidget').mockImplementation((_, onReady) => {
            hostWindow.OffAmazonPayments = {
                Button: {} as AmazonPayLoginButtonConstructor,
                Widgets: {
                    AddressBook: {} as AmazonPayAddressBookConstructor,
                    Wallet: MockWallet,
                },
                initConfirmationFlow: jest.fn(() => {}),
            } as OffAmazonPayments;

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
            .mockReturnValue(of(createErrorAction(RemoteCheckoutActionType.InitializeRemoteBillingFailed, new Error())));

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
            .mockReturnValue(createErrorAction(
                OrderActionType.SubmitOrderFailed,
                getErrorResponse({ type: 'provider_widget_error', status: '', errors: [] })
            ));

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
            expect(error).toBeInstanceOf(RequestError);
            expect(error.body).toEqual(response.body);
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

    it('throws error to inform that order finalization is not required', async () => {
        try {
            await strategy.finalize();
        } catch (error) {
            expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
        }
    });

    describe('When 3ds is enabled', () => {
        const amazon3ds = getAmazonPay();
        const payload = getOrderRequestBody();
        const paymentMethodsState = {
            data: [amazon3ds],
            meta: {
                geoCountryCode: 'AU',
                deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
                sessionHash: 'cfbbbac580a920b395571fe086db1e06',
            },
            errors: {},
            statuses: {},
        };
        let options: PaymentInitializeOptions;
        let store3ds: CheckoutStore;
        let strategy3ds: AmazonPayPaymentStrategy;
        let amazonConfirmationFlow: AmazonPayConfirmationFlow;
        amazon3ds.config.is3dsEnabled = true;

        beforeEach(async () => {
            options = { methodId: paymentMethod.id };

            store3ds = createCheckoutStore({
                remoteCheckout: {data: {}}, paymentMethods: paymentMethodsState,
            });
            strategy3ds = new AmazonPayPaymentStrategy(
                store3ds,
                orderActionCreator,
                billingAddressActionCreator,
                remoteCheckoutActionCreator,
                scriptLoader
            );

            amazonConfirmationFlow = {
                success: jest.fn(),
                error: jest.fn(),
            };

            await strategy3ds.initialize({ methodId: paymentMethod.id, amazon: { container: 'wallet' } });
        });

        it('redirects to confirmation flow success when support 3ds', async () => {

            const remoteCheckout = {
                referenceId: 'referenceId',
                shipping: {},
            };

            jest.spyOn(store3ds, 'getState');

            jest.spyOn(store3ds.getState().remoteCheckout, 'getCheckout')
                .mockReturnValue(remoteCheckout);

            if (hostWindow.OffAmazonPayments) {
                hostWindow.OffAmazonPayments.initConfirmationFlow = jest.fn((_sellerId, _referenceId, callback) => {
                    callback(amazonConfirmationFlow);
                });

                strategy3ds.execute(payload, options);

                await new Promise(resolve => process.nextTick(resolve));

                expect(hostWindow.OffAmazonPayments.initConfirmationFlow).toHaveBeenCalled();
            }

        });

        it('redirects to confirmation flow success when support 3ds and extract OrderReferenceId from InitializationData', async () => {
            if (hostWindow.OffAmazonPayments) {
                hostWindow.OffAmazonPayments.initConfirmationFlow = jest.fn((_sellerId, _referenceId, callback) => {
                    callback(amazonConfirmationFlow);
                });

                strategy3ds.execute(payload, options);

                await new Promise(resolve => process.nextTick(resolve));

                expect(hostWindow.OffAmazonPayments.initConfirmationFlow).toHaveBeenCalled();
            }

        });

        it('redirects to confirmation flow  error when initializePayment fails', async () => {
            if (hostWindow.OffAmazonPayments) {
                jest.spyOn(remoteCheckoutActionCreator, 'initializePayment')
                    .mockImplementation(() => {
                        throw new Error('error');
                    });

                hostWindow.OffAmazonPayments.initConfirmationFlow = jest.fn((_sellerId, _referenceId, callback) => {
                    callback(amazonConfirmationFlow).catch((error: Error) => {
                        expect(error).toBeInstanceOf(Error);
                    });
                });

                try {
                    await strategy3ds.execute(payload, options);
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                }
            }
        });

        it('returns NotInitializedError when referenceId is undefined', async () => {
            jest.spyOn(store3ds.getState().remoteCheckout, 'getCheckout')
                .mockReturnValue({ referenceId: undefined });
            try {
                await strategy3ds.execute(payload, options);
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });

        it('returns NotInitializedError when payload.payment is undefined', async () => {
            payload.payment = undefined;
            try {
                await strategy3ds.execute(payload, options);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
            }
        });
    });
});
