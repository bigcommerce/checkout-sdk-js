import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { Overlay } from '../../../common/overlay';
import { PaymentMethodCancelledError } from '../../errors';
import { NonceInstrument } from '../../payment';

import { BraintreeClient, BraintreePaypal, BraintreeThreeDSecure } from './braintree';
import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeSDKCreator from './braintree-sdk-creator';
import { getBraintreePaymentData, getBraintreeRequestData, getClientMock, getThreeDSecureMock, getThreeDSecureOptionsMock, getTokenizeResponseBody, getVerifyPayload } from './braintree.mock';

describe('BraintreePaymentProcessor', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let overlay: Overlay;

    beforeEach(() => {
        braintreeSDKCreator = {} as BraintreeSDKCreator;
        overlay = new Overlay();
    });

    it('creates a instance of the payment processor', () => {
        const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);
        expect(braintreePaymentProcessor).toBeInstanceOf(BraintreePaymentProcessor);
    });

    describe('#initialize()', () => {
        it('initializes the sdk creator with the client token', () => {
            braintreeSDKCreator.initialize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);
            braintreePaymentProcessor.initialize('clientToken');
            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith('clientToken');
        });
    });

    describe('#tokenizeCard()', () => {
        let clientMock: BraintreeClient;
        let braintreePaymentProcessor: BraintreePaymentProcessor;

        beforeEach(() => {
            clientMock = getClientMock();
            jest.spyOn(clientMock, 'request')
                .mockReturnValue(Promise.resolve(getTokenizeResponseBody()));
            braintreeSDKCreator.getClient = jest.fn().mockReturnValue(Promise.resolve(clientMock));
            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);
        });

        it('tokenizes a card', async () => {
            const tokenizedCard = await braintreePaymentProcessor.tokenizeCard(getBraintreePaymentData(), getBillingAddress());
            expect(tokenizedCard).toEqual({ nonce: 'demo_nonce' });
        });

        it('calls the braintree client request with the correct information', async () => {
            await braintreePaymentProcessor.tokenizeCard(getBraintreePaymentData(), getBillingAddress());
            expect(clientMock.request).toHaveBeenCalledWith(getBraintreeRequestData());
        });
    });

    describe('#verifyCard()', () => {
        let threeDSecureMock: BraintreeThreeDSecure;
        let braintreePaymentProcessor: BraintreePaymentProcessor;
        let cancelVerifyCard: () => void;

        beforeEach(() => {
            threeDSecureMock = getThreeDSecureMock();

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.get3DS = jest.fn().mockReturnValue(Promise.resolve(threeDSecureMock));

            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);

            braintreePaymentProcessor.initialize('clientToken', {
                threeDSecure: {
                    ...getThreeDSecureOptionsMock(),
                    addFrame: (_error, _iframe, cancel) => {
                        cancelVerifyCard = cancel;
                    },
                },
            });

            jest.spyOn(braintreePaymentProcessor, 'tokenizeCard')
                .mockReturnValue(Promise.resolve({ nonce: 'my_nonce' }));
        });

        it('throws if no modal handler was supplied on initialization', () => {
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);
            expect(() => braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122))
                .toThrow();
        });

        it('tokenizes the card with the right params', async () => {
            await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(braintreePaymentProcessor.tokenizeCard).toHaveBeenCalledWith(getBraintreePaymentData(), getBillingAddress());
        });

        it('verifies the card using 3', async () => {
            jest.spyOn(threeDSecureMock, 'verifyCard')
                .mockReturnValue(Promise.resolve({ nonce: 'my_nonce' }));
            const verifiedCard = await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(verifiedCard).toEqual({ nonce: 'my_nonce' });
        });

        it('calls the verification service with the right values', async () => {
            await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);

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
                jest.spyOn(threeDSecureMock, 'verifyCard')
                    .mockImplementation(({ addFrame }) => {
                        addFrame();

                        return new Promise(() => { });
                    });

                jest.spyOn(threeDSecureMock, 'cancelVerifyCard')
                    .mockReturnValue(Promise.resolve(getVerifyPayload()));
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
                braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);

                await new Promise(resolve => process.nextTick(resolve));
                const response = await cancelVerifyCard();

                expect(response).toEqual(getVerifyPayload());
            });
        });
    });

    describe('#appendSessionId()', () => {
        let processedPayment: NonceInstrument;

        beforeEach(() => {
            const dataCollector = {
                deviceData: 'my_device_session_id',
            };

            braintreeSDKCreator.getDataCollector = jest.fn().mockReturnValue(Promise.resolve(dataCollector));
            processedPayment = { nonce: 'my_nonce' };
        });

        it('appends data to a processed payment', async () => {
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);
            const expected = await braintreePaymentProcessor.appendSessionId(Promise.resolve(processedPayment));
            expect(expected).toEqual({
                ...processedPayment,
                deviceSessionId: 'my_device_session_id',
            });
        });
    });

    describe('#deinitialize()', () => {
        it('calls teardown in the braintree sdk creator', async () => {
            braintreeSDKCreator.teardown = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);
            await braintreePaymentProcessor.deinitialize();
            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
        });
    });

    describe('#paypal()', () => {
        let paypal: BraintreePaypal;

        beforeEach(() => {
            paypal = {
                closeWindow: jest.fn(),
                focusWindow: jest.fn(),
                tokenize: jest.fn(),
            };

            braintreeSDKCreator.getPaypal = () => Promise.resolve(paypal);

            jest.spyOn(overlay, 'show')
                .mockImplementation();

            jest.spyOn(overlay, 'remove')
                .mockImplementation();
        });

        it('shows Paypal modal for tokenization', async () => {
            const processor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);

            await processor.paypal(200, 'en', 'USD', false);

            expect(paypal.tokenize)
                .toHaveBeenCalledWith({
                    amount: 200,
                    currency: 'USD',
                    enableShippingAddress: true,
                    flow: 'checkout',
                    locale: 'en',
                    offerCredit: false,
                    useraction: 'commit',
                });
        });

        it('toggles overlay', async () => {
            const processor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);

            await processor.paypal(200, 'en', 'USD', false);

            expect(overlay.show)
                .toHaveBeenCalled();

            expect(overlay.remove)
                .toHaveBeenCalled();
        });

        it('removes overlay if tokenization fails', async () => {
            jest.spyOn(paypal, 'tokenize')
                .mockRejectedValue(new Error());

            const processor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);

            try {
                await processor.paypal(200, 'en', 'USD', false);
            } catch (error) {
                expect(overlay.remove)
                    .toHaveBeenCalled();
            }
        });

        it('focus PayPal window when overlay is clicked', async () => {
            const processor = new BraintreePaymentProcessor(braintreeSDKCreator, overlay);

            await processor.paypal(200, 'en', 'USD', false);

            const { onClick } = (overlay.show as jest.Mock).mock.calls[0][0];

            onClick();

            expect(paypal.focusWindow)
                .toHaveBeenCalled();
        });
    });
});
