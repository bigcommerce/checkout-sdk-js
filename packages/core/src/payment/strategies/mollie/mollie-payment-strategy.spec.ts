import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { of, Observable } from 'rxjs';

import { PaymentActionCreator } from '../..';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator, InternalCheckoutSelectors } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { HostedForm, HostedFormFactory } from '../../../hosted-form';
import { FinalizeOrderAction, LoadOrderSucceededAction, OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { getOrder } from '../../../order/orders.mock';
import { createSpamProtection, PaymentHumanVerificationHandler } from '../../../spam-protection';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentActionType, SubmitPaymentAction } from '../../payment-actions';
import { getMollie } from '../../payment-methods.mock';
import { PaymentInitializeOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentRequestTransformer from '../../payment-request-transformer';

import {  MollieClient, MollieElement, MollieHostWindow } from './mollie';
import MolliePaymentStrategy from './mollie-payment-strategy';
import MollieScriptLoader from './mollie-script-loader';
import { getHostedFormInitializeOptions, getInitializeOptions, getMollieClient, getOrderRequestBodyAPMs, getOrderRequestBodyVaultedCC, getOrderRequestBodyVaultAPMs, getOrderRequestBodyVaultCC, getOrderRequestBodyWithoutPayment, getOrderRequestBodyWithCreditCard } from './mollie.mock';
import { getCart } from "../../../cart/carts.mock";

describe('MolliePaymentStrategy', () => {
    let orderRequestSender: OrderRequestSender;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let mollieScriptLoader: MollieScriptLoader;
    let mockWindow: MollieHostWindow;
    let store: CheckoutStore;
    let finalizeOrderAction: Observable<FinalizeOrderAction>;
    let submitPaymentAction: Observable<SubmitPaymentAction>;
    let strategy: MolliePaymentStrategy;
    let mollieClient: MollieClient;
    let mollieElement: MollieElement;
    let formFactory: HostedFormFactory;

    beforeEach(() => {
        mollieClient = getMollieClient();
        mollieElement = {
            mount: jest.fn(),
            unmount: jest.fn(),
            addEventListener: jest.fn(),
        };
        const scriptLoader = createScriptLoader();
        const requestSender = createRequestSender();
        mockWindow = {} as MollieHostWindow;
        orderRequestSender = new OrderRequestSender(requestSender);
        orderActionCreator = new OrderActionCreator(
            orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(requestSender))
        );
        paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            orderActionCreator,
            new PaymentRequestTransformer(),
            new PaymentHumanVerificationHandler(createSpamProtection(createScriptLoader()))
        );

        mollieScriptLoader = new MollieScriptLoader(scriptLoader, mockWindow);

        store = createCheckoutStore(getCheckoutStoreState());

        finalizeOrderAction = of(createAction(OrderActionType.FinalizeOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));

        jest.useFakeTimers();

        jest.spyOn(store, 'dispatch');

        jest.spyOn(orderActionCreator, 'finalizeOrder')
            .mockReturnValue(finalizeOrderAction);

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(paymentActionCreator, 'submitPayment')
            .mockReturnValue(submitPaymentAction);

        jest.spyOn(mollieScriptLoader, 'load')
            .mockReturnValue(Promise.resolve(mollieClient));

        jest.spyOn(mollieClient, 'createComponent')
            .mockReturnValue(mollieElement);
        jest.spyOn(document, 'querySelectorAll');

        formFactory = new HostedFormFactory(store);
        strategy = new MolliePaymentStrategy(
            formFactory,
            store,
            mollieScriptLoader,
            orderActionCreator,
            paymentActionCreator
        );
    });

    describe('#Initialize & #Execute', () => {
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = getInitializeOptions();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getMollie());

            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue({ storeProfile: { storeLanguage:  'en_US' } });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        describe('Initialize', () => {
            it('does not load Mollie if initialization options are not provided', () => {
                options.mollie = undefined;
                const response = strategy.initialize(options);

                return expect(response).rejects.toThrow(InvalidArgumentError);
            });

            it('does initialize mollie and create 4 components', async () => {
                await strategy.initialize(options);

                expect(mollieScriptLoader.load).toBeCalledWith('test_T0k3n', 'en_US', true);
                jest.runAllTimers();
                expect(mollieClient.createComponent).toBeCalledTimes(4);
                expect(mollieElement.mount).toBeCalledTimes(4);
                expect(document.querySelectorAll).toHaveBeenNthCalledWith(1, '.mollie-components-controller');
            });

            it('does initialize without containerId', async () => {
                delete options.mollie?.containerId;
                await strategy.initialize(options);

                expect(mollieScriptLoader.load).toBeCalledWith('test_T0k3n', 'en_US', true);
                jest.runAllTimers();
                expect(mollieClient.createComponent).toBeCalledTimes(4);
                expect(mollieElement.mount).toBeCalledTimes(4);
            });

            it('does render a message when the cart contain digital items',  async () => {
                const disableButtonMock = jest.fn();
                const optionsMock = {
                    ...getInitializeOptions(),
                    methodId: 'klarnapaylater',
                    mollie: {
                        containerId: 'mollie-element',
                        cardCvcId: 'mollie-card-cvc-component-field',
                        cardExpiryId: 'mollie-card-expiry-component-field',
                        cardHolderId: 'mollie-card-holder-component-field',
                        cardNumberId: 'mollie-card-number-component-field',
                        styles: {valid: '#0f0'},
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    }
                }

                const cartMock = getCart();
                const container = {
                    appendChild: jest.fn(),
                }
                const paragraph = {
                    innerText: '',
                    setAttribute: jest.fn(),
                }

                const mollieMethod = {
                    ...getMollie(),
                    config: {
                        ...getMollie().config,
                        isHostedFormEnabled : false,
                    }
                }

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue( mollieMethod);
                jest.spyOn(store.getState().cart, 'getCartOrThrow')
                    .mockReturnValue(cartMock);
                jest.spyOn(document, 'createElement').mockReturnValue(paragraph);
                jest.spyOn(document, 'getElementById').mockReturnValue(container);

                await strategy.initialize(optionsMock);

                expect(store.getState().cart.getCartOrThrow).toHaveBeenCalled();
                expect(document.getElementById).toHaveBeenCalledWith(options.mollie?.containerId);
                expect(document.createElement).toHaveBeenCalledWith('p');
                expect(paragraph.setAttribute).toHaveBeenCalled();
                expect(container.appendChild).toHaveBeenCalled();
                expect(disableButtonMock).toHaveBeenCalledWith(true);
            });

            it('does not display a message when the cart contains no digital items',  async () => {
                const disableButtonMock = jest.fn();

                const optionsMock = {
                    ...getInitializeOptions(),
                    methodId: 'klarnapaylater',
                    mollie: {
                        containerId: 'mollie-element',
                        cardCvcId: 'mollie-card-cvc-component-field',
                        cardExpiryId: 'mollie-card-expiry-component-field',
                        cardHolderId: 'mollie-card-holder-component-field',
                        cardNumberId: 'mollie-card-number-component-field',
                        styles: {valid: '#0f0'},
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    }
                }

                const cartMock = {
                    ...getCart(),
                    lineItems: {
                        ...getCart().lineItems,
                        digitalItems: []
                    }
                }

                const mollieMethod = {
                    ...getMollie(),
                    config: {
                        ...getMollie().config,
                        isHostedFormEnabled : false,
                    }
                }

                const paragraph = {
                    innerText: '',
                    setAttribute: jest.fn(),
                }

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(mollieMethod);
                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(cartMock);
                jest.spyOn(document, 'createElement');
                jest.spyOn(document, 'getElementById');

                await strategy.initialize(optionsMock);

                expect(store.getState().cart.getCartOrThrow).toHaveBeenCalled();
                expect(document.getElementById).not.toHaveBeenCalledWith('mollie-element');
                expect(document.createElement).not.toHaveBeenCalledWith('p');
                expect(paragraph.setAttribute).not.toHaveBeenCalled();
                expect(disableButtonMock).not.toHaveBeenCalled();
            });

            it('throws MissingDataError when the state.cart is not available',  async () => {
                const disableButtonMock = jest.fn();

                const optionsMock = {
                    ...getInitializeOptions(),
                    methodId: 'klarnapaylater',
                    mollie: {
                        containerId: 'mollie-element',
                        cardCvcId: 'mollie-card-cvc-component-field',
                        cardExpiryId: 'mollie-card-expiry-component-field',
                        cardHolderId: 'mollie-card-holder-component-field',
                        cardNumberId: 'mollie-card-number-component-field',
                        styles: {valid: '#0f0'},
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    }
                }

                const mollieMethod = {
                    ...getMollie(),
                    config: {
                        ...getMollie().config,
                        isHostedFormEnabled: false,
                    }
                }

                const rejection = new MissingDataError(MissingDataErrorType.MissingCart);

                const paragraph = {
                    innerText: '',
                    setAttribute: jest.fn(),
                }

                jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                    .mockReturnValue(mollieMethod);
                jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(rejection);
                jest.spyOn(document, 'createElement');
                jest.spyOn(document, 'getElementById');


                const response = strategy.initialize(optionsMock)

                expect(response).rejects.toThrowError(rejection);
                expect(store.getState().cart.getCartOrThrow).toHaveBeenCalled();
                expect(document.getElementById).not.toHaveBeenCalledWith('mollie-element');
                expect(document.createElement).not.toHaveBeenCalledWith('p');
                expect(paragraph.setAttribute).not.toHaveBeenCalled();
                expect(disableButtonMock).not.toHaveBeenCalled();
            });

            it('loads klarnapaylater or klarnasliceit when widget was updated', async () => {
                const disableButtonMock = jest.fn();

                const optionsMock = {
                    ...getInitializeOptions(),
                    methodId: 'klarnapaylater',
                    mollie: {
                        containerId: 'mollie-element',
                        cardCvcId: 'mollie-card-cvc-component-field',
                        cardExpiryId: 'mollie-card-expiry-component-field',
                        cardHolderId: 'mollie-card-holder-component-field',
                        cardNumberId: 'mollie-card-number-component-field',
                        styles: {valid: '#0f0'},
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    }
                }

                const container = {
                    remove: jest.fn(),
                    appendChild: jest.fn(),
                }

                jest.spyOn(store.getState().paymentStrategies, 'isInitialized').mockReturnValue(true);
                jest.spyOn(document, 'getElementById').mockReturnValue(container);

                await strategy.initialize(optionsMock);

                expect(document.getElementById).toHaveBeenCalledWith(`${optionsMock.gatewayId}-${optionsMock.methodId}-paragraph`);
                expect(container.remove).toHaveBeenCalled();
                expect(disableButtonMock).toHaveBeenCalledWith(false);
            });
        });

        describe('#execute', () => {
            beforeEach(() => {
                jest.spyOn(mollieClient, 'createToken')
                    .mockResolvedValue({token : 'tkn_test'});
            });

            it('throws an error when payment is not present', async () => {
                try {
                    await strategy.execute(getOrderRequestBodyWithoutPayment());
                } catch (err) {
                    expect(err).toBeInstanceOf(PaymentArgumentInvalidError);
                }
            });

            it('should call submitPayment when paying with credit_card', async () => {
                await strategy.initialize(options);
                jest.runAllTimers();
                await strategy.execute(getOrderRequestBodyWithCreditCard());

                expect(mollieClient.createToken).toBeCalled();
                expect(paymentActionCreator.submitPayment).toBeCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'credit_card',
                    paymentData: {
                        formattedPayload: {
                            browser_info: {
                                color_depth: 24,
                                java_enabled: false,
                                language: 'en-US',
                                screen_height: 0,
                                screen_width: 0,
                                time_zone_offset: new Date().getTimezoneOffset().toString(),
                            },
                            credit_card_token : {
                                token: 'tkn_test',
                            },
                            shopper_locale: 'en-US',
                        },
                    },
                });
            });

            it('should call submitPayment when saving vaulted', async () => {
                await strategy.initialize(options);
                jest.runAllTimers();
                const { payment } = getOrderRequestBodyVaultCC();
                await strategy.execute({ payment });
                expect(paymentActionCreator.submitPayment).toBeCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'credit_card',
                    paymentData: {
                        formattedPayload: {
                            browser_info: {
                                color_depth: 24,
                                java_enabled: false,
                                language: 'en-US',
                                screen_height: 0,
                                screen_width: 0,
                                time_zone_offset: new Date().getTimezoneOffset().toString(),
                            },
                            credit_card_token : {
                                token: 'tkn_test',
                            },
                            set_as_default_stored_instrument: true,
                            shopper_locale: 'en-US',
                            vault_payment_instrument: true,
                        },
                    },
                });
            });

            it('should call submitPayment when paying with apms', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyAPMs());

                expect(paymentActionCreator.submitPayment).toBeCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'belfius',
                    paymentData: {
                        formattedPayload: {
                            issuer: 'foo',
                            shopper_locale: 'en-US',
                        },
                        issuer: 'foo',
                        shopper_locale: 'en-US',
                    },
                });
            });

            it('should save vault_payment_instrument on APMs', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyVaultAPMs());

                expect(paymentActionCreator.submitPayment).toBeCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'belfius',
                    paymentData: {
                        formattedPayload: {
                            issuer: '',
                            shopper_locale: 'en-US',
                        },
                        shouldSaveInstrument: true,
                        shouldSetAsDefaultInstrument: false,
                    },
                });
            });
        });
    });

    describe('When Hosted Form is enabled', () => {
        let form: Pick<HostedForm, 'attach' | 'submit' | 'validate' | 'detach'>;
        let initializeOptions: PaymentInitializeOptions;
        let loadOrderAction: Observable<LoadOrderSucceededAction>;
        let state: InternalCheckoutSelectors;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
                detach: jest.fn(),
            };
            initializeOptions = getHostedFormInitializeOptions();
            loadOrderAction = of(createAction(OrderActionType.LoadOrderSucceeded, getOrder()));
            state = store.getState();

            jest.spyOn(state.paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getMollie());

            jest.spyOn(orderActionCreator, 'loadCurrentOrder')
                .mockReturnValue(loadOrderAction);

            jest.spyOn(formFactory, 'create')
                .mockReturnValue(form);
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(formFactory.create)
                .toHaveBeenCalledWith(
                    'https://bigpay.integration.zone',
                    initializeOptions.mollie?.form
                );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach)
                .toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBodyVaultedCC();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit)
                .toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBodyVaultedCC());

            expect(form.validate)
                .toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate')
                .mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBodyVaultedCC());
            } catch (error) {
                expect(form.submit)
                    .not.toHaveBeenCalled();
            }
        });

        it('should detach hostedForm on Deinitialize', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.deinitialize();

            expect(form.detach)
                .toHaveBeenCalled();
        });
    });

    describe('#finalize()', () => {
        it('finalize mollie', () => {
            const promise = strategy.finalize();
            expect(promise).resolves.toBe(store.getState());
        });
    });

    describe('#deinitialize', () => {
        let options: PaymentInitializeOptions;
        const initializeOptions = { methodId: 'credit_card', gatewayId: 'mollie' };

        beforeEach(() => {
            options = getInitializeOptions();

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow')
                .mockReturnValue(getMollie());

            jest.spyOn(store.getState().config, 'getStoreConfig')
                .mockReturnValue({ storeProfile: { storeLanguage:  'en_US' } });
        });

        it('deinitialize mollie payment strategy', async () => {
            await strategy.initialize(options);

            jest.runAllTimers();
            expect(mollieClient.createComponent).toBeCalledTimes(4);
            expect(mollieElement.mount).toBeCalledTimes(4);
            jest.spyOn(document, 'getElementById');
            const promise = strategy.deinitialize(initializeOptions);

            expect(document.getElementById).toHaveBeenNthCalledWith(1, `${options.gatewayId}-${options.methodId}`);
            expect(document.querySelectorAll).toHaveBeenNthCalledWith(1, '.mollie-components-controller');

            return expect(promise).resolves.toBe(store.getState());
        });
    });
});
