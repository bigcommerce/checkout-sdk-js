import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import getPayPalSDKMock from '../mocks/get-paypal-sdk.mock';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import { WithPayPalCommerceCreditWalletInitializeOptions } from './paypal-commerce-credit-wallet-initialize-options';
import PayPalCommerceCreditWalletStrategy from './paypal-commerce-credit-wallet-strategy';

describe('PayPalCommerceCreditWalletStrategy', () => {
    let strategy: PayPalCommerceCreditWalletStrategy;
    let paypalCommerceWalletService: jest.Mocked<PaypalCommerceWalletService>;

    const defaultContainerId = 'paypal-commerce-credit-wallet-button';
    const defaultMethodId = 'paypalcommercepaypalcredit';
    const defaultCartId = 'abc123';
    const defaultOrderId = 'ORDER_ID';
    const defaultButtonStyle = { color: 'gold', label: 'checkout' };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithPayPalCommerceCreditWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        paypalcommercepaypalcredit: {
            cartId: defaultCartId,
            currency: {
                code: 'USD',
            },
            initializationData: btoa(
                JSON.stringify({
                    initializationData: {
                        clientId: 'test-client-id',
                        paymentButtonStyles: {
                            cartButtonStyles: defaultButtonStyle,
                        },
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

        strategy = new PayPalCommerceCreditWalletStrategy(paypalCommerceWalletService);
    });

    it('throws when methodId is not provided', async () => {
        const optionsWithoutMethodId = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithPayPalCommerceCreditWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutMethodId)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            ),
        );
    });

    it('throws when containerId is not provided', async () => {
        const optionsWithoutContainerId = {
            ...initializationOptions,
            containerId: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithPayPalCommerceCreditWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutContainerId)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            ),
        );
    });

    it('throws when paypalcommercepaypalcredit is not provided', async () => {
        const optionsWithoutPaymentOptions = {
            ...initializationOptions,
            paypalcommercepaypalcredit: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithPayPalCommerceCreditWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutPaymentOptions)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercepaypalcredit" argument is not provided.',
            ),
        );
    });

    it('renders credit button with PAYLATER as first eligible funding source', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        expect(buttonOptions.fundingSource).toEqual(paypalSdk.FUNDING.PAYLATER);
        expect(paypalButtons.render).toHaveBeenCalledWith(`#${defaultContainerId}`);
    });

    it('renders credit button with CREDIT funding source when PAYLATER is not eligible', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockImplementation((options: any) => {
            if (options.fundingSource === paypalSdk.FUNDING.PAYLATER) {
                return {
                    ...paypalButtons,
                    isEligible: jest.fn().mockReturnValue(false),
                };
            }

            return paypalButtons;
        });

        await strategy.initialize(initializationOptions);

        const creditButtonOptions = buttonsSpy.mock.calls[1][0];

        expect(creditButtonOptions.fundingSource).toEqual(paypalSdk.FUNDING.CREDIT);
        expect(paypalButtons.render).toHaveBeenCalledWith(`#${defaultContainerId}`);
    });

    it('applies cart button styles from initialization data', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(paypalCommerceWalletService.getValidButtonStyle).toHaveBeenCalledWith(
            defaultButtonStyle,
        );
    });

    it('creates payment order intent with correct method ID', async () => {
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
            'paypalcommerce.paypalcredit',
            defaultCartId,
        );
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
                                given_name: 'Jane',
                                surname: 'Smith',
                            },
                            email_address: 'jane@smith.com',
                            address: {
                                address_line_1: '456 Oak Ave',
                                address_line_2: 'Apt 200',
                                admin_area_2: 'Denver',
                                admin_area_1: 'CO',
                                postal_code: '80202',
                                country_code: 'US',
                            },
                            phone: {
                                phone_number: {
                                    national_number: '3035555555',
                                },
                            },
                        },
                    }),
                },
            },
        );

        expect(paypalCommerceWalletService.addBillingAddress).toHaveBeenCalledWith(defaultCartId, {
            firstName: 'Jane',
            lastName: 'Smith',
            company: '',
            address1: '456 Oak Ave',
            address2: 'Apt 200',
            city: 'Denver',
            email: 'jane@smith.com',
            stateOrProvince: 'CO',
            stateOrProvinceCode: 'CO',
            countryCode: 'US',
            postalCode: '80202',
            phone: '3035555555',
            shouldSaveAddress: false,
        });
        expect(paypalCommerceWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
            defaultCartId,
            defaultOrderId,
        );
    });

    it('removes element when no funding source is eligible', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(false),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(paypalCommerceWalletService.removeElement).toHaveBeenCalledWith(defaultContainerId);
    });

    it('returns resolved promise on deinitialize', async () => {
        const result = strategy.deinitialize();

        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBeUndefined();
    });

    it('uses fallback style when cartButtonStyles is not provided', async () => {
        const optionsWithoutButtonStyle: CheckoutButtonInitializeOptions &
            WithPayPalCommerceCreditWalletInitializeOptions = {
            methodId: defaultMethodId,
            containerId: defaultContainerId,
            paypalcommercepaypalcredit: {
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

        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = paypalCommerceWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(optionsWithoutButtonStyle);

        expect(paypalCommerceWalletService.getValidButtonStyle).toHaveBeenCalledWith(undefined);
    });
});
