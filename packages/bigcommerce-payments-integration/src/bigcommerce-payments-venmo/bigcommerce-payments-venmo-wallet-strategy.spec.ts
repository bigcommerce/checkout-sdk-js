import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import { getPayPalSDKMock } from '../mocks';

import { WithBigCommercePaymentsVenmoWalletInitializeOptions } from './bigcommerce-payments-venmo-wallet-initialize-options';
import BigCommercePaymentsVenmoWalletStrategy from './bigcommerce-payments-venmo-wallet-strategy';

describe('BigCommercePaymentsVenmoWalletStrategy', () => {
    let strategy: BigCommercePaymentsVenmoWalletStrategy;
    let bigCommercePaymentsVenmoWalletService: jest.Mocked<PaypalCommerceWalletService>;

    const defaultContainerId = 'bigcommerce-payments-venmo-wallet-button';
    const defaultMethodId = 'bigcommerce_payments_venmo';
    const defaultProviderId = 'bigcommerce_payments.venmo';
    const defaultCartId = 'abc123';
    const defaultOrderId = 'ORDER_ID';
    const defaultButtonStyle = { color: 'blue', label: 'checkout' };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithBigCommercePaymentsVenmoWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        bigcommerce_paymentsvenmo: {
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

        bigCommercePaymentsVenmoWalletService = {
            addBillingAddress: jest.fn(),
            createPaymentOrderIntent: jest.fn().mockResolvedValue(defaultOrderId),
            getPayPalSdkOrThrow: jest.fn().mockReturnValue(paypalSdk),
            getValidButtonStyle: jest.fn().mockReturnValue({ height: 45 }),
            loadPayPalSdk: jest.fn(),
            mapOrderDetailsToBillingAddress: jest.fn(),
            proxyTokenizationPayment: jest.fn(),
            removeElement: jest.fn(),
        } as unknown as jest.Mocked<PaypalCommerceWalletService>;

        strategy = new BigCommercePaymentsVenmoWalletStrategy(
            bigCommercePaymentsVenmoWalletService,
        );
    });

    it('throws when methodId is not provided', async () => {
        const optionsWithoutMethodId = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsVenmoWalletInitializeOptions;

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
            WithBigCommercePaymentsVenmoWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutContainerId)).rejects.toEqual(
            new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            ),
        );
    });

    it('throws when bigcommerce_paymentsvenmo options are not provided', async () => {
        const optionsWithoutVenmoOptions = {
            ...initializationOptions,
            bigcommerce_paymentsvenmo: undefined,
        } as unknown as CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsVenmoWalletInitializeOptions;

        await expect(strategy.initialize(optionsWithoutVenmoOptions)).rejects.toEqual(
            new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_paymentsvenmo" argument is not provided.`,
            ),
        );
    });

    it('throws when payment method initializationData cannot be parsed', async () => {
        const invalidOptions = {
            ...initializationOptions,
            bigcommerce_paymentsvenmo: {
                ...initializationOptions.bigcommerce_paymentsvenmo!,
                initializationData: '%%%invalid-base64%%%',
            },
        };

        await expect(strategy.initialize(invalidOptions)).rejects.toEqual(
            new InvalidArgumentError("Failed to parse payment method 'initializationData'."),
        );
    });

    it('loads PayPal SDK with parsed initialization data and currency', async () => {
        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsVenmoWalletService.loadPayPalSdk).toHaveBeenCalledWith(
            expect.objectContaining({
                initializationData: expect.objectContaining({ clientId: 'test-client-id' }),
            }),
            'USD',
            false,
        );
    });

    it('renders venmo button with VENMO funding source', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        expect(buttonOptions.fundingSource).toEqual(paypalSdk.FUNDING.VENMO);
        expect(paypalButtons.render).toHaveBeenCalledWith(`#${defaultContainerId}`);
    });

    it('applies cart button styles from parsed initializationData', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsVenmoWalletService.getValidButtonStyle).toHaveBeenCalledWith(
            defaultButtonStyle,
        );
    });

    it('creates payment order intent with correct provider ID', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.createOrder();

        expect(bigCommercePaymentsVenmoWalletService.createPaymentOrderIntent).toHaveBeenCalledWith(
            defaultProviderId,
            defaultCartId,
        );
    });

    it('proxies tokenization payment on approve', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();
        const buttonsSpy = jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        const buttonOptions = buttonsSpy.mock.calls[0][0];

        await buttonOptions.onApprove?.({ orderID: defaultOrderId }, { order: { get: jest.fn() } });

        expect(bigCommercePaymentsVenmoWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
            defaultCartId,
            defaultProviderId,
            'bigcommerce_payments_venmo',
            defaultOrderId,
        );
    });

    it('removes element when button is not eligible', async () => {
        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(false),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(initializationOptions);

        expect(bigCommercePaymentsVenmoWalletService.removeElement).toHaveBeenCalledWith(
            defaultContainerId,
        );
    });

    it('uses fallback style when cartButtonStyles is not provided', async () => {
        const optionsWithoutButtonStyle: CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsVenmoWalletInitializeOptions = {
            methodId: defaultMethodId,
            containerId: defaultContainerId,
            bigcommerce_paymentsvenmo: {
                cartId: defaultCartId,
                currency: { code: 'USD' },
                initializationData: btoa(
                    JSON.stringify({ initializationData: { clientId: 'test-client-id' } }),
                ),
                clientToken: 'test-client-token',
            },
        };

        const paypalButtons = {
            close: jest.fn(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn(),
        };
        const paypalSdk = bigCommercePaymentsVenmoWalletService.getPayPalSdkOrThrow();

        jest.spyOn(paypalSdk, 'Buttons').mockReturnValue(paypalButtons);

        await strategy.initialize(optionsWithoutButtonStyle);

        expect(bigCommercePaymentsVenmoWalletService.getValidButtonStyle).toHaveBeenCalledWith(
            undefined,
        );
    });

    it('resolves on deinitialize', async () => {
        await expect(strategy.deinitialize()).resolves.toBeUndefined();
    });
});
