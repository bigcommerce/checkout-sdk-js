import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    getBillingAddressFromOrderDetails,
    getPayPalOrderDetails,
    getPayPalSDKMock,
    getShippingAddressFromOrderDetails,
} from './mocks';
import PaypalButtonCreationService from './paypal-button-creation-service';
import PayPalIntegrationService from './paypal-integration-service';
import PayPalRequestSender from './paypal-request-sender';
import PayPalSdkLoader from './paypal-sdk-script-loader';
import { PayPalButtonsOptions, PayPalSDK, StyleButtonColor } from './paypal-types';

describe('PayPalButtonCreationService', () => {
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let eventEmitter: EventEmitter;
    let paypalRequestSender: PayPalRequestSender;
    let paypalSdkLoader: PayPalSdkLoader;
    let paypalButtonCreationService: PaypalButtonCreationService;
    let paymentIntegrationService: PaymentIntegrationService;
    let paypalIntegrationService: PayPalIntegrationService;
    let paypalSdk: PayPalSDK;

    const paypalOrderId = 'ORDER_ID';
    const defaultMethodId = 'paypalcommercecredit';

    const paypalShippingAddressPayloadMock = {
        city: 'New York',
        countryCode: 'US',
        postalCode: '07564',
        state: 'New York',
    };

    const paypalSelectedShippingOptionPayloadMock = {
        amount: {
            currency_code: 'USD',
            value: '100',
        },
        id: '1',
        label: 'Free shipping',
        selected: true,
        type: 'type_shipping',
    };

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        formPoster = createFormPoster();
        eventEmitter = new EventEmitter();
        requestSender = createRequestSender();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        paypalRequestSender = new PayPalRequestSender(requestSender);
        paypalSdkLoader = new PayPalSdkLoader(getScriptLoader());

        paypalSdk = getPayPalSDKMock();

        paypalIntegrationService = new PayPalIntegrationService(
            formPoster,
            paymentIntegrationService,
            paypalRequestSender,
            paypalSdkLoader,
        );

        jest.spyOn(paypalIntegrationService, 'getPayPalSdkOrThrow').mockReturnValue(paypalSdk);
        jest.spyOn(paypalIntegrationService, 'createOrder');
        jest.spyOn(paypalIntegrationService, 'tokenizePayment').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateBillingAddress').mockImplementation(jest.fn());
        jest.spyOn(paymentIntegrationService, 'updateShippingAddress').mockImplementation(
            jest.fn(),
        );
        jest.spyOn(paymentIntegrationService, 'selectShippingOption').mockImplementation(jest.fn());

        jest.spyOn(paypalIntegrationService, 'getBillingAddressFromOrderDetails').mockReturnValue(
            getBillingAddressFromOrderDetails(),
        );
        jest.spyOn(paypalIntegrationService, 'getShippingAddressFromOrderDetails').mockReturnValue(
            getShippingAddressFromOrderDetails(),
        );
        jest.spyOn(paypalIntegrationService, 'updateOrder').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'submitPayment').mockImplementation(jest.fn());
        jest.spyOn(paypalIntegrationService, 'getShippingOptionOrThrow').mockReturnValue(
            getShippingOption(),
        );

        paypalButtonCreationService = new PaypalButtonCreationService(
            paymentIntegrationService,
            paypalIntegrationService,
        );

        jest.spyOn(paypalSdk, 'Buttons').mockImplementation((options: PayPalButtonsOptions) => {
            eventEmitter.on('createOrder', () => {
                if (options.createOrder) {
                    options.createOrder();
                }
            });

            eventEmitter.on(
                'onClick',
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                async (jestSuccessExpectationsCallback, jestFailureExpectationsCallback) => {
                    try {
                        if (options.onClick) {
                            await options.onClick(
                                { fundingSource: 'PAYLATER' },
                                {
                                    reject: jest.fn(),
                                    resolve: jest.fn(),
                                },
                            );

                            if (
                                jestSuccessExpectationsCallback &&
                                typeof jestSuccessExpectationsCallback === 'function'
                            ) {
                                jestSuccessExpectationsCallback();
                            }
                        }
                    } catch (error) {
                        if (
                            jestFailureExpectationsCallback &&
                            typeof jestFailureExpectationsCallback === 'function'
                        ) {
                            jestFailureExpectationsCallback(error);
                        }
                    }
                },
            );

            eventEmitter.on('onApprove', () => {
                if (options.onApprove) {
                    options.onApprove(
                        { orderID: paypalOrderId },
                        {
                            order: {
                                get: jest.fn(),
                            },
                        },
                    );
                }
            });

            eventEmitter.on('onCancel', () => {
                if (options.onCancel) {
                    options.onCancel();
                }
            });

            eventEmitter.on('onShippingAddressChange', () => {
                if (options.onShippingAddressChange) {
                    options.onShippingAddressChange({
                        orderId: paypalOrderId,
                        shippingAddress: paypalShippingAddressPayloadMock,
                    });
                }
            });

            eventEmitter.on('onShippingOptionsChange', () => {
                if (options.onShippingOptionsChange) {
                    options.onShippingOptionsChange({
                        orderId: paypalOrderId,
                        selectedShippingOption: paypalSelectedShippingOptionPayloadMock,
                    });
                }
            });

            return {
                isEligible: jest.fn(() => true),
                render: jest.fn(),
                close: jest.fn(),
            };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('create paypal button with required options', () => {
        paypalButtonCreationService.createPayPalButton('paypalcommerce', 'paypalcommercecredit', {
            fundingSource: paypalSdk.FUNDING.PAYLATER,
        });

        expect(paypalSdk.Buttons).toHaveBeenCalledWith({
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            createOrder: expect.any(Function),
            onApprove: expect.any(Function),
            style: {
                height: 40,
            },
        });
    });

    it('create PayPal button with the option to set the style', () => {
        const styleOption = {
            height: 45,
            color: StyleButtonColor.gold,
        };

        paypalButtonCreationService.createPayPalButton('paypalcommerce', 'paypalcommercecredit', {
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            style: styleOption,
        });

        expect(paypalSdk.Buttons).toHaveBeenCalledWith({
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            style: styleOption,
            createOrder: expect.any(Function),
            onApprove: expect.any(Function),
        });
    });

    it('create PayPal button with onClick callback support', async () => {
        const onClick = jest.fn();

        paypalButtonCreationService.createPayPalButton('paypalcommerce', 'paypalcommercecredit', {
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            onClick,
        });

        eventEmitter.emit('onClick');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(onClick).toHaveBeenCalled();

        expect(paypalSdk.Buttons).toHaveBeenCalledWith({
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            onClick,
            createOrder: expect.any(Function),
            onApprove: expect.any(Function),
            style: {
                height: 40,
            },
        });
    });

    it('create PayPal button with onCancel callback support', async () => {
        const onCancel = jest.fn();

        paypalButtonCreationService.createPayPalButton('paypalcommerce', 'paypalcommercecredit', {
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            onCancel,
        });

        eventEmitter.emit('onCancel');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(onCancel).toHaveBeenCalled();

        expect(paypalSdk.Buttons).toHaveBeenCalledWith({
            fundingSource: paypalSdk.FUNDING.PAYLATER,
            onCancel,
            createOrder: expect.any(Function),
            onApprove: expect.any(Function),
            style: {
                height: 40,
            },
        });
    });

    it('creates paypal order', async () => {
        paypalButtonCreationService.createPayPalButton('paypalcommerce', 'paypalcommercecredit', {
            fundingSource: paypalSdk.FUNDING.PAYLATER,
        });

        eventEmitter.emit('createOrder');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paypalIntegrationService.createOrder).toHaveBeenCalledWith('paypalcommerce');
    });

    it('throw an error if fundingSource is not valid', () => {
        const onCancel = jest.fn();

        try {
            paypalButtonCreationService.createPayPalButton(
                'paypalcommerce',
                'paypalcommercecredit',
                {
                    fundingSource: 'not-valid-funding-source',
                    onCancel,
                },
            );
        } catch (e) {
            expect(e).toBeInstanceOf(InvalidArgumentError);
        }
    });

    describe('create PayPal button with onApprove callback support', () => {
        describe('default flow', () => {
            it('tokenizes payment on paypal approve', async () => {
                paypalButtonCreationService.createPayPalButton(
                    'paypalcommerce',
                    'paypalcommercecredit',
                    {
                        fundingSource: paypalSdk.FUNDING.PAYLATER,
                    },
                );

                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalIntegrationService.tokenizePayment).toHaveBeenCalledWith(
                    defaultMethodId,
                    paypalOrderId,
                );
            });
        });

        describe('when isHostedCheckoutEnabled is true', () => {
            const paypalOrderDetails = getPayPalOrderDetails();
            const getMock = jest.fn(() => Promise.resolve(paypalOrderDetails));
            const onPaymentComplete = jest.fn();

            beforeEach(() => {
                jest.spyOn(paypalSdk, 'Buttons').mockImplementation(
                    (options: PayPalButtonsOptions) => {
                        eventEmitter.on('onApprove', () => {
                            if (options.onApprove) {
                                options.onApprove(
                                    { orderID: paypalOrderId },
                                    {
                                        order: {
                                            get: getMock,
                                        },
                                    },
                                );
                            }
                        });

                        return {
                            render: jest.fn(),
                            isEligible: jest.fn(() => true),
                            close: jest.fn(),
                        };
                    },
                );

                paypalButtonCreationService.createPayPalButton(
                    'paypalcommerce',
                    'paypalcommercecredit',
                    {
                        fundingSource: paypalSdk.FUNDING.PAYLATER,
                        onPaymentComplete,
                    },
                    true,
                );
            });

            it('call onPaymentComplete when order is completed', async () => {
                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalIntegrationService.submitPayment).toHaveBeenCalled();
                expect(onPaymentComplete).toHaveBeenCalled();
            });

            it('takes order details data from paypal', async () => {
                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(getMock).toHaveBeenCalled();
            });

            it('updates billing address with valid customers data', async () => {
                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    paypalIntegrationService.getBillingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getPayPalOrderDetails());
                expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(
                    getBillingAddressFromOrderDetails(),
                );
            });

            it('updates shipping address with valid customers data if physical items are available in the cart', async () => {
                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(
                    paypalIntegrationService.getShippingAddressFromOrderDetails,
                ).toHaveBeenCalledWith(getPayPalOrderDetails());
                expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(
                    getShippingAddressFromOrderDetails(),
                );
            });

            it('submits BC order with provided methodId', async () => {
                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paymentIntegrationService.submitOrder).toHaveBeenCalledWith(
                    {},
                    {
                        params: {
                            methodId: 'paypalcommercecredit',
                        },
                    },
                );
            });

            it('submits BC payment to update BC order data', async () => {
                eventEmitter.emit('onApprove');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(paypalIntegrationService.submitPayment).toHaveBeenCalledWith(
                    defaultMethodId,
                    paypalOrderId,
                );
            });
        });
    });

    describe('create PayPal button with onShippingAddressChange callback support', () => {
        it('updates billing and shipping address with data returned from PayPal', async () => {
            const address = {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                address1: '',
                address2: '',
                city: paypalShippingAddressPayloadMock.city,
                countryCode: paypalShippingAddressPayloadMock.countryCode,
                postalCode: paypalShippingAddressPayloadMock.postalCode,
                stateOrProvince: '',
                stateOrProvinceCode: paypalShippingAddressPayloadMock.state,
                customFields: [],
            };

            jest.spyOn(paypalIntegrationService, 'getAddress').mockReturnValue(address);

            paypalButtonCreationService.createPayPalButton(
                'paypalcommerce',
                'paypalcommercecredit',
                {
                    fundingSource: paypalSdk.FUNDING.PAYLATER,
                },
                true,
            );

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paymentIntegrationService.updateBillingAddress).toHaveBeenCalledWith(address);
            expect(paymentIntegrationService.updateShippingAddress).toHaveBeenCalledWith(address);
        });

        it('selects shipping option after address update', async () => {
            paypalButtonCreationService.createPayPalButton(
                'paypalcommerce',
                'paypalcommercecredit',
                {
                    fundingSource: paypalSdk.FUNDING.PAYLATER,
                },
                true,
            );

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates PayPal order after shipping option selection', async () => {
            const consignment = getConsignment();

            // INFO: lets imagine that it is a state that we get after consignmentActionCreator.selectShippingOption call
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            paypalButtonCreationService.createPayPalButton(
                'paypalcommerce',
                'paypalcommercecredit',
                {
                    fundingSource: paypalSdk.FUNDING.PAYLATER,
                },
                true,
            );

            eventEmitter.emit('onShippingAddressChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.updateOrder).toHaveBeenCalledWith('paypalcommerce');
        });
    });

    describe('#onShippingOptionsChange button callback', () => {
        it('selects shipping option', async () => {
            paypalButtonCreationService.createPayPalButton(
                'paypalcommerce',
                'paypalcommercecredit',
                {
                    fundingSource: paypalSdk.FUNDING.PAYLATER,
                },
                true,
            );

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.getShippingOptionOrThrow).toHaveBeenCalled();
            expect(paymentIntegrationService.selectShippingOption).toHaveBeenCalledWith(
                getShippingOption().id,
            );
        });

        it('updates PayPal order', async () => {
            paypalButtonCreationService.createPayPalButton(
                'paypalcommerce',
                'paypalcommercecredit',
                {
                    fundingSource: paypalSdk.FUNDING.PAYLATER,
                },
                true,
            );

            eventEmitter.emit('onShippingOptionsChange');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(paypalIntegrationService.updateOrder).toHaveBeenCalledWith('paypalcommerce');
        });
    });
});
