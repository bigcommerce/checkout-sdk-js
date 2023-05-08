import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import {
    CheckoutButtonInitializeOptions,
    InvalidArgumentError,
    NotImplementedError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BoltCheckout, BoltHostWindow, StyleButtonShape, StyleButtonSize } from './bolt';
import BoltButtonInitializeOptions from './bolt-button-initialize-options';
import BoltButtonStrategy from './bolt-button-strategy';
import BoltScriptLoader from './bolt-script-loader';
import { getBolt, getBoltClientScriptMock } from './bolt.mock';

describe('BoltButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;
    let scriptLoader: ScriptLoader;
    let paymentMethod: PaymentMethod;
    let boltScriptLoader: BoltScriptLoader;
    let boltButtonElement: HTMLDivElement;
    let boltClient: BoltCheckout;
    let strategy: BoltButtonStrategy;

    const defaultMethodId = 'bolt';
    const defaultButtonContainerId = 'button-button-mock-id';
    const boltOptions: BoltButtonInitializeOptions = {
        buyNowInitializeOptions: {
            storefrontApiToken: 'storefrontApiToken',
            getBuyNowCartRequestBody: jest.fn(),
        },
        style: {
            size: StyleButtonSize.Medium,
            shape: StyleButtonShape.Rect,
        },
    };
    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: defaultMethodId,
        containerId: defaultButtonContainerId,
        bolt: boltOptions,
    };

    beforeEach(() => {
        boltButtonElement = document.createElement('div');
        boltButtonElement.id = defaultButtonContainerId;
        document.body.appendChild(boltButtonElement);

        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
        scriptLoader = createScriptLoader();
        boltScriptLoader = new BoltScriptLoader(scriptLoader);
        boltClient = getBoltClientScriptMock(true);
        paymentMethod = getBolt();

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );
        jest.spyOn(boltScriptLoader, 'loadBoltClient').mockResolvedValue(boltClient);

        strategy = new BoltButtonStrategy(paymentIntegrationService, boltScriptLoader);
    });

    afterEach(() => {
        jest.clearAllMocks();

        delete (window as BoltHostWindow).BoltConnect;

        if (document.getElementById(defaultButtonContainerId)) {
            document.body.removeChild(boltButtonElement);
        }
    });

    it('creates an instance of the Bolt checkout button strategy', () => {
        expect(strategy).toBeInstanceOf(BoltButtonStrategy);
    });

    describe('#initialize()', () => {
        it('throws error if methodId is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
            } as CheckoutButtonInitializeOptions;

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });

        it('throws an error if containerId is not provided', async () => {
            const options = {
                methodId: defaultMethodId,
            } as CheckoutButtonInitializeOptions;

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });

        it('throws an error if it is not buy now flow', async () => {
            const options = {
                ...initializationOptions,
                bolt: {},
            };

            await expect(strategy.initialize(options)).rejects.toThrow(NotImplementedError);
        });

        it('throws an error if storefrontApiToken is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: defaultMethodId,
                bolt: {
                    buyNowInitializeOptions: {},
                },
            } as CheckoutButtonInitializeOptions;

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });

        it('throws an error if bolt is not provided', async () => {
            const options = {
                containerId: defaultButtonContainerId,
                methodId: defaultMethodId,
                storefrontApiToken: '123',
            } as CheckoutButtonInitializeOptions;

            await expect(strategy.initialize(options)).rejects.toThrow(InvalidArgumentError);
        });

        it('loads bolt client script', async () => {
            await strategy.initialize(initializationOptions);

            expect(boltScriptLoader.loadBoltClient).toHaveBeenCalledWith(
                'publishableKey',
                true,
                undefined,
                'BigCommerce',
                'storefrontApiToken',
            );
        });
    });

    describe('#renderButton', () => {
        it('skip button render if BoltConnect do not exist', async () => {
            (window as BoltHostWindow).BoltConnect = undefined;

            await strategy.initialize(initializationOptions);

            expect(document.getElementById('product-page-checkout-wrapper')).toBeNull();
        });

        it('skip button render if setupProductPageCheckout do not exist', async () => {
            (window as BoltHostWindow).BoltConnect = {};

            await strategy.initialize(initializationOptions);

            expect(document.getElementById('product-page-checkout-wrapper')).toBeNull();
        });

        it('render default bolt smart payment button', async () => {
            (window as BoltHostWindow).BoltConnect = {
                setupProductPageCheckout: jest.fn(),
            };

            await strategy.initialize(initializationOptions);

            const objectElement = document.getElementsByClassName(
                'bolt-product-checkout-button',
            )[0];
            const objectData = objectElement.getAttribute('data');

            expect(objectElement).not.toBeNull();
            expect(objectData).toContain('publishable_key=publishableKey');
            expect(objectData).toContain('variant=ppc');
            expect(objectData).toContain('height=40');
            expect(objectData).toContain('border_radius=4');
        });

        it('render small bolt smart payment button with shape pill', async () => {
            (window as BoltHostWindow).BoltConnect = {
                setupProductPageCheckout: jest.fn(),
            };

            boltOptions.style = {
                size: StyleButtonSize.Small,
                shape: StyleButtonShape.Pill,
            };

            await strategy.initialize(initializationOptions);

            const objectElement = document.getElementsByClassName(
                'bolt-product-checkout-button',
            )[0];
            const objectData = objectElement.getAttribute('data');

            expect(objectData).toContain('height=25');
            expect(objectData).toContain('border_radius=13');
        });

        it('render large bolt smart payment button', async () => {
            (window as BoltHostWindow).BoltConnect = {
                setupProductPageCheckout: jest.fn(),
            };

            boltOptions.style = {
                size: StyleButtonSize.Large,
                shape: StyleButtonShape.Rect,
            };

            await strategy.initialize(initializationOptions);

            const objectElement = document.getElementsByClassName(
                'bolt-product-checkout-button',
            )[0];
            const objectData = objectElement.getAttribute('data');

            expect(objectData).toContain('height=45');
            expect(objectData).toContain('border_radius=4');
        });

        it('render bolt smart payment button without styles', async () => {
            (window as BoltHostWindow).BoltConnect = {
                setupProductPageCheckout: jest.fn(),
            };

            boltOptions.style = undefined;

            await strategy.initialize(initializationOptions);

            const objectElement = document.getElementsByClassName(
                'bolt-product-checkout-button',
            )[0];
            const objectData = objectElement.getAttribute('data');

            expect(objectData).not.toContain('height');
            expect(objectData).not.toContain('border_radius');
        });
    });
});
