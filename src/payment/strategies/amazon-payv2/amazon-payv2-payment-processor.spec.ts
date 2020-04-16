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
import { getAmazonPayv2, getPaymentMethodsState } from '../../payment-methods.mock';

import { AmazonPayv2Client } from './amazon-payv2';
import AmazonPayv2PaymentProcessor from './amazon-payv2-payment-processor';
import AmazonPayv2ScriptLoader from './amazon-payv2-script-loader';
import { getAmazonPayv2ButtonParamsMock, getAmazonPayv2SDKMock } from './amazon-payv2.mock';

describe('AmazonPayv2PaymentProcessor', () => {
    let processor: AmazonPayv2PaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let amazonPayv2ScriptLoader: AmazonPayv2ScriptLoader;
    let store: CheckoutStore;
    let clientMock: AmazonPayv2Client;
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
        amazonPayv2ScriptLoader = new AmazonPayv2ScriptLoader(scriptLoader);
        requestSender = createRequestSender();

        processor =  new AmazonPayv2PaymentProcessor(
            store,
            paymentMethodActionCreator,
            amazonPayv2ScriptLoader
        );
    });

    describe('#initialize', () => {
        beforeEach(() => {
            const amazonPayv2SDK = getAmazonPayv2SDKMock();
            clientMock = {
                renderButton: jest.fn(() => Promise.resolve(new HTMLElement())),
                bindChangeAction: () => null,
            };
            amazonPayv2SDK.Pay.renderButton = jest.fn(() => clientMock);

            jest.spyOn(amazonPayv2ScriptLoader, 'load').mockReturnValue(Promise.resolve(amazonPayv2SDK));
        });

        it('creates an instance of AmazonPayv2PaymentProcessor', () => {
            expect(processor).toBeInstanceOf(AmazonPayv2PaymentProcessor);
        });

        it('initializes processor successfully', async () => {
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAmazonPayv2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));

            await processor.initialize('amazonpay');

            expect(amazonPayv2ScriptLoader.load).toHaveBeenCalled();
        });

        it('fails to initialize processor without paymentMethod', async () => {
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(undefined);
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));

            await expect(processor.initialize('amazonpay') ).rejects.toThrow(MissingDataError);
        });
    });

    describe('#createButton', () => {
        beforeEach(() => {
            const amazonPayv2SDK = getAmazonPayv2SDKMock();
            clientMock = {
                renderButton: jest.fn(() => Promise.resolve()),
                bindChangeAction: () => null,
            };

            amazonPayv2SDK.Pay = clientMock;

            jest.spyOn(amazonPayv2ScriptLoader, 'load').mockReturnValue(Promise.resolve(amazonPayv2SDK));
            jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(getAmazonPayv2());
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(Promise.resolve(store.getState()));
        });

        it('creates the html button element', async () => {
            await processor.initialize('amazonpay');
            await processor.createButton('container', getAmazonPayv2ButtonParamsMock());

            expect(clientMock.renderButton).toHaveBeenCalled();
        });

        it('throws an error when amazonPayv2SDK is not initialized', async () => {

            await expect(() => {processor.createButton('container', getAmazonPayv2ButtonParamsMock()); } ).toThrow(NotInitializedError);
        });
    });
});
