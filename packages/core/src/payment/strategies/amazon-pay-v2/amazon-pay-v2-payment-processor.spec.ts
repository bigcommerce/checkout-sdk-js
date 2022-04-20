import { createScriptLoader } from '@bigcommerce/script-loader';

import { NotInitializedError } from '../../../common/error/errors';
import { getAmazonPayV2 } from '../../payment-methods.mock';

import { AmazonPayV2ButtonParams, AmazonPayV2SDK } from './amazon-pay-v2';
import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import { getAmazonPayV2ButtonParamsMock, getAmazonPayV2SDKMock } from './amazon-pay-v2.mock';

describe('AmazonPayV2PaymentProcessor', () => {
    let amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader;
    let processor: AmazonPayV2PaymentProcessor;
    let amazonPayV2SDKMock: AmazonPayV2SDK;

    beforeEach(() => {
        amazonPayV2ScriptLoader = new AmazonPayV2ScriptLoader(createScriptLoader());
        processor = new AmazonPayV2PaymentProcessor(
            amazonPayV2ScriptLoader
        );
        amazonPayV2SDKMock = getAmazonPayV2SDKMock();

        jest.spyOn(amazonPayV2ScriptLoader, 'load').mockResolvedValue(amazonPayV2SDKMock);
    });

    describe('#initialize', () => {
        it('creates an instance of AmazonPayV2PaymentProcessor', () => {
            expect(processor).toBeInstanceOf(AmazonPayV2PaymentProcessor);
        });

        it('initializes processor successfully', async () => {
            await processor.initialize(getAmazonPayV2());

            expect(amazonPayV2ScriptLoader.load).toHaveBeenCalled();
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor successfully', () => {
            expect(processor.deinitialize()).toBeTruthy();
        });
    });

    describe('#bindButton', () => {
        const sessionId = 'ACB123';
        const buttonName = 'bindableButton';

        it('bind the button successfully', async () => {
            const bindOptions = {
                amazonCheckoutSessionId: sessionId,
                changeAction: 'changePayment',
            };

            await processor.initialize(getAmazonPayV2());

            processor.bindButton(buttonName, sessionId, 'changePayment');

            expect(amazonPayV2SDKMock.Pay.bindChangeAction).toHaveBeenCalledWith(`#${buttonName}`, bindOptions);
        });

        it('does not bind the button if the processor is not initialized previously', () => {
            expect(() => processor.bindButton(buttonName, sessionId, 'changePayment')).toThrow(NotInitializedError);
        });
    });

    describe('#signOut', () => {
        it('signs out succesfully', async () => {
            await processor.initialize(getAmazonPayV2());
            await processor.signout();

            expect(amazonPayV2SDKMock.Pay.signout).toHaveBeenCalled();
        });
    });

    describe('#createButton', () => {
        const containerId = 'amazonpay-container';
        let amazonPayV2ButtonParams: AmazonPayV2ButtonParams;

        beforeEach(() => {
            amazonPayV2ButtonParams = getAmazonPayV2ButtonParamsMock();
        });

        it('creates the html button element', async () => {
            await processor.initialize(getAmazonPayV2());
            processor.createButton(containerId, amazonPayV2ButtonParams);

            expect(amazonPayV2SDKMock.Pay.renderButton).toHaveBeenCalledWith(containerId, amazonPayV2ButtonParams);
        });

        it('throws an error when amazonPayV2SDK is not initialized', () => {
            expect(() => processor.createButton(containerId, amazonPayV2ButtonParams)).toThrow(NotInitializedError);
        });
    });
});
