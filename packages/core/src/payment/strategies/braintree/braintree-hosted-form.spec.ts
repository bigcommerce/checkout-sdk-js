import { EventEmitter } from 'events';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { NotInitializedError } from '../../../common/error/errors';
import { PaymentInvalidFormError } from '../../errors';

import { BraintreeHostedFields } from './braintree';
import BraintreeHostedForm from './braintree-hosted-form';
import { BraintreeFormOptions } from './braintree-payment-options';
import BraintreeSDKCreator from './braintree-sdk-creator';

describe('BraintreeHostedForm', () => {
    let braintreeSdkCreator: Pick<BraintreeSDKCreator, 'createHostedFields'>;
    let cardFields: Pick<BraintreeHostedFields, 'on' | 'tokenize' | 'teardown'>;
    let cardFieldsEventEmitter: EventEmitter;
    let containers: HTMLElement[];
    let formOptions: BraintreeFormOptions;
    let subject: BraintreeHostedForm;

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

        braintreeSdkCreator = {
            createHostedFields: jest.fn(() => Promise.resolve(cardFields as BraintreeHostedFields)),
        };

        formOptions = {
            fields: {
                cardCode: { containerId: 'cardCode', placeholder: 'Card code' },
                cardName: { containerId: 'cardName', placeholder: 'Card name' },
                cardNumber: { containerId: 'cardNumber', placeholder: 'Card number' },
                cardExpiry: { containerId: 'cardExpiry', placeholder: 'Card expiry' },
            },
            styles: {
                default: {
                    color: '#000',
                },
                error: {
                    color: '#f00',
                    fontWeight: 'bold',
                },
                focus: {
                    color: '#00f',
                },
            },
        };

        subject = new BraintreeHostedForm(braintreeSdkCreator as BraintreeSDKCreator);

        containers = [
            appendContainer('cardCode'),
            appendContainer('cardName'),
            appendContainer('cardNumber'),
            appendContainer('cardExpiry'),
        ];
    });

    afterEach(() => {
        containers.forEach((container) => {
            container.parentElement?.removeChild(container);
        });
    });

    describe('#initialize', () => {
        it('creates and configures hosted fields', async () => {
            await subject.initialize(formOptions);

            expect(braintreeSdkCreator.createHostedFields).toHaveBeenCalledWith({
                fields: {
                    cvv: {
                        container: '#cardCode',
                        placeholder: 'Card code',
                    },
                    expirationDate: {
                        container: '#cardExpiry',
                        placeholder: 'Card expiry',
                    },
                    number: {
                        container: '#cardNumber',
                        placeholder: 'Card number',
                    },
                },
                styles: {
                    input: {
                        color: '#000',
                    },
                    '.invalid': {
                        color: '#f00',
                        'font-weight': 'bold',
                    },
                    ':focus': {
                        color: '#00f',
                    },
                },
            });
        });

        it('creates and configures hosted fields for stored card verification', async () => {
            await subject.initialize({
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
                styles: {
                    default: {
                        color: '#000',
                    },
                    error: {
                        color: '#f00',
                        fontWeight: 'bold',
                    },
                    focus: {
                        color: '#00f',
                    },
                },
            });

            expect(braintreeSdkCreator.createHostedFields).toHaveBeenCalledWith({
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
                    input: {
                        color: '#000',
                    },
                    '.invalid': {
                        color: '#f00',
                        'font-weight': 'bold',
                    },
                    ':focus': {
                        color: '#00f',
                    },
                },
            });
        });
    });

    describe('#isInitialized', () => {
        it('returns true if hosted form is initialized', async () => {
            await subject.initialize(formOptions);

            expect(subject.isInitialized()).toBe(true);
        });

        it('returns false when no fields specified in form options', async () => {
            await subject.initialize({ fields: {} });

            expect(subject.isInitialized()).toBe(false);
        });

        it('changes hosted form initialization state', async () => {
            await subject.initialize(formOptions);

            expect(subject.isInitialized()).toBe(true);

            await subject.deinitialize();

            expect(subject.isInitialized()).toBe(false);
        });
    });

    describe('#deinitialize', () => {
        it('calls hosted form fields teardown on deinitialize', async () => {
            await subject.initialize(formOptions);
            await subject.deinitialize();

            expect(cardFields.teardown).toHaveBeenCalled();
        });
    });

    describe('#tokenize', () => {
        it('tokenizes data through hosted fields', async () => {
            await subject.initialize(formOptions);

            const billingAddress = getBillingAddress();
            const cardNameInput = document.querySelector('#cardName input') as HTMLInputElement;

            cardNameInput.value = 'Foobar';

            await subject.tokenize(billingAddress);

            expect(cardFields.tokenize).toHaveBeenCalledWith({
                billingAddress: {
                    countryName: billingAddress.country,
                    postalCode: billingAddress.postalCode,
                    streetAddress: billingAddress.address1,
                },
                cardholderName: 'Foobar',
            });
        });

        it('returns invalid form error when tokenizing with invalid form data', async () => {
            await subject.initialize(formOptions);

            jest.spyOn(cardFields, 'tokenize').mockRejectedValue({
                code: 'HOSTED_FIELDS_FIELDS_EMPTY',
            });

            try {
                await subject.tokenize(getBillingAddress());
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentInvalidFormError);
            }
        });

        it('throws error if trying to tokenize before initialization', async () => {
            try {
                await subject.tokenize(getBillingAddress());
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('#tokenizeForStoredCardVerification', () => {
        it('tokenizes data through hosted fields for stored card verification', async () => {
            await subject.initialize(formOptions);

            const cardNameInput = document.querySelector('#cardName input') as HTMLInputElement;

            cardNameInput.value = 'Foobar';

            await subject.tokenizeForStoredCardVerification();

            expect(cardFields.tokenize).toHaveBeenCalledWith({
                cardholderName: 'Foobar',
            });
        });

        it('returns invalid form error when tokenizing store credit card with invalid form data', async () => {
            await subject.initialize(formOptions);

            jest.spyOn(cardFields, 'tokenize').mockRejectedValue({
                code: 'HOSTED_FIELDS_FIELDS_EMPTY',
            });

            try {
                await subject.tokenizeForStoredCardVerification();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentInvalidFormError);
            }
        });

        it('throws error if trying to tokenize store credit card before initialization', async () => {
            try {
                await subject.tokenizeForStoredCardVerification();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
            }
        });
    });

    describe('card fields events notifications', () => {
        let handleFocus: jest.Mock;
        let handleBlur: jest.Mock;
        let handleEnter: jest.Mock;
        let handleCardTypeChange: jest.Mock;
        let handleValidate: jest.Mock;

        beforeEach(async () => {
            handleFocus = jest.fn();
            handleBlur = jest.fn();
            handleEnter = jest.fn();
            handleCardTypeChange = jest.fn();
            handleValidate = jest.fn();

            await subject.initialize({
                ...formOptions,
                onFocus: handleFocus,
                onBlur: handleBlur,
                onEnter: handleEnter,
                onCardTypeChange: handleCardTypeChange,
                onValidate: handleValidate,
            });
        });

        it('notifies when field receives focus', () => {
            cardFieldsEventEmitter.emit('focus', { emittedBy: 'cvv' });

            expect(handleFocus).toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies when field loses focus', () => {
            cardFieldsEventEmitter.emit('blur', { emittedBy: 'cvv' });

            expect(handleBlur).toHaveBeenCalledWith({ fieldType: 'cardCode', errors: {} });
        });

        describe('when event fields are provided', () => {
            it('notifies with proper errors', () => {
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
        });

        it('notifies when input receives submit event', () => {
            cardFieldsEventEmitter.emit('inputSubmitRequest', { emittedBy: 'cvv' });

            expect(handleEnter).toHaveBeenCalledWith({ fieldType: 'cardCode' });
        });

        it('notifies when card number changes', () => {
            cardFieldsEventEmitter.emit('cardTypeChange', { cards: [{ type: 'visa' }] });

            expect(handleCardTypeChange).toHaveBeenCalledWith({ cardType: 'visa' });
        });

        it('notifies when card number changes and type is master-card', () => {
            cardFieldsEventEmitter.emit('cardTypeChange', { cards: [{ type: 'master-card' }] });

            expect(handleCardTypeChange).toHaveBeenCalledWith({ cardType: 'mastercard' });
        });

        it('notifies when card number changes and type of card is not yet known', () => {
            cardFieldsEventEmitter.emit('cardTypeChange', {
                cards: [{ type: 'visa' }, { type: 'master-card' }],
            });

            expect(handleCardTypeChange).toHaveBeenCalledWith({ cardType: undefined });
        });

        it('notifies when there are validation errors', () => {
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

        it('notifies when there are no more validation errors', () => {
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

        it('notifies when tokenizing with invalid form data', async () => {
            jest.spyOn(cardFields, 'tokenize').mockRejectedValue({
                code: 'HOSTED_FIELDS_FIELDS_EMPTY',
            });

            try {
                await subject.tokenize(getBillingAddress());
            } catch (error) {
                expect(handleValidate).toHaveBeenCalledWith({
                    errors: {
                        cardCode: [
                            {
                                fieldType: 'cardCode',
                                message: 'CVV is required',
                                type: 'required',
                            },
                        ],
                        cardNumber: [
                            {
                                fieldType: 'cardNumber',
                                message: 'Credit card number is required',
                                type: 'required',
                            },
                        ],
                        cardExpiry: [
                            {
                                fieldType: 'cardExpiry',
                                message: 'Expiration date is required',
                                type: 'required',
                            },
                        ],
                    },
                    isValid: false,
                });
            }
        });

        it('notifies when tokenizing with valid form data', async () => {
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
