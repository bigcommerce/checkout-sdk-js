import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import { MissingDataError, NotInitializedError } from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getAmazonPayV2, getPaymentMethodsState } from '../../payment-methods.mock';

import { AmazonPayV2Client } from './amazon-pay-v2';
import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import { getAmazonPayV2ButtonParamsMock, getAmazonPayV2SDKMock } from './amazon-pay-v2.mock';

describe('AmazonPayV2PaymentProcessor', () => {
    let processor: AmazonPayV2PaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let amazonPayV2ScriptLoader: AmazonPayV2ScriptLoader;
    let store: CheckoutStore;
    let clientMock: AmazonPayV2Client;
    let requestSender: RequestSender;

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        paymentMethodActionCreator = new PaymentMethodActionCreator(new PaymentMethodRequestSender(requestSender));
        amazonPayV2ScriptLoader = new AmazonPayV2ScriptLoader(scriptLoader);
        requestSender = createRequestSender();

        processor =  new AmazonPayV2PaymentProcessor(
            store,
            paymentMethodActionCreator,
            amazonPayV2ScriptLoader
        );
    });

    describe('#initialize', () => {
        beforeEach(() => {
            const amazonPayV2SDK = getAmazonPayV2SDKMock();
            clientMock = {
                renderButton: jest.fn(() => Promise.resolve(new HTMLElement())),
                bindChangeAction: () => null,
                signout: () => null,
            };
            amazonPayV2SDK.Pay.renderButton = jest.fn(() => clientMock);

            jest.spyOn(amazonPayV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(amazonPayV2SDK));
        });

        it('creates an instance of AmazonPayV2PaymentProcessor', () => {
            expect(processor).toBeInstanceOf(AmazonPayV2PaymentProcessor);
        });

        it('initializes processor successfully', async () => {
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAmazonPayV2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));

            await processor.initialize('amazonpay');

            expect(amazonPayV2ScriptLoader.load).toHaveBeenCalled();
        });

        it('fails to initialize processor without paymentMethod', async () => {
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));

            await expect(processor.initialize('amazonpay') ).rejects.toThrow(MissingDataError);
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

        beforeEach(() => {
            const amazonPayV2SDK = getAmazonPayV2SDKMock();
            clientMock = {
                renderButton: (jest.fn(() => Promise.resolve())),
                bindChangeAction: jest.fn(),
                signout: () => null,
            };

            amazonPayV2SDK.Pay = clientMock;

            jest.spyOn(amazonPayV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(amazonPayV2SDK));
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAmazonPayV2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('bind the button successfully', async () => {
            const bindOptions = {
                amazonCheckoutSessionId: sessionId,
                changeAction: 'changePayment',
            };

            await processor.initialize('amazonMaxo');

            processor.bindButton(buttonName, sessionId, 'changePayment');

            expect(clientMock.bindChangeAction).toHaveBeenCalledWith(`#${buttonName}`, bindOptions);
        });

        it('does not bind the button if the processor is not initialized previously', () => {
            expect(() => processor.bindButton(buttonName, sessionId, 'changePayment')).toThrow(NotInitializedError);
        });
    });

    describe('#signout', () => {
        const methodId = 'amazonmaxo';

        beforeEach(() => {
            const amazonMaxoSDK = getAmazonPayV2SDKMock();
            clientMock = {
                renderButton: (jest.fn(() => Promise.resolve())),
                bindChangeAction: jest.fn(),
                signout:  jest.fn(),
            };

            amazonMaxoSDK.Pay = clientMock;

            jest.spyOn(amazonPayV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(amazonMaxoSDK));
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAmazonPayV2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('loads the SDK when the SDK is not loaded', async () => {
            await processor.signout(methodId);

            expect(amazonPayV2ScriptLoader.load).toHaveBeenCalled();
        });

        it('signouts succesfully when the SDK is previouly loaded', async () => {
            await processor.initialize('amazonMaxo');

            await processor.signout(methodId);

            expect(clientMock.signout).toHaveBeenCalled();
        });
    });

    describe('#createButton', () => {
        beforeEach(() => {
            const amazonPayV2SDK = getAmazonPayV2SDKMock();
            clientMock = {
                renderButton: jest.fn(() => Promise.resolve()),
                bindChangeAction: () => null,
                signout: () => null,
            };

            amazonPayV2SDK.Pay = clientMock;

            jest.spyOn(amazonPayV2ScriptLoader, 'load').mockReturnValue(Promise.resolve(amazonPayV2SDK));
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAmazonPayV2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('creates the html button element', async () => {
            await processor.initialize('amazonpay');
            await processor.createButton('container', getAmazonPayV2ButtonParamsMock());

            expect(clientMock.renderButton).toHaveBeenCalled();
        });

        it('throws an error when amazonPayV2SDK is not initialized', async () => {

            await expect(() => {processor.createButton('container', getAmazonPayV2ButtonParamsMock()); } ).toThrow(NotInitializedError);
        });
    });
});
