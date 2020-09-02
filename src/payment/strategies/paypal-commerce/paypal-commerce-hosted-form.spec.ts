import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { EventEmitter } from 'events';

import { NotInitializedError } from '../../../common/error/errors';

import { PaypalCommerceFormOptions, PaypalCommerceHostedFields, PaypalCommerceHostedForm, PaypalCommerceRequestSender, PaypalCommerceSDK } from './index';
import { getPaypalCommerceMock } from './paypal-commerce.mock';

describe('PaypalCommerceHostedForm', () => {
    let cardFieldsEventEmitter: EventEmitter;
    let formOptions: PaypalCommerceFormOptions;
    let hostedForm: PaypalCommerceHostedForm;
    let cardFields: PaypalCommerceHostedFields;
    let requestSender: RequestSender;
    let paypalCommerceRequestSender: PaypalCommerceRequestSender;
    let containers: HTMLElement[];
    let paypal: PaypalCommerceSDK;
    let orderId: string;

    function appendContainer(id: string): HTMLElement {
        const container = document.createElement('div');

        container.id = id;
        document.body.appendChild(container);

        return container;
    }

    beforeEach(() => {
        cardFieldsEventEmitter = new EventEmitter();
        requestSender = createRequestSender();
        orderId = 'orderId';

        cardFields = {
            on: jest.fn((eventName, callback) => {
                cardFieldsEventEmitter.on(eventName, callback);
            }),
            submit: jest.fn(() => ({ orderId })),
        };

        paypal = {
            ...getPaypalCommerceMock(),
            HostedFields: {
                isEligible: () => true,
                render: jest.fn(() => Promise.resolve(cardFields)),
            },
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

        paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
        hostedForm = new PaypalCommerceHostedForm(paypalCommerceRequestSender);

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
        await hostedForm.initialize(formOptions, '123', paypal);

        expect(paypal.HostedFields.render)
            .toHaveBeenCalledWith({
                paymentsSDK: true,
                createOrder: expect.any(Function),
                fields: {
                    cvv: {
                        selector: '#cardCode',
                        placeholder: 'Card code',
                    },
                    expirationDate: {
                        selector: '#cardExpiry',
                        placeholder: 'Card expiry',
                    },
                    number: {
                        selector: '#cardNumber',
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
        await hostedForm.initialize({
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
        }, '123', paypal);

        expect(paypal.HostedFields.render)
            .toHaveBeenCalledWith({
                paymentsSDK: true,
                createOrder: expect.any(Function),
                fields: {
                    cvv: {
                        selector: '#cardCode',
                        placeholder: 'Card code',
                    },
                    number: {
                        selector: '#cardNumber',
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

        await hostedForm.initialize({ ...formOptions, onFocus: handleFocus }, '123', paypal );

        cardFieldsEventEmitter.emit('focus', { emittedBy: 'cvv' });

        expect(handleFocus)
            .toHaveBeenCalledWith({ fieldType: 'cardCode' });
    });

    it('notifies when field loses focus', async () => {
        const handleBlur = jest.fn();

        await hostedForm.initialize({ ...formOptions, onBlur: handleBlur }, '123', paypal );

        cardFieldsEventEmitter.emit('blur', { emittedBy: 'cvv' });

        expect(handleBlur)
            .toHaveBeenCalledWith({ fieldType: 'cardCode' });
    });

    it('notifies when input receives submit event', async () => {
        const handleEnter = jest.fn();

        await hostedForm.initialize({...formOptions,  onEnter: handleEnter }, '123', paypal );

        cardFieldsEventEmitter.emit('inputSubmitRequest', { emittedBy: 'cvv' });

        expect(handleEnter)
            .toHaveBeenCalledWith({ fieldType: 'cardCode' });
    });

    it('notifies when card number changes', async () => {
        const handleCardTypeChange = jest.fn();

        await hostedForm.initialize({...formOptions,  onCardTypeChange: handleCardTypeChange }, '123', paypal );

        cardFieldsEventEmitter.emit('cardTypeChange', { cards: [{ type: 'Visa' }] });

        expect(handleCardTypeChange)
            .toHaveBeenCalledWith({ cardType: 'Visa' });
    });

    it('notifies when there are validation errors', async () => {
        const handleValidate = jest.fn();

        await hostedForm.initialize({...formOptions,  onValidate: handleValidate }, '123', paypal );

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

        await hostedForm.initialize({...formOptions,  onValidate: handleValidate }, '123', paypal );

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

    it('submit hosted form should return orderId', async () => {
        await hostedForm.initialize(formOptions, '123', paypal);
        const result = await hostedForm.submit();

        expect(result.orderId).toEqual(orderId);
    });

    it('throws error if trying to submit hosted form without initialize', async () => {
        try {
            await hostedForm.submit();
        } catch (error) {
            expect(error).toBeInstanceOf(NotInitializedError);
        }
    });
});
