import braintreeBrowserDetection from '@braintree/browser-detection';
import { noop } from 'lodash';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { NotInitializedError } from '../../../common/error/errors';
import { Overlay } from '../../../common/overlay';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import { NonceInstrument } from '../../payment';

import { BraintreeClient, BraintreePaypal, BraintreeThreeDSecure } from './braintree';
import BraintreeHostedForm from './braintree-hosted-form';
import { BraintreeFormOptions } from './braintree-payment-options';
import BraintreePaymentProcessor from './braintree-payment-processor';
import BraintreeSDKCreator from './braintree-sdk-creator';
import { getBraintreePaymentData, getBraintreeRequestData, getClientMock, getThreeDSecureMock, getThreeDSecureOptionsMock, getTokenizeResponseBody, getVerifyPayload } from './braintree.mock';

jest.mock('@braintree/browser-detection', () => ({
    supportsPopups: jest.fn(() => false),
}));

describe('BraintreePaymentProcessor', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let braintreeHostedForm: BraintreeHostedForm;
    let overlay: Overlay;

    beforeEach(() => {
        braintreeSDKCreator = {} as BraintreeSDKCreator;
        braintreeHostedForm = {} as BraintreeHostedForm;
        overlay = new Overlay();
    });

    it('creates a instance of the payment processor', () => {
        const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
        expect(braintreePaymentProcessor).toBeInstanceOf(BraintreePaymentProcessor);
    });

    describe('#initialize()', () => {
        it('initializes the sdk creator with the client token', () => {
            braintreeSDKCreator.initialize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
            braintreePaymentProcessor.initialize('clientToken');
            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith('clientToken');
        });
    });

    describe('#deinitialize()', () => {
        it('calls teardown in the braintree sdk creator', async () => {
            braintreeSDKCreator.teardown = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
            await braintreePaymentProcessor.deinitialize();
            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
        });
    });

    describe('#preloadPaypal', () => {
        it('gets paypal from the braintree sdk creator', async () => {
            braintreeSDKCreator.getPaypal = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
            await braintreePaymentProcessor.preloadPaypal();
            expect(braintreeSDKCreator.getPaypal).toHaveBeenCalled();
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
            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
        });

        it('tokenizes a card', async () => {
            const tokenizedCard = await braintreePaymentProcessor.tokenizeCard(getBraintreePaymentData(), getBillingAddress());
            expect(tokenizedCard).toEqual({ nonce: 'demo_nonce' });
        });

        it('calls the braintree client request with the correct information', async () => {
            await braintreePaymentProcessor.tokenizeCard(getBraintreePaymentData(), getBillingAddress());
            expect(clientMock.request).toHaveBeenCalledWith(getBraintreeRequestData());
        });

        it('throws an error when tokenising card with invalid form data', async () => {
            const payment = getBraintreePaymentData();
            payment.paymentData = undefined;

            await expect(braintreePaymentProcessor.tokenizeCard(payment, getBillingAddress()))
                .rejects
                .toThrow(PaymentArgumentInvalidError);
        });
    });

    describe('#verifyCard()', () => {
        let clientMock: BraintreeClient;
        let braintreePaymentProcessor: BraintreePaymentProcessor;

        beforeEach(() => {
            clientMock = getClientMock();

            jest.spyOn(clientMock, 'request')
                .mockResolvedValue(getTokenizeResponseBody());

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getClient = jest.fn().mockReturnValue(Promise.resolve(clientMock));

            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            jest.spyOn(braintreePaymentProcessor, 'tokenizeCard')
                .mockReturnValue(Promise.resolve({ nonce: 'my_nonce' }));
            jest.spyOn(braintreePaymentProcessor, 'challenge3DSVerification')
                .mockReturnValue(Promise.resolve({ nonce: 'three_ds_nonce' }));
        });

        it('tokenizes the card with the right params', async () => {
            await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(braintreePaymentProcessor.tokenizeCard).toHaveBeenCalledWith(getBraintreePaymentData(), getBillingAddress());
        });

        it('verifies the card using 3DS', async () => {
            const verifiedCard = await braintreePaymentProcessor.verifyCard(getBraintreePaymentData(), getBillingAddress(), 122);
            expect(verifiedCard).toEqual({ nonce: 'three_ds_nonce' });
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
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
            const expected = await braintreePaymentProcessor.appendSessionId(Promise.resolve(processedPayment));
            expect(expected).toEqual({
                ...processedPayment,
                deviceSessionId: 'my_device_session_id',
            });
        });
    });

    describe('#getSessionId()', () => {
        it('appends data to a processed payment', async () => {
            braintreeSDKCreator.getDataCollector = jest.fn().mockResolvedValue({
                deviceData: 'my_device_session_id',
            });

            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
            const expected = await braintreePaymentProcessor.getSessionId();

            expect(expected).toEqual('my_device_session_id');
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
            const processor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            await processor.paypal({
                amount: 200,
                locale: 'en',
                currency: 'USD',
            });

            expect(paypal.tokenize)
                .toHaveBeenCalledWith({
                    amount: 200,
                    currency: 'USD',
                    enableShippingAddress: true,
                    flow: 'checkout',
                    locale: 'en',
                    useraction: 'commit',
                });
        });

        it('shows Paypal modal for vaulting', async () => {
            const processor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            await processor.paypal({
                amount: 200,
                locale: 'en',
                currency: 'USD',
                shouldSaveInstrument: true,
            });

            expect(paypal.tokenize)
                .toHaveBeenCalledWith({
                    amount: 200,
                    currency: 'USD',
                    enableShippingAddress: true,
                    flow: 'vault',
                    locale: 'en',
                    useraction: 'commit',
                });
        });

        describe('when popups are supported', () => {
            it('toggles overlay', async () => {
                braintreeBrowserDetection.supportsPopups = jest.fn(() => true);

                const processor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

                await processor.paypal({
                    amount: 200,
                    locale: 'en',
                    currency: 'USD',
                });
                expect(overlay.show)
                    .toHaveBeenCalled();

                expect(overlay.remove)
                    .toHaveBeenCalled();
            });

            it('removes overlay if tokenization fails', async () => {
                braintreeBrowserDetection.supportsPopups = jest.fn(() => true);

                jest.spyOn(paypal, 'tokenize')
                    .mockRejectedValue(new Error());

                const processor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

                try {
                    await processor.paypal({
                        amount: 200,
                        locale: 'en',
                        currency: 'USD',
                    });
                } catch (error) {
                    expect(overlay.remove)
                        .toHaveBeenCalled();
                }
            });

            it('focus PayPal window when overlay is clicked', async () => {
                braintreeBrowserDetection.supportsPopups = jest.fn(() => true);

                const processor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

                await processor.paypal({
                    amount: 200,
                    locale: 'en',
                    currency: 'USD',
                });

                const { onClick } = (overlay.show as jest.Mock).mock.calls[0][0];

                onClick();

                expect(paypal.focusWindow)
                    .toHaveBeenCalled();
            });

        });

        describe('when popups are not supported', () => {
            it('does not toggle the overlay', async () => {
                braintreeBrowserDetection.supportsPopups = jest.fn(() => false);

                const processor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

                await processor.paypal({
                    amount: 200,
                    locale: 'en',
                    currency: 'USD',
                });
                expect(overlay.show)
                    .not.toHaveBeenCalled();
            });
        });
    });

    describe('#initializeHostedForm', () => {
        let hostedFormInitializationOptions: BraintreeFormOptions;

        it('initializes the hosted form', () => {
            braintreeHostedForm.initialize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            hostedFormInitializationOptions = {
                fields: {
                    cardCode: { containerId: 'cardCode', placeholder: 'Card code' },
                    cardName: { containerId: 'cardName', placeholder: 'Card name' },
                    cardNumber: { containerId: 'cardNumber', placeholder: 'Card number' },
                    cardExpiry: { containerId: 'cardExpiry', placeholder: 'Card expiry' },
                },
            };

            braintreePaymentProcessor.initializeHostedForm(hostedFormInitializationOptions);
            expect(braintreeHostedForm.initialize).toHaveBeenCalledWith(hostedFormInitializationOptions);
        });
    });

    describe('#deinitializeHostedForm', () => {
        it('deinitializes the hosted form', async () => {
            braintreeHostedForm.deinitialize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            await braintreePaymentProcessor.deinitializeHostedForm();
            expect(braintreeHostedForm.deinitialize).toHaveBeenCalled();
        });
    });

    describe('#isInitializedHostedForm()', () => {
        it('returns false is hosted form is not initialized', async () => {
            const braintreeHostedForm = new BraintreeHostedForm(braintreeSDKCreator);
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            await braintreeHostedForm.initialize({ fields: {} });

            expect(braintreePaymentProcessor.isInitializedHostedForm()).toBeFalsy();
        });
    });

    describe('#tokenizeHostedForm', () => {
        it('tokenizes credit card with hosted form', () => {
            braintreeHostedForm.tokenize = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            braintreePaymentProcessor.tokenizeHostedForm(getBillingAddress());
            expect(braintreeHostedForm.tokenize).toHaveBeenCalledWith(getBillingAddress());
        });
    });

    describe('#tokenizeHostedFormForStoredCardVerification', () => {
        it('tokenizes stored credit card with hosted form', () => {
            braintreeHostedForm.tokenizeForStoredCardVerification = jest.fn();
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            braintreePaymentProcessor.tokenizeHostedFormForStoredCardVerification();
            expect(braintreeHostedForm.tokenizeForStoredCardVerification).toHaveBeenCalled();
        });
    });

    describe('#verifyCardWithHostedForm', () => {
        it('verifies the card with hosted form using 3DS', async () => {
            const braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);
            braintreeHostedForm.tokenize = jest.fn();

            jest.spyOn(braintreePaymentProcessor, 'challenge3DSVerification')
                .mockReturnValue({ nonce: 'three_ds_nonce' });
            jest.spyOn(braintreeHostedForm, 'tokenize')
                .mockReturnValue({ nonce: 'tokenized_nonce' });

            const verifiedCard = await braintreePaymentProcessor.verifyCardWithHostedForm(getBillingAddress(), 122);
            expect(braintreeHostedForm.tokenize).toHaveBeenCalledWith(getBillingAddress());
            expect(verifiedCard).toEqual({ nonce: 'three_ds_nonce' });
        });
    });

    describe('#verifyCardWithHostedFormAnd3DSCheck', () => {
        let braintreePaymentProcessor: BraintreePaymentProcessor;
        let merchantAccountIdMock: string;

        beforeEach(() => {
            merchantAccountIdMock = '100000';

            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            braintreeHostedForm.tokenizeWith3DSRegulationCheck = jest.fn();

            jest.spyOn(braintreePaymentProcessor, 'challenge3DSVerification')
                .mockReturnValue({ nonce: 'three_ds_nonce' });
        });

        it('verifies credit card with hosted form using 3DS if the card is regulated', async () => {
            jest.spyOn(braintreeHostedForm, 'tokenizeWith3DSRegulationCheck')
                .mockReturnValue({
                    authenticationInsight: {
                        regulationEnvironment: 'psd2',
                    },
                    nonce: 'tokenized_nonce',
                });

            const verifiedCard = await braintreePaymentProcessor.verifyCardWithHostedFormAnd3DSCheck(getBillingAddress(), 122, merchantAccountIdMock);
            expect(braintreePaymentProcessor.challenge3DSVerification).toHaveBeenCalledWith('tokenized_nonce', 122);
            expect(braintreeHostedForm.tokenizeWith3DSRegulationCheck).toHaveBeenCalledWith(getBillingAddress(), merchantAccountIdMock);
            expect(verifiedCard).toEqual({ nonce: 'three_ds_nonce' });
        });

        it('verifies credit card with hosted form using 3DS if the card is unavailable', async () => {
            jest.spyOn(braintreeHostedForm, 'tokenizeWith3DSRegulationCheck')
                .mockReturnValue({
                    authenticationInsight: {
                        regulationEnvironment: 'unavailable',
                    },
                    nonce: 'tokenized_nonce',
                });

            const verifiedCard = await braintreePaymentProcessor.verifyCardWithHostedFormAnd3DSCheck(getBillingAddress(), 122, merchantAccountIdMock);
            expect(braintreePaymentProcessor.challenge3DSVerification).toHaveBeenCalledWith('tokenized_nonce', 122);
            expect(braintreeHostedForm.tokenizeWith3DSRegulationCheck).toHaveBeenCalledWith(getBillingAddress(), merchantAccountIdMock);
            expect(verifiedCard).toEqual({ nonce: 'three_ds_nonce' });
        });

        it('only tokenizes credit card with hosted form using 3DS if the card is unregulated', async () => {
            jest.spyOn(braintreeHostedForm, 'tokenizeWith3DSRegulationCheck')
                .mockReturnValue({
                    authenticationInsight: {
                        regulationEnvironment: 'unregulated',
                    },
                    nonce: 'tokenized_nonce',
                });

            const verifiedCard = await braintreePaymentProcessor.verifyCardWithHostedFormAnd3DSCheck(getBillingAddress(), 122, merchantAccountIdMock);
            expect(braintreePaymentProcessor.challenge3DSVerification).not.toHaveBeenCalled();
            expect(braintreeHostedForm.tokenizeWith3DSRegulationCheck).toHaveBeenCalledWith(getBillingAddress(), merchantAccountIdMock);
            expect(verifiedCard).toEqual({ nonce: 'tokenized_nonce' });
        });
    });

    describe('#challenge3DSVerification()', () => {
        let clientMock: BraintreeClient;
        let threeDSecureMock: BraintreeThreeDSecure;
        let braintreePaymentProcessor: BraintreePaymentProcessor;
        let cancelVerifyCard: () => void;

        beforeEach(() => {
            clientMock = getClientMock();
            threeDSecureMock = getThreeDSecureMock();

            jest.spyOn(clientMock, 'request')
                .mockResolvedValue(getTokenizeResponseBody());

            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getClient = jest.fn().mockReturnValue(Promise.resolve(clientMock));
            braintreeSDKCreator.get3DS = jest.fn().mockReturnValue(Promise.resolve(threeDSecureMock));

            braintreePaymentProcessor = new BraintreePaymentProcessor(braintreeSDKCreator, braintreeHostedForm, overlay);

            braintreePaymentProcessor.initialize('clientToken', {
                threeDSecure: {
                    ...getThreeDSecureOptionsMock(),
                    addFrame: (_error, _iframe, cancel) => {
                        cancelVerifyCard = cancel;
                    },
                },
            });
        });

        it('throws if no 3DS modal handler was supplied on initialization', () => {
            braintreePaymentProcessor.initialize('clientToken', {});

            return expect(braintreePaymentProcessor.challenge3DSVerification('tokenization_nonce', 122))
                .rejects.toThrow(NotInitializedError);
        });

        it('challenges 3DS verifies the card using 3DS', async () => {
            jest.spyOn(threeDSecureMock, 'verifyCard')
                .mockReturnValue(Promise.resolve({ nonce: 'three_ds_nonce' }));
            const verifiedCard = await braintreePaymentProcessor.challenge3DSVerification('tokenization_nonce', 122);
            expect(verifiedCard).toEqual({ nonce: 'three_ds_nonce' });
        });

        it('calls the verification service with the right values', async () => {
            await braintreePaymentProcessor.challenge3DSVerification('tokenization_nonce', 122);

            expect(threeDSecureMock.verifyCard)
                .toHaveBeenCalledWith({
                    addFrame: expect.any(Function),
                    removeFrame: expect.any(Function),
                    challengeRequested: true,
                    amount: 122,
                    nonce: 'tokenization_nonce',
                    onLookupComplete: expect.any(Function),
                });
        });

        describe('when cancel function gets called', () => {
            beforeEach(() => {
                jest.spyOn(threeDSecureMock, 'verifyCard')
                    .mockImplementation(({ addFrame }) => {
                        addFrame();

                        return new Promise(noop);
                    });

                jest.spyOn(threeDSecureMock, 'cancelVerifyCard')
                    .mockReturnValue(Promise.resolve(getVerifyPayload()));
            });

            it('cancels card verification', async () => {
                braintreePaymentProcessor
                    .challenge3DSVerification('tokenization_nonce', 122)
                    .catch(noop);

                await new Promise(resolve => process.nextTick(resolve));
                cancelVerifyCard();

                expect(threeDSecureMock.cancelVerifyCard).toHaveBeenCalled();
            });

            it('rejects the return promise', async () => {
                const promise = braintreePaymentProcessor.challenge3DSVerification('tokenization_nonce', 122);

                await new Promise(resolve => process.nextTick(resolve));
                cancelVerifyCard();

                return expect(promise).rejects.toBeInstanceOf(PaymentMethodCancelledError);
            });

            it('resolves with verify payload', async () => {
                braintreePaymentProcessor.challenge3DSVerification('tokenization_nonce', 122);

                await new Promise(resolve => process.nextTick(resolve));
                const response = await cancelVerifyCard();

                expect(response).toEqual(getVerifyPayload());
            });
        });
    });
});
