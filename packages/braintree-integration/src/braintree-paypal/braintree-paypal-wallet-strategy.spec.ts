import { getScriptLoader } from '@bigcommerce/script-loader';
import { EventEmitter } from 'events';

import {
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreePaypalCheckout,
    BraintreePaypalWalletService,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    getBraintree,
    getPaypalCheckoutMock,
    getTokenizePayload,
    PaypalButtonOptions,
    PaypalSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import {
    createWalletButtonIntegrationService,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { getPaypalSDKMock } from '../mocks/paypal.mock';

import BraintreePaypalWalletInitializeOptions, {
    WithBraintreePaypalWalletInitializeOptions,
} from './braintree-paypal-wallet-initialize-options';
import BraintreePaypalWalletStrategy from './braintree-paypal-wallet-strategy';

describe('BraintreePaypalWalletStrategy', () => {
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreePaypalCheckoutMock: BraintreePaypalCheckout;
    let braintreePaypalWalletService: BraintreePaypalWalletService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let eventEmitter: EventEmitter;
    let paymentIntegrationService: PaymentIntegrationService;
    let paypalButtonElement: HTMLDivElement;
    let paypalSdkMock: PaypalSDK;
    let strategy: BraintreePaypalWalletStrategy;
    let walletButtonIntegrationService: WalletButtonIntegrationService;

    const defaultButtonContainerId = 'braintree-paypal-wallet-mock-id';

    const paymentMethod: PaymentMethod = {
        ...getBraintree(),
        config: {
            ...getBraintree().config,
            testMode: true,
        },
        initializationData: {
            ...getBraintree().initializationData,
            intent: 'authorize',
            isCreditEnabled: false,
        },
    };

    const encodedInitializationData = btoa(JSON.stringify(paymentMethod));

    const braintreePaypalWalletOptions: BraintreePaypalWalletInitializeOptions = {
        cartId: 'cart-123',
        amount: 190,
        currency: { code: 'USD' },
        initializationData: encodedInitializationData,
        clientToken: 'clientToken',
        style: { height: 45 },
        onAuthorizeError: jest.fn(),
        onPaymentError: jest.fn(),
        onError: jest.fn(),
        onEligibilityFailure: jest.fn(),
    };

    const initializationOptions: CheckoutButtonInitializeOptions &
        WithBraintreePaypalWalletInitializeOptions = {
        methodId: 'braintreepaypal',
        containerId: defaultButtonContainerId,
        braintreepaypal: braintreePaypalWalletOptions,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        paypalSdkMock = getPaypalSDKMock();
        (window as BraintreeHostWindow).paypal = paypalSdkMock;
        braintreePaypalCheckoutMock = getPaypalCheckoutMock();

        paypalButtonElement = document.createElement('div');
        paypalButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(paypalButtonElement);

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
        braintreePaypalWalletService = new BraintreePaypalWalletService(
            walletButtonIntegrationService,
            braintreeIntegrationService,
        );

        strategy = new BraintreePaypalWalletStrategy(braintreePaypalWalletService, window);

        jest.spyOn(braintreePaypalWalletService, 'initialize').mockImplementation(jest.fn());
        jest.spyOn(braintreePaypalWalletService, 'teardown').mockResolvedValue();
        jest.spyOn(braintreePaypalWalletService, 'removeElement').mockImplementation(jest.fn());
        jest.spyOn(braintreePaypalWalletService, 'loadPaypalCheckout').mockResolvedValue(
            braintreePaypalCheckoutMock,
        );
        jest.spyOn(
            braintreePaypalWalletService,
            'getBraintreePaypalCheckoutOrThrow',
        ).mockReturnValue(braintreePaypalCheckoutMock);
        jest.spyOn(braintreePaypalWalletService, 'proxyTokenizationPayment').mockResolvedValue(
            getTokenizePayload(),
        );

        jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation((options: PaypalButtonOptions) => {
            eventEmitter.on('createOrder', () => {
                if (typeof options.createOrder === 'function') {
                    options.createOrder().catch(() => {});
                }
            });

            eventEmitter.on('approve', () => {
                if (typeof options.onApprove === 'function') {
                    options.onApprove({ payerId: 'PAYER_ID' }).catch(() => {});
                }
            });

            return {
                close: jest.fn(),
                isEligible: jest.fn(() => true),
                render: jest.fn(),
            };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BraintreeHostWindow).paypal;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(paypalButtonElement);
        }
    });

    it('creates an instance of the braintree paypal wallet strategy', () => {
        expect(strategy).toBeInstanceOf(BraintreePaypalWalletStrategy);
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
                    methodId: 'braintreepaypal',
                    containerId: '',
                    braintreepaypal: braintreePaypalWalletOptions,
                } as CheckoutButtonInitializeOptions),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if braintreepaypal is not provided', async () => {
            await expect(
                strategy.initialize({
                    methodId: 'braintreepaypal',
                    containerId: defaultButtonContainerId,
                } as CheckoutButtonInitializeOptions),
            ).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('throws an error if client token is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreepaypal: { ...braintreePaypalWalletOptions, clientToken: '' },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('throws an error if initialization data is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreepaypal: {
                        ...braintreePaypalWalletOptions,
                        initializationData: btoa(JSON.stringify({ config: { testMode: true } })),
                    },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('throws an error if config is missing', async () => {
            await expect(
                strategy.initialize({
                    ...initializationOptions,
                    braintreepaypal: {
                        ...braintreePaypalWalletOptions,
                        initializationData: btoa(
                            JSON.stringify({ initializationData: { intent: 'authorize' } }),
                        ),
                    },
                }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('initializes the braintree paypal wallet service with the client token', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreePaypalWalletService.initialize).toHaveBeenCalledWith('clientToken');
        });

        it('loads paypal checkout with intent sourced from the initialization data', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreePaypalWalletService.loadPaypalCheckout).toHaveBeenCalledWith(
                {
                    currency: 'USD',
                    intent: 'authorize',
                    isCreditEnabled: false,
                    commit: false,
                },
                defaultButtonContainerId,
                braintreePaypalWalletOptions.onError,
            );
        });

        it('renders the Braintree PayPal button', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                env: 'sandbox',
                fundingSource: paypalSdkMock.FUNDING.PAYPAL,
                style: { shape: 'rect', height: 45 },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders the Braintree PayPal PayLater button with the gold color', async () => {
            await strategy.initialize(initializationOptions);

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith({
                env: 'sandbox',
                fundingSource: paypalSdkMock.FUNDING.PAYLATER,
                style: { shape: 'rect', height: 45, color: 'gold' },
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
            });
        });

        it('renders the Braintree PayPal button in production when not in test mode', async () => {
            const productionPaymentMethod = {
                ...paymentMethod,
                config: { ...paymentMethod.config, testMode: false },
            };

            await strategy.initialize({
                ...initializationOptions,
                braintreepaypal: {
                    ...braintreePaypalWalletOptions,
                    initializationData: btoa(JSON.stringify(productionPaymentMethod)),
                },
            });

            expect(paypalSdkMock.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ env: 'production' }),
            );
        });

        it('removes the button container when paypal is not available in window', async () => {
            delete (window as BraintreeHostWindow).paypal;

            await strategy.initialize(initializationOptions);

            expect(braintreePaypalWalletService.removeElement).toHaveBeenCalledWith(
                defaultButtonContainerId,
            );
        });

        it('does not render the button and calls onEligibilityFailure when not eligible', async () => {
            const renderMock = jest.fn();

            jest.spyOn(paypalSdkMock, 'Buttons').mockImplementation(() => ({
                close: jest.fn(),
                isEligible: jest.fn(() => false),
                render: renderMock,
            }));

            await strategy.initialize(initializationOptions);

            expect(braintreePaypalWalletOptions.onEligibilityFailure).toHaveBeenCalled();
            expect(renderMock).not.toHaveBeenCalled();
        });

        it('sets up the PayPal payment flow when createOrder is triggered', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalCheckoutMock.createPayment).toHaveBeenCalledWith({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                amount: 190,
                currency: 'USD',
                offerCredit: false,
                intent: 'authorize',
            });
        });

        it('calls onPaymentError when the payment flow set up fails', async () => {
            const expectedError = new Error('Unable to set up payment flow');

            expectedError.name = 'BraintreeError';

            jest.spyOn(braintreePaypalCheckoutMock, 'createPayment').mockRejectedValue(
                expectedError,
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('createOrder');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalWalletOptions.onPaymentError).toHaveBeenCalledWith(expectedError);
        });

        it('tokenizes the payment through the wallet service when approved', async () => {
            await strategy.initialize(initializationOptions);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalWalletService.proxyTokenizationPayment).toHaveBeenCalledWith(
                { payerId: 'PAYER_ID' },
                'braintreepaypal',
                'cart-123',
            );
        });

        it('calls onAuthorizeError when tokenization fails', async () => {
            const expectedError = new Error('Unable to tokenize');

            expectedError.name = 'BraintreeError';

            jest.spyOn(braintreePaypalWalletService, 'proxyTokenizationPayment').mockRejectedValue(
                expectedError,
            );

            await strategy.initialize(initializationOptions);

            eventEmitter.emit('approve');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(braintreePaypalWalletOptions.onAuthorizeError).toHaveBeenCalledWith(
                expectedError,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('tears down the wallet service on deinitialize', async () => {
            await strategy.initialize(initializationOptions);
            await strategy.deinitialize();

            expect(braintreePaypalWalletService.teardown).toHaveBeenCalled();
        });
    });
});
