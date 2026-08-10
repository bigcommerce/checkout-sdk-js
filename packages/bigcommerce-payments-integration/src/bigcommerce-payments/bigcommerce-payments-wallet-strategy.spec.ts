import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import { getPayPalSDKMock } from '../mocks';

import { WithBigCommercePaymentsWalletInitializeOptions } from './bigcommerce-payments-wallet-initialize-options';
import BigCommercePaymentsWalletStrategy from './bigcommerce-payments-wallet-strategy';

describe('BigCommercePaymentsWalletStrategy', () => {
    let strategy: BigCommercePaymentsWalletStrategy;
    let bigCommercePaymentsWalletService: jest.Mocked<PaypalCommerceWalletService>;

    const defaultContainerId = 'bigcommerce-payments-wallet-button';
    const defaultMethodId = 'bigcommerce_payments';
    const defaultProviderId = 'bigcommerce_payments.paypal';
    const defaultCartId = 'abc123';
    const defaultOrderId = 'ORDER_ID';

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
        WithBigCommercePaymentsWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        bigcommerce_paymentspaypal: {
            cartId: defaultCartId,
            currency: {
                code: 'USD',
            },
            initializationData: btoa(
                JSON.stringify({
                    initializationData: {
                        clientId: 'test-client-id',
                        paymentButtonStyles: {
                            cartButtonStyles: { color: 'gold', height: 45 },
                        },
                    },
                }),
            ),
            clientToken: 'test-client-token',
        },
    };

    beforeEach(() => {
        const paypalSdk = getPayPalSDKMock();

        bigCommercePaymentsWalletService = {
            addBillingAddress: jest.fn(),
            createPaymentOrderIntent: jest.fn().mockResolvedValue(defaultOrderId),
            getPayPalSdkOrThrow: jest.fn().mockReturnValue(paypalSdk),
            getValidButtonStyle: jest.fn().mockReturnValue({ height: 45 }),
            loadPayPalSdk: jest.fn(),
            mapOrderDetailsToBillingAddress: jest.fn().mockReturnValue(mappedBillingAddress),
            proxyTokenizationPayment: jest.fn(),
            removeElement: jest.fn(),
        } as unknown as jest.Mocked<PaypalCommerceWalletService>;

        strategy = new BigCommercePaymentsWalletStrategy(bigCommercePaymentsWalletService);
    });

    it('throws when methodId is not provided', async () => {
        const optionsWithoutMethodId = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsWalletInitializeOptions;

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
            WithBigCommercePaymentsWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutContainerId)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            ),
        );
    });

    it('throws when bigcommerce_paymentspaypal options are not provided', async () => {
        const optionsWithoutWallet = {
            ...initializationOptions,
            bigcommerce_paymentspaypal: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutWallet)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.bigcommerce_paymentspaypal" argument is not provided.',
            ),
        );
    });

    it('throws when payment method initializationData cannot be parsed', async () => {
        const invalidInitializationOptions = {
            ...initializationOptions,
            bigcommerce_paymentspaypal: {
                ...initializationOptions.bigcommerce_paymentspaypal!,
                initializationData: '%%%invalid-base64%%%',
            },
        };

        await expect(strategy.initialize(invalidInitializationOptions)).rejects.toEqual(
            new InvalidArgumentError("Failed to parse payment method 'initializationData'."),
        );
    });

    it('loads PayPal SDK with parsed initialization data and currency', async () => {
        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsWalletService.loadPayPalSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                initializationData: expect.objectContaining({ clientId: 'test-client-id' }),
            }),
            'USD',
            false,
        );
    });

    it('creates wallet intent', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.createOrder();

        expect(bigCommercePaymentsWalletService.createPaymentOrderIntent).toHaveBeenCalledWith(
            defaultProviderId,
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
        const paypalSdk = bigCommercePaymentsWalletService.getPayPalSdkOrThrow();
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
            bigCommercePaymentsWalletService.mapOrderDetailsToBillingAddress,
        ).toHaveBeenCalledWith(orderDetails);
        expect(bigCommercePaymentsWalletService.addBillingAddress).toHaveBeenCalledWith(
            defaultCartId,
            mappedBillingAddress,
        );
        expect(bigCommercePaymentsWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
            defaultCartId,
            defaultProviderId,
            'bigcommerce_payments',
            defaultOrderId,
        );
    });

    it('applies cart button styles from parsed initializationData', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsWalletService.getValidButtonStyle).toHaveBeenCalledWith({
            color: 'gold',
            height: 45,
        });
    });

    it('hides container when button is not eligible', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(false),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(paypalButtons.render).not.toHaveBeenCalled();
        expect(bigCommercePaymentsWalletService.removeElement).toHaveBeenCalledWith(
            defaultContainerId,
        );
    });

    it('resolves on deinitialize', async () => {
        await expect(strategy.deinitialize()).resolves.toBeUndefined();
    });
});
