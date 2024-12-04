import { merge } from 'lodash';

import {
    Checkout,
    HostedFieldType,
    HostedForm,
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getCheckout,
    getOrderRequestBody,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { WithMonerisPaymentInitializeOptions } from './moneris-payment-initialize-options';
import { getMoneris } from './moneris-payment-method.mock';
import MonerisPaymentStrategy from './moneris-payment-strategy';
import { getHostedFormInitializeOptions, getOrderRequestBodyVaultedCC } from './moneris.mock';

describe('MonerisPaymentStrategy', () => {
    const containerId = 'moneris_iframe_container';
    const iframeId = 'moneris-payment-iframe';
    let checkoutMock: Checkout;
    let container: HTMLDivElement;
    let initializeOptions: PaymentInitializeOptions;
    let options: PaymentInitializeOptions;
    let payload: OrderRequestBody;
    let paymentMethodMock: PaymentMethod;
    let strategy: MonerisPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentMethodMock = getMoneris();

        initializeOptions = {
            methodId: 'moneris',
            moneris: {
                containerId,
            },
        };

        checkoutMock = getCheckout();

        options = { methodId: 'moneris' };
        payload = merge(getOrderRequestBody(), {
            payment: {
                methodId: 'moneris',
                paymentData: null,
            },
        });

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        container = document.createElement('div');
        container.setAttribute('id', containerId);
        document.body.appendChild(container);

        jest.spyOn(document, 'getElementById');
        jest.spyOn(document, 'createElement');

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(paymentIntegrationService, 'applyStoreCredit').mockImplementation(jest.fn());

        jest.spyOn(window, 'removeEventListener');

        strategy = new MonerisPaymentStrategy(paymentIntegrationService);
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('#initialize', () => {
        it('successfully initializes moneris strategy and creates the iframe', async () => {
            await strategy.initialize(initializeOptions);

            expect(document.getElementById).toHaveBeenCalledWith(containerId);
            expect(document.createElement).toHaveBeenCalledWith('iframe');
        });

        it('only creates the iframe once when tryng to initialize more than once', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.initialize(initializeOptions);

            expect(document.getElementById).toHaveBeenCalledWith(containerId);
            expect(container.childElementCount).toBe(1);
        });

        it('initializes moneris iframe and sets src to the live environment', async () => {
            paymentMethodMock.config.testMode = false;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain('www3.moneris.com');
        });

        it('initializes moneris iframe and sets src to the test environment', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain('esqa.moneris.com');
        });

        it('initialize moneris iframe and sets data labels from initialization data', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain(
                'pan_label=Credit%20Card&exp_label=Expiration%20Date&cvd_label=CVV',
            );
        });

        it('initialize moneris iframe and sets data labels if initialization data is null', async () => {
            paymentMethodMock.config.testMode = true;
            paymentMethodMock.initializationData = { profileId: 'ABC123' };

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain(
                'pan_label=Credit%20Card%20Number&exp_label=Expiration&cvd_label=CVD',
            );
        });

        it('initialize moneris iframe and sets expiry field', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain('enable_exp=1');
        });

        it('initialize moneris iframe and sets cvv field', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain('enable_cvd=1');
        });

        it('initialize moneris iframe and sets labels enabled', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain('display_labels=1');
        });

        it('initialize moneris iframe and sets hosted fields css', async () => {
            paymentMethodMock.config.testMode = true;

            await strategy.initialize(initializeOptions);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeTruthy();
            expect(iframe.src).toContain('css_body=');
            expect(iframe.src).toContain('css_textbox=');
            expect(iframe.src).toContain('css_textbox_pan=');
            expect(iframe.src).toContain('css_textbox_exp=');
            expect(iframe.src).toContain('css_textbox_cvd=');
            expect(iframe.src).toContain('css_input_label=');
        });

        it('fails to initialize moneris strategy when initialization options are not provided', async () => {
            initializeOptions.moneris = undefined;

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(
                InvalidArgumentError,
            );

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeFalsy();
        });

        it('fails to initialize moneris strategy when initialization data is missing', async () => {
            paymentMethodMock.initializationData = undefined;

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);

            const iframe = document.getElementById(iframeId) as HTMLIFrameElement;

            expect(iframe).toBeFalsy();
        });
    });

    describe('#execute', () => {
        it('throws error when moneris response is not successful', async () => {
            await strategy.initialize(initializeOptions);

            const promise = strategy.execute(payload, options);

            await new Promise((resolve) => process.nextTick(resolve));

            const mockMonerisIframeMessage = {
                responseCode: ['400'],
                errorMessage: 'expected error message',
                dataKey: 'ABC123',
                bin: '1234',
            };

            window.postMessage(JSON.stringify(mockMonerisIframeMessage), '*');
            await expect(promise).rejects.toThrow(new Error('expected error message'));
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('successfully executes moneris strategy and submits payment', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    nonce: 'ABC123',
                    shouldSaveInstrument: undefined,
                    shouldSetAsDefaultInstrument: undefined,
                },
            };

            checkoutMock.isStoreCreditApplied = true;
            await strategy.initialize(initializeOptions);

            const promise = strategy.execute(payload, options);

            await new Promise((resolve) => process.nextTick(resolve));

            const mockMonerisIframeMessage = {
                responseCode: ['001'],
                errorMessage: null,
                dataKey: 'ABC123',
                bin: '1234',
            };

            window.postMessage(JSON.stringify(mockMonerisIframeMessage), '*');
            await promise;
            expect(paymentIntegrationService.applyStoreCredit).toHaveBeenCalledWith(true);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('submits payment with vaulted card', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    instrumentId: '1234',
                    shouldSaveInstrument: true,
                    shouldSetAsDefaultInstrument: true,
                },
            };

            await strategy.initialize(initializeOptions);

            const pendingExecution = strategy.execute(getOrderRequestBodyVaultedCC(), options);
            const mockMonerisIframeMessage = {
                responseCode: ['001'],
                errorMessage: null,
                dataKey: 'ABC123',
                bin: '1234',
            };

            window.postMessage(JSON.stringify(mockMonerisIframeMessage), '*');
            await pendingExecution;
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('Moneris returns an object instead of a stringify JSON', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    instrumentId: '1234',
                    shouldSaveInstrument: true,
                    shouldSetAsDefaultInstrument: true,
                },
            };

            await strategy.initialize(initializeOptions);

            const pendingExecution = strategy.execute(getOrderRequestBodyVaultedCC(), options);
            const mockMonerisIframeMessage = {
                responseCode: ['001'],
                errorMessage: null,
                dataKey: 'ABC123',
                bin: '1234',
            };

            window.postMessage(mockMonerisIframeMessage, '*');
            await pendingExecution;
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('submits payment and sends shouldSaveInstrument and shouldSetAsDefaultInstrument if provided', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    nonce: 'ABC123',
                    shouldSaveInstrument: true,
                    shouldSetAsDefaultInstrument: true,
                },
            };
            const vaultingPayload = merge(payload, {
                payment: {
                    paymentData: { shouldSaveInstrument: true, shouldSetAsDefaultInstrument: true },
                },
            });

            await strategy.initialize(initializeOptions);

            const pendingExecution = strategy.execute(vaultingPayload, options);
            const mockMonerisIframeMessage = {
                responseCode: ['001'],
                errorMessage: null,
                dataKey: 'ABC123',
                bin: '1234',
            };

            window.postMessage(JSON.stringify(mockMonerisIframeMessage), '*');
            await pendingExecution;
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('submits payment with intrument if provided', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    instrumentId: 'instrument_123',
                },
            };
            const vaultingPayload = merge(payload, {
                payment: { paymentData: { instrumentId: 'instrument_123' } },
            });

            await strategy.initialize(initializeOptions);
            await strategy.execute(vaultingPayload, options);
            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
        });

        it('fails to executes moneris strategy when payment is not provided', async () => {
            payload.payment = undefined;
            await strategy.initialize(initializeOptions);
            await expect(strategy.execute(payload)).rejects.toThrow(PaymentArgumentInvalidError);
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });

        it('fails to executes moneris strategy when the strategy is not previously initialized', async () => {
            await expect(strategy.execute(payload)).rejects.toThrow(NotInitializedError);
            expect(paymentIntegrationService.submitPayment).not.toHaveBeenCalled();
        });
    });

    describe('When Hosted Form is enabled', () => {
        let form: HostedForm;
        let hostedFormInitializeOptions: PaymentInitializeOptions &
            WithMonerisPaymentInitializeOptions;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(),
                validate: jest.fn(() => Promise.resolve()),
                detach: jest.fn(),
                getBin: jest.fn(),
                getCardType: jest.fn(),
            };
            hostedFormInitializeOptions = getHostedFormInitializeOptions();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(merge(getMoneris(), { config: { isHostedFormEnabled: true } }));
            jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockImplementation(jest.fn());
            jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
        });

        it('creates hosted form', async () => {
            await strategy.initialize(hostedFormInitializeOptions);

            expect(paymentIntegrationService.createHostedForm).toHaveBeenCalledWith(
                'https://bigpay.integration.zone',
                hostedFormInitializeOptions.moneris?.form,
            );
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(hostedFormInitializeOptions);

            expect(form.attach).toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            payload = getOrderRequestBodyVaultedCC();

            await strategy.initialize(hostedFormInitializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            payload = getOrderRequestBodyVaultedCC();

            await strategy.initialize(hostedFormInitializeOptions);
            await strategy.execute(payload);

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            await strategy.initialize(hostedFormInitializeOptions);

            await expect(strategy.execute(getOrderRequestBodyVaultedCC())).rejects.toThrow();
            expect(form.submit).not.toHaveBeenCalled();
        });

        it('submits payment without hosted form if no fields are required', async () => {
            const expectedPayment = {
                methodId: 'moneris',
                paymentData: {
                    instrumentId: '1234',
                    shouldSaveInstrument: true,
                    shouldSetAsDefaultInstrument: true,
                },
            };

            const noFieldPayload = {
                methodId: 'moneris',
                moneris: {
                    containerId: 'moneris_iframe_container',
                    form: {
                        fields: {
                            [HostedFieldType.CardCodeVerification]: undefined,
                            [HostedFieldType.CardNumberVerification]: undefined,
                        },
                    },
                },
            };

            payload = getOrderRequestBodyVaultedCC();

            await strategy.initialize(noFieldPayload);
            await strategy.execute(payload);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
            expect(form.submit).not.toHaveBeenCalled();
        });

        it('should detach hostedForm on Deinitialize', async () => {
            await strategy.initialize(hostedFormInitializeOptions);
            await strategy.deinitialize();

            expect(form.detach).toHaveBeenCalled();
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy and removes event listener if set', async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
            await strategy.initialize(initializeOptions);

            const promise = strategy.execute(payload, options);

            await new Promise((resolve) => process.nextTick(resolve));

            const mockMonerisIframeMessage = {
                responseCode: ['400'],
                errorMessage: 'expected error message',
                dataKey: 'ABC123',
                bin: '1234',
            };

            window.postMessage(JSON.stringify(mockMonerisIframeMessage), '*');
            await expect(promise).rejects.toThrow(new Error('expected error message'));
            await strategy.deinitialize();
            expect(window.removeEventListener).toHaveBeenCalledWith(
                'message',
                expect.any(Function),
            );
        });
        it('deinitializes strategy and removes the iframe if it exists', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.deinitialize();
            expect(container.childElementCount).toBe(0);
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
