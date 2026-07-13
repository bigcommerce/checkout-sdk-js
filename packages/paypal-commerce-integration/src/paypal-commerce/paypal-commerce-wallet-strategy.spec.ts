import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import getPayPalSDKMock from '../mocks/get-paypal-sdk.mock';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import { WithPayPalCommerceWalletInitializeOptions } from './paypal-commerce-wallet-initialize-options';
import PaypalCommerceWalletStrategy from './paypal-commerce-wallet-strategy';

describe('PaypalCommerceWalletStrategy', () => {
    let strategy: PaypalCommerceWalletStrategy;
    let paypalCommerceWalletService: jest.Mocked<PaypalCommerceWalletService>;

    const defaultContainerId = 'paypal-commerce-wallet-button';
    const defaultMethodId = 'paypalcommerce';
    const defaultCartId = 'abc123';
    const defaultOrderId = 'ORDER_ID';

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithPayPalCommerceWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        paypalcommercepaypal: {
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

        strategy = new PaypalCommerceWalletStrategy(paypalCommerceWalletService);
    });

    it('throws when methodId is not provided', async () => {
        const optionsWithoutMethodId = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions & WithPayPalCommerceWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutMethodId)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            ),
        );
    });

    it('throws when payment method initializationData cannot be parsed', async () => {
        const invalidInitializationOptions = {
            ...initializationOptions,
            paypalcommercepaypal: {
                ...initializationOptions.paypalcommercepaypal!,
                initializationData: '%%%invalid-base64%%%',
            },
        };

        await expect(strategy.initialize(invalidInitializationOptions)).rejects.toEqual(
            new InvalidArgumentError("Failed to parse payment method 'initializationData'."),
        );
    });

    it('creates wallet intent', async () => {
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

        expect(paypalCommerceWalletService.createPaymentOrderIntent).toHaveBeenCalledWith(
            'paypalcommerce.paypal',
            defaultCartId,
        );
        expect(paypalButtons.render).toHaveBeenCalledWith(`#${defaultContainerId}`);
        expect(buttonOptions.onShippingAddressChange).toBeUndefined();
        expect(buttonOptions.onShippingOptionsChange).toBeUndefined();
    });

    it('adds billing address and proxies tokenization on approve', async () => {
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

        expect(paypalCommerceWalletService.addBillingAddress).toHaveBeenCalledWith(defaultCartId, {
            firstName: 'John',
            lastName: 'Doe',
            company: '',
            address1: '123 Main St',
            address2: 'Suite 100',
            city: 'Austin',
            email: 'john@doe.com',
            stateOrProvince: 'TX',
            stateOrProvinceCode: 'TX',
            countryCode: 'US',
            postalCode: '73301',
            phone: '5555555555',
            shouldSaveAddress: false,
        });
        expect(paypalCommerceWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
            defaultCartId,
            defaultOrderId,
        );
    });
});
