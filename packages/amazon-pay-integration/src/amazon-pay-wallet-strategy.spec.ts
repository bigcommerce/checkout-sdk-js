import {
    AmazonPayV2ButtonColor,
    AmazonPayV2LedgerCurrency,
    AmazonPayV2PaymentProcessor,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithAmazonPayWalletInitializeOptions } from './amazon-pay-wallet-initialize-options';
import AmazonPayWalletStrategy from './amazon-pay-wallet-strategy';

describe('AmazonPayWalletStrategy', () => {
    let strategy: AmazonPayWalletStrategy;
    let processor: jest.Mocked<AmazonPayV2PaymentProcessor>;

    const defaultContainerId = 'amazon-pay-wallet-button';
    const defaultMethodId = 'amazonpay';
    const defaultCartId = 'abc123';

    const signedConfig = {
        payloadJSON: '{"webCheckoutDetails":{}}',
        signature: 'signature',
        publicKeyId: 'SANDBOX-PUBLIC-KEY',
    };

    // A serialized PaymentMethod<AmazonPayV2InitializeOptions> as the host page would hand
    // it to the headless button (Base64-encoded, no checkout session required).
    // initializationData.createCheckoutSessionConfig is the server-signed payload sourced
    // upstream from paymentWalletWithInitializationData.
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

    beforeEach(() => {
        processor = {
            initialize: jest.fn().mockResolvedValue(undefined),
            createButton: jest.fn(),
            prepareCheckout: jest.fn(),
            deinitialize: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<AmazonPayV2PaymentProcessor>;

        strategy = new AmazonPayWalletStrategy(processor);
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

    it('loads the SDK and renders the button without a checkout session', async () => {
        await strategy.initialize(initializationOptions);

        expect(processor.initialize).toHaveBeenCalled();
        expect(processor.createButton).toHaveBeenCalledWith(
            defaultContainerId,
            expect.objectContaining({
                merchantId: 'MERCHANT_ID',
                ledgerCurrency: AmazonPayV2LedgerCurrency.USD,
                placement: 'Cart',
                publicKeyId: 'SANDBOX-PUBLIC-KEY',
                estimatedOrderAmount: { amount: '100', currencyCode: 'USD' },
            }),
        );
    });

    it('binds the decoupled checkout initiation with the signed config', async () => {
        await strategy.initialize(initializationOptions);

        expect(processor.prepareCheckout).toHaveBeenCalledWith(signedConfig);
    });

    it('hides the button when required payment method data is missing', async () => {
        const container = document.createElement('div');

        container.id = defaultContainerId;
        document.body.appendChild(container);

        const options = {
            ...initializationOptions,
            amazonpayamazonpay: {
                ...initializationOptions.amazonpayamazonpay!,
                initializationData: btoa(JSON.stringify({ config: {}, initializationData: {} })),
            },
        };

        await strategy.initialize(options);

        expect(processor.createButton).not.toHaveBeenCalled();
        expect(container.style.display).toBe('none');

        document.body.removeChild(container);
    });

    it('deinitializes via the processor', async () => {
        await strategy.deinitialize();

        expect(processor.deinitialize).toHaveBeenCalled();
    });
});
