import { merge } from 'lodash';

import {
    Checkout,
    HostedFieldType,
    HostedForm,
    OrderFinalizationNotRequiredError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethod,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCheckout,
    getErrorPaymentResponseBody,
    getOrderRequestBody,
    getPaymentMethod,
    getResponse,
    getShippingAddress,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getCheckoutcom } from './checkoutcom';
import CheckoutComCustomPaymentStrategy from './checkoutcom-custom-payment-strategy';

describe('CheckoutComCustomPaymentStrategy', () => {
    let strategy: CheckoutComCustomPaymentStrategy;
    let checkoutMock: Checkout;
    let paymentMethodMock: PaymentMethod;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        strategy = new CheckoutComCustomPaymentStrategy(paymentIntegrationService);
        paymentMethodMock = getCheckoutcom();
        checkoutMock = getCheckout();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
            getBillingAddress(),
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getShippingAddress').mockReturnValue(
            getShippingAddress(),
        );

        jest.spyOn(paymentIntegrationService, 'initializePayment').mockResolvedValue(
            paymentIntegrationService.getState(),
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getCheckoutOrThrow').mockReturnValue(
            checkoutMock,
        );
    });

    it('is special type of credit card strategy', () => {
        expect(strategy).toBeInstanceOf(CheckoutComCustomPaymentStrategy);
    });

    describe('#execute', () => {
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

            const state = paymentIntegrationService.getState();

            jest.spyOn(state, 'getCheckoutOrThrow').mockReturnValue(checkoutMock);
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(merge(getPaymentMethod(), { config: { isHostedFormEnabled: true } }));
            jest.spyOn(paymentIntegrationService, 'createHostedForm').mockReturnValue(form);
        });

        it('validates user input before submitting data', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(form.validate).toHaveBeenCalled();
        });

        it('submits the order', async () => {
            await strategy.initialize(initializeOptions);
            await strategy.execute(getOrderRequestBody());

            expect(paymentIntegrationService.submitOrder).toHaveBeenCalled();
        });

        it('submits payment data with hosted form', async () => {
            const payload = getOrderRequestBody();

            await strategy.initialize(initializeOptions);
            await strategy.execute(payload);

            expect(form.submit).toHaveBeenCalledWith(payload.payment);
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
    });

    describe('#finalize', () => {
        it('should throw an error to inform that order finalization is not required', async () => {
            const finalize = strategy.finalize();

            await expect(finalize).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });
});
