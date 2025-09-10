import {EventEmitter} from 'events';

import {
    BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION,
    BraintreeFormOptions,
    BraintreeHostedFields,
    BraintreeScriptLoader,
    BraintreeSDKVersionManager,
    getClientMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import {
    NotInitializedError,
    PaymentIntegrationService,
    PaymentInvalidFormError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {PaymentIntegrationServiceMock} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {getScriptLoader} from '@bigcommerce/script-loader';

import {getBillingAddress} from '../mocks/braintree.mock';

import BraintreeHostedForm from './braintree-hosted-form';

describe('BraintreeHostedForm', () => {
    let braintreeScriptLoader: BraintreeScriptLoader;
    let cardFields: Pick<BraintreeHostedFields, 'on' | 'tokenize' | 'teardown'>;
    let cardFieldsEventEmitter: EventEmitter;
    let containers: HTMLElement[];
    let formOptions: BraintreeFormOptions;
    let subject: BraintreeHostedForm;
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let paymentIntegrationService: PaymentIntegrationService;

    const unsupportedCardBrands = ['american-express', 'maestro'];

    function appendContainer(id: string): HTMLElement {
        const container = document.createElement('div');
        container.id = id;
        document.body.appendChild(container);

        return container;
    }

    beforeEach(() => {
        cardFieldsEventEmitter = new EventEmitter();

        cardFields = {
            on: jest.fn((eventName, callback) => {
                cardFieldsEventEmitter.on(eventName, callback);
            }),
            tokenize: jest.fn(() => Promise.resolve({ nonce: 'foobar_nonce' })),
            teardown: jest.fn(),
        };

        formOptions = {
            fields: {
                cardCode: { containerId: 'cardCode', placeholder: 'Card code' },
                cardName: { containerId: 'cardName', placeholder: 'Card name' },
                cardNumber: { containerId: 'cardNumber', placeholder: 'Card number' },
                cardExpiry: { containerId: 'cardExpiry', placeholder: 'Card expiry' },
            },
            styles: {
                default: { color: '#000' },
                error: { color: '#f00', fontWeight: 'bold' },
                focus: { color: '#00f' },
            },
        };

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
        braintreeScriptLoader = new BraintreeScriptLoader(
            getScriptLoader(),
            window,
            braintreeSDKVersionManager,
        );
        subject = new BraintreeHostedForm(braintreeScriptLoader, braintreeSDKVersionManager);

        containers = [
            appendContainer('cardCode'),
            appendContainer('cardName'),
            appendContainer('cardNumber'),
            appendContainer('cardExpiry'),
        ];

        jest.spyOn(braintreeScriptLoader, 'loadClient').mockResolvedValue({
            create: jest.fn().mockResolvedValue(getClientMock()),
        });

        jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
            create: jest.fn().mockResolvedValue({ on: jest.fn() }),
        });

        jest.spyOn(braintreeSDKVersionManager, 'getSDKVersion').mockReturnValue(
            BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION,
        );
    });

    afterEach(() => {
        containers.forEach((container) => {
            container.parentElement?.removeChild(container);
        });
    });

    describe('#initialize', () => {
        it('creates and configures hosted fields', async () => {
            const createMock = jest.fn();
            const clientMock = {
                ...getClientMock(),
                request: expect.any(Function),
            };

            const options = {
                fields: {
                    cvv: {
                        container: '#cardCode',
                        internalLabel: undefined,
                        placeholder: 'Card code',
                    },
                    expirationDate: {
                        container: '#cardExpiry',
                        internalLabel: undefined,
                        placeholder: 'Card expiry',
                    },
                    number: {
                        container: '#cardNumber',
                        internalLabel: undefined,
                        placeholder: 'Card number',
                        supportedCardBrands: {
                            'american-express': false,
                            maestro: false,
                        },
                    },
                    cardholderName: {
                        container: '#cardName',
                        internalLabel: undefined,
                        placeholder: 'Card name',
                    },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
            };

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: createMock,
            });

            await subject.initialize(formOptions, unsupportedCardBrands, 'clientToken');

            expect(createMock).toHaveBeenCalledWith({
                ...options,
                client: clientMock,
            });
        });

        it('creates and configures hosted fields with preventCursorJumps', async () => {
            const createMock = jest.fn();
            const clientMock = {
                ...getClientMock(),
                request: expect.any(Function),
            };

            const options = {
                fields: {
                    cvv: {
                        container: '#cardCode',
                        internalLabel: undefined,
                        placeholder: 'Card code',
                    },
                    expirationDate: {
                        container: '#cardExpiry',
                        internalLabel: undefined,
                        placeholder: 'Card expiry',
                    },
                    number: {
                        container: '#cardNumber',
                        internalLabel: undefined,
                        placeholder: 'Card number',
                        supportedCardBrands: {
                            'american-express': false,
                            maestro: false,
                        },
                    },
                    cardholderName: {
                        container: '#cardName',
                        internalLabel: undefined,
                        placeholder: 'Card name',
                    },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
                preventCursorJumps: true,
            };

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: createMock,
            });

            await subject.initialize(formOptions, unsupportedCardBrands, 'clientToken');

            expect(createMock).toHaveBeenCalledWith({
                ...options,
                client: clientMock,
            });
        });

        it('creates and configures hosted fields for stored card verification', async () => {
            const createMock = jest.fn();
            const clientMock = {
                ...getClientMock(),
                request: expect.any(Function),
            };

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: createMock,
            });

            const expectOptions = {
                fields: {
                    cvv: {
                        container: '#cardCode',
                        placeholder: 'Card code',
                    },
                    number: {
                        container: '#cardNumber',
                        placeholder: 'Card number',
                    },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
            };

            await subject.initialize(
                {
                    ...formOptions,
                    fields: {
                        cardCodeVerification: {
                            containerId: 'cardCode',
                            placeholder: 'Card code',
                            instrumentId: 'foobar_instrument_id',
                        },
                        cardNumberVerification: {
                            containerId: 'cardNumber',
                            placeholder: 'Card number',
                            instrumentId: 'foobar_instrument_id',
                        },
                    },
                },
                [],
                'clientToken',
            );

            expect(createMock).toHaveBeenCalledWith({
                ...expectOptions,
                client: clientMock,
            });
        });
    });

    describe('#isInitialized', () => {
        it('returns true if hosted form is initialized', async () => {
            await subject.initialize(formOptions, [], 'clientToken');
            expect(subject.isInitialized()).toBe(true);
        });

        it('returns false when no fields specified in form options', async () => {
            await subject.initialize({ fields: {} }, [], 'clientToken');
            expect(subject.isInitialized()).toBe(false);
        });

        it('changes hosted form initialization state', async () => {
            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    teardown: jest.fn(),
                    on: jest.fn(),
                }),
            });

            await subject.initialize(formOptions, [], 'clientToken');
            expect(subject.isInitialized()).toBe(true);

            await subject.deinitialize();
            expect(subject.isInitialized()).toBe(false);
        });
    });

    describe('#deinitialize', () => {
        it('calls hosted form fields teardown on deinitialize', async () => {
            const teardownMock = jest.fn();

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    teardown: teardownMock,
                    on: jest.fn(),
                }),
            });

            await subject.initialize(formOptions, [], 'clientToken');
            await subject.deinitialize();

            expect(teardownMock).toHaveBeenCalled();
        });

        it('does not call teardown if fields are not initialized', async () => {
            await subject.initialize({ ...formOptions, fields: {} }, [], 'clientToken');
            await subject.deinitialize();

            expect(cardFields.teardown).not.toHaveBeenCalled();
        });
    });

    describe('#tokenize', () => {
        it('tokenizes data through hosted fields', async () => {
            const tokenizeMock = jest.fn().mockResolvedValue({ nonce: 'nonce' });

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    teardown: jest.fn(),
                    on: jest.fn(),
                    tokenize: tokenizeMock,
                }),
            });

            await subject.initialize(formOptions, [], 'clientToken');
            const billingAddress = getBillingAddress();

            await subject.tokenize(billingAddress);

            expect(tokenizeMock).toHaveBeenCalledWith({
                billingAddress: {
                    countryName: billingAddress.country,
                    postalCode: billingAddress.postalCode,
                    streetAddress: billingAddress.address1,
                },
            });
        });

        it('returns invalid form error when tokenizing with invalid form data', async () => {
            const tokenizeMock = jest.fn().mockRejectedValue({
                name: 'BraintreeError',
                code: 'HOSTED_FIELDS_FIELDS_EMPTY',
            });

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    teardown: jest.fn(),
                    on: jest.fn(),
                    tokenize: tokenizeMock,
                }),
            });

            await subject.initialize(formOptions, [], 'clientToken');

            await expect(subject.tokenize(getBillingAddress())).rejects.toBeInstanceOf(
                PaymentInvalidFormError,
            );
        });

        it('throws error if trying to tokenize before initialization', async () => {
            await expect(subject.tokenize(getBillingAddress())).rejects.toBeInstanceOf(
                NotInitializedError,
            );
        });
    });

    describe('#tokenizeForStoredCardVerification', () => {
        it('tokenizes data for stored card verification', async () => {
            const tokenizeMock = jest.fn().mockResolvedValue({ nonce: 'nonce' });

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    teardown: jest.fn(),
                    on: jest.fn(),
                    tokenize: tokenizeMock,
                }),
            });

            await subject.initialize(formOptions, [], 'clientToken');
            await subject.tokenizeForStoredCardVerification();

            expect(tokenizeMock).toHaveBeenCalled();
        });

        it('returns invalid form error on invalid stored card data', async () => {
            const tokenizeMock = jest.fn().mockRejectedValue({
                name: 'BraintreeError',
                code: 'HOSTED_FIELDS_FIELDS_EMPTY',
            });

            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    teardown: jest.fn(),
                    on: jest.fn(),
                    tokenize: tokenizeMock,
                }),
            });

            await subject.initialize(formOptions, [], 'clientToken');

            await expect(subject.tokenizeForStoredCardVerification()).rejects.toBeInstanceOf(
                PaymentInvalidFormError,
            );
        });

        it('throws error if trying to tokenize before initialization', async () => {
            await expect(subject.tokenizeForStoredCardVerification()).rejects.toBeInstanceOf(
                NotInitializedError,
            );
        });
    });

    describe('card fields events notifications', () => {
        let handleFocus: jest.Mock;
        let handleBlur: jest.Mock;
        let handleEnter: jest.Mock;
        let handleCardTypeChange: jest.Mock;
        let handleValidate: jest.Mock;

        beforeEach(async () => {
            jest.spyOn(braintreeScriptLoader, 'loadHostedFields').mockResolvedValue({
                create: jest.fn().mockResolvedValue({
                    on: jest.fn((eventName, callback) => {
                        cardFieldsEventEmitter.on(eventName, callback);
                    }),
                    tokenize: jest.fn(() => Promise.resolve({ nonce: 'foobar_nonce' })),
                    teardown: jest.fn(),
                }),
            });

            handleFocus = jest.fn();
            handleBlur = jest.fn();
            handleEnter = jest.fn();
            handleCardTypeChange = jest.fn();
            handleValidate = jest.fn();

            await subject.initialize(
                {
                    ...formOptions,
                    onFocus: handleFocus,
                    onBlur: handleBlur,
                    onEnter: handleEnter,
                    onCardTypeChange: handleCardTypeChange,
                    onValidate: handleValidate,
                },
                [],
                'clientToken',
            );
        });

        it('notifies on focus', () => {
            cardFieldsEventEmitter.emit('focus', { emittedBy: 'cvv' });
            expect(handleFocus).toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies on blur', () => {
            cardFieldsEventEmitter.emit('blur', { emittedBy: 'cvv' });
            expect(handleBlur).toHaveBeenCalledWith({ fieldType: 'cardCode', errors: {} });
        });

        it('notifies on blur with field errors', () => {
            cardFieldsEventEmitter.emit('blur', {
                emittedBy: 'cvv',
                fields: { cvv: { isEmpty: true, isPotentiallyValid: true, isValid: false } },
            });

            expect(handleBlur).toHaveBeenCalledWith({
                fieldType: 'cardCode',
                errors: {
                    cvv: {
                        isEmpty: true,
                        isPotentiallyValid: true,
                        isValid: false,
                    },
                },
            });
        });

        it('notifies on enter key', () => {
            cardFieldsEventEmitter.emit('inputSubmitRequest', { emittedBy: 'cvv' });
            expect(handleEnter).toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies on card type change', () => {
            cardFieldsEventEmitter.emit('cardTypeChange', { cards: [{ type: 'visa' }] });
            expect(handleCardTypeChange).toHaveBeenCalledWith({ cardType: 'visa' });
        });

        it('normalizes "master-card" to "mastercard"', () => {
            cardFieldsEventEmitter.emit('cardTypeChange', { cards: [{ type: 'master-card' }] });
            expect(handleCardTypeChange).toHaveBeenCalledWith({ cardType: 'mastercard' });
        });

        it('notifies undefined if card type is ambiguous', () => {
            cardFieldsEventEmitter.emit('cardTypeChange', {
                cards: [{ type: 'visa' }, { type: 'master-card' }],
            });

            expect(handleCardTypeChange).toHaveBeenCalledWith({ cardType: undefined });
        });

        it('notifies on validation errors', () => {
            cardFieldsEventEmitter.emit('validityChange', {
                fields: {
                    cvv: { isValid: false },
                    number: { isValid: false },
                    expirationDate: { isValid: false },
                },
            });

            expect(handleValidate).toHaveBeenCalledWith({
                errors: {
                    cardCode: [
                        {
                            fieldType: 'cardCode',
                            message: 'Invalid card code',
                            type: 'invalid_card_code',
                        },
                    ],
                    cardNumber: [
                        {
                            fieldType: 'cardNumber',
                            message: 'Invalid card number',
                            type: 'invalid_card_number',
                        },
                    ],
                    cardExpiry: [
                        {
                            fieldType: 'cardExpiry',
                            message: 'Invalid card expiry',
                            type: 'invalid_card_expiry',
                        },
                    ],
                },
                isValid: false,
            });
        });

        it('notifies when form becomes valid', () => {
            cardFieldsEventEmitter.emit('validityChange', {
                fields: {
                    cvv: { isValid: true },
                    number: { isValid: true },
                    expirationDate: { isValid: true },
                },
            });

            expect(handleValidate).toHaveBeenCalledWith({
                errors: {
                    cardCode: undefined,
                    cardNumber: undefined,
                    cardExpiry: undefined,
                },
                isValid: true,
            });
        });

        it('notifies when tokenizing valid form', async () => {
            await subject.tokenize(getBillingAddress());

            expect(handleValidate).toHaveBeenCalledWith({
                errors: {
                    cardCode: undefined,
                    cardNumber: undefined,
                    cardExpiry: undefined,
                },
                isValid: true,
            });
        });
    });
});
