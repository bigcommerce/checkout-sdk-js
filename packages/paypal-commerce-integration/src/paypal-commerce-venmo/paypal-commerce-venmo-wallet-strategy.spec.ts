import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import getPayPalSDKMock from '../mocks/get-paypal-sdk.mock';

import { WithPayPalCommerceVenmoWalletInitializeOptions } from './paypal-commerce-venmo-wallet-initialize-options';
import PayPalCommerceVenmoWalletStrategy from './paypal-commerce-venmo-wallet-strategy';

describe('PayPalCommerceVenmoWalletStrategy', () => {
    let strategy: PayPalCommerceVenmoWalletStrategy;
    let paypalCommerceWalletService: jest.Mocked<PaypalCommerceWalletService>;

    const defaultContainerId = 'paypal-commerce-venmo-wallet-button';
    const defaultMethodId = 'paypalcommercevenmo';
    const defaultCartId = 'abc123';
    const defaultOrderId = 'ORDER_ID';

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithPayPalCommerceVenmoWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        paypalcommercevenmo: {
            cartId: defaultCartId,
            currency: {
                code: 'USD',
            },
            initializationData: btoa(
                JSON.stringify({
                    initializationData: {
                        clientId: 'test-client-id',
                    },
                }),
            ),
            clientToken: 'test-client-token',
        },
    };

    beforeEach(() => {
        const paypalSdk = getPayPalSDKMock();

        paypalCommerceWalletService = {
            addBillingAddress: jest.fn(),
            createPaymentOrderIntent: jest.fn().mockResolvedValue(defaultOrderId),
            getPayPalSdkOrThrow: jest.fn().mockReturnValue(paypalSdk),
            getValidButtonStyle: jest.fn().mockReturnValue({ height: 45 }),
            loadPayPalSdk: jest.fn(),
            proxyTokenizationPayment: jest.fn(),
            removeElement: jest.fn(),
        } as unknown as jest.Mocked<PaypalCommerceWalletService>;

        strategy = new PayPalCommerceVenmoWalletStrategy(paypalCommerceWalletService);
    });

    it('throws when methodId is not provided', async () => {
        const optionsWithoutMethodId = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithPayPalCommerceVenmoWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutMethodId)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            ),
        );
    });

    it('creates wallet intent with Venmo funding source', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.createOrder();

        expect(buttonOptions.fundingSource).toEqual(paypalSdk.FUNDING.VENMO);
        expect(paypalCommerceWalletService.createPaymentOrderIntent).toHaveBeenCalledWith(
            'paypalcommerce.venmo',
            defaultCartId,
        );
        expect(paypalButtons.render).toHaveBeenCalledWith(`#${defaultContainerId}`);
        expect(buttonOptions.onShippingAddressChange).toBeUndefined();
        expect(buttonOptions.onShippingOptionsChange).toBeUndefined();
    });

    it('proxies tokenization on approve', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.onApprove?.(
            { orderID: defaultOrderId },
            {
                order: {
                    get: jest.fn().mockResolvedValue({
                        payer: {
                            name: {
                                given_name: 'John',
                                surname: 'Doe',
                            },
                            email_address: 'john@doe.com',
                            address: {
                                address_line_1: '123 Main St',
                                address_line_2: 'Suite 100',
                                admin_area_2: 'Austin',
                                admin_area_1: 'TX',
                                postal_code: '73301',
                                country_code: 'US',
                            },
                            phone: {
                                phone_number: {
                                    national_number: '5555555555',
                                },
                            },
                        },
                    }),
                },
            },
        );

        expect(paypalCommerceWalletService.addBillingAddress).not.toHaveBeenCalled();
        expect(paypalCommerceWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
            defaultCartId,
            'paypalcommerce.venmo',
            'paypalcommercevenmo',
            defaultOrderId,
        );
    });
});
