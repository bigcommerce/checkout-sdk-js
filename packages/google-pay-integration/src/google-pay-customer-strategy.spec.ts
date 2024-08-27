import { createFormPoster } from '@bigcommerce/form-poster';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    CustomerInitializeOptions,
    InvalidArgumentError,
    NotImplementedError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConsignment,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayGateway from './gateways/google-pay-gateway';
import { WithGooglePayCustomerInitializeOptions } from './google-pay-customer-initialize-options';
import GooglePayCustomerStrategy from './google-pay-customer-strategy';
import GooglePayPaymentProcessor from './google-pay-payment-processor';
import GooglePayScriptLoader from './google-pay-script-loader';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getGeneric } from './mocks/google-pay-payment-method.mock';
import {
    CallbackTriggerType,
    GooglePayButtonOptions,
    GooglePayFullBillingAddress,
    GooglePayInitializationData,
    NewTransactionInfo,
} from './types';

describe.skip('GooglePayCustomerStrategy', () => {
    const CONTAINER_ID = 'my_awesome_google_pay_button_container';

    let paymentIntegrationService: PaymentIntegrationService;
    let button: HTMLButtonElement;
    let processor: GooglePayPaymentProcessor;
    let strategy: GooglePayCustomerStrategy;
    let options: CustomerInitializeOptions & WithGooglePayCustomerInitializeOptions;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            getGeneric(),
        );

        button = document.createElement('button');
        jest.spyOn(button, 'remove');

        processor = new GooglePayPaymentProcessor(
            new GooglePayScriptLoader(createScriptLoader()),
            new GooglePayGateway('example', paymentIntegrationService),
            createRequestSender(),
            createFormPoster(),
        );
        jest.spyOn(processor, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(processor, 'addPaymentButton').mockReturnValue(button);
        jest.spyOn(processor, 'signOut').mockResolvedValue(undefined);

        strategy = new GooglePayCustomerStrategy(paymentIntegrationService, processor);

        options = {
            methodId: 'googlepayworldpayaccess',
            googlepayworldpayaccess: {
                container: CONTAINER_ID,
                onClick: jest.fn(),
            },
        };
    });

    describe('#initialize', () => {
        it('should initialize the strategy', async () => {
            const initialize = strategy.initialize(options);

            await expect(initialize).resolves.toBeUndefined();
        });

        it('should call loadPaymentMethod', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockImplementation(() => {
                throw new Error();
            });

            jest.spyOn(paymentIntegrationService, 'loadPaymentMethod').mockResolvedValueOnce({
                getPaymentMethodOrThrow: jest.fn().mockReturnValue(getGeneric()),
            });

            await strategy.initialize(options);

            expect(paymentIntegrationService.loadPaymentMethod).toHaveBeenCalledWith(
                'googlepayworldpayaccess',
            );
        });

        it('should initialize processor', async () => {
            const getPaymentMethod = () =>
                (
                    (processor.initialize as jest.Mock).mock
                        .calls[0][0] as () => PaymentMethod<GooglePayInitializationData>
                )();
            const paymentMethod = getGeneric();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue(paymentMethod);

            await strategy.initialize(options);

            expect(getPaymentMethod()).toBe(paymentMethod);
        });

        it('should fail silently if Google Pay is not supported', async () => {
            jest.spyOn(processor, 'initialize').mockRejectedValue(
                new Error('Google Pay is not supported'),
            );

            await strategy.initialize(options);

            expect(processor.addPaymentButton).not.toHaveBeenCalled();
        });

        it('should add payment button', async () => {
            await strategy.initialize(options);

            expect(processor.addPaymentButton).toHaveBeenCalledWith(CONTAINER_ID, {
                buttonColor: 'default',
                buttonType: 'plain',
                onClick: expect.any(Function),
            });
        });

        it('should add payment button once', async () => {
            await strategy.initialize(options);
            await strategy.initialize(options);

            expect(processor.addPaymentButton).toHaveBeenCalledTimes(1);
        });

        describe('should fail if:', () => {
            test('options is missing', async () => {
                const initialize = strategy.initialize();

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('methodId is empty', async () => {
                options.methodId = '';

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('methodId is not a google pay key', async () => {
                options.methodId = 'foo';

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });

            test('googlePayOptions is missing', async () => {
                delete options.googlepayworldpayaccess;

                const initialize = strategy.initialize(options);

                await expect(initialize).rejects.toThrow(InvalidArgumentError);
            });
        });
    });

    describe('#signIn', () => {
        it('should not signIn programmatically', async () => {
            const signIn = strategy.signIn();

            await expect(signIn).rejects.toThrow(NotImplementedError);
        });
    });

    describe('#signOut', () => {
        it('should signOut', async () => {
            const signOut = strategy.signOut();

            await expect(signOut).resolves.toBeUndefined();
        });
    });

    describe('#executePaymentMethodCheckout', () => {
        it('runs continue callback automatically on execute payment method checkout', async () => {
            const continueWithCheckoutCallback = jest.fn();

            await strategy.executePaymentMethodCheckout({
                continueWithCheckoutCallback,
            });

            expect(continueWithCheckoutCallback).toHaveBeenCalled();
        });
    });

    describe('#deinitialize', () => {
        it('should deinitialize the strategy', async () => {
            const deinitialize = strategy.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should remove payment button', async () => {
            await strategy.initialize(options);
            await strategy.deinitialize();

            expect(button.remove).toHaveBeenCalled();
        });
    });

    describe('#handleClick', () => {
        beforeEach(() => {
            jest.spyOn(processor, 'addPaymentButton').mockImplementation(
                (
                    _: string,
                    buttonOptions: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>,
                ) => {
                    button.onclick = buttonOptions.onClick;

                    return button;
                },
            );
        });

        it('triggers onClick callback on wallet button click', async () => {
            await strategy.initialize(options);

            button.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(options.googlepayworldpayaccess?.onClick).toHaveBeenCalled();
        });

        describe('#getGooglePayClientOptions', () => {
            let mockReturnedPaymentDataChangedValue: NewTransactionInfo;
            const defaultGPayShippingAddress: GooglePayFullBillingAddress = {
                address1: '',
                address2: '',
                address3: '',
                administrativeArea: 'US',
                locality: 'TX',
                sortingCode: '78726',
                name: '',
                postalCode: '',
                countryCode: '',
            };
            const consignment = getConsignment();
            const expectedSippingOptions = [
                {
                    id: consignment.availableShippingOptions![0].id,
                    label: consignment.availableShippingOptions![0].description,
                    description: '$0.00',
                },
            ];
            const availableGPayShippingOptions = {
                defaultSelectedOptionId: consignment.selectedShippingOption?.id,
                shippingOptions: expectedSippingOptions,
            };

            beforeEach(() => {
                jest.spyOn(processor, 'initialize').mockImplementation(
                    (_, googlePayClientOptions) => {
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        eventEmitter.on('onPaymentDataChanged', async () => {
                            mockReturnedPaymentDataChangedValue =
                                await googlePayClientOptions.paymentDataCallbacks.onPaymentDataChanged(
                                    {
                                        callbackTrigger: CallbackTriggerType.INITIALIZE,
                                        shippingAddress: defaultGPayShippingAddress,
                                        shippingOptionData: {
                                            id: consignment.selectedShippingOption?.id,
                                        },
                                    },
                                );
                        });
                    },
                );

                jest.spyOn(processor, 'showPaymentSheet').mockImplementation(() => {
                    eventEmitter.emit('onPaymentDataChanged');

                    return getCardDataResponse();
                });

                jest.spyOn(processor, 'getCallbackTriggers').mockReturnValue({
                    availableTriggers: [
                        CallbackTriggerType.INITIALIZE,
                        CallbackTriggerType.SHIPPING_ADDRESS,
                        CallbackTriggerType.SHIPPING_OPTION,
                    ],
                    initializationTrigger: [CallbackTriggerType.INITIALIZE],
                    addressChangeTriggers: [
                        CallbackTriggerType.INITIALIZE,
                        CallbackTriggerType.SHIPPING_ADDRESS,
                    ],
                    shippingOptionsChangeTriggers: [CallbackTriggerType.SHIPPING_OPTION],
                });
            });

            it('should load checkout via onPaymentDataChanged callback', async () => {
                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.loadCheckout).toHaveBeenCalled();
            });

            it('should return updated transactionInfo without shipping data', async () => {
                jest.spyOn(processor, 'getCallbackTriggers').mockReturnValue({
                    availableTriggers: [CallbackTriggerType.INITIALIZE],
                    addressChangeTriggers: [],
                    shippingOptionsChangeTriggers: [],
                });

                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(mockReturnedPaymentDataChangedValue).toStrictEqual({
                    newTransactionInfo: {
                        countryCode: 'US',
                        currencyCode: 'USD',
                        totalPriceStatus: 'FINAL',
                        totalPrice: '190.00',
                    },
                });
            });

            it('should not return updated transactionInfo if callback not supported', async () => {
                jest.spyOn(processor, 'getCallbackTriggers').mockReturnValue({
                    availableTriggers: [],
                    addressChangeTriggers: [],
                    shippingOptionsChangeTriggers: [],
                });

                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(mockReturnedPaymentDataChangedValue).toBeUndefined();
            });

            it('should return updated transactionInfo with available shipping options', async () => {
                jest.spyOn(processor, 'handleShippingAddressChange').mockResolvedValue(
                    availableGPayShippingOptions,
                );

                const handleShippingOptionChangeMock = jest.spyOn(
                    processor,
                    'handleShippingOptionChange',
                );

                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(mockReturnedPaymentDataChangedValue).toStrictEqual({
                    newTransactionInfo: {
                        countryCode: 'US',
                        currencyCode: 'USD',
                        totalPriceStatus: 'FINAL',
                        totalPrice: '190.00',
                    },
                    newShippingOptionParameters: availableGPayShippingOptions,
                });
                expect(handleShippingOptionChangeMock).not.toHaveBeenCalled();
            });

            it('should update selected shipping option', async () => {
                jest.spyOn(processor, 'initialize').mockImplementation(
                    (_, googlePayClientOptions) => {
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        eventEmitter.on('onPaymentDataChanged', async () => {
                            mockReturnedPaymentDataChangedValue =
                                await googlePayClientOptions.paymentDataCallbacks.onPaymentDataChanged(
                                    {
                                        callbackTrigger: CallbackTriggerType.SHIPPING_OPTION,
                                        shippingAddress: defaultGPayShippingAddress,
                                        shippingOptionData: {
                                            id: consignment.selectedShippingOption?.id,
                                        },
                                    },
                                );
                        });
                    },
                );
                jest.spyOn(processor, 'handleShippingAddressChange').mockResolvedValue(
                    Promise.resolve(availableGPayShippingOptions),
                );

                const handleShippingOptionChangeMock = jest.spyOn(
                    processor,
                    'handleShippingOptionChange',
                );

                await strategy.initialize(options);

                button.click();

                await new Promise((resolve) => process.nextTick(resolve));

                expect(mockReturnedPaymentDataChangedValue).toStrictEqual({
                    newTransactionInfo: {
                        countryCode: 'US',
                        currencyCode: 'USD',
                        totalPriceStatus: 'FINAL',
                        totalPrice: '190.00',
                    },
                });
                expect(handleShippingOptionChangeMock).toHaveBeenCalledWith(
                    consignment.selectedShippingOption?.id,
                );
            });
        });
    });
});
