import { createFormPoster } from '@bigcommerce/form-poster';

import { InvalidArgumentError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WalletButtonIntegrationService } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import GooglePayWalletInitializeOptions from './google-pay-wallet-initialize-options';
import GooglePayWalletService from './google-pay-wallet-service';
import GooglePayWalletStrategy from './google-pay-wallet-strategy';
import getCardDataResponse from './mocks/google-pay-card-data-response.mock';
import { getBigCommercePayments, getPayPalCommerce } from './mocks/google-pay-payment-method.mock';
import { GooglePayButtonOptions, TotalPriceStatusType } from './types';

describe('GooglePayWalletStrategy', () => {
    let strategy: GooglePayWalletStrategy;
    let service: GooglePayWalletService;
    let walletOptions: GooglePayWalletInitializeOptions;

    beforeEach(() => {
        service = new GooglePayWalletService(
            {} as WalletButtonIntegrationService,
            {} as GooglePayScriptLoader,
            {} as GooglePayWalletGateway,
            createFormPoster(),
        );
        strategy = new GooglePayWalletStrategy(service);
        walletOptions = {
            cartId: 'cart-123',
            currency: { code: 'USD' },
            amount: 10,
            initializationData: btoa(JSON.stringify(getPayPalCommerce())),
            clientToken: 'client-token',
        };

        jest.spyOn(service, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(service, 'renderButton').mockImplementation(jest.fn());
        jest.spyOn(service, 'showPaymentSheet').mockResolvedValue(getCardDataResponse());
        jest.spyOn(service, 'addBillingAddress').mockResolvedValue(undefined);
        jest.spyOn(service, 'proxyTokenizationPayment').mockResolvedValue(undefined);
    });

    it('initializes PayPal Commerce Google Pay using its wallet options', async () => {
        const paymentMethod = getPayPalCommerce();

        await strategy.initialize({
            methodId: 'paypalcommercegooglepay',
            containerId: 'google-pay',
            paypalcommercegooglepay: {
                ...walletOptions,
                initializationData: btoa(JSON.stringify(paymentMethod)),
            },
        });

        expect(service.initialize).toHaveBeenCalledWith(paymentMethod, 'USD', true, {
            countryCode: 'US',
            currencyCode: 'USD',
            totalPrice: '10.00',
            totalPriceStatus: TotalPriceStatusType.ESTIMATED,
        });
        expect(service.renderButton).toHaveBeenCalledWith('google-pay', {
            buttonColor: 'default',
            buttonType: 'plain',
            onClick: expect.any(Function),
        });
    });

    it('continues to initialize BigCommerce Payments using its wallet options', async () => {
        const paymentMethod = getBigCommercePayments();

        await strategy.initialize({
            methodId: 'bigcommerce_paymentsgooglepay',
            containerId: 'google-pay',
            bigcommerce_paymentsgooglepay: {
                ...walletOptions,
                initializationData: btoa(JSON.stringify(paymentMethod)),
            },
        });

        expect(service.initialize).toHaveBeenCalledWith(
            paymentMethod,
            expect.any(String),
            expect.any(Boolean),
            expect.any(Object),
        );
        expect(service.renderButton).toHaveBeenCalled();
    });

    it('saves the billing address before redirecting the payment', async () => {
        const response = getCardDataResponse();

        jest.spyOn(service, 'showPaymentSheet').mockResolvedValue(response);

        await strategy.initialize({
            methodId: 'paypalcommercegooglepay',
            containerId: 'google-pay',
            paypalcommercegooglepay: walletOptions,
        });

        const renderOptions = (service.renderButton as jest.Mock).mock.calls[0][1] as Omit<
            GooglePayButtonOptions,
            'allowedPaymentMethods'
        >;

        await renderOptions.onClick({ preventDefault: jest.fn() } as unknown as MouseEvent);

        expect(service.addBillingAddress).toHaveBeenCalledWith(
            'cart-123',
            expect.objectContaining({ address1: '505 Oakland Ave' }),
        );
        expect(service.proxyTokenizationPayment).toHaveBeenCalledWith('cart-123', response);
        expect(jest.mocked(service.addBillingAddress).mock.invocationCallOrder[0]).toBeLessThan(
            jest.mocked(service.proxyTokenizationPayment).mock.invocationCallOrder[0],
        );
    });

    it('removes the Google Pay button when deinitialized', async () => {
        const removeButton = jest.spyOn(service, 'removeButton');

        await strategy.deinitialize();

        expect(removeButton).toHaveBeenCalled();
    });

    it('rejects missing PayPal Commerce options even if BigCommerce options are supplied', async () => {
        await expect(
            strategy.initialize({
                methodId: 'paypalcommercegooglepay',
                containerId: 'google-pay',
                bigcommerce_paymentsgooglepay: walletOptions,
            }),
        ).rejects.toThrow('"options.paypalcommercegooglepay" argument is not provided.');
        expect(service.initialize).not.toHaveBeenCalled();
    });

    it('rejects invalid encoded payment method data', async () => {
        await expect(
            strategy.initialize({
                methodId: 'paypalcommercegooglepay',
                containerId: 'google-pay',
                paypalcommercegooglepay: { ...walletOptions, initializationData: 'invalid' },
            }),
        ).rejects.toThrow(InvalidArgumentError);
        expect(service.initialize).not.toHaveBeenCalled();
    });
});
