import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import { getCartState } from '../../../cart/carts.mock';
import {
    CheckoutRequestSender,
    CheckoutStore,
    CheckoutValidator,
    createCheckoutStore,
} from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { getFormFieldsState } from '../../../form/form.mock';
import {
    OrderActionCreator,
    OrderActionType,
    OrderRequestBody,
    OrderRequestSender,
} from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import {
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestSender,
} from '../../../payment';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentActionType } from '../../payment-actions';
import { getMasterpass, getPaymentMethodsState } from '../../payment-methods.mock';
import PaymentRequestTransformer from '../../payment-request-transformer';

import { Masterpass } from './masterpass';
import { getCallbackUrlMock, getMasterpassScriptMock } from './masterpass.mock';

import { MasterpassCheckoutOptions, MasterpassPaymentStrategy, MasterpassScriptLoader } from './';

describe('MasterpassPaymentStrategy', () => {
    let strategy: MasterpassPaymentStrategy;
    let orderRequestSender: OrderRequestSender;
    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let scriptLoader: MasterpassScriptLoader;
    let initOptions: PaymentInitializeOptions;
    let paymentMethodMock: PaymentMethod;
    let masterpassScript: Masterpass;

    beforeEach(() => {
        initOptions = {
            methodId: 'masterpass',
            masterpass: {
                walletButton: 'masterpassWalletButton',
            },
        };

        orderRequestSender = new OrderRequestSender(createRequestSender());

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            config: getConfigState(),
            customer: getCustomerState(),
            cart: getCartState(),
            formFields: getFormFieldsState(),
            paymentMethods: getPaymentMethodsState(),
        });

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));

        paymentMethodMock = getMasterpass();

        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );

        const checkoutValidator = new CheckoutValidator(
            new CheckoutRequestSender(createRequestSender()),
        );

        orderActionCreator = new OrderActionCreator(orderRequestSender, checkoutValidator);

        const paymentRequestSender = new PaymentRequestSender(createPaymentClient());

        paymentActionCreator = new PaymentActionCreator(
            paymentRequestSender,
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader())),
        );

        scriptLoader = new MasterpassScriptLoader(createScriptLoader());
        masterpassScript = getMasterpassScriptMock();
        jest.spyOn(scriptLoader, 'load').mockReturnValue(Promise.resolve(masterpassScript));
        jest.spyOn(masterpassScript, 'checkout').mockReturnValue(true);

        // Strategy
        strategy = new MasterpassPaymentStrategy(
            store,
            orderActionCreator,
            paymentActionCreator,
            scriptLoader,
            'en-US',
        );
    });

    describe('#initialize()', () => {
        it('throws an exception if payment method cannot be found', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                undefined,
            );

            const error =
                'Unable to proceed because payment method data is unavailable or not properly configured.';

            expect(() => strategy.initialize(initOptions)).toThrow(error);
        });

        it('throws an exception if masterpass options is not passed', () => {
            initOptions.masterpass = undefined;
            paymentMethodMock.initializationData = {
                checkoutId: 'checkout-id',
            };

            const error =
                'Unable to initialize payment because "options.masterpass" argument is not provided.';

            return expect(strategy.initialize(initOptions)).rejects.toThrow(error);
        });

        it('loads masterpass script with correct locale', async () => {
            // Strategy
            strategy = new MasterpassPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                scriptLoader,
                'FR',
            );

            paymentMethodMock.initializationData = {
                checkoutId: 'checkout-id',
                isMasterpassSrcEnabled: false,
            };
            await strategy.initialize(initOptions);

            expect(scriptLoader.load).toHaveBeenLastCalledWith({
                useMasterpassSrc: false,
                language: 'fr_fr',
                testMode: false,
                checkoutId: 'checkout-id',
            });
        });

        it('loads masterpass script with default locale for unsupported country code', async () => {
            // Strategy
            strategy = new MasterpassPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                scriptLoader,
                'es_fr',
            );

            paymentMethodMock.initializationData = {
                checkoutId: 'checkout-id',
                isMasterpassSrcEnabled: false,
            };
            await strategy.initialize(initOptions);

            expect(scriptLoader.load).toHaveBeenLastCalledWith({
                useMasterpassSrc: false,
                language: 'es_es',
                testMode: false,
                checkoutId: 'checkout-id',
            });
        });

        it('loads masterpass script with default locale for unsupported language', async () => {
            // Strategy
            strategy = new MasterpassPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                scriptLoader,
                'tr',
            );

            paymentMethodMock.initializationData = {
                checkoutId: 'checkout-id',
                isMasterpassSrcEnabled: false,
            };
            await strategy.initialize(initOptions);

            expect(scriptLoader.load).toHaveBeenLastCalledWith({
                useMasterpassSrc: false,
                language: 'en_us',
                testMode: false,
                checkoutId: 'checkout-id',
            });
        });

        it('loads masterpass script with correct locale for supported language and country', async () => {
            // Strategy
            strategy = new MasterpassPaymentStrategy(
                store,
                orderActionCreator,
                paymentActionCreator,
                scriptLoader,
                'zh_hk',
            );

            paymentMethodMock.initializationData = {
                checkoutId: 'checkout-id',
                isMasterpassSrcEnabled: false,
            };
            await strategy.initialize(initOptions);

            expect(scriptLoader.load).toHaveBeenLastCalledWith({
                useMasterpassSrc: false,
                language: 'zh_hk',
                testMode: false,
                checkoutId: 'checkout-id',
            });
        });

        it('loads masterpass script with correct locale when locale contains "-" character', async () => {
            paymentMethodMock.initializationData = {
                checkoutId: 'checkout-id',
                isMasterpassSrcEnabled: false,
            };
            await strategy.initialize(initOptions);

            expect(scriptLoader.load).toHaveBeenLastCalledWith({
                useMasterpassSrc: false,
                language: 'en_us',
                testMode: false,
                checkoutId: 'checkout-id',
            });
        });

        describe('on click button handler', () => {
            let payload: MasterpassCheckoutOptions;
            let walletButton: HTMLElement;

            beforeEach(() => {
                paymentMethodMock.initializationData = {
                    allowedCardTypes: ['visa', 'amex', 'master'],
                    checkoutId: 'checkout-id',
                    isMasterpassSrcEnabled: false,
                };

                payload = {
                    allowedCardTypes: ['visa', 'amex', 'master'],
                    amount: '190.00',
                    cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    checkoutId: 'checkout-id',
                    currency: 'USD',
                    callbackUrl: getCallbackUrlMock(),
                };

                walletButton = document.createElement('a');
                jest.spyOn(document, 'getElementById').mockReturnValue(walletButton);
            });

            it('loads the script and calls the checkout when the wallet button is clicked', async () => {
                await strategy.initialize(initOptions);

                expect(scriptLoader.load).toHaveBeenLastCalledWith({
                    useMasterpassSrc: false,
                    language: 'en_us',
                    testMode: false,
                    checkoutId: 'checkout-id',
                });

                walletButton.click();

                expect(masterpassScript.checkout).toHaveBeenCalledWith(payload);
            });

            it('loads the script in test mode, and calls the checkout when the wallet button is clicked', async () => {
                paymentMethodMock.config.testMode = true;
                await strategy.initialize(initOptions);

                expect(scriptLoader.load).toHaveBeenLastCalledWith({
                    useMasterpassSrc: false,
                    language: 'en_us',
                    testMode: true,
                    checkoutId: 'checkout-id',
                });

                walletButton.click();

                expect(masterpassScript.checkout).toHaveBeenCalled();
            });

            it('does not call the checkout method when wallet button is not set on the init options', async () => {
                paymentMethodMock.config.testMode = true;
                initOptions.masterpass = {};
                await strategy.initialize(initOptions);

                expect(scriptLoader.load).toHaveBeenLastCalledWith({
                    useMasterpassSrc: false,
                    language: 'en_us',
                    testMode: true,
                    checkoutId: 'checkout-id',
                });

                walletButton.click();

                expect(masterpassScript.checkout).not.toHaveBeenCalled();
            });
        });

        describe('with payment data', () => {
            beforeEach(() => {
                paymentMethodMock.initializationData = {
                    cardData: {
                        expMonth: '10',
                        expYear: '20',
                        accountMask: '4444',
                        cardType: 'MasterCard',
                    },
                    gateway: 'stripe',
                    paymentData: { nonce: 'src_foobar1234567' },
                };
            });

            it('does not load the masterpass script', async () => {
                await strategy.initialize(initOptions);

                expect(scriptLoader.load).not.toHaveBeenLastCalledWith(true);
                expect(masterpassScript.checkout).not.toHaveBeenCalled();
            });
        });
    });

    describe('#execute', () => {
        let payload: OrderRequestBody;
        let submitOrderAction: Observable<Action>;
        let submitPaymentAction: Observable<Action>;

        beforeEach(() => {
            paymentMethodMock.initializationData = {
                cardData: {
                    expMonth: '10',
                    expYear: '20',
                    accountMask: '4444',
                    cardType: 'MasterCard',
                },
                gateway: 'stripe',
                paymentData: { nonce: 'src_foobar1234567' },
            };

            payload = {
                payment: {
                    methodId: 'masterpass',
                },
                useStoreCredit: true,
            };

            submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);

            submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
            paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
        });

        it('fails to submit order when payment is not provided', () => {
            delete payload.payment;

            const error =
                'Unable to submit payment because "payload.payment" argument is not provided.';

            expect(() => strategy.execute(payload)).toThrow(error);
        });

        it('throws an exception if payment data is missing', () => {
            paymentMethodMock.initializationData.paymentData = undefined;

            const error =
                'Unable to proceed because payment method data is unavailable or not properly configured.';

            expect(() => strategy.execute(payload)).toThrow(error);
        });

        it('throws an exception when the gateway is not provided', async () => {
            paymentMethodMock.initializationData.gateway = undefined;

            const error =
                'Unable to proceed because payment method data is unavailable or not properly configured.';

            await strategy.initialize(initOptions);

            expect(() => strategy.execute(payload)).toThrow(error);
        });

        it('throws an exception when the paymentData is not provided', async () => {
            paymentMethodMock.initializationData.paymentData = undefined;

            const error =
                'Unable to proceed because "paymentMethod.initializationData.paymentData" argument is not provided.';

            await strategy.initialize(initOptions);

            expect(() => strategy.execute(payload)).toThrow(error);
        });

        it('creates the order and execute the payment', async () => {
            await strategy.initialize(initOptions);
            await strategy.execute(payload);

            const submitPaymentArgs = {
                methodId: 'masterpass',
                paymentData: { nonce: 'src_foobar1234567' },
            };
            const order = { useStoreCredit: payload.useStoreCredit };

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(order, undefined);
            expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(submitPaymentArgs);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });
    });

    describe('#deinitialize()', () => {
        let walletButton: HTMLElement;

        beforeEach(() => {
            walletButton = document.createElement('a');
            jest.spyOn(walletButton, 'removeEventListener');
            jest.spyOn(document, 'getElementById').mockReturnValue(walletButton);

            paymentMethodMock.initializationData = {
                allowedCardTypes: ['visa', 'amex', 'mastercard'],
                checkoutId: 'checkout-id',
            };

            const submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

            orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
        });

        it('remove event listeners on wallet button', async () => {
            await strategy.initialize(initOptions);
            await strategy.deinitialize();

            expect(walletButton.removeEventListener).toHaveBeenCalled();
        });

        it('does not remove event listeners on wallet button if the id of the button was not passed on initialize options', async () => {
            initOptions.masterpass = {};
            await strategy.initialize(initOptions);
            await strategy.deinitialize();

            expect(walletButton.removeEventListener).not.toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await strategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
