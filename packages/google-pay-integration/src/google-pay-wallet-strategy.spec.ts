import { createFormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { createWalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import GooglePayWalletInitializeOptions, {
    WithGooglePayWalletInitializeOptions,
} from './google-pay-wallet-initialize-options';
import GooglePayWalletService from './google-pay-wallet-service';
import GooglePayWalletStrategy from './google-pay-wallet-strategy';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getBraintree } from './mocks/google-pay-payment-method.mock';
import { GooglePayButtonOptions, TotalPriceStatusType } from './types';

describe('GooglePayWalletStrategy', () => {
    let service: GooglePayWalletService;
    let strategy: GooglePayWalletStrategy;
    let googlePayOptions: GooglePayWalletInitializeOptions;
    let initializationOptions: CheckoutButtonInitializeOptions &
        WithGooglePayWalletInitializeOptions;

    const containerId = 'google-pay-wallet-container';
    const paymentMethod = { ...getBraintree(), clientToken: undefined };

    const getOnClick = () => {
        const [, { onClick }] = (service.renderButton as jest.Mock).mock.calls[0] as [
            string,
            GooglePayButtonOptions,
        ];

        return onClick(new MouseEvent('click'));
    };

    beforeEach(() => {
        service = new GooglePayWalletService(
            createWalletButtonIntegrationService('/graphql'),
            new GooglePayScriptLoader(getScriptLoader()),
            {} as GooglePayWalletGateway,
            createFormPoster(),
        );

        jest.spyOn(service, 'initialize').mockResolvedValue();
        jest.spyOn(service, 'isReadyToPay').mockResolvedValue(true);
        jest.spyOn(service, 'renderButton').mockImplementation(jest.fn());
        jest.spyOn(service, 'showPaymentSheet').mockResolvedValue(getCardDataResponse());
        jest.spyOn(service, 'addBillingAddress').mockResolvedValue();
        jest.spyOn(service, 'redirectToCheckout').mockResolvedValue();
        jest.spyOn(service, 'deinitialize').mockResolvedValue();

        googlePayOptions = {
            cartId: 'cart-123',
            currency: { code: 'USD', decimalPlaces: 2 },
            amount: 10,
            initializationData: btoa(JSON.stringify(paymentMethod)),
            clientToken: 'clientToken',
            onAuthorizeError: jest.fn(),
            onError: jest.fn(),
            onEligibilityFailure: jest.fn(),
        };

        initializationOptions = {
            methodId: 'braintreegooglepay',
            containerId,
            braintreegooglepay: googlePayOptions,
        };

        strategy = new GooglePayWalletStrategy(service);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            await expect(
                strategy.initialize({ containerId } as CheckoutButtonInitializeOptions),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if containerId is not provided', async () => {
            await expect(
                strategy.initialize({ ...initializationOptions, containerId: '' }),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if method options are not provided', async () => {
            await expect(
                strategy.initialize({ methodId: 'braintreegooglepay', containerId }),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if initialization data cannot be parsed', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreegooglepay: { ...googlePayOptions, initializationData: 'not-valid' },
                }),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if payment method config is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreegooglepay: {
                        ...googlePayOptions,
                        initializationData: btoa(JSON.stringify({ initializationData: {} })),
                    },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('initializes service with payment method and transaction info', async () => {
            await strategy.initialize(initializationOptions);

            expect(service.initialize).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'googlepaybraintree', clientToken: 'clientToken' }),
                {
                    countryCode: 'US',
                    currencyCode: 'USD',
                    totalPrice: '10.00',
                    totalPriceStatus: TotalPriceStatusType.ESTIMATED,
                },
            );
        });

        it('formats total price with currency decimal places', async () => {
            await strategy.initialize({
                ...initializationOptions,
                braintreegooglepay: {
                    ...googlePayOptions,
                    amount: 12.3456,
                    currency: { code: 'KWD', decimalPlaces: 3 },
                },
            });

            expect(service.initialize).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ currencyCode: 'KWD', totalPrice: '12.346' }),
            );
        });

        it('formats total price without decimals for zero-decimal currency', async () => {
            await strategy.initialize({
                ...initializationOptions,
                braintreegooglepay: {
                    ...googlePayOptions,
                    amount: 1500,
                    currency: { code: 'JPY', decimalPlaces: 0 },
                },
            });

            expect(service.initialize).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ currencyCode: 'JPY', totalPrice: '1500' }),
            );
        });

        it('falls back to buyer country if store country is missing', async () => {
            await strategy.initialize({
                ...initializationOptions,
                braintreegooglepay: {
                    ...googlePayOptions,
                    initializationData: btoa(
                        JSON.stringify({
                            ...paymentMethod,
                            initializationData: {
                                ...paymentMethod.initializationData,
                                storeCountry: undefined,
                                buyerCountry: 'CA',
                            },
                        }),
                    ),
                },
            });

            expect(service.initialize).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({ countryCode: 'CA' }),
            );
        });

        it('renders google pay button with default styles', async () => {
            await strategy.initialize(initializationOptions);

            expect(service.renderButton).toHaveBeenCalledWith(containerId, {
                buttonColor: 'default',
                buttonType: 'plain',
                onClick: expect.any(Function),
            });
        });

        it('calls onError and does not render button if initialization fails', async () => {
            const error = new Error('Failed to load');

            jest.spyOn(service, 'initialize').mockRejectedValue(error);

            await strategy.initialize(initializationOptions);

            expect(googlePayOptions.onError).toHaveBeenCalledWith(error);
            expect(service.renderButton).not.toHaveBeenCalled();
        });

        it('calls onEligibilityFailure and does not render button if google pay is not available', async () => {
            jest.spyOn(service, 'isReadyToPay').mockResolvedValue(false);

            await strategy.initialize(initializationOptions);

            expect(googlePayOptions.onEligibilityFailure).toHaveBeenCalled();
            expect(service.renderButton).not.toHaveBeenCalled();
        });
    });

    describe('#handleClick()', () => {
        it('adds billing address and redirects to checkout', async () => {
            await strategy.initialize(initializationOptions);
            await getOnClick();

            expect(service.showPaymentSheet).toHaveBeenCalled();
            expect(service.addBillingAddress).toHaveBeenCalledWith(
                'cart-123',
                getCardDataResponse(),
            );
            expect(service.redirectToCheckout).toHaveBeenCalledWith(
                'cart-123',
                getCardDataResponse(),
            );
        });

        it('ignores a second click while the first one is in progress', async () => {
            let finishRedirect: () => void = () => undefined;

            jest.spyOn(service, 'redirectToCheckout').mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        finishRedirect = resolve;
                    }),
            );

            await strategy.initialize(initializationOptions);

            const firstClick = getOnClick();

            await new Promise((resolve) => process.nextTick(resolve));
            await getOnClick();

            finishRedirect();
            await firstClick;

            expect(service.showPaymentSheet).toHaveBeenCalledTimes(1);
            expect(service.addBillingAddress).toHaveBeenCalledTimes(1);
            expect(service.redirectToCheckout).toHaveBeenCalledTimes(1);
        });

        it('handles the next click after the previous one is finished', async () => {
            await strategy.initialize(initializationOptions);
            await getOnClick();
            await getOnClick();

            expect(service.showPaymentSheet).toHaveBeenCalledTimes(2);
            expect(service.redirectToCheckout).toHaveBeenCalledTimes(2);
        });

        it('handles the next click after shopper closes payment sheet', async () => {
            jest.spyOn(service, 'showPaymentSheet').mockRejectedValueOnce({
                statusCode: 'CANCELED',
            });

            await strategy.initialize(initializationOptions);
            await getOnClick();
            await getOnClick();

            expect(service.showPaymentSheet).toHaveBeenCalledTimes(2);
            expect(service.redirectToCheckout).toHaveBeenCalledTimes(1);
        });

        it('does nothing if shopper closes payment sheet', async () => {
            jest.spyOn(service, 'showPaymentSheet').mockRejectedValue({ statusCode: 'CANCELED' });

            await strategy.initialize(initializationOptions);
            await getOnClick();

            expect(service.addBillingAddress).not.toHaveBeenCalled();
            expect(googlePayOptions.onAuthorizeError).not.toHaveBeenCalled();
        });

        it('calls onAuthorizeError if google pay returns an error', async () => {
            jest.spyOn(service, 'showPaymentSheet').mockRejectedValue({
                statusCode: 'DEVELOPER_ERROR',
            });

            await strategy.initialize(initializationOptions);
            await getOnClick();

            expect(googlePayOptions.onAuthorizeError).toHaveBeenCalledWith(
                expect.any(PaymentMethodFailedError),
            );
        });

        it('calls onAuthorizeError if redirect fails', async () => {
            const error = new PaymentMethodFailedError();

            jest.spyOn(service, 'redirectToCheckout').mockRejectedValue(error);

            await strategy.initialize(initializationOptions);
            await getOnClick();

            expect(googlePayOptions.onAuthorizeError).toHaveBeenCalledWith(error);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes service', async () => {
            await strategy.deinitialize();

            expect(service.deinitialize).toHaveBeenCalled();
        });
    });
});
