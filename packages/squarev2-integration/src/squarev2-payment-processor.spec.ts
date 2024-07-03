import { createScriptLoader } from '@bigcommerce/script-loader';
import * as rxjs from 'rxjs';

import {
    NotInitializedError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { SquareIntent } from './enums';
import { getSquareV2MockFunctions } from './mocks/squarev2-web-payments-sdk.mock';
import SquareV2PaymentProcessor from './squarev2-payment-processor';
import SquareV2ScriptLoader from './squarev2-script-loader';
import { Square } from './types';

describe('SquareV2PaymentProcessor', () => {
    let squareV2ScriptLoader: SquareV2ScriptLoader;
    let squareV2MockFunctions: ReturnType<typeof getSquareV2MockFunctions>;
    let squareWebPaymentsSdkMock: Omit<Square, 'errors'>;
    let paymentIntegrationService: PaymentIntegrationService;
    let processor: SquareV2PaymentProcessor;

    beforeEach(async () => {
        squareV2ScriptLoader = new SquareV2ScriptLoader(createScriptLoader());

        squareV2MockFunctions = getSquareV2MockFunctions();
        squareWebPaymentsSdkMock = { payments: squareV2MockFunctions.payments };

        // @ts-ignore to avoid mocking square errors as they don't use in BC integration
        jest.spyOn(squareV2ScriptLoader, 'load').mockResolvedValue(squareWebPaymentsSdkMock);

        paymentIntegrationService = new PaymentIntegrationServiceMock();

        processor = new SquareV2PaymentProcessor(squareV2ScriptLoader, paymentIntegrationService);

        await processor.initialize({
            applicationId: 'foo',
            locationId: 'bar',
            testMode: true,
        });
    });

    afterEach(async () => {
        await processor.deinitialize();
    });

    describe('#initialize', () => {
        it('initializes processor successfully', () => {
            expect(squareV2ScriptLoader.load).toHaveBeenCalledWith(true);
            expect(squareWebPaymentsSdkMock.payments).toHaveBeenCalledWith('foo', 'bar');
        });
    });

    describe('#initializeCard', () => {
        it('should create a card payment method and attach it to the container', async () => {
            await processor.initializeCard({ containerId: 'card-container' });

            expect(squareV2MockFunctions.card).toHaveBeenCalled();
            expect(squareV2MockFunctions.attach).toHaveBeenCalledWith('#card-container');
        });

        it('should fail if _payments has not yet been initialized', async () => {
            await processor.deinitialize();

            const initializeCard = processor.initializeCard({
                containerId: 'card-container',
            });

            await expect(initializeCard).rejects.toThrow(NotInitializedError);
        });

        it('should configure the card element', async () => {
            await processor.initializeCard({
                containerId: 'card-container',
                style: { input: { color: 'foo' } },
            });

            expect(squareV2MockFunctions.configure).toHaveBeenCalledWith({
                postalCode: '95555',
                style: { input: { color: 'foo' } },
            });
        });

        it('should fail silently if the card element configuration fails', async () => {
            squareV2MockFunctions.configure.mockRejectedValue(new Error('Invalid configuration'));

            const initializeCard = processor.initializeCard({
                containerId: 'card-container',
            });

            await expect(initializeCard).resolves.not.toThrow('Invalid configuration');
        });

        it('should subscribe to form validation', async () => {
            await processor.initializeCard({
                containerId: 'card-container',
                onValidationChange: jest.fn(),
            });

            expect(squareV2MockFunctions.addEventListener).toHaveBeenCalledTimes(6);
        });

        it('should call onValidationChange once', async () => {
            const onValidationChange = jest.fn();

            await processor.initializeCard({
                containerId: 'card-container',
                onValidationChange,
            });
            squareV2MockFunctions.simulateEvent('focusClassAdded', 'cardNumber', true);

            expect(onValidationChange).toHaveBeenCalledTimes(1);
            expect(onValidationChange).toHaveBeenCalledWith(false);
        });

        it('should call onValidationChange twice', async () => {
            const onValidationChange = jest.fn();

            await processor.initializeCard({
                containerId: 'card-container',
                onValidationChange,
            });
            squareV2MockFunctions.simulateEvent('focusClassAdded', 'cardNumber', true);
            squareV2MockFunctions.simulateEvent('errorClassRemoved', 'cvv', true);

            expect(onValidationChange).toHaveBeenCalledTimes(2);
            expect(onValidationChange).toHaveBeenNthCalledWith(1, false);
            expect(onValidationChange).toHaveBeenNthCalledWith(2, true);
        });

        it('should validate only blacklisted fields', async () => {
            const onValidationChange = jest.fn();

            await processor.initializeCard({
                containerId: 'card-container',
                onValidationChange,
            });
            squareV2MockFunctions.simulateEvent('focusClassAdded', 'cardNumber', true);
            squareV2MockFunctions.simulateEvent('focusClassRemoved', 'expirationDate', false);
            squareV2MockFunctions.simulateEvent('errorClassRemoved', 'cvv', true);
            squareV2MockFunctions.simulateEvent('postalCodeChanged', 'postalCode', false);

            expect(onValidationChange).toHaveBeenCalledTimes(2);
            expect(onValidationChange).toHaveBeenNthCalledWith(1, false);
            expect(onValidationChange).toHaveBeenNthCalledWith(2, true);
        });

        it('should call onValidationChange three times', async () => {
            const onValidationChange = jest.fn();

            await processor.initializeCard({
                containerId: 'card-container',
                onValidationChange,
            });
            squareV2MockFunctions.simulateEvent('focusClassAdded', 'cardNumber', true);
            squareV2MockFunctions.simulateEvent('errorClassRemoved', 'cvv', true);
            squareV2MockFunctions.simulateEvent('cardBrandChanged', 'cardNumber', false);

            expect(onValidationChange).toHaveBeenCalledTimes(3);
            expect(onValidationChange).toHaveBeenNthCalledWith(1, false);
            expect(onValidationChange).toHaveBeenNthCalledWith(2, true);
            expect(onValidationChange).toHaveBeenNthCalledWith(3, false);
        });
    });

    describe('#tokenize', () => {
        beforeEach(async () => {
            await processor.initializeCard({ containerId: 'card-container' });
        });

        it('should fail if _card has not yet initialized', async () => {
            await processor.deinitialize();

            const nonce = processor.tokenize();

            await expect(nonce).rejects.toThrow(NotInitializedError);
        });

        it('should tokenize the card payment and return a nonce', async () => {
            const nonce = await processor.tokenize();

            expect(nonce).toBe('cnon:xxx');
        });

        it('throws an error if tokenization does not return a nonce', async () => {
            squareV2MockFunctions.tokenize.mockResolvedValue({ status: 'OK' });

            const nonce = processor.tokenize();

            await expect(nonce).rejects.toThrow();
        });

        it('throws an error if tokenization status is not OK', async () => {
            squareV2MockFunctions.tokenize.mockResolvedValue({
                status: 'FOO',
                errors: [{ err1: 'bar' }, { err2: 'baz' }],
            });

            const nonce = processor.tokenize();

            await expect(nonce).rejects.toThrow();
        });

        it('should throw a PaymentExecuteError', async () => {
            squareV2MockFunctions.tokenize.mockResolvedValue({
                status: 'FOO',
                errors: [{ err1: 'bar' }, { err2: 'baz' }],
            });

            try {
                await processor.tokenize();
            } catch (error) {
                expect(error.name).toBe('SquareV2TokenizationError');
                expect(error.type).toBe('custom_provider_execute_error');
                expect(error.subtype).toBe('payment.errors.card_error');
                expect(error.message).toBe(
                    'Tokenization failed with status: FOO and errors: [{"err1":"bar"},{"err2":"baz"}]',
                );
            }
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
                    familyName: 'Tester',
                    givenName: 'Test',
                    phone: '555-555-5555',
                    postalCode: '95555',
                    state: 'CA',
                    email: 'test@bigcommerce.com',
                },
                currencyCode: 'USD',
                intent: 'CHARGE',
            };

            const nonce = await processor.verifyBuyer('cnon:zzz', SquareIntent.CHARGE);

            expect(nonce).toBe('verf:yyy');
            expect(squareV2MockFunctions.verifyBuyer).toHaveBeenCalledWith(
                'cnon:zzz',
                expectedDetails,
            );
        });

        it('should fail if _payments has not yet been initialized', async () => {
            await processor.deinitialize();

            const nonce = processor.verifyBuyer('cnon:zzz', SquareIntent.CHARGE);

            await expect(nonce).rejects.toThrow(NotInitializedError);
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor successfully', async () => {
            await processor.initializeCard({ containerId: 'card-container' });
            await processor.deinitialize();

            expect(squareV2MockFunctions.destroy).toHaveBeenCalled();
        });

        it('should unsubscribe from form validation', async () => {
            const foo$ = rxjs.of('foo');

            jest.spyOn(rxjs, 'merge').mockReturnValue(foo$);

            const bar$ = rxjs.of('bar');

            jest.spyOn(foo$, 'pipe').mockReturnValue(bar$);

            const spy = jest.spyOn(bar$, 'subscribe');

            await processor.initializeCard({
                containerId: 'card-container',
                onValidationChange: jest.fn(),
            });

            const formValidationSubscription = spy.mock.results[0].value as rxjs.Subscription;
            const unsubscribe = jest.spyOn(formValidationSubscription, 'unsubscribe');

            await processor.deinitialize();

            expect(unsubscribe).toHaveBeenCalled();
        });
    });
});
