import { EventEmitter } from 'events';

import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { NotInitializedError } from '../../../common/error/errors';

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
        containers.forEach(container => {
            container.parentElement?.removeChild(container);
        });
    });

    it('creates and configures hosted fields', async () => {
        await subject.initialize(formOptions);

        expect(braintreeSdkCreator.createHostedFields)
            .toHaveBeenCalledWith({
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

        expect(braintreeSdkCreator.createHostedFields)
            .toHaveBeenCalledWith({
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

    it('notifies when field receives focus', async () => {
        const handleFocus = jest.fn();

        await subject.initialize({
            ...formOptions,
            onFocus: handleFocus,
        });

        cardFieldsEventEmitter.emit('focus', { emittedBy: 'cvv' });

        expect(handleFocus)
            .toHaveBeenCalledWith({ fieldType: 'cardCode' });
    });

    it('notifies when field loses focus', async () => {
        const handleBlur = jest.fn();

        await subject.initialize({
            ...formOptions,
            onBlur: handleBlur,
        });

        cardFieldsEventEmitter.emit('blur', { emittedBy: 'cvv' });

        expect(handleBlur)
            .toHaveBeenCalledWith({ fieldType: 'cardCode' });
    });

    it('notifies when input receives submit event', async () => {
        const handleEnter = jest.fn();

        await subject.initialize({
            ...formOptions,
            onEnter: handleEnter,
        });

        cardFieldsEventEmitter.emit('inputSubmitRequest', { emittedBy: 'cvv' });

        expect(handleEnter)
            .toHaveBeenCalledWith({ fieldType: 'cardCode' });
    });

    it('notifies when card number changes', async () => {
        const handleCardTypeChange = jest.fn();

        await subject.initialize({
            ...formOptions,
            onCardTypeChange: handleCardTypeChange,
        });

        cardFieldsEventEmitter.emit('cardTypeChange', { cards: [{ type: 'Visa' }] });

        expect(handleCardTypeChange)
            .toHaveBeenCalledWith({ cardType: 'Visa' });
    });

    it('notifies when there are validation errors', async () => {
        const handleValidate = jest.fn();

        await subject.initialize({
            ...formOptions,
            onValidate: handleValidate,
        });

        cardFieldsEventEmitter.emit('validityChange', {
            fields: {
                cvv: { isValid: false },
                number: { isValid: false },
                expirationDate: { isValid: false },
            },
        });

        expect(handleValidate)
            .toHaveBeenCalledWith({
                errors: {
                    cardCode: [{
                        fieldType: 'cardCode',
                        message: 'Invalid card number',
                        type: 'invalid_card_number',
                    }],
                    cardNumber: [{
                        fieldType: 'cardNumber',
                        message: 'Invalid card number',
                        type: 'invalid_card_number',
                    }],
                    cardExpiry: [{
                        fieldType: 'cardExpiry',
                        message: 'Invalid card number',
                        type: 'invalid_card_number',
                    }],
                },
                isValid: false,
            });
    });

    it('notifies when there are no more validation errors', async () => {
        const handleValidate = jest.fn();

        await subject.initialize({
            ...formOptions,
            onValidate: handleValidate,
        });

        cardFieldsEventEmitter.emit('validityChange', {
            fields: {
                cvv: { isValid: true },
                number: { isValid: true },
                expirationDate: { isValid: true },
            },
        });

        expect(handleValidate)
            .toHaveBeenCalledWith({
                errors: {
                    cardCode: undefined,
                    cardNumber: undefined,
                    cardExpiry: undefined,
                },
                isValid: true,
            });
    });

    it('tokenizes data through hosted fields', async () => {
        await subject.initialize(formOptions);

        const billingAddress = getBillingAddress();
        const cardNameInput = document.querySelector('#cardName input') as HTMLInputElement;

        cardNameInput.value = 'Foobar';

        await subject.tokenize(billingAddress);

        expect(cardFields.tokenize)
            .toHaveBeenCalledWith({
                billingAddress: {
                    countryName: billingAddress.country,
                    postalCode: billingAddress.postalCode,
                    streetAddress: billingAddress.address1,
                },
                cardholderName: 'Foobar',
            });
    });

    it('tokenizes data through hosted fields for stored card verification', async () => {
        await subject.initialize(formOptions);

        const cardNameInput = document.querySelector('#cardName input') as HTMLInputElement;

        cardNameInput.value = 'Foobar';

        await subject.tokenizeForStoredCardVerification();

        expect(cardFields.tokenize)
            .toHaveBeenCalledWith({
                cardholderName: 'Foobar',
            });
    });

    it('throws error if trying to tokenize before initialization', async () => {
        try {
            await subject.tokenize(getBillingAddress());
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });
});
