import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import localStorageFallback from 'local-storage-fallback';
import { Observable, of } from 'rxjs';

import { AnalyticsExtraItemsManager } from '@bigcommerce/checkout-sdk/analytics';
import {
    PaymentMethodFailedError,
    PaymentMethodInvalidError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    Checkout,
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckout, getCheckoutStoreStateWithOrder } from '../../../checkout/checkouts.mock';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
} from '../../../common/error/errors';
import { getConfig } from '../../../config/configs.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
    SubmitOrderAction,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import {
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodRequestSender,
    PaymentRequestSender,
} from '../../../payment';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import {
    StoreCreditActionCreator,
    StoreCreditActionType,
    StoreCreditRequestSender,
} from '../../../store-credit';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { getBolt } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { BoltCheckout, BoltEmbedded, BoltEmbeddedTokenize, BoltEmbededField } from './bolt';
import BoltPaymentStrategy from './bolt-payment-strategy';
import BoltScriptLoader from './bolt-script-loader';
import { getBoltClientScriptMock, getBoltEmbeddedScriptMock } from './bolt.mock';

describe('BoltPaymentStrategy', () => {
    let applyStoreCreditAction: Observable<Action>;
    let boltClient: BoltCheckout;
    let boltClientScriptInitializationOptions: PaymentInitializeOptions;
    let boltEmbedded: BoltEmbedded;
    let boltEmbeddedScriptInitializationOptions: PaymentInitializeOptions;
    let boltEmbeddedField: BoltEmbededField;
    let boltEmbeddedFieldTokenizeResponse: BoltEmbeddedTokenize;
    let boltScriptLoader: BoltScriptLoader;
    let boltTakeOverInitializationOptions: PaymentInitializeOptions;
    let checkoutMock: Checkout;
    let requestSender: RequestSender;
    let orderActionCreator: OrderActionCreator;
    let payload: OrderRequestBody;
    let paymentActionCreator: PaymentActionCreator;
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let paymentMethodRequestSender: PaymentMethodRequestSender;
    let paymentRequestSender: PaymentRequestSender;
    let paymentRequestTransformer: PaymentRequestTransformer;
    let scriptLoader: ScriptLoader;
    let store: CheckoutStore;
    let storeCreditActionCreator: StoreCreditActionCreator;
    let strategy: BoltPaymentStrategy;
    let submitOrderAction: Observable<SubmitOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreStateWithOrder());
        paymentMethodMock = getBolt();
        scriptLoader = createScriptLoader();
        requestSender = createRequestSender();
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(requestSender),
            new CheckoutValidator(new CheckoutRequestSender(requestSender)),
        );

        const config = getConfig();

        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
            ...config.storeConfig,
            checkoutSettings: {
                ...config.storeConfig.checkoutSettings,
                features: {
                    'BOLT-203.Bolt_string_type_of_token_card_data': true,
                },
            },
        });

        paymentRequestTransformer = new PaymentRequestTransformer();
        paymentRequestSender = new PaymentRequestSender(createPaymentClient());
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(
            createSpamProtection(scriptLoader),
        );
        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            paymentRequestTransformer,
            paymentHumanVerificationHandler,
        );
        storeCreditActionCreator = new StoreCreditActionCreator(
            new StoreCreditRequestSender(requestSender),
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        paymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        applyStoreCreditAction = of(createAction(StoreCreditActionType.ApplyStoreCreditRequested));
        boltClient = getBoltClientScriptMock(true);
        boltEmbedded = getBoltEmbeddedScriptMock();
        boltEmbeddedField = boltEmbedded.create('payment_field');
        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        checkoutMock = getCheckout();

        payload = {
            payment: {
                methodId: 'bolt',
                paymentData: {
                    nonce: 'transactionReference',
                },
            },
        };

        boltClientScriptInitializationOptions = {
            methodId: 'bolt',
            bolt: {
                useBigCommerceCheckout: true,
            },
        };

        boltEmbeddedScriptInitializationOptions = {
            methodId: 'bolt',
            bolt: {
                containerId: 'bolt-embedded',
                onPaymentSelect: jest.fn(),
                useBigCommerceCheckout: true,
            },
        };

        boltTakeOverInitializationOptions = {
            methodId: 'bolt',
        };

        boltEmbeddedFieldTokenizeResponse = {
            bin: '1111',
            expiration: '2022-11',
            last4: '1111',
            postal_code: undefined,
            token: 'token',
            token_type: 'bolt',
        };

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'submitOrder').mockReturnValue(submitOrderAction);
        jest.spyOn(paymentActionCreator, 'submitPayment').mockReturnValue(submitPaymentAction);
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
            store.getState(),
        );
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue(checkoutMock);
        jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);
        jest.spyOn(boltScriptLoader, 'loadBoltEmbedded').mockResolvedValue(boltEmbedded);
        jest.spyOn(storeCreditActionCreator, 'applyStoreCredit').mockReturnValue(
            applyStoreCreditAction,
        );
        jest.spyOn(boltEmbedded, 'create').mockReturnValue(boltEmbeddedField);
        jest.spyOn(boltEmbeddedField, 'tokenize').mockReturnValue(
            boltEmbeddedFieldTokenizeResponse,
        );

        strategy = new BoltPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            paymentMethodActionCreator,
            storeCreditActionCreator,
            boltScriptLoader,
            new AnalyticsExtraItemsManager(localStorageFallback),
        );
    });

    describe('#initialize', () => {
        it('successfully initializes the bolt strategy and loads the bolt client', async () => {
            await expect(
                strategy.initialize(boltClientScriptInitializationOptions),
            ).resolves.toEqual(store.getState());
            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith(
                'publishableKey',
                true,
                undefined,
            );
        });

        it('successfully initializes the bolt strategy and loads the bolt client with developer params', async () => {
            paymentMethodMock.initializationData.developerConfig = {
                developerMode: 'bolt_sandbox',
                developerDomain: '',
            };

            await expect(
                strategy.initialize(boltClientScriptInitializationOptions),
            ).resolves.toEqual(store.getState());
            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith(
                'publishableKey',
                true,
                paymentMethodMock.initializationData.developerConfig,
            );
        });

        it('fails to initialize the bolt strategy and load bolt embedded script if containerId is not provided', async () => {
            const initializationOptions = {
                methodId: 'bolt',
                bolt: {
                    containerId: undefined,
                    useBigCommerceCheckout: true,
                    onPaymentSelect: jest.fn(),
                },
            };

            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            await expect(strategy.initialize(initializationOptions)).rejects.toThrow(
                InvalidArgumentError,
            );
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).not.toHaveBeenCalled();
            expect(initializationOptions.bolt.onPaymentSelect).not.toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy, loads the bolt embedded and mounts bolt embedded field', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            await expect(
                strategy.initialize(boltEmbeddedScriptInitializationOptions),
            ).resolves.toEqual(store.getState());
            expect(boltScriptLoader.loadBoltEmbedded).toHaveBeenCalledWith(
                'publishableKey',
                true,
                undefined,
            );
            expect(boltEmbedded.create).toHaveBeenCalled();
            expect(boltEmbeddedField.mount).toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).toHaveBeenCalled();
            expect(
                boltEmbeddedScriptInitializationOptions.bolt?.onPaymentSelect,
            ).toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy, loads the bolt embedded with developer params and mounts bolt embedded field', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;
            paymentMethodMock.initializationData.developerConfig = {
                developerMode: 'bolt_sandbox',
                developerDomain: '',
            };

            await expect(
                strategy.initialize(boltEmbeddedScriptInitializationOptions),
            ).resolves.toEqual(store.getState());
            expect(boltScriptLoader.loadBoltEmbedded).toHaveBeenCalledWith(
                'publishableKey',
                true,
                paymentMethodMock.initializationData.developerConfig,
            );
            expect(boltEmbedded.create).toHaveBeenCalled();
            expect(boltEmbeddedField.mount).toHaveBeenCalled();
            expect(boltClient.hasBoltAccount).toHaveBeenCalled();
            expect(
                boltEmbeddedScriptInitializationOptions.bolt?.onPaymentSelect,
            ).toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy without loading the bolt embedded', async () => {
            await expect(strategy.initialize(boltTakeOverInitializationOptions)).resolves.toEqual(
                store.getState(),
            );
            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalled();
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
        });

        it('successfully initializes the bolt strategy without publishable key if BoltCheckout SDK was initialized before', async () => {
            await boltScriptLoader.loadBoltClient(
                'publishableKey',
                true,
                paymentMethodMock.initializationData.developerConfig,
            );

            const initializationOptions = {
                ...boltTakeOverInitializationOptions,
                bolt: {
                    useBigCommerceCheckout: false,
                },
            };

            paymentMethodMock.initializationData.publishableKey = null;

            await expect(strategy.initialize(initializationOptions)).resolves.toEqual(
                store.getState(),
            );
            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith();
        });

        it('fails to initialize the bolt strategy if publishableKey is not provided when using Bigcommerce Checkout', async () => {
            paymentMethodMock.initializationData.publishableKey = null;

            await expect(
                strategy.initialize(boltClientScriptInitializationOptions),
            ).rejects.toThrow(MissingDataError);
            expect(boltScriptLoader.loadBoltClient).not.toHaveBeenCalled();
            expect(boltScriptLoader.loadBoltEmbedded).not.toHaveBeenCalled();
        });
    });

    describe('#execute', () => {
        const expectedPayment = {
            methodId: 'bolt',
            paymentData: {
                nonce: 'transactionReference',
            },
        };

        it('successfully executes the bolt strategy and submits payment when using bolt client', async () => {
            const expectedCart = {
                orderToken: 'clientToken',
            };
            const expectedCallbacks = {
                success: expect.any(Function),
                close: expect.any(Function),
            };

            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.execute(payload);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(false);
            expect(boltClient.configure).toHaveBeenCalledWith(
                expect.objectContaining(expectedCart),
                {},
                expect.objectContaining(expectedCallbacks),
            );
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt strategy and applies store credit when using bolt client', async () => {
            const expectedCart = {
                orderToken: 'clientToken',
            };
            const expectedCallbacks = {
                success: expect.any(Function),
                close: expect.any(Function),
            };

            checkoutMock.isStoreCreditApplied = true;

            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.execute(payload);

            expect(storeCreditActionCreator.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(boltClient.configure).toHaveBeenCalledWith(
                expect.objectContaining(expectedCart),
                {},
                expect.objectContaining(expectedCallbacks),
            );
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('succesfully executes the bolt strategy with checkout takeover', async () => {
            jest.spyOn(boltClient, 'getTransactionReference').mockResolvedValue(
                'transactionReference',
            );

            await strategy.initialize(boltTakeOverInitializationOptions);
            await strategy.execute(payload);

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(boltClient.setOrderId).toHaveBeenCalled();
            expect(boltClient.getTransactionReference).toHaveBeenCalled();
            expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to submit payment if no transaction reference returned from bolt client with checkout takeover', async () => {
            jest.spyOn(boltClient, 'getTransactionReference').mockResolvedValue(undefined);

            await strategy.initialize(boltTakeOverInitializationOptions);

            try {
                await strategy.execute(payload);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodInvalidError);
            }

            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
            expect(boltClient.setOrderId).toHaveBeenCalled();
            expect(boltClient.getTransactionReference).toHaveBeenCalled();
            expect(store.dispatch).not.toHaveBeenCalledWith(submitPaymentAction);
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalledWith(expectedPayment);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no payment is provided when using bolt client', async () => {
            payload.payment = undefined;
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if no client token is provided when using bolt client', async () => {
            paymentMethodMock.clientToken = undefined;
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the bolt strategy if the client script is not loaded when using bolt client', async () => {
            jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(undefined);
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
            expect(boltClient.configure).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('does not submit payment if the payment is cancelled when using bolt client', async () => {
            boltClient = getBoltClientScriptMock(false);
            jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodCancelledError);
            expect(boltClient.configure).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('does not submit payment if the payment is cancelled because of invalid transaction reference when using bolt client', async () => {
            boltClient = getBoltClientScriptMock(true, false);
            jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);
            await strategy.initialize(boltClientScriptInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentMethodFailedError);
            expect(boltClient.configure).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment is provided with checkout takeover', async () => {
            payload.payment = undefined;

            await strategy.initialize(boltTakeOverInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no method id is provided with checkout takeover', async () => {
            payload.payment = {
                methodId: '',
            };

            await strategy.initialize(boltTakeOverInitializationOptions);

            await expect(strategy.execute(payload)).rejects.toThrow(MissingDataError);
            expect(storeCreditActionCreator.applyStoreCredit).not.toHaveBeenCalled();
            expect(boltClient.configure).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment payload sent without account creation field with bolt embedded', async () => {
            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {},
                },
            };

            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(MissingDataError);
            expect(boltEmbeddedField.tokenize).not.toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy if no payment provided with bolt embedded', async () => {
            const boltEmbeddedPayload = {
                payment: undefined,
            };

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
            expect(boltEmbeddedField.tokenize).not.toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy with bolt embedded if provider will receive an error', async () => {
            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: false,
                    },
                },
            };

            jest.spyOn(boltEmbeddedField, 'tokenize').mockImplementation(() => {
                throw new Error();
            });

            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(Error);
            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to execute the strategy with bolt embedded if provider will receive invalid data', async () => {
            const invalidData = {
                token: undefined,
                last4: 'last4',
                bin: 'bin',
                expiration: 1122,
            };

            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: false,
                    },
                },
            };

            jest.spyOn(boltEmbeddedField, 'tokenize').mockResolvedValue(invalidData);

            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;

            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            await expect(strategy.execute(boltEmbeddedPayload)).rejects.toThrow(
                PaymentArgumentInvalidError,
            );
            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).not.toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
        });

        it('succesfully executes the bolt strategy with bolt embedded (without account creation)', async () => {
            const submitPaymentOptions = {
                methodId: 'bolt',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: 'token',
                            last_four_digits: '1111',
                            iin: '1111',
                            expiration_month: 11,
                            expiration_year: 2022,
                        },
                        provider_data: {
                            create_account: false,
                            embedded_checkout: true,
                        },
                    },
                },
            };

            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: false,
                    },
                },
            };

            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;
            await strategy.initialize(boltEmbeddedScriptInitializationOptions);
            await strategy.execute(boltEmbeddedPayload);

            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(submitPaymentOptions);
        });

        it('succesfully executes the bolt strategy with bolt embedded (with account creation)', async () => {
            const submitPaymentOptions = {
                methodId: 'bolt',
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: 'token',
                            last_four_digits: '1111',
                            iin: '1111',
                            expiration_month: 11,
                            expiration_year: 2022,
                        },
                        provider_data: {
                            create_account: true,
                            embedded_checkout: true,
                        },
                    },
                },
            };

            const boltEmbeddedPayload = {
                payment: {
                    methodId: 'bolt',
                    paymentData: {
                        shouldCreateAccount: true,
                    },
                },
            };

            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;
            await strategy.initialize(boltEmbeddedScriptInitializationOptions);
            await strategy.execute(boltEmbeddedPayload);

            expect(boltEmbeddedField.tokenize).toHaveBeenCalled();
            expect(orderActionCreator.submitOrder).toHaveBeenCalled();
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(submitPaymentOptions);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes Bolt client script strategy', async () => {
            await strategy.initialize(boltClientScriptInitializationOptions);
            await strategy.deinitialize();

            expect(await strategy.deinitialize()).toEqual(store.getState());
            expect(boltEmbeddedField.unmount).not.toHaveBeenCalled();
        });

        it('deinitializes Bolt embedded one click strategy', async () => {
            paymentMethodMock.initializationData.embeddedOneClickEnabled = true;
            await strategy.initialize(boltEmbeddedScriptInitializationOptions);

            const deinitializeResult = await strategy.deinitialize();

            expect(boltEmbeddedField.unmount).toHaveBeenCalled();
            expect(deinitializeResult).toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
