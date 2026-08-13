import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import { getPayPalSDKMock } from '../mocks';

import { WithBigCommercePaymentsPayLaterWalletInitializeOptions } from './bigcommerce-payments-paylater-wallet-initialize-options';
import BigCommercePaymentsPayLaterWalletStrategy from './bigcommerce-payments-paylater-wallet-strategy';

describe('BigCommercePaymentsPayLaterWalletStrategy', () => {
    let strategy: BigCommercePaymentsPayLaterWalletStrategy;
    let bigCommercePaymentsPayLaterWalletService: jest.Mocked<PaypalCommerceWalletService>;

    const defaultContainerId = 'bigcommerce-payments-paylater-wallet-button';
    const defaultMethodId = 'bigcommerce_paymentspaypalcredit';
    const defaultProviderId = 'bigcommerce_payments.paypalcredit';
    const defaultCartId = 'abc123';
    const defaultOrderId = 'ORDER_ID';
    const defaultButtonStyle = { color: 'gold', label: 'checkout' };

    const orderDetails = {
        payer: {
            name: { given_name: 'John', surname: 'Doe' },
            email_address: 'john@doe.com',
            address: {
                address_line_1: '123 Main St',
                address_line_2: 'Suite 100',
                admin_area_2: 'Austin',
                admin_area_1: 'TX',
                postal_code: '73301',
                country_code: 'US',
            },
        },
        purchase_units: [],
    };
    const mappedBillingAddress = { firstName: 'John', lastName: 'Doe' };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithBigCommercePaymentsPayLaterWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        bigcommerce_paymentspaypalcredit: {
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

        bigCommercePaymentsPayLaterWalletService = {
            addBillingAddress: jest.fn(),
            createPaymentOrderIntent: jest.fn().mockResolvedValue(defaultOrderId),
            getPayPalSdkOrThrow: jest.fn().mockReturnValue(paypalSdk),
            getValidButtonStyle: jest.fn().mockReturnValue({ height: 45 }),
            loadPayPalSdk: jest.fn(),
            mapOrderDetailsToBillingAddress: jest.fn().mockReturnValue(mappedBillingAddress),
            proxyTokenizationPayment: jest.fn(),
            removeElement: jest.fn(),
        } as unknown as jest.Mocked<PaypalCommerceWalletService>;

        strategy = new BigCommercePaymentsPayLaterWalletStrategy(
            bigCommercePaymentsPayLaterWalletService,
        );
    });

    it('throws when methodId is not provided', async () => {
        const optionsWithoutMethodId = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsPayLaterWalletInitializeOptions;

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
            WithBigCommercePaymentsPayLaterWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutContainerId)).rejects.toEqual(
            new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            ),
        );
    });

    it('throws when bigcommerce_paymentspaypalcredit options are not provided', async () => {
        const optionsWithoutPayLaterOptions = {
            ...initializationOptions,
            bigcommerce_paymentspaypalcredit: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsPayLaterWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutPayLaterOptions)).rejects.toEqual(
            new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_paymentspaypalcredit" argument is not provided.`,
            ),
        );
    });

    it('throws when payment method initializationData cannot be parsed', async () => {
        const invalidInitializationOptions = {
            ...initializationOptions,
            bigcommerce_paymentspaypalcredit: {
                ...initializationOptions.bigcommerce_paymentspaypalcredit!,
                initializationData: '%%%invalid-base64%%%',
            },
        };

        await expect(strategy.initialize(invalidInitializationOptions)).rejects.toEqual(
            new InvalidArgumentError("Failed to parse payment method 'initializationData'."),
        );
    });

    it('loads PayPal SDK with parsed initialization data and currency', async () => {
        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsPayLaterWalletService.loadPayPalSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                initializationData: expect.objectContaining({ clientId: 'test-client-id' }),
            }),
            'USD',
            false,
        );
    });

    it('renders paylater button with PAYLATER as first eligible funding source', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        expect(buttonOptions.fundingSource).toEqual(paypalSdk.FUNDING.PAYLATER);
        expect(paypalButtons.render).toHaveBeenCalledWith(`#${defaultContainerId}`);
    });

    it('renders button with CREDIT funding source when PAYLATER is not eligible', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();
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

    it('applies cart button styles from parsed initializationData', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsPayLaterWalletService.getValidButtonStyle).toHaveBeenCalledWith(
            defaultButtonStyle,
        );
    });

    it('creates payment order intent with correct provider ID', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.createOrder();

        expect(
            bigCommercePaymentsPayLaterWalletService.createPaymentOrderIntent,
        ).toHaveBeenCalledWith(defaultProviderId, defaultCartId);
    });

    it('adds billing address and proxies tokenization on approve', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.onApprove?.(
            { orderID: defaultOrderId },
            {
                order: {
                    get: jest.fn().mockResolvedValue(orderDetails),
                },
            },
        );

        expect(
            bigCommercePaymentsPayLaterWalletService.mapOrderDetailsToBillingAddress,
        ).toHaveBeenCalledWith(orderDetails);
        expect(bigCommercePaymentsPayLaterWalletService.addBillingAddress).toHaveBeenCalledWith(
            defaultCartId,
            mappedBillingAddress,
        );
        expect(
            bigCommercePaymentsPayLaterWalletService.proxyTokenizationPayment,
        ).toHaveBeenCalledWith(
            defaultCartId,
            defaultProviderId,
            'bigcommerce_payments_paylater',
            defaultOrderId,
        );
    });

    it('removes element when no funding source is eligible', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(false),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsPayLaterWalletService.removeElement).toHaveBeenCalledWith(
            defaultContainerId,
        );
    });

    it('uses fallback style when cartButtonStyles is not provided', async () => {
        const optionsWithoutButtonStyle: CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsPayLaterWalletInitializeOptions = {
            methodId: defaultMethodId,
            containerId: defaultContainerId,
            bigcommerce_paymentspaypalcredit: {
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
        const paypalSdk = bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(optionsWithoutButtonStyle);

        expect(bigCommercePaymentsPayLaterWalletService.getValidButtonStyle).toHaveBeenCalledWith(
            undefined,
        );
    });

    it('resolves on deinitialize', async () => {
        await expect(strategy.deinitialize()).resolves.toBeUndefined();
    });
});
