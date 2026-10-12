import { createScriptLoader } from '@bigcommerce/script-loader';

import {
    NotInitializedError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AmazonPayV2Button,
    AmazonPayV2ButtonParameters,
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2NewButtonParams,
    AmazonPayV2SDK,
} from './amazon-pay-v2';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import BaseAmazonPayV2PaymentProcessor from './base-amazon-pay-v2-payment-processor';
import {
    getAmazonPayV2,
    getAmazonPayV2ButtonParamsMock,
    getAmazonPayV2Ph4ButtonParamsMock,
    getAmazonPayV2SDKMock,
} from './mocks/amazon-pay-v2.mock';

describe('BaseAmazonPayV2PaymentProcessor', () => {
    let amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader;
    let processor: BaseAmazonPayV2PaymentProcessor;
    let amazonPayV2SDKMock: AmazonPayV2SDK;
    let amazonPayV2Mock: PaymentMethod<AmazonPayV2InitializeOptions>;

    beforeEach(() => {
        amazonPayV2ScriptLoader = new AmazonPayV2ScriptLoader(createScriptLoader());

        processor = new BaseAmazonPayV2PaymentProcessor(amazonPayV2ScriptLoader);

        amazonPayV2SDKMock = getAmazonPayV2SDKMock();

        jest.spyOn(amazonPayV2ScriptLoader, 'load').mockResolvedValue(amazonPayV2SDKMock);

        jest.spyOn(document, 'createElement');

        amazonPayV2Mock = getAmazonPayV2();
    });

    afterEach(() => {
        jest.spyOn(document, 'createElement').mockRestore();
    });

    it('creates an instance of BaseAmazonPayV2PaymentProcessor', () => {
        expect(processor).toBeInstanceOf(BaseAmazonPayV2PaymentProcessor);
    });

    describe('#initialize', () => {
        it('initializes processor successfully', async () => {
            await processor.initialize(amazonPayV2Mock);

            expect(amazonPayV2ScriptLoader.load).toHaveBeenCalledWith(amazonPayV2Mock);
            expect(document.createElement).toHaveBeenCalledTimes(1);
        });

        it('should reuse already created container', async () => {
            await processor.initialize(amazonPayV2Mock);
            await processor.initialize(amazonPayV2Mock);

            expect(document.createElement).toHaveBeenCalledTimes(1);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor successfully', async () => {
            await processor.initialize(amazonPayV2Mock);

            const deinitialize = processor.deinitialize();

            await expect(deinitialize).resolves.toBeUndefined();
        });

        it('should remove the button parent container from the DOM', async () => {
            const grandparentContainer = document.createElement('div');
            const parentContainer = grandparentContainer.appendChild(document.createElement('div'));

            jest.spyOn(document, 'createElement').mockReturnValueOnce(parentContainer);

            await processor.initialize(amazonPayV2Mock);
            await processor.deinitialize();

            expect(grandparentContainer.contains(parentContainer)).toBe(false);
        });
    });

    describe('#createButton', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: AmazonPayV2ButtonParameters;

        beforeEach(() => {
            amazonPayV2ButtonParams = getAmazonPayV2ButtonParamsMock();
        });

        it('should render the Amazon Pay button to an HTML container element', async () => {
            await processor.initialize(amazonPayV2Mock);

            processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(
                `#${containerId}`,
                amazonPayV2ButtonParams,
            );
        });

        it('throws an error when amazonPayV2SDK is not initialized', () => {
            const createButton = () => processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(createButton).toThrow(NotInitializedError);
        });
    });

    describe('#prepareCheckout', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: Required<AmazonPayV2NewButtonParams>;
        let createCheckoutSessionConfig: Required<AmazonPayV2CheckoutSessionConfig>;

        beforeEach(() => {
            amazonPayV2ButtonParams =
                getAmazonPayV2Ph4ButtonParamsMock() as Required<AmazonPayV2NewButtonParams>;

            const { publicKeyId, createCheckoutSessionConfig: signedPayload } =
                amazonPayV2ButtonParams;

            createCheckoutSessionConfig = {
                publicKeyId,
                ...signedPayload,
            };
        });

        describe('should initiate checkout successfully:', () => {
            beforeEach(async () => {
                await processor.initialize(amazonPayV2Mock);
                processor.createButton(containerId, amazonPayV2ButtonParams);
            });

            test('onClick is called to define custom actions', () => {
                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;

                expect(amazonPayV2Button.onClick).toHaveBeenCalledTimes(1);
            });

            test('config does not include publicKeyId because it has an environment prefix', () => {
                const expectedConfig = {
                    createCheckoutSessionConfig:
                        amazonPayV2ButtonParams.createCheckoutSessionConfig,
                };

                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;
                // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });

            test('config includes publicKeyId because it does not have an environment prefix', () => {
                const expectedConfig = {
                    createCheckoutSessionConfig,
                };

                createCheckoutSessionConfig.publicKeyId = 'foo';
                processor.prepareCheckout(createCheckoutSessionConfig);

                const amazonPayV2Button: AmazonPayV2Button = (
                    amazonPayV2SDKMock.Pay.renderButton as jest.Mock
                ).mock.results[0].value;
                // eslint-disable-next-line  @typescript-eslint/no-unsafe-member-access
                const customActions = (amazonPayV2Button.onClick as jest.Mock).mock.calls[0][0];

                customActions();

                expect(amazonPayV2Button.initCheckout).toHaveBeenNthCalledWith(1, expectedConfig);
            });
        });

        it('throws an error when amazonPayV2Button is not initialized', () => {
            const prepareCheckout = () => processor.prepareCheckout(createCheckoutSessionConfig);

            expect(prepareCheckout).toThrow(NotInitializedError);
        });
    });
});
