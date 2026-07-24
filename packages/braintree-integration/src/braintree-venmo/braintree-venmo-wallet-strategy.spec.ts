import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeIntegrationService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    BraintreeVenmoCheckout,
    BraintreeVenmoWalletService,
    getBraintree,
    getTokenizePayload,
    getVenmoCheckoutMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import BraintreeVenmoWalletInitializeOptions, {
    WithBraintreeVenmoWalletInitializeOptions,
} from './braintree-venmo-wallet-initialize-options';
import BraintreeVenmoWalletStrategy from './braintree-venmo-wallet-strategy';

describe('BraintreeVenmoWalletStrategy', () => {
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let braintreeVenmoCheckoutMock: BraintreeVenmoCheckout;
    let braintreeVenmoWalletService: BraintreeVenmoWalletService;
    let paymentIntegrationService: PaymentIntegrationService;
    let strategy: BraintreeVenmoWalletStrategy;
    let venmoButtonElement: HTMLDivElement;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const defaultButtonContainerId = 'braintree-venmo-wallet-mock-id';

    const paymentMethod: PaymentMethod = {
        ...getBraintree(),
        config: {
            ...getBraintree().config,
            testMode: true,
        },
        initializationData: {
            ...getBraintree().initializationData,
        },
    };

    const encodedInitializationData = btoa(JSON.stringify(paymentMethod));

    const braintreeVenmoWalletOptions: BraintreeVenmoWalletInitializeOptions = {
        cartId: 'cart-123',
        initializationData: encodedInitializationData,
        clientToken: 'clientToken',
        style: { height: 45 },
        onAuthorizeError: jest.fn(),
        onError: jest.fn(),
        onEligibilityFailure: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithBraintreeVenmoWalletInitializeOptions = {
        methodId: 'braintreevenmo',
        containerId: defaultButtonContainerId,
        braintreevenmo: braintreeVenmoWalletOptions,
    };

    beforeEach(() => {
        braintreeVenmoCheckoutMock = getVenmoCheckoutMock();

        venmoButtonElement = document.createElement('div');
        venmoButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(venmoButtonElement);

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        walletButtonIntegrationService = createWalletButtonIntegrationService('/graphql');
        braintreeVenmoWalletService = new BraintreeVenmoWalletService(
            walletButtonIntegrationService,
            braintreeIntegrationService,
        );

        strategy = new BraintreeVenmoWalletStrategy(braintreeVenmoWalletService);

        jest.spyOn(braintreeVenmoWalletService, 'initialize').mockImplementation(jest.fn());
        jest.spyOn(braintreeVenmoWalletService, 'teardown').mockResolvedValue();
        jest.spyOn(braintreeVenmoWalletService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(braintreeVenmoWalletService, 'loadVenmoCheckout').mockResolvedValue(
            braintreeVenmoCheckoutMock,
        );
        jest.spyOn(braintreeVenmoWalletService, 'proxyTokenizationPayment').mockResolvedValue(
            getTokenizePayload(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(venmoButtonElement);
        }
    });

    it('creates an instance of the braintree venmo wallet strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreeVenmoWalletStrategy);
    });

    describe('#initialize()', () => {
        it('throws an error if methodId is not provided', async () => {
            await expect(
                strategy.initialize({} as CheckoutButtonInitializeOptions),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if containerId is not provided', async () => {
            await expect(
                strategy.initialize({
                    methodId: 'braintreevenmo',
                    containerId: '',
                    braintreevenmo: braintreeVenmoWalletOptions,
                } as CheckoutButtonInitializeOptions),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if braintreevenmo is not provided', async () => {
            await expect(
                strategy.initialize({
                    methodId: 'braintreevenmo',
                    containerId: defaultButtonContainerId,
                } as CheckoutButtonInitializeOptions),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if initialization data cannot be parsed', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreevenmo: {
                        ...braintreeVenmoWalletOptions,
                        initializationData: 'not-a-valid-base64-json',
                    },
                }),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if client token is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreevenmo: { ...braintreeVenmoWalletOptions, clientToken: '' },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('throws an error if initialization data is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreevenmo: {
                        ...braintreeVenmoWalletOptions,
                        initializationData: btoa(JSON.stringify({ config: { testMode: true } })),
                    },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('throws an error if config is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreevenmo: {
                        ...braintreeVenmoWalletOptions,
                        initializationData: btoa(
                            JSON.stringify({ initializationData: { intent: 'authorize' } }),
                        ),
                    },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('initializes the braintree venmo wallet service with the client token', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeVenmoWalletService.initialize).toHaveBeenCalledWith('clientToken');
        });

        it('loads the venmo checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeVenmoWalletService.loadVenmoCheckout).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });

        it('renders the venmo button', async () => {
            await strategy.initialize(initializationOptions);

            expect(venmoButtonElement.getAttribute('aria-label')).toBe('Venmo');
            expect(venmoButtonElement.style.cursor).toBe('pointer');
        });

        it('calls onEligibilityFailure when the button container is missing', async () => {
            document.body.removeChild(venmoButtonElement);

            await strategy.initialize(initializationOptions);

            expect(braintreeVenmoWalletService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
            expect(braintreeVenmoWalletOptions.onEligibilityFailure).toHaveBeenCalled();
        });

        it('calls onEligibilityFailure when the browser is not supported', async () => {
            jest.spyOn(braintreeVenmoWalletService, 'loadVenmoCheckout').mockRejectedValue(
                new UnsupportedBrowserError(),
            );

            await strategy.initialize(initializationOptions);

            expect(braintreeVenmoWalletOptions.onEligibilityFailure).toHaveBeenCalled();
        });

        it('calls onError when the venmo checkout fails to load', async () => {
            const expectedError = new Error('Unable to load venmo checkout');

            expectedError.name = 'BraintreeError';

            jest.spyOn(braintreeVenmoWalletService, 'loadVenmoCheckout').mockRejectedValue(
                expectedError,
            );

            await strategy.initialize(initializationOptions);

            expect(braintreeVenmoWalletOptions.onError).toHaveBeenCalledWith(expectedError);
        });

        it('tokenizes the payment through the wallet service when the button is clicked', async () => {
            await strategy.initialize(initializationOptions);

            venmoButtonElement.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreeVenmoWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
                'braintreevenmo',
                'cart-123',
            );
        });

        it('calls onAuthorizeError when tokenization fails', async () => {
            const expectedError = new Error('Unable to tokenize');

            expectedError.name = 'BraintreeError';

            jest.spyOn(braintreeVenmoWalletService, 'proxyTokenizationPayment').mockRejectedValue(
                expectedError,
            );

            await strategy.initialize(initializationOptions);

            venmoButtonElement.click();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreeVenmoWalletOptions.onAuthorizeError).toHaveBeenCalledWith(
                expectedError,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('tears down the wallet service on deinitialize', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(braintreeVenmoWalletService.teardown).toHaveBeenCalled();
        });
    });
});
