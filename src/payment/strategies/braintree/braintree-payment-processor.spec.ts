import { omit } from 'lodash';

import { getBillingAddress } from '../../../billing/internal-billing-addresses.mock';
import { getBraintree } from '../../../payment/payment-methods.mock';
import { PaymentMethodCancelledError } from '../../errors';
import { TokenizedCreditCard } from '../../payment';

import BraintreePaymentProcessor, { BraintreeCreditCardInitializeOptions } from './braintree-payment-processor';
import BraintreeSDKCreator from './braintree-sdk-creator';
import {
    getBraintreePaymentData,
    getBraintreeRequestData,
    getClientMock,
    getDataCollectorMock,
    getModalHandlerMock,
    getThreeDSecureMock,
    getTokenizeResponseResponseBody,
} from './braintree.mocks';

describe('BraintreePaymentProcessor', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;

    beforeEach(() => {
        braintreeSDKCreator = {} as BraintreeSDKCreator;
    });

    it('creates a instance of the payment processor', () => {
        const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
        expect(braintreePaymentProcessor).toBeInstanceOf(BraintreePaymentProcessor);
    });

    describe('#initialize()', () => {
        it('initializes the sdk creator with the client token', () => {
            const options = {} as BraintreeCreditCardInitializeOptions;
            options.paymentMethod = getBraintree();

            braintreeSDKCreator.initialize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
            braintreePaymentProcessor.initialize('clientToken', options);
            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith('clientToken');
        });
    });

    describe('#tokenizeCard()', () => {
        let clientMock;
        let braintreePaymentProcessor;

        beforeEach(() => {
            clientMock = getClientMock();
            clientMock.request.mockReturnValue(Promise.resolve(getTokenizeResponseResponseBody()));
            braintreeSDKCreator.getClient = jest.fn().mockReturnValue(Promise.resolve(clientMock));
            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
        });

        it('tokenizes a card', async () => {
            const tokenizedCard = await braintreePaymentProcessor.tokenizeCard(getBraintreePaymentData(), getBillingAddress());
            expect(tokenizedCard).toEqual({ nonce: 'demo_nonce' });
        });

        it('calls the braintree client request with the correct information', async () => {
            const tokenizedCard = await braintreePaymentProcessor.tokenizeCard(getBraintreePaymentData(), getBillingAddress());
            expect(clientMock.request).toHaveBeenCalledWith(getBraintreeRequestData());
        });
    });

    describe('#verifyCard()', () => {
        let threeDSecureMock;
        let braintreePaymentProcessor;
        let modalHandlerMock;

        beforeEach(() => {
            modalHandlerMock = getModalHandlerMock();
            threeDSecureMock = getThreeDSecureMock();

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.get3DS = jest.fn().mockReturnValue(Promise.resolve(threeDSecureMock));

            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);

            braintreePaymentProcessor.initialize('clientToken', { modalHandler: modalHandlerMock });
            jest.spyOn(braintreePaymentProcessor, 'tokenizeCard').mockReturnValue(Promise.resolve({ nonce: 'my_nonce' }));
        });

        it('throws if no modal handler was supplied on initialization', async () => {
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
            expect(() => braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122))
                .toThrow();
        });

        it('tokenizes the card with the right params', async () => {
            await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(braintreePaymentProcessor.tokenizeCard).toHaveBeenCalledWith(getBraintreePaymentData(), getBillingAddress());
        });

        it('verifies the card using 3', async () => {
            threeDSecureMock.verifyCard.mockReturnValue(Promise.resolve({ nonce: 'my_nonce' }));
            const verifiedCard = await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(verifiedCard).toEqual({ nonce: 'my_nonce' });
        });

        it('calls the verification service with the right values', async () => {
            const verifiedCard = await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(threeDSecureMock.verifyCard)
                .toHaveBeenCalledWith({
                    ...omit(modalHandlerMock, 'onRemoveFrame'),
                    amount: 122,
                    nonce: 'my_nonce',
                });
        });

        describe('when the modal is closed (onRemoveFrame)', () => {
            beforeEach(() => {
                threeDSecureMock.verifyCard.mockReturnValue(new Promise(() => {}));
                threeDSecureMock.cancelVerifyCard.mockReturnValue(Promise.resolve());
                modalHandlerMock.onRemoveFrame.mockImplementation((callback) => callback());
            });

            it('cancels card verification', async () => {
                await braintreePaymentProcessor
                    .verifyCard(getBraintreePaymentData(), getBillingAddress(), 122)
                    .catch(() => {});
                expect(threeDSecureMock.cancelVerifyCard).toHaveBeenCalled();
            });

            it('rejects the return promise', async () => {
                const verifiedCardPromise = braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
                await expect(verifiedCardPromise).rejects.toEqual(new PaymentMethodCancelledError());
            });
        });
    });

    describe('#appendSessionId()', () => {
        let processedPayment: TokenizedCreditCard;

        beforeEach(() => {
            const dataCollector = getDataCollectorMock();
            braintreeSDKCreator.getDataCollector = jest.fn().mockReturnValue(Promise.resolve(dataCollector));
            processedPayment = { nonce: 'my_nonce' };
        });

        it('appends data to a processed payment', async () => {
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
            const expected = await braintreePaymentProcessor.appendSessionId(Promise.resolve(processedPayment));
            expect(expected).toEqual({
                ...processedPayment,
                deviceSessionId: 'my_device_session_id',
            });
        });
    });

    describe('#deinitialize()', () => {
        it('calls teardown in the braintre sdk creator', async () => {
            braintreeSDKCreator.teardown = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
            await braintreePaymentProcessor.deinitialize();
            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
        });
    });
});
