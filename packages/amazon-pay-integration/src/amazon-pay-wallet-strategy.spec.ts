import {
    AmazonPayV2ButtonColor,
    AmazonPayV2LedgerCurrency,
    AmazonPayWalletService,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithAmazonPayWalletInitializeOptions } from './amazon-pay-wallet-initialize-options';
import AmazonPayWalletStrategy from './amazon-pay-wallet-strategy';

describe('AmazonPayWalletStrategy', () => {
    let strategy: AmazonPayWalletStrategy;
    let amazonPayWalletService: jest.Mocked<AmazonPayWalletService>;

    const defaultContainerId = 'amazon-pay-wallet-button';
    const defaultMethodId = 'amazonpay';
    const defaultCartId = 'abc123';

    const signedConfig = {
        payloadJSON: '{"webCheckoutDetails":{}}',
        signature: 'signature',
        publicKeyId: 'SANDBOX-PUBLIC-KEY',
    };

    // A serialized PaymentMethod<AmazonPayV2InitializeOptions> as the host page would
    // hand it to the headless button (Base64-encoded, no checkout session required).
    // initializationData.createCheckoutSessionConfig is the server-signed payload
    // sourced upstream from paymentWalletWithInitializationData.
    const paymentMethod = {
        id: defaultMethodId,
        config: { merchantId: 'MERCHANT_ID', testMode: true },
        initializationData: {
            ledgerCurrency: AmazonPayV2LedgerCurrency.USD,
            region: 'us',
            publicKeyId: 'SANDBOX-PUBLIC-KEY',
            createCheckoutSessionConfig: signedConfig,
        },
    };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithAmazonPayWalletInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultContainerId,
        amazonpayamazonpay: {
            cartId: defaultCartId,
            currency: { code: 'USD' },
            initializationData: btoa(JSON.stringify(paymentMethod)),
            estimatedAmount: '100',
            buttonColor: AmazonPayV2ButtonColor.Gold,
        },
    };

    let onClickCallback: () => void | Promise<void>;
    const amazonPayButton = {
        onClick: jest.fn((cb: () => void | Promise<void>) => {
            onClickCallback = cb;
        }),
        initCheckout: jest.fn(),
    };
    const amazonPaySdk = {
        Pay: {
            renderButton: jest.fn().mockReturnValue(amazonPayButton),
        },
    };

    beforeEach(() => {
        amazonPayWalletService = {
            loadAmazonPaySdk: jest.fn().mockResolvedValue(amazonPaySdk),
            getAmazonPaySdkOrThrow: jest.fn().mockReturnValue(amazonPaySdk),
            getCheckoutSessionConfigOrThrow: jest.fn().mockReturnValue(signedConfig),
            getValidButtonColor: jest.fn().mockReturnValue(AmazonPayV2ButtonColor.Gold),
            removeElement: jest.fn(),
        } as unknown as jest.Mocked<AmazonPayWalletService>;

        strategy = new AmazonPayWalletStrategy(amazonPayWalletService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws when methodId is not provided', async () => {
        const options = {
            ...initializationOptions,
            methodId: undefined,
        } as unknown as CheckoutButtonInitializeOptions & WithAmazonPayWalletInitializeOptions;

        await expect(strategy.initialize(options)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            ),
        );
    });

    it('throws when containerId is not provided', async () => {
        const options = {
            ...initializationOptions,
            containerId: undefined,
        } as unknown as CheckoutButtonInitializeOptions & WithAmazonPayWalletInitializeOptions;

        await expect(strategy.initialize(options)).rejects.toEqual(
            new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            ),
        );
    });

    it('throws when payment method initializationData cannot be parsed', async () => {
        const options = {
            ...initializationOptions,
            amazonpayamazonpay: {
                ...initializationOptions.amazonpayamazonpay!,
                initializationData: '%%%invalid-base64%%%',
            },
        };

        await expect(strategy.initialize(options)).rejects.toEqual(
            new InvalidArgumentError("Failed to parse payment method 'initializationData'."),
        );
    });

    it('loads the SDK and renders the Amazon Pay button without a checkout session', async () => {
        await strategy.initialize(initializationOptions);

        expect(amazonPayWalletService.loadAmazonPaySdk).toHaveBeenCalled();
        expect(amazonPaySdk.Pay.renderButton).toHaveBeenCalledWith(
            `#${defaultContainerId}`,
            expect.objectContaining({
                merchantId: 'MERCHANT_ID',
                ledgerCurrency: AmazonPayV2LedgerCurrency.USD,
                placement: 'Cart',
                publicKeyId: 'SANDBOX-PUBLIC-KEY',
                sandbox: true,
            }),
        );
    });

    it('hides the button when required payment method data is missing', async () => {
        const options = {
            ...initializationOptions,
            amazonpayamazonpay: {
                ...initializationOptions.amazonpayamazonpay!,
                initializationData: btoa(JSON.stringify({ config: {}, initializationData: {} })),
            },
        };

        await strategy.initialize(options);

        expect(amazonPayWalletService.removeElement).toHaveBeenCalledWith(defaultContainerId);
        expect(amazonPaySdk.Pay.renderButton).not.toHaveBeenCalled();
    });

    it('initiates checkout with the signed config on click (no BC create-order call)', async () => {
        await strategy.initialize(initializationOptions);

        await onClickCallback();

        expect(amazonPayWalletService.getCheckoutSessionConfigOrThrow).toHaveBeenCalled();
        expect(amazonPayButton.initCheckout).toHaveBeenCalledWith(
            expect.objectContaining({
                createCheckoutSessionConfig: signedConfig,
                productType: 'PayAndShip',
                estimatedOrderAmount: { amount: '100', currencyCode: 'USD' },
            }),
        );
    });

    it('deinitializes without error', async () => {
        await expect(strategy.deinitialize()).resolves.toBeUndefined();
    });
});
