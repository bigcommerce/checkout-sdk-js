import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    HostedForm,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCart,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { MollieClient, MollieElement, MollieHostWindow } from './mollie';
import MolliePaymentStrategy from './mollie-payment-strategy';
import MollieScriptLoader from './mollie-script-loader';
import {
    getHostedFormInitializeOptions,
    getInitializeOptions,
    getMollie,
    getMollieClient,
    getOrderRequestBodyAPMs,
    getOrderRequestBodyVaultAPMs,
    getOrderRequestBodyVaultCC,
    getOrderRequestBodyVaultedCC,
    getOrderRequestBodyWithCreditCard,
    getOrderRequestBodyWithoutPayment,
} from './mollie.mock';

describe('MolliePaymentStrategy', () => {
    let mockWindow: MollieHostWindow;
    let mollieClient: MollieClient;
    let mollieElement: MollieElement;
    let mollieScriptLoader: MollieScriptLoader;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: MolliePaymentStrategy;

    beforeEach(() => {
        mollieClient = getMollieClient();

        mollieElement = {
            mount: jest.fn(),
            unmount: jest.fn(),
            addEventListener: jest.fn(),
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        const scriptLoader = createScriptLoader();

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        mockWindow = {} as MollieHostWindow;

        mollieScriptLoader = new MollieScriptLoader(scriptLoader, mockWindow);

        jest.useFakeTimers();

        jest.spyOn(mollieScriptLoader, 'load').mockReturnValue(Promise.resolve(mollieClient));

        jest.spyOn(mollieClient, 'createComponent').mockReturnValue(mollieElement);
        jest.spyOn(document, 'querySelectorAll');

        strategy = new MolliePaymentStrategy(mollieScriptLoader, paymentIntegrationService);
    });

    describe('#Initialize & #Execute', () => {
        let options: PaymentInitializeOptions;

        beforeEach(() => {
            options = getInitializeOptions();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getMollie());

            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
                storeProfile: { storeLanguage: 'en_US' },
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        describe('Initialize', () => {
            it('does not load Mollie if initialization options are not provided', async () => {
                options.mollie = undefined;

                const response = strategy.initialize(options);

                await expect(response).rejects.toThrow(InvalidArgumentError);
            });

            it('does not load Mollie if gatewayId is not provided', async () => {
                options.gatewayId = undefined;

                const response = strategy.initialize(options);

                await expect(response).rejects.toThrow(InvalidArgumentError);
            });

            it('does not load Mollie if store config is not provided', async () => {
                jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
                    undefined,
                );

                const response = strategy.initialize(options);

                await expect(response).rejects.toThrow(MissingDataError);
            });

            it('does initialize mollie and create 4 components', async () => {
                await strategy.initialize(options);

                expect(mollieScriptLoader.load).toHaveBeenCalledWith('test_T0k3n', 'en_US', true);

                jest.runAllTimers();

                expect(mollieClient.createComponent).toHaveBeenCalledTimes(4);
                expect(mollieElement.mount).toHaveBeenCalledTimes(4);
                expect(document.querySelectorAll).toHaveBeenNthCalledWith(
                    1,
                    '.mollie-components-controller',
                );
            });

            it('does initialize without containerId', async () => {
                delete options.mollie?.containerId;
                await strategy.initialize(options);

                expect(mollieScriptLoader.load).toHaveBeenCalledWith('test_T0k3n', 'en_US', true);

                jest.runAllTimers();

                expect(mollieClient.createComponent).toHaveBeenCalledTimes(4);
                expect(mollieElement.mount).toHaveBeenCalledTimes(4);
            });

            it('does render a message when the cart contain digital items', async () => {
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
                        styles: { valid: '#0f0' },
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    },
                };

                const cartMock = getCart();
                const container = {
                    appendChild: jest.fn(),
                };
                const paragraph = {
                    innerText: '',
                    setAttribute: jest.fn(),
                };

                const mollieMethod = {
                    ...getMollie(),
                    config: {
                        ...getMollie().config,
                        isHostedFormEnabled: false,
                    },
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(mollieMethod);
                jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                    cartMock,
                );
                jest.spyOn(document, 'createElement').mockReturnValue(paragraph);
                jest.spyOn(document, 'getElementById').mockReturnValue(container);

                await strategy.initialize(optionsMock);

                expect(paymentIntegrationService.getState().getCartOrThrow).toHaveBeenCalled();
                expect(document.getElementById).toHaveBeenCalledWith(options.mollie?.containerId);
                expect(document.createElement).toHaveBeenCalledWith('p');
                expect(paragraph.setAttribute).toHaveBeenCalled();
                expect(container.appendChild).toHaveBeenCalled();
                expect(disableButtonMock).toHaveBeenCalledWith(true);
            });

            it('does not display a message when the cart contains no digital items', async () => {
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
                        styles: { valid: '#0f0' },
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    },
                };

                const cartMock = {
                    ...getCart(),
                    lineItems: {
                        ...getCart().lineItems,
                        digitalItems: [],
                    },
                };

                const mollieMethod = {
                    ...getMollie(),
                    config: {
                        ...getMollie().config,
                        isHostedFormEnabled: false,
                    },
                };

                const paragraph = {
                    innerText: '',
                    setAttribute: jest.fn(),
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(mollieMethod);
                jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                    cartMock,
                );
                jest.spyOn(document, 'createElement');
                jest.spyOn(document, 'getElementById');

                await strategy.initialize(optionsMock);

                expect(paymentIntegrationService.getState().getCartOrThrow).toHaveBeenCalled();
                expect(document.getElementById).not.toHaveBeenCalledWith('mollie-element');
                expect(document.createElement).not.toHaveBeenCalledWith('p');
                expect(paragraph.setAttribute).not.toHaveBeenCalled();
                expect(disableButtonMock).not.toHaveBeenCalled();
            });

            it('throws MissingDataError when the state.cart is not available', async () => {
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
                        styles: { valid: '#0f0' },
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    },
                };

                const mollieMethod = {
                    ...getMollie(),
                    config: {
                        ...getMollie().config,
                        isHostedFormEnabled: false,
                    },
                };

                const rejection = new MissingDataError(MissingDataErrorType.MissingCart);

                const paragraph = {
                    innerText: '',
                    setAttribute: jest.fn(),
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'getPaymentMethodOrThrow',
                ).mockReturnValue(mollieMethod);
                jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                    rejection,
                );
                jest.spyOn(document, 'createElement');
                jest.spyOn(document, 'getElementById');

                await strategy.initialize(optionsMock);

                expect(paymentIntegrationService.getState().getCartOrThrow).toHaveBeenCalled();
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
                        styles: { valid: '#0f0' },
                        unsupportedMethodMessage: 'This payment method is not supported',
                        disableButton: disableButtonMock,
                    },
                };

                const container = {
                    remove: jest.fn(),
                    appendChild: jest.fn(),
                };

                jest.spyOn(
                    paymentIntegrationService.getState(),
                    'isPaymentMethodInitialized',
                ).mockReturnValue(true);

                jest.spyOn(document, 'getElementById').mockReturnValue(container);

                await strategy.initialize(optionsMock);

                expect(document.getElementById).toHaveBeenCalledWith(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `${optionsMock.gatewayId}-${optionsMock.methodId}-paragraph`,
                );
                expect(container.remove).toHaveBeenCalled();
                expect(disableButtonMock).toHaveBeenCalledWith(false);
            });
        });

        describe('#execute', () => {
            beforeEach(() => {
                jest.spyOn(mollieClient, 'createToken').mockResolvedValue({ token: 'tkn_test' });

                jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue(
                    'en-US',
                );
            });

            it('throws an error when payment is not present', async () => {
                try {
                    await strategy.execute(getOrderRequestBodyWithoutPayment());
                } catch (err) {
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect(err).toBeInstanceOf(PaymentArgumentInvalidError);
                }
            });

            it('should call submitPayment when paying with credit_card', async () => {
                await strategy.initialize(options);
                jest.runAllTimers();
                await strategy.execute(getOrderRequestBodyWithCreditCard());

                expect(mollieClient.createToken).toHaveBeenCalled();
                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'credit_card',
                    paymentData: {
                        formattedPayload: {
                            /* eslint-disable */
                            browser_info: {
                                color_depth: 24,
                                java_enabled: false,
                                language: 'en-US',
                                screen_height: 0,
                                screen_width: 0,
                                time_zone_offset: new Date().getTimezoneOffset().toString(),
                            },
                            credit_card_token: {
                                token: 'tkn_test',
                            },
                            shopper_locale: 'en-US',
                            /* eslint-enable */
                        },
                    },
                });
            });

            it('should call submitPayment when saving vaulted', async () => {
                await strategy.initialize(options);
                jest.runAllTimers();

                const { payment } = getOrderRequestBodyVaultCC();

                await strategy.execute({ payment });

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'credit_card',
                    paymentData: {
                        formattedPayload: {
                            /* eslint-disable */
                            browser_info: {
                                color_depth: 24,
                                java_enabled: false,
                                language: 'en-US',
                                screen_height: 0,
                                screen_width: 0,
                                time_zone_offset: new Date().getTimezoneOffset().toString(),
                            },
                            credit_card_token: {
                                token: 'tkn_test',
                            },
                            set_as_default_stored_instrument: true,
                            shopper_locale: 'en-US',
                            vault_payment_instrument: true,
                            /* eslint-enable */
                        },
                    },
                });
            });

            it('should call submitPayment when paying with apms', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyAPMs());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'belfius',
                    paymentData: {
                        /* eslint-disable */
                        formattedPayload: {
                            issuer: 'foo',
                            shopper_locale: 'en-US',
                        },
                        issuer: 'foo',
                        shopper_locale: 'en-US',
                        /* eslint-enable */
                    },
                });
            });

            it('should save vault_payment_instrument on APMs', async () => {
                await strategy.initialize(options);
                await strategy.execute(getOrderRequestBodyVaultAPMs());

                expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                    gatewayId: 'mollie',
                    methodId: 'belfius',
                    paymentData: {
                        formattedPayload: {
                            /* eslint-disable */
                            issuer: '',
                            shopper_locale: 'en-US',
                            /* eslint-enable */
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

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(() => Promise.resolve()),
                validate: jest.fn(() => Promise.resolve()),
                detach: jest.fn(),
            };
            initializeOptions = getHostedFormInitializeOptions();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getMollie());

            jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
                paymentSettings: {
                    bigpayBaseUrl: 'https://bigpay.integration.zone',
                },
                storeProfile: {
                    storeLanguage: 'en_US',
                },
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('creates hosted form', async () => {
            await strategy.initialize(initializeOptions);

            expect(paymentIntegrationService.createHostedForm).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                initializeOptions.mollie?.form,
            );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach).toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBodyVaultedCC();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBodyVaultedCC());

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBodyVaultedCC());
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(form.submit).not.toHaveBeenCalled();
            }
        });

        it('should detach hostedForm on Deinitialize', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.deinitialize();

            expect(form.detach).toHaveBeenCalled();
        });

        it('should unmount the elements of the card when adding a new one', async () => {
            const options = getInitializeOptions();

            await strategy.initialize(initializeOptions);
            await strategy.deinitialize();

            expect(form.detach).toHaveBeenCalled();

            await strategy.initialize(options);

            jest.runAllTimers();

            expect(mollieClient.createComponent).toHaveBeenCalledTimes(4);
            expect(mollieElement.mount).toHaveBeenCalledTimes(4);

            jest.spyOn(document, 'getElementById');

            await strategy.deinitialize(initializeOptions);

            expect(mollieElement.unmount).toHaveBeenCalledTimes(4);
        });
    });

    describe('#finalize()', () => {
        it('finalize mollie', async () => {
            const promise = strategy.finalize();

            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('#deinitialize', () => {
        let options: PaymentInitializeOptions;
        const initializeOptions = { methodId: 'credit_card', gatewayId: 'mollie' };

        beforeEach(() => {
            options = getInitializeOptions();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(getMollie());

            jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
                storeProfile: { storeLanguage: 'en_US' },
            });
        });

        it('deinitialize mollie payment strategy', async () => {
            await strategy.initialize(options);

            jest.runAllTimers();

            expect(mollieClient.createComponent).toHaveBeenCalledTimes(4);
            expect(mollieElement.mount).toHaveBeenCalledTimes(4);

            jest.spyOn(document, 'getElementById');

            const promise = strategy.deinitialize(initializeOptions);

            expect(document.querySelectorAll).toHaveBeenNthCalledWith(
                1,
                '.mollie-components-controller',
            );

            await expect(promise).resolves.toBeUndefined();
        });
    });
});
