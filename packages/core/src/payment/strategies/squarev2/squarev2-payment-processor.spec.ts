import { createScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { NotInitializedError } from '../../../common/error/errors';

import SquareV2PaymentProcessor from './squarev2-payment-processor';
import SquareV2ScriptLoader from './squarev2-script-loader';
import { Card, Payments, Square } from './types';

describe('SquareV2PaymentProcessor', () => {
    let squareV2ScriptLoader: SquareV2ScriptLoader;
    let squareWebPaymentsSdkMock: Omit<Square, 'errors'>;
    let store: CheckoutStore;
    let processor: SquareV2PaymentProcessor;

    let attach: jest.Mock<Card['attach']>;
    let configure: jest.Mock<Card['configure']>;
    let tokenize: jest.Mock<Card['tokenize']>;
    let destroy: jest.Mock<Card['destroy']>;
    let card: jest.Mock<Card>;
    let verifyBuyer: jest.Mock<Payments['verifyBuyer']>;
    let payments: jest.Mock<Payments>;

    beforeEach(async () => {
        squareV2ScriptLoader = new SquareV2ScriptLoader(createScriptLoader());

        attach = jest.fn<Card['attach']>().mockResolvedValue(undefined);
        configure = jest.fn<Card['configure']>().mockResolvedValue(undefined);
        tokenize = jest.fn<Card['tokenize']>().mockResolvedValue({ status: 'OK', token: 'cnon:xxx' });
        destroy = jest.fn<Card['destroy']>().mockResolvedValue(true);
        card = jest.fn<Card>().mockReturnValue({ attach, configure, tokenize, destroy });
        verifyBuyer = jest.fn<Payments['verifyBuyer']>().mockReturnValue({ token: 'verf:yyy' });
        payments = jest.fn<Payments>().mockReturnValue({ card, verifyBuyer });

        squareWebPaymentsSdkMock = { payments };

        jest.spyOn(squareV2ScriptLoader, 'load')
            .mockResolvedValue(squareWebPaymentsSdkMock);

        store = createCheckoutStore(getCheckoutStoreState());

        processor = new SquareV2PaymentProcessor(
            squareV2ScriptLoader,
            store
        );

        await processor.initialize({
            applicationId: 'foo',
            locationId: 'bar',
            testMode: true,
        });
    });

    afterEach(async () => {
        await processor.deinitialize();
    });

    it('creates an instance of SquareV2PaymentProcessor', () => {
        expect(processor).toBeInstanceOf(SquareV2PaymentProcessor);
    });

    describe('#initialize', () => {
        it('initializes processor successfully', async () => {
            expect(squareV2ScriptLoader.load).toHaveBeenCalledWith(true);
            expect(squareWebPaymentsSdkMock.payments).toHaveBeenCalledWith('foo', 'bar');
        });
    });

    describe('#initializeCard', () => {
        it('should create a card payment method and attach it to the container', async () => {
            await processor.initializeCard({ containerId: 'card-container' });

            expect(card).toHaveBeenCalled();
            expect(attach).toHaveBeenCalledWith('#card-container');
        });

        it('should fail if the processor has not yet initialized', async () => {
            await processor.deinitialize();

            const initializeCard = processor.initializeCard({ containerId: 'card-container' });

            await expect(initializeCard).rejects.toThrow(NotInitializedError);
        });

        it('should configure the card element', async () => {
            await processor.initializeCard({
                containerId: 'card-container',
                style: { input: { color: 'foo' } },
            });

            expect(configure).toHaveBeenCalledWith({
                postalCode: '95555',
                style: { input: { color: 'foo' } },
            });
        });

        it('should fail silently if the card element configuration fails', async () => {
            configure.mockRejectedValue(new Error('Invalid configuration'));

            const initializeCard = processor.initializeCard({ containerId: 'card-container' });

            await expect(initializeCard).resolves.not.toThrow('Invalid configuration');
        });

        it.skip('should subscribe to form validation', async () => {
            // TODO: complete
        });
    });

    describe('#tokenize', () => {
        beforeEach(async () => {
            await processor.initializeCard({ containerId: 'card-container' });
        });

        it('should fail if the processor has not yet initialized', async () => {
            await processor.deinitialize();

            const nonce = processor.tokenize();

            await expect(nonce).rejects.toThrow(NotInitializedError);
        });

        it('should tokenize the card payment and return a nonce', async () => {
            const nonce = await processor.tokenize();

            expect(nonce).toBe('cnon:xxx');
        });

        it('throws an error if tokenization does not return a nonce', async () => {
            tokenize.mockResolvedValue({ status: 'OK' });

            const nonce = processor.tokenize();

            await expect(nonce).rejects.toThrow();
        });

        it('throws an error if tokenization status is not OK', async () => {
            tokenize.mockResolvedValue({
                status: 'FOO',
                errors: [{ err1: 'bar' }, { err2: 'baz' }],
            });

            const nonce = processor.tokenize();

            await expect(nonce).rejects.toThrow(
                'Tokenization failed with status: FOO and errors: [{"err1":"bar"},{"err2":"baz"}]'
            );
        });
    });

    describe('#verifyBuyer', () => {
        beforeEach(async () => {
            await processor.initializeCard({ containerId: 'card-container' });
        });

        it('should verify the identity of the card holder and return a verification token', async () => {
            const expectedDetails = {
                amount: '190',
                billingContact: {
                    addressLines: ['12345 Testing Way', ''],
                    city: 'Some City',
                    countryCode: 'US',
                    email: 'test@bigcommerce.com',
                    familyName: 'Tester',
                    givenName: 'Test',
                    phone: '555-555-5555',
                    postalCode: '95555',
                    state: 'CA',
                },
                currencyCode: 'USD',
                intent: 'CHARGE',
            };

            const nonce = await processor.verifyBuyer('cnon:zzz');

            expect(nonce).toBe('verf:yyy');
            expect(verifyBuyer).toHaveBeenCalledWith('cnon:zzz', expectedDetails);
        });

        it('should fail if the processor has not yet initialized', async () => {
            await processor.deinitialize();

            const nonce = processor.verifyBuyer('cnon:zzz');

            await expect(nonce).rejects.toThrow(NotInitializedError);
        });
    });

    describe('#deinitialize', () => {
        // TODO: complete
        it('deinitializes processor successfully', async () => {
            await processor.initializeCard({ containerId: 'card-container' });
            await processor.deinitialize();

            expect(destroy).toHaveBeenCalled();
        });
    });
});
