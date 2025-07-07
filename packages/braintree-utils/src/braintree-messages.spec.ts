import {
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BraintreeHostWindow } from './braintree';
import BraintreeMessages from './braintree-messages';
import { getBraintree, getPaypalMock } from './mocks';
import { MessagingPlacements, PaypalSDK } from './paypal';

describe('BraintreeMessages', () => {
    let braintreeMessages: BraintreeMessages;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let paypalSdkMock: PaypalSDK;
    let paypalMessageElement: HTMLDivElement;

    const amount = 190;
    const methodId = 'braintreepaypalcredit';
    const defaultMessageContainerId = 'braintree-paypal-credit-message-mock-id';

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeMessages = new BraintreeMessages(paymentIntegrationService);

        paypalSdkMock = getPaypalMock();
        (window as BraintreeHostWindow).paypal = paypalSdkMock;

        paymentMethod = {
            ...getBraintree(),
            clientToken: 'myToken',
        };

        paypalMessageElement = document.createElement('div');
        paypalMessageElement.id = defaultMessageContainerId;
        document.body.appendChild(paypalMessageElement);

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
    });

    afterEach(() => {
        delete (window as BraintreeHostWindow).paypal;

        if (document.getElementById(defaultMessageContainerId)) {
            document.body.removeChild(paypalMessageElement);
        }
    });

    it('does not render paypal banner when paypal is not presented in window', () => {
        delete (window as BraintreeHostWindow).paypal;

        braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.PAYMENT);

        expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
    });

    it('does not render paypal banner when container is not presented in DOM', () => {
        document.body.removeChild(paypalMessageElement);

        braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.PAYMENT);

        expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
    });

    it('does not render paypal banner when payment initialization data was not returned from server', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            {
                ...paymentMethod,
                initializationData: null,
            },
        );

        braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.PAYMENT);

        expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
    });

    it('does not render paypal banner on checkout page when it is disabled', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            {
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: undefined,
                },
            },
        );

        braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.PAYMENT);

        expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
    });

    describe('BNPL implementation', () => {
        it('does not render home page Braintree Message if banner status is false', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'homepage',
                            name: 'Home page',
                            status: false,
                            styles: {},
                        },
                    ],
                },
            });

            braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.HOME);

            expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
        });

        it('renders Braintree Message on home page', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'homepage',
                            name: 'Home page',
                            status: true,
                            styles: {
                                color: 'white-no-border',
                                layout: 'flex',
                                ratio: '8x1',
                            },
                        },
                    ],
                },
            });

            braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.HOME);

            expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                amount,
                buyerCountry: 'US',
                placement: 'homepage',
                style: {
                    color: 'white-no-border',
                    layout: 'flex',
                    ratio: '8x1',
                },
            });
        });

        it('does not render product page Braintree Message if banner status is false', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'product',
                            name: 'Product page',
                            status: false,
                            styles: {},
                        },
                    ],
                },
            });

            braintreeMessages.render(
                methodId,
                defaultMessageContainerId,
                MessagingPlacements.PRODUCT,
            );

            expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
        });

        it('renders Braintree Message on product page', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'product',
                            name: 'Product page',
                            status: true,
                            styles: {
                                layout: 'text',
                                'logo-type': 'alternative',
                                'text-color': 'black',
                                'text-size': '12',
                            },
                        },
                    ],
                },
            });

            braintreeMessages.render(
                methodId,
                defaultMessageContainerId,
                MessagingPlacements.PRODUCT,
            );

            expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                amount,
                buyerCountry: 'US',
                placement: 'product',
                style: {
                    layout: 'text',
                    logo: {
                        type: 'alternative',
                    },
                    text: {
                        color: 'black',
                        size: 12,
                    },
                },
            });
        });

        it('does not render cart page Braintree Message if banner status is false', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'cart',
                            name: 'Cart page',
                            status: false,
                            styles: {},
                        },
                    ],
                },
            });

            braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.CART);

            expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
        });

        it('renders Braintree Message on cart page', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'cart',
                            name: 'Cart page',
                            status: true,
                            styles: {
                                layout: 'text',
                                'logo-type': 'alternative',
                                'text-color': 'white',
                                'text-size': '10',
                                'logo-position': 'right',
                            },
                        },
                    ],
                },
            });

            braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.CART);

            expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                amount,
                buyerCountry: 'US',
                placement: 'cart',
                style: {
                    layout: 'text',
                    logo: {
                        position: 'right',
                        type: 'alternative',
                    },
                    text: {
                        color: 'white',
                        size: 10,
                    },
                },
            });
        });

        it('does not render checkout page Braintree Message if banner status is false', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'checkout',
                            name: 'Checkout page',
                            status: false,
                            styles: {},
                        },
                    ],
                },
            });

            braintreeMessages.render(methodId, defaultMessageContainerId, MessagingPlacements.CART);

            expect(paypalSdkMock.Messages).not.toHaveBeenCalled();
        });

        it('renders Braintree Message on checkout page', () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: {
                    ...paymentMethod.initializationData,
                    paypalBNPLConfiguration: [
                        {
                            id: 'checkout',
                            name: 'Checkout page',
                            status: true,
                            styles: {
                                layout: 'text',
                                'logo-type': 'inline',
                                'text-color': 'black',
                                'text-size': '12',
                            },
                        },
                    ],
                },
            });

            braintreeMessages.render(
                methodId,
                defaultMessageContainerId,
                MessagingPlacements.PAYMENT,
            );

            expect(paypalSdkMock.Messages).toHaveBeenCalledWith({
                amount,
                buyerCountry: 'US',
                placement: 'payment',
                style: {
                    layout: 'text',
                    logo: {
                        type: 'inline',
                    },
                    text: {
                        color: 'black',
                        size: 12,
                    },
                },
            });
        });
    });
});
