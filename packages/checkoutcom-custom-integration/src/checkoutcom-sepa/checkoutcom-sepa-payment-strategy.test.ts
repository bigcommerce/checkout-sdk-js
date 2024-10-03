import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { merge, noop, omit } from 'lodash';

import {
    HostedFieldType,
    HostedForm,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentStatusTypes,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getCheckoutcom } from '../checkoutcom';

import CheckoutcomSEPAPaymentStrategy from './checkoutcom-sepa-payment-strategy';

describe('CheckoutcomSEPAPaymentStrategy', () => {
    let formPoster: FormPoster;
    let strategy: CheckoutcomSEPAPaymentStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethodMock: PaymentMethod;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paymentMethodMock = getCheckoutcom();
        formPoster = createFormPoster();

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        const state = paymentIntegrationService.getState();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(state);
        jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockImplementation(jest.fn());

        jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

        jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
            callback(),
        );
        strategy = new CheckoutcomSEPAPaymentStrategy(paymentIntegrationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('submits order without payment data', async () => {
        const payload = getOrderRequestBody();
        const options = { methodId: 'methodId' };

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
            omit(payload, 'payment'),
            options,
        );
    });

    it('submits document field when methodId is supported', async () => {
        const paymentWithDocument = {
            payment: {
                methodId: 'sepa',
                gatewayId: 'checkoutcom',
                paymentData: {
                    iban: 'iban-code',
                    bic: 'bic-code',
                },
            },
        };

        Object.defineProperty(window, 'location', {
            value: {
                replace: jest.fn(),
            },
        });

        const payload = merge(getOrderRequestBody(), paymentWithDocument);
        const options = { methodId: 'sepa' };

        const expectedPayment = merge(payload.payment, {
            paymentData: { formattedPayload: { iban: 'iban-code', bic: 'bic-code' } },
        });

        await strategy.execute(payload, options);

        expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith(expectedPayment);
    });

    it('returns checkout state', async () => {
        const paymentWithDocument = {
            payment: {
                methodId: 'sepa',
                gatewayId: 'checkoutcom',
                paymentData: {
                    iban: 'iban-code',
                    bic: 'bic-code',
                },
            },
        };
        const payload = merge(getOrderRequestBody(), paymentWithDocument);
        const options = { methodId: 'sepa' };

        const output = await strategy.execute(payload);

        await expect(strategy.execute(payload, options)).resolves.toEqual(output);
    });

    it('redirects to target url when additional action redirect is provided', async () => {
        const payload = {
            payment: {
                gatewayId: 'checkoutcom',
                methodId: 'sepa',
                paymentData: {
                    terms: false,
                    shouldCreateAccount: true,
                    shouldSaveInstrument: false,
                },
            },
        };

        Object.defineProperty(window, 'location', {
            value: {
                replace: jest.fn(),
            },
        });
        await strategy.initialize();

        const redirect_url = 'http://redirect-url.com';
        const error = new RequestError(
            getResponse({
                additional_action_required: {
                    data: {
                        redirect_url,
                    },
                    type: 'offsite_redirect',
                },
                status: 'additional_action_required',
                provider_data: JSON.stringify({
                    merchantid: '123',
                }),
            }),
        );

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
            Promise.reject(error),
        );

        void strategy.execute(payload);
        await new Promise((resolve) => process.nextTick(resolve));

        expect(window.location.replace).toHaveBeenCalledWith('http://redirect-url.com');
    });

    it('does not redirect to target url if additional action is not provided', async () => {
        const response = new RequestError(getResponse(getErrorPaymentResponseBody()));

        jest.spyOn(paymentIntegrationService, 'submitPayment').mockReturnValueOnce(
            Promise.reject(response),
        );

        await expect(strategy.execute(getOrderRequestBody())).rejects.toThrow(RequestError);
    });

    describe('when hosted form is enabled', () => {
        let form: HostedForm;
        let initializeOptions: PaymentInitializeOptions;

        beforeEach(() => {
            form = {
                attach: jest.fn(() => Promise.resolve()),
                submit: jest.fn(),
                validate: jest.fn(() => Promise.resolve()),
                detach: jest.fn(),
                getBin: jest.fn(),
                getCardType: jest.fn(),
            };

            initializeOptions = {
                creditCard: {
                    form: {
                        fields: {
                            [HostedFieldType.CardExpiry]: { containerId: 'card-expiry' },
                            [HostedFieldType.CardName]: { containerId: 'card-name' },
                            [HostedFieldType.CardNumber]: { containerId: 'card-number' },
                        },
                    },
                },
                methodId: 'checkoutcom',
            };

            paymentMethodMock.config.isHostedFormEnabled = true;

            paymentIntegrationService = new PaymentIntegrationServiceMock();

            const state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(
                merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }),
            );

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethodMock);
            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValue(state);
            jest.spyOn(paymentIntegrationService, 'finalizeOrder').mockImplementation(jest.fn());

            jest.spyOn(paymentIntegrationService, 'submitOrder').mockImplementation(jest.fn());

            jest.spyOn(formPoster, 'postForm').mockImplementation((_url, _data, callback = noop) =>
                callback(),
            );

            strategy = new CheckoutcomSEPAPaymentStrategy(paymentIntegrationService);
            jest.spyOn(paymentIntegrationService, 'loadCurrentOrder').mockImplementation(jest.fn());
            jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('creates hosted form', async () => {
            paymentMethodMock.config.isHostedFormEnabled = true;

            await strategy.initialize(initializeOptions);

            expect(paymentIntegrationService.createHostedForm).toHaveBeenCalled();
        });

        it('attaches hosted form to container', async () => {
            await strategy.initialize(initializeOptions);

            expect(form.attach).toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(form.validate).toHaveBeenCalled();
        });

        it('does not submit payment data with hosted form if validation fails', async () => {
            jest.spyOn(form, 'validate').mockRejectedValue(new Error());

            try {
                await strategy.initialize(initializeOptions);
                await strategy.execute(getOrderRequestBody());
            } catch (error) {
                expect(form.submit).not.toHaveBeenCalled();
            }
        });

        it('loads current order after payment submission', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(paymentIntegrationService.loadCurrentOrder).toHaveBeenCalled();
        });

        it('redirects to target url when additional action redirect is provided', async () => {
            const error = new RequestError(
                getResponse({
                    ...getErrorPaymentResponseBody(),
                    errors: [],
                    additional_action_required: {
                        data: {
                            redirect_url: 'http://redirect-url.com',
                        },
                        type: 'offsite_redirect',
                    },
                    three_ds_result: {},
                    status: 'error',
                }),
            );

            Object.defineProperty(window, 'location', {
                value: {
                    replace: jest.fn(),
                },
            });

            jest.spyOn(form, 'submit').mockRejectedValue(error);

            await strategy.initialize(initializeOptions);
            strategy.execute(getOrderRequestBody());

            await new Promise((resolve) => process.nextTick(resolve));

            expect(window.location.replace).toHaveBeenCalledWith('http://redirect-url.com');
        });

        it('does not finalize order if order is not created', async () => {
            jest.spyOn(paymentIntegrationService, 'getState').mockReturnValue({
                ...paymentIntegrationService.getState(),
                getOrder: () => undefined,
                getPaymentStatus: () => PaymentStatusTypes.INITIALIZE,
            });

            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
            expect(paymentIntegrationService.finalizeOrder).not.toHaveBeenCalled();
        });
    });
});
