import { omit } from 'lodash';

import { getBillingAddress } from '../../../billing/internal-billing-addresses.mock';
import { getBraintree } from '../../../payment/payment-methods.mock';
import { PaymentMethodCancelledError } from '../../errors';
import { TokenizedCreditCard } from '../../payment';

import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeSDKCreator from './braintree-sdk-creator';
import {
    getBraintreePaymentData,
    getBraintreeRequestData,
    getClientMock,
    getDataCollectorMock,
    getThreeDSecureMock,
    getThreeDSecureOptionsMock,
    getTokenizeResponseBody,
    getVerifyPayload,
} from './braintree.mock';

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
            braintreeSDKCreator.initialize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);
            braintreePaymentProcessor.initialize('clientToken');
            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith('clientToken');
        });
    });

    describe('#tokenizeCard()', () => {
        let clientMock;
        let braintreePaymentProcessor;

        beforeEach(() => {
            clientMock = getClientMock();
            clientMock.request.mockReturnValue(Promise.resolve(getTokenizeResponseBody()));
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
        let threeDSecureOptionsMock;
        let cancelVerifyCard;

        beforeEach(() => {
            threeDSecureOptionsMock = getThreeDSecureOptionsMock();
            threeDSecureMock = getThreeDSecureMock();

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.get3DS = jest.fn().mockReturnValue(Promise.resolve(threeDSecureMock));

            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator);

            braintreePaymentProcessor.initialize('clientToken', {
                threeDSecure: {
                    ...getThreeDSecureOptionsMock(),
                    addFrame: (error, iframe, cancel) => {
                        cancelVerifyCard = cancel;
                    },
                },
            });

            jest.spyOn(braintreePaymentProcessor, 'tokenizeCard')
                .mockReturnValue(Promise.resolve({ nonce: 'my_nonce' }));
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
                    addFrame: expect.any(Function),
                    removeFrame: expect.any(Function),
                    amount: 122,
                    nonce: 'my_nonce',
                });
        });

        describe('when cancel function gets called', () => {
            beforeEach(() => {
                threeDSecureMock.verifyCard.mockImplementation(({ addFrame }) => {
                    addFrame();

                    return new Promise(() => {});
                });

                threeDSecureMock.cancelVerifyCard.mockReturnValue(Promise.resolve(getVerifyPayload()));
            });

            it('cancels card verification', async () => {
                braintreePaymentProcessor
                    .verifyCard(getBraintreePaymentData(), getBillingAddress(), 122)
                    .catch(() => {});

                await new Promise(resolve => process.nextTick(resolve));
                cancelVerifyCard();

                expect(threeDSecureMock.cancelVerifyCard).toHaveBeenCalled();
            });

            it('rejects the return promise', async () => {
                const promise = braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);

                await new Promise(resolve => process.nextTick(resolve));
                cancelVerifyCard();

                return expect(promise).rejects.toBeInstanceOf(PaymentMethodCancelledError);
            });

            it('resolves with verify payload', async () => {
                const promise = braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);

                await new Promise(resolve => process.nextTick(resolve));
                const response = await cancelVerifyCard();

                expect(response).toEqual(getVerifyPayload());
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
